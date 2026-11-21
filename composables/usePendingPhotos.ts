// Photos added in the editor but not yet published.
//
// An upload used to be committed straight to GitHub, which kicked off a full site deploy per
// photo and couldn't be undone. Now the resized photo waits on this device (IndexedDB, so it
// survives closing the tab) under the path it will have on the site, e.g. /uploads/walk-x1y2z.jpg.
// The draft stores that path like any other value; Publish sends the photo in the same commit as
// the change that uses it. Until then `src()` swaps the path for a local object URL so the
// editor and the live preview can show it.

const DB_NAME = 'ontariorare-admin'
const STORE = 'photos'
// Paths added on this device and not yet published. Kept apart from the blobs so a draft that
// points at a photo whose blob was cleared by the browser can be caught before publishing.
const REGISTRY = 'ontariorare_admin_photos'

const urls = ref<Record<string, string>>({})
const registry = ref<string[]>([])
const memory = new Map<string, Blob>() // fallback when IndexedDB isn't available (private windows)
let loading: Promise<void> | null = null

function openDb(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    try {
      const req = indexedDB.open(DB_NAME, 1)
      req.onupgradeneeded = () => req.result.createObjectStore(STORE)
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => resolve(null)
    } catch {
      resolve(null)
    }
  })
}

async function run<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T | undefined> {
  const db = await openDb()
  if (!db) return undefined
  return new Promise((resolve) => {
    try {
      const req = fn(db.transaction(STORE, mode).objectStore(STORE))
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => resolve(undefined)
    } catch {
      resolve(undefined)
    }
  })
}

const getBlob = async (path: string) => memory.get(path) ?? ((await run('readonly', (s) => s.get(path))) as Blob | undefined)

function saveRegistry() {
  try {
    if (registry.value.length) localStorage.setItem(REGISTRY, JSON.stringify(registry.value))
    else localStorage.removeItem(REGISTRY)
  } catch {
    /* storage blocked: the in-memory copy still works for this visit */
  }
}

function toBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = String(reader.result || '')
      resolve(result.slice(result.indexOf(',') + 1))
    }
    reader.onerror = () => reject(new Error('Could not read a photo.'))
    reader.readAsDataURL(blob)
  })
}

export function usePendingPhotos() {
  /** Load the registry and make object URLs for the photos still on this device. */
  function ensureLoaded(): Promise<void> {
    if (!import.meta.client) return Promise.resolve()
    loading ??= (async () => {
      try {
        registry.value = JSON.parse(localStorage.getItem(REGISTRY) || '[]')
      } catch {
        registry.value = []
      }
      for (const path of registry.value) {
        const blob = await getBlob(path)
        if (blob && !urls.value[path]) urls.value[path] = URL.createObjectURL(blob)
      }
    })()
    return loading
  }

  async function add(path: string, blob: Blob) {
    const stored = await run('readwrite', (s) => s.put(blob, path))
    if (stored === undefined) memory.set(path, blob)
    urls.value[path] = URL.createObjectURL(blob)
    if (!registry.value.includes(path)) registry.value.push(path)
    saveRegistry()
  }

  /** What to put in an <img src> for a stored value: the local copy while it's unpublished. */
  function src(path: string | null | undefined): string {
    if (!path) return ''
    return urls.value[path] || path
  }

  const isPending = (path: string | null | undefined) => Boolean(path && registry.value.includes(path))

  /** The unpublished photos that some page JSON names (an abandoned upload is in none of it). */
  const usedBy = (pageTexts: string[]) =>
    registry.value.filter((path) => pageTexts.some((t) => t.includes(`"${path}"`)))

  /**
   * The unpublished photos that these draft files use, ready to commit. `missing` lists any the
   * drafts use whose saved copy is gone from this device (they'd publish as broken images).
   */
  async function filesFor(
    draftTexts: string[],
  ): Promise<{ files: { path: string; base64: string }[]; used: string[]; missing: string[] }> {
    await ensureLoaded()
    const files: { path: string; base64: string }[] = [] // repo paths, e.g. public/uploads/x.jpg
    const used: string[] = [] // the same photos as site paths, for markPublished
    const missing: string[] = []
    for (const path of usedBy(draftTexts)) {
      const blob = await getBlob(path)
      if (!blob) missing.push(path)
      else {
        files.push({ path: `public${path}`, base64: await toBase64(blob) })
        used.push(path)
      }
    }
    return { files, used, missing }
  }

  /** Swap every unpublished photo path in some JSON for its local object URL (for the live preview). */
  function withLocalUrls<T>(data: T): T {
    const paths = Object.keys(urls.value)
    if (!paths.length) return data
    let text = JSON.stringify(data)
    for (const p of paths) text = text.split(`"${p}"`).join(`"${urls.value[p]}"`)
    return JSON.parse(text)
  }

  /**
   * After publishing: these photos (site paths, as filesFor found them) are in GitHub now, so drop
   * their saved copies. Photos the published drafts didn't use, such as one in a half-finished new
   * event, stay for a later publish. Keep the object URLs for this visit, though: the site takes a
   * couple of minutes to serve the new files, and until then the editor and preview would
   * otherwise show broken images.
   */
  async function markPublished(done: string[]) {
    registry.value = registry.value.filter((p) => !done.includes(p))
    saveRegistry()
    for (const p of done) {
      memory.delete(p)
      await run('readwrite', (s) => s.delete(p))
    }
  }

  /** Forget every unpublished photo (when all drafts are thrown away). */
  async function clear() {
    for (const u of Object.values(urls.value)) URL.revokeObjectURL(u)
    urls.value = {}
    registry.value = []
    memory.clear()
    saveRegistry()
    await run('readwrite', (s) => s.clear())
  }

  return {
    ensureLoaded,
    add,
    src,
    isPending,
    usedBy,
    filesFor,
    withLocalUrls,
    markPublished,
    clear,
    paths: computed(() => registry.value),
  }
}
