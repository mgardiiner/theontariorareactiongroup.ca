import { loadJsonFile, getFileSha, commitFiles } from '~/utils/adminGithub'

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

  function clearAll() {
    state.value.files = {}
    state.value.pending = []
    if (import.meta.client) localStorage.removeItem(STORAGE)
  }

  return { getData, stageChange, undo, pending, pendingCount, hasChanges, publishAll, clearAll }
}
