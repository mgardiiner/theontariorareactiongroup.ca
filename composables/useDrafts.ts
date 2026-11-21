import { loadJsonFile, getFileSha, commitFiles, conflictError, type CommitFile } from '~/utils/adminGithub'
import { describeChange, pageNameFor, type DiffLine } from '~/admin/diff'
import { FOCUS_FILE, missingInFiles } from '~/admin/schema'

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

// Open forms' "save now": the page editor autosaves only once typing pauses, so someone typing
// steadily has edits on screen that aren't in the store yet. Publishing and merging call these
// before reading the drafts, and again after each wait on the network.
const flushers = new Set<() => void>()
const flushEdits = () => flushers.forEach((save) => save())

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
      if (inBase !== undefined && !sameJson(inBase, item)) {
        // Both sides edited this item: merge it field by field.
        const m = mergeValue(inBase, inDraft, item)
        if (m.clashed) clashed = true
        result.push(m.data)
      } else {
        result.push(inDraft) // only the editor edited it
      }
    } else {
      result.push(item)
    }
  }
  for (const item of draft) {
    const id = itemId(item) as string
    if (!b.has(id) && !r.has(id)) result.push(item) // editor added it
  }

  // The list above follows the other side's order. If the editor rearranged it (dragged items),
  // theirs wins: their items go in their order, and an item only the other side added goes after
  // every item it came after in their list.
  const ids = (list: any[]) => list.map((x) => itemId(x) as string)
  const draftIds = ids(draft)
  const unmoved = [...ids(base).filter((id) => d.has(id)), ...draftIds.filter((id) => !b.has(id))]
  if (sameJson(draftIds, unmoved)) return { data: result, clashed }
  const remoteIds = ids(remote)
  const shared = (list: string[]) => list.filter((id) => b.has(id) && d.has(id) && r.has(id))
  const [baseOrder, draftOrder, remoteOrder] = [shared(ids(base)), shared(draftIds), shared(remoteIds)]
  if (!sameJson(remoteOrder, baseOrder) && !sameJson(remoteOrder, draftOrder)) clashed = true // both rearranged
  const pos = new Map(draftIds.map((id, i) => [id, i]))
  const at = (x: any) => pos.get(itemId(x) as string) as number
  const ordered = result.filter((x) => pos.has(itemId(x) as string)).sort((x, y) => at(x) - at(y))
  for (const item of result) {
    const id = itemId(item) as string
    if (pos.has(id)) continue
    const earlier = new Set(remoteIds.slice(0, remoteIds.indexOf(id)))
    let slot = 0
    ordered.forEach((y, k) => {
      if (earlier.has(itemId(y) as string)) slot = k + 1
    })
    ordered.splice(slot, 0, item)
  }
  return { data: ordered, clashed }
}

const isPlainObject = (v: unknown): v is Record<string, any> =>
  v != null && typeof v === 'object' && !Array.isArray(v)

/**
 * Three-way merge of one value: the editor's changes (draft vs base) applied on top of the latest
 * published version (remote). Objects merge key by key and id'd lists item by item, so two people
 * editing different fields of the same section both keep their work. `clashed` is true only when
 * both changed the same thing differently; the editor's version wins there, and the UI warns.
 * `data` is undefined when the key should be removed.
 */
function mergeValue(base: any, draft: any, remote: any): { data: any; clashed: boolean } {
  if (sameJson(base, draft)) return { data: remote, clashed: false } // editor didn't touch it
  if (sameJson(base, remote) || sameJson(draft, remote)) return { data: draft, clashed: false }
  if (isPlainObject(base) && isPlainObject(draft) && isPlainObject(remote)) {
    const out: Record<string, any> = { ...remote }
    let clashed = false
    for (const key of new Set([...Object.keys(base), ...Object.keys(draft)])) {
      const m = mergeValue(base[key], draft[key], remote[key])
      if (m.data === undefined) delete out[key]
      else out[key] = m.data
      if (m.clashed) clashed = true
    }
    return { data: out, clashed }
  }
  return mergeItemList(base, draft, remote) ?? { data: draft, clashed: true }
}

// The JSON of the pages being published: where they name the new photos they use. focus.json
// names photos too, but only as keys for focus points, and a point kept for a photo that was later
// swapped out doesn't make that photo part of the site.
const pageTexts = (files: Record<string, any>) =>
  Object.entries(files)
    .filter(([file]) => file !== FOCUS_FILE)
    .map(([, data]) => JSON.stringify(data))

// Content files that can be missing from GitHub, and what a missing one means. focus.json is new:
// until it's pushed, an editor run against GitHub (a local dev server signed in with the real key)
// finds nothing there, and no file means no photo has a chosen point yet. Publishing creates it:
// with no baseSha there's no version to conflict with.
const IF_MISSING: Record<string, () => unknown> = { [FOCUS_FILE]: () => ({}) }

async function loadFile(token: string, file: string): Promise<{ data: any; sha: string | null }> {
  try {
    return await loadJsonFile<any>(token, file)
  } catch (e) {
    const empty = IF_MISSING[file]
    if (empty && (e as { status?: number }).status === 404) return { data: empty(), sha: null }
    throw e
  }
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

  /**
   * Current working data for a file: the local draft if it has edits, else a fresh load from GitHub.
   * `cached` settles for the clean copy already loaded, if there is one: for a form redrawing after
   * Undo, a publish or "Throw away", which mustn't wait on the network while someone types.
   */
  async function getData(file: string, { cached = false } = {}): Promise<any> {
    const existing = state.value.files[file]
    if (existing && (existing.dirty || cached)) return existing.data
    if (!token.value) throw new Error('Not signed in.')
    const { data, sha } = await loadFile(token.value, file)
    // An edit saved while this was loading is newer than what came back: keep it.
    const now = state.value.files[file]
    if (now?.dirty) return now.data
    state.value.files[file] = { data, baseSha: sha, dirty: false }
    return data
  }

  /** Have publishing and merging save this form's unsaved typing first. Returns the undo. */
  function registerFlush(save: () => void) {
    flushers.add(save)
    return () => {
      flushers.delete(save)
    }
  }

  /**
   * Replace a file's data with an edited version and record a pending change. Returns the change's
   * key. With `mergeKey` (an earlier change's key), keeps adding to that change instead of logging
   * a new one, as long as it is still the latest change to this file: the page editor autosaves
   * as you type, and one visit should read as one change ("Edited the About page") with one Undo.
   */
  function stageChange(file: string, newData: any, label: string, mergeKey?: string | null): string {
    const existing = state.value.files[file]
    const baseSha = existing?.baseSha ?? null
    const latest = [...state.value.pending].reverse().find((p) => p.file === file)
    if (mergeKey && latest && latest.key === mergeKey) {
      state.value.files[file] = { data: newData, baseSha, dirty: true }
      latest.when = Date.now()
      latest.what = label
      persist()
      return mergeKey
    }
    const before = existing ? clone(existing.data) : null
    const key = 'k' + Date.now() + Math.random().toString(36).slice(2)
    state.value.files[file] = { data: newData, baseSha, dirty: true }
    state.value.pending.push({ key, what: label, when: Date.now(), file, before })
    persist()
    return key
  }

  /** The file as it is on the live site (before any of this device's changes), if loaded. */
  function publishedData(file: string): any {
    const first = state.value.pending.find((p) => p.file === file)
    if (first) return clone(first.before)
    const f = state.value.files[file]
    return f ? clone(f.data) : null
  }

  /** Files with unpublished changes, and their current data (for the live preview). */
  const draftFiles = computed<Record<string, any>>(() => {
    const out: Record<string, any> = {}
    for (const p of state.value.pending) {
      const f = state.value.files[p.file]
      if (f) out[p.file] = f.data
    }
    return out
  })

  /** Put a file back to its snapshot from before pending[idx], dropping that change and every later one to it. */
  function rewind(idx: number) {
    const entry = state.value.pending[idx]
    const file = entry.file
    if (entry.before == null) {
      delete state.value.files[file]
    } else if (state.value.files[file]) {
      state.value.files[file].data = entry.before
      state.value.files[file].dirty = true
    }
    state.value.pending = state.value.pending.filter((p, i) => !(i >= idx && p.file === file))
  }

  function settle(file: string) {
    // If nothing pending references this file anymore, it's back to what was loaded from GitHub:
    // keep that copy as a clean (unsaved) cache rather than deleting it, so a later edit still has
    // its baseSha for the conflict check and a real "before" for Undo.
    if (!state.value.pending.some((p) => p.file === file) && state.value.files[file]) {
      state.value.files[file].dirty = false
    }
    persist()
  }

  /**
   * Undo one pending change and keep the later changes to the same file. The review sheet lists
   * changes one by one, each with "Undo this one", and choosing what shows in photo A and then in
   * photo B are unrelated changes to the same file, so undoing A mustn't take B with it. The later
   * changes are replayed one at a time onto the file as it was before this one, each with the same
   * three-way merge a publish conflict uses: where a later change redid the same thing, the later
   * change stays. Replaying them in order (not merging the end result once) keeps a later change
   * that set a value back to what this one had set it to. Their own "before" snapshots are the
   * replayed ones, so their diffs and Undo still line up.
   *
   * Typing an open form hasn't autosaved yet is saved first, so it isn't lost when the form reloads
   * from the changed draft. A form's own save passes flush: false (it is the one saving).
   */
  function undo(key: string, { flush = true } = {}) {
    if (flush) flushEdits()
    const idx = state.value.pending.findIndex((p) => p.key === key)
    if (idx < 0) return
    const entry = state.value.pending[idx]
    const f = state.value.files[entry.file]
    const later = state.value.pending.filter((p, i) => i > idx && p.file === entry.file)
    if (!later.length || entry.before == null || later.some((p) => p.before == null) || !f) {
      rewind(idx) // the latest change to the file (or nothing to merge against)
    } else {
      // Change k turned later[k].before into the next snapshot; apply that onto the rebuilt file.
      const snaps = [...later.map((p) => p.before), f.data]
      let rebuilt = clone(entry.before)
      later.forEach((p, k) => {
        p.before = clone(rebuilt)
        rebuilt = clone(mergeValue(snaps[k], snaps[k + 1], rebuilt).data)
      })
      f.data = rebuilt
      f.dirty = true
      state.value.pending.splice(idx, 1)
    }
    settle(entry.file)
  }

  /** Drop every pending change to a file: back to the version on the live site. */
  function discardFile(file: string) {
    const idx = state.value.pending.findIndex((p) => p.file === file)
    if (idx < 0) return
    rewind(idx)
    settle(file)
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

  /** New photos that go out with the next publish: the ones the changed pages use (see publishAll). */
  const newPhotos = computed(() => usePendingPhotos().usedBy(pageTexts(draftFiles.value)))

  const pending = computed(() => state.value.pending)
  const pendingCount = computed(() => state.value.pending.length)
  const hasChanges = computed(() => state.value.pending.length > 0)

  /**
   * Commit every changed file, plus the new photos they use, in a single commit.
   * Throws { code:'conflict' } if a file changed on GitHub since load, and { code:'photo-missing' }
   * if a change uses a photo whose saved copy is no longer on this device.
   */
  async function publishAll(
    onProgress?: (text: string) => void,
  ): Promise<{ commit: string; files: Record<string, any> } | null> {
    if (!token.value) throw new Error('Not signed in.')
    flushEdits()
    const changedFiles = [...new Set(state.value.pending.map((p) => p.file))]
    if (!changedFiles.length) return null

    // Fails fast, before any photos are read. commitFiles checks again against the exact commit it
    // builds on, which closes the gap between this check and the commit. A null baseSha means the
    // file wasn't there when it loaded, so one that exists now was published by someone else.
    for (const file of changedFiles) {
      const current = await getFileSha(token.value, file)
      const baseSha = state.value.files[file]?.baseSha ?? null
      if (current !== baseSha) throw conflictError(file)
    }

    // What this publish sends: these files as they are now (typing during the check included) and
    // the changes that made them. Anything edited from here on stays pending, on top of it.
    flushEdits()
    const sent: Record<string, any> = {}
    const expect: Record<string, string | null> = {}
    for (const file of changedFiles) {
      sent[file] = clone(state.value.files[file].data)
      expect[file] = state.value.files[file].baseSha ?? null // null: it must still not exist
    }
    // The review sheet already holds the button back while a required field is empty; this is the
    // last word on exactly what would go out, so a blank title can't reach the site another way.
    const blanks = missingInFiles(sent)
    if (blanks.length) {
      const list = blanks.flatMap(({ section, missing }) =>
        missing.map((m) => `${section.label}: ${m.where.join(' › ')}`),
      )
      const err: any = new Error(`These need filling in before publishing: ${list.join('; ')}.`)
      err.code = 'missing-fields'
      throw err
    }
    const sentEntries = state.value.pending.filter((p) => changedFiles.includes(p.file))
    const files: CommitFile[] = changedFiles.map((file) => ({
      path: file,
      content: JSON.stringify(sent[file], null, 2) + '\n',
    }))
    const photos = await usePendingPhotos().filesFor(pageTexts(sent))
    if (photos.missing.length) {
      const err: any = new Error(
        `A photo you added (${photos.missing.join(', ')}) is no longer saved on this device, so it can't be published. Upload it again, then publish.`,
      )
      err.code = 'photo-missing'
      throw err
    }
    files.push(...photos.files)

    const labels = sentEntries.map((p) => `- ${p.what}`).join('\n')
    const message = `Update website via editor (${sentEntries.length} change${
      sentEntries.length === 1 ? '' : 's'
    })\n\n${labels}`
    const progress = (done: number, total: number) =>
      onProgress?.(
        total > 1 && done < total
          ? `Sending your changes${photos.files.length ? ' and photos' : ''} (${done + 1} of ${total})…`
          : 'Saving your changes…',
      )
    const { commit, shas } = await commitFiles(token.value, files, message, undefined, progress, expect)
    flushEdits() // typing during the upload is an edit on top of what just went out
    settlePublished(sent, sentEntries, shas)
    await usePendingPhotos().markPublished(photos.used)
    return { commit, files: sent }
  }

  /**
   * After a publish, retire only what it sent. A file nobody touched during the upload becomes a
   * clean copy of the published version. One edited meanwhile (the sheet can be closed while it
   * publishes, and forms autosave) keeps its draft as the editor left it, with its pending changes
   * now measured against the published version: the first one's "before" is what visitors now see,
   * which is what publishedData, Undo and "Changed · Undo" all compare with.
   *
   * An Undo during the upload counts as an edit made meanwhile. The change was already on its way,
   * so it is live now, and taking it back is a change still to publish. It stays as one, rather than
   * the file quietly becoming the published version under a form that still shows the undone one.
   */
  function settlePublished(sent: Record<string, any>, sentEntries: PendingEntry[], shas: Record<string, string>) {
    const sentKeys = new Set(sentEntries.map((p) => p.key))
    for (const [file, data] of Object.entries(sent)) {
      const now = state.value.files[file]
      const baseSha = shas[file] ?? now?.baseSha ?? null
      // Untouched since (or edited and put back exactly as it was sent).
      if (!now || sameJson(now.data, data)) {
        state.value.files[file] = { data, baseSha, dirty: false }
        state.value.pending = state.value.pending.filter((p) => p.file !== file)
        continue
      }
      // A new object, so an open form sees the change and redraws against the new baseline.
      state.value.files[file] = { data: clone(now.data), baseSha, dirty: true }
      const entries = state.value.pending.filter((p) => p.file === file)
      const published = entries.filter((p) => sentKeys.has(p.key))
      const later = entries.filter((p) => !sentKeys.has(p.key))
      // The last published change may have kept growing during the upload (the form adds each
      // autosave to its current change). If so it stays, holding just that growth.
      const last = published[published.length - 1]
      const keep = last && !sameJson(later[0]?.before ?? now.data, data) ? last : null
      state.value.pending = state.value.pending.filter((p) => !published.includes(p) || p === keep)
      const first = state.value.pending.find((p) => p.file === file)
      if (first) {
        first.before = clone(data)
      } else {
        // Every change to it was undone during the upload: list taking it back as a change.
        const undone = [...sentEntries].reverse().find((p) => p.file === file)
        const key = 'k' + Date.now() + Math.random().toString(36).slice(2)
        const what = `Undid: ${undone?.what ?? 'a change'}`
        state.value.pending.push({ key, what, when: Date.now(), file, before: clone(data) })
      }
    }
    persist()
  }

  /**
   * Resolve a publish conflict without losing local edits: reload each edited file from GitHub,
   * then layer the editor's changes on top, section by section (top-level JSON keys).
   * A section the editor didn't touch takes the latest published version; a section they did
   * touch keeps their version. Returns the sections where both sides changed, so the UI can warn.
   */
  async function rebaseOnLatest(): Promise<{ file: string; sections: string[] }[]> {
    if (!token.value) throw new Error('Not signed in.')
    const overlaps: { file: string; sections: string[] }[] = []
    const changedFiles = [...new Set(state.value.pending.map((p) => p.file))]

    for (const file of changedFiles) {
      const { data: remote, sha } = await loadFile(token.value, file)
      // Read the draft only now: it may have been edited (or undone) while that loaded.
      flushEdits()
      const draft = state.value.files[file]
      if (!draft || !state.value.pending.some((p) => p.file === file)) continue
      // The snapshot taken before the editor's first change to this file = what they started from.
      const base = state.value.pending.find((p) => p.file === file)?.before ?? null
      const mergeable = base && remote && typeof remote === 'object' && !Array.isArray(remote)

      // Rebuild `snapshot` on top of `remote`: what the editor changed (vs base) wins, everything
      // else takes the latest published version, down to single fields and list items (mergeValue).
      // Returns the merged data and the sections where both sides changed the same thing.
      const rebase = (snapshot: any): { data: any; sections: string[] } => {
        if (!mergeable) return { data: snapshot, sections: [] }
        const merged: any = { ...remote }
        const sections: string[] = []
        const keys = new Set([...Object.keys(base), ...Object.keys(snapshot ?? {})])
        for (const key of keys) {
          const m = mergeValue(base[key], snapshot?.[key], remote[key])
          if (m.data === undefined) delete merged[key]
          else merged[key] = m.data
          if (m.clashed) sections.push(key)
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

  /**
   * Throw away every unpublished change and photo on this device. Each file goes back to the version
   * it was loaded as, kept as a clean copy so an open form redraws at once instead of refetching.
   */
  async function discardAll() {
    for (const p of state.value.pending) {
      const f = state.value.files[p.file]
      if (!f?.dirty) continue // the file's first change holds its loaded version; later ones don't
      if (p.before == null) delete state.value.files[p.file]
      else state.value.files[p.file] = { data: p.before, baseSha: f.baseSha, dirty: false }
    }
    for (const [file, f] of Object.entries(state.value.files)) if (f.dirty) delete state.value.files[file]
    state.value.pending = []
    persist()
    await usePendingPhotos().clear()
  }

  return {
    getData,
    registerFlush,
    flushEdits,
    stageChange,
    publishedData,
    draftFiles,
    discardAll,
    undo,
    discardFile,
    pending,
    pendingCount,
    newPhotos,
    hasChanges,
    publishAll,
    rebaseOnLatest,
    changeDetails,
  }
}
