import { loadJsonFile, getFileSha, commitFiles } from '~/utils/adminGithub'
import { describeChange, pageNameFor, type DiffLine } from '~/admin/diff'

// Local draft store: every edit autosaves to localStorage; nothing touches GitHub
// until the user deliberately Publishes, which commits all changed files in ONE commit.

const STORAGE = 'ontariorare_admin_drafts'

export interface PendingEntry {
  key: string
  what: string // human sentence shown in the pending list, e.g. 'Added "Caregiver Circle"'
  when: number // Date.now() at time of change
  file: string
  before: any // snapshot of the file's data before this change (for Undo)
}

interface DraftFile {
  data: any
  baseSha: string | null
  dirty: boolean
}

interface DraftState {
  files: Record<string, DraftFile>
  pending: PendingEntry[]
  hydrated: boolean
}

const clone = (v: any) => (v == null ? null : JSON.parse(JSON.stringify(v)))
const sameJson = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b)

/** Stable identity for a list item, if it has one. */
function itemId(item: any): string | null {
  if (!item || typeof item !== 'object' || Array.isArray(item)) return null
  for (const k of ['id', 'slug', 'url', 'name', 'title']) {
    const v = item[k]
    if (typeof v === 'string' || typeof v === 'number') return `${k}:${v}`
  }
  return null
}

/**
 * Three-way merge of a list of identifiable items. Starts from the latest published list, then
 * applies only what the editor did relative to their starting point: edits to an item, new items,
 * and deletions. Returns null when the lists aren't all made of identifiable items.
 * `clashed` is true when the editor and someone else changed the same item.
 */
function mergeItemList(
  base: any,
  draft: any,
  remote: any,
): { data: any[]; clashed: boolean } | null {
  if (![base, draft, remote].every(Array.isArray)) return null
  const all = [...base, ...draft, ...remote]
  if (!all.length || all.some((x) => itemId(x) == null)) return null
  const byId = (list: any[]) => new Map<string, any>(list.map((x) => [itemId(x) as string, x]))
  const b = byId(base)
  const d = byId(draft)
  const r = byId(remote)

  let clashed = false
  const result: any[] = []
  for (const item of remote) {
    const id = itemId(item) as string
    const inBase = b.get(id)
    const inDraft = d.get(id)
    if (inBase !== undefined && inDraft === undefined) continue // editor deleted it
    if (inDraft !== undefined && !sameJson(inBase, inDraft)) {
      if (inBase !== undefined && !sameJson(inBase, item)) clashed = true
      result.push(inDraft) // editor edited it (their version wins)
    } else {
      result.push(item)
    }
  }
  for (const item of draft) {
    const id = itemId(item) as string
    if (!b.has(id) && !r.has(id)) result.push(item) // editor added it
  }
  return { data: result, clashed }
}

export function useDrafts() {
  const { token } = useAdminAuth()
  const state = useState<DraftState>('admin_drafts', () => ({
    files: {},
    pending: [],
    hydrated: false,
  }))

  if (import.meta.client && !state.value.hydrated) {
    try {
      const raw = localStorage.getItem(STORAGE)
      if (raw) {
        const parsed = JSON.parse(raw)
        state.value.files = parsed.files || {}
        state.value.pending = parsed.pending || []
      }
    } catch {
      /* ignore corrupt drafts */
    }
    state.value.hydrated = true
  }

  function persist() {
    if (!import.meta.client) return
    // Only persist files that actually have unsaved changes.
    const files: Record<string, DraftFile> = {}
    for (const [f, v] of Object.entries(state.value.files)) if (v.dirty) files[f] = v
    localStorage.setItem(STORAGE, JSON.stringify({ files, pending: state.value.pending }))
  }

  /** Current working data for a file: the local draft if it has edits, else a fresh load from GitHub. */
  async function getData(file: string): Promise<any> {
    const existing = state.value.files[file]
    if (existing && existing.dirty) return existing.data
    if (!token.value) throw new Error('Not signed in.')
    const { data, sha } = await loadJsonFile(token.value, file)
    state.value.files[file] = { data, baseSha: sha, dirty: false }
    return data
  }

  /** Replace a file's data with an edited version and record a pending change. */
  function stageChange(file: string, newData: any, label: string) {
    const existing = state.value.files[file]
    const before = existing ? clone(existing.data) : null
    const baseSha = existing?.baseSha ?? null
    state.value.files[file] = { data: newData, baseSha, dirty: true }
    state.value.pending.push({
      key: 'k' + Date.now() + Math.random().toString(36).slice(2),
      what: label,
      when: Date.now(),
      file,
      before,
    })
    persist()
  }

  /** Undo one pending change: restore the file to its pre-change snapshot and drop that (and any later same-file) entries. */
  function undo(key: string) {
    const idx = state.value.pending.findIndex((p) => p.key === key)
    if (idx < 0) return
    const entry = state.value.pending[idx]
    const file = entry.file
    if (entry.before == null) {
      delete state.value.files[file]
    } else if (state.value.files[file]) {
      state.value.files[file].data = entry.before
      state.value.files[file].dirty = true
    }
    // remove this entry and any later entries touching the same file
    state.value.pending = state.value.pending.filter((p, i) => !(i >= idx && p.file === file))
    // if nothing pending references this file anymore, drop the draft entirely (revert to GitHub)
    if (!state.value.pending.some((p) => p.file === file)) delete state.value.files[file]
    persist()
  }

  /** Friendly per-field summary of one pending change, for the publish sheet. */
  function changeDetails(key: string): { page: string; lines: DiffLine[] } | null {
    const idx = state.value.pending.findIndex((p) => p.key === key)
    if (idx < 0) return null
    const entry = state.value.pending[idx]
    // "After" this change = the snapshot the next change to the same file started from,
    // or the current draft if this was the latest edit to that file.
    const next = state.value.pending.slice(idx + 1).find((p) => p.file === entry.file)
    const after = next ? next.before : state.value.files[entry.file]?.data
    return { page: pageNameFor(entry.file), lines: describeChange(entry.file, entry.before, after) }
  }

  const pending = computed(() => state.value.pending)
  const pendingCount = computed(() => state.value.pending.length)
  const hasChanges = computed(() => state.value.pending.length > 0)

  /** Commit every changed file in a single commit. Throws { code:'conflict' } if a file changed on GitHub since load. */
  async function publishAll(): Promise<void> {
    if (!token.value) throw new Error('Not signed in.')
    const changedFiles = [...new Set(state.value.pending.map((p) => p.file))]
    if (!changedFiles.length) return

    for (const file of changedFiles) {
      const current = await getFileSha(token.value, file)
      const baseSha = state.value.files[file]?.baseSha ?? null
      if (baseSha && current && current !== baseSha) {
        const err: any = new Error('Someone else changed the website while you were working.')
        err.code = 'conflict'
        err.file = file
        throw err
      }
    }

    const files = changedFiles.map((file) => ({
      path: file,
      content: JSON.stringify(state.value.files[file].data, null, 2) + '\n',
    }))
    const labels = state.value.pending.map((p) => `- ${p.what}`).join('\n')
    const message = `Update website via editor (${state.value.pending.length} change${
      state.value.pending.length === 1 ? '' : 's'
    })\n\n${labels}`
    await commitFiles(token.value, files, message)
    clearAll()
  }

  /**
   * Resolve a publish conflict without losing local edits: reload each edited file from GitHub,
   * then layer the editor's changes on top, section by section (top-level JSON keys).
   * A section the editor didn't touch takes the latest published version; a section they did
   * touch keeps their version. Returns the sections where both sides changed, so the UI can warn.
   */
  async function rebaseOnLatest(): Promise<{ file: string; sections: string[] }[]> {
    if (!token.value) throw new Error('Not signed in.')
    const same = (a: any, b: any) => JSON.stringify(a) === JSON.stringify(b)
    const overlaps: { file: string; sections: string[] }[] = []
    const changedFiles = [...new Set(state.value.pending.map((p) => p.file))]

    for (const file of changedFiles) {
      const draft = state.value.files[file]
      if (!draft) continue
      const { data: remote, sha } = await loadJsonFile<any>(token.value, file)
      // The snapshot taken before the editor's first change to this file = what they started from.
      const base = state.value.pending.find((p) => p.file === file)?.before ?? null
      const mergeable = base && remote && typeof remote === 'object' && !Array.isArray(remote)

      // Rebuild `snapshot` on top of `remote`: sections the editor changed (vs base) win, the rest
      // take the latest published version. Returns the merged data and the sections changed on both sides.
      const rebase = (snapshot: any): { data: any; sections: string[] } => {
        if (!mergeable) return { data: snapshot, sections: [] }
        const merged: any = { ...remote }
        const sections: string[] = []
        const keys = new Set([...Object.keys(base), ...Object.keys(snapshot ?? {})])
        for (const key of keys) {
          if (same(base[key], snapshot?.[key])) continue
          if (same(base[key], remote[key])) {
            merged[key] = snapshot[key]
            continue
          }
          // Both sides changed this section. For lists of items with a stable id (stories, events,
          // partners, coverage…) merge item by item so a stale draft can't wipe items added elsewhere.
          const itemMerge = mergeItemList(base[key], snapshot[key], remote[key])
          if (itemMerge) {
            merged[key] = itemMerge.data
            if (itemMerge.clashed) sections.push(key)
          } else {
            merged[key] = snapshot[key]
            sections.push(key)
          }
        }
        return { data: merged, sections }
      }

      const { data: merged, sections } = rebase(draft.data)
      state.value.files[file] = { data: merged, baseSha: sha, dirty: true }
      // Keep Undo consistent: each pending entry's "before" snapshot moves onto the latest version too,
      // so undoing one change can't quietly resurrect the stale copy of someone else's edits.
      for (const p of state.value.pending) {
        if (p.file === file && p.before != null) p.before = rebase(p.before).data
      }
      if (sections.length) overlaps.push({ file, sections })
    }
    persist()
    return overlaps
  }

  function clearAll() {
    state.value.files = {}
    state.value.pending = []
    if (import.meta.client) localStorage.removeItem(STORAGE)
  }

  return {
    getData,
    stageChange,
    undo,
    pending,
    pendingCount,
    hasChanges,
    publishAll,
    rebaseOnLatest,
    changeDetails,
    clearAll,
  }
}
