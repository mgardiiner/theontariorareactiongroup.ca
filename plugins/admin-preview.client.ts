// Live preview for the website editor.
//
// The editor (/admin) shows the real site in an iframe beside the form. This plugin only wakes up
// inside that iframe: it receives the editor's unpublished content files, writes them over the
// content the pages imported (in place, so every page and composable holding a reference sees
// them, e.g. composables/useStories.ts keeps `content.stories` at module scope), then bumps
// `admin_preview_rev`, the key layouts/default.vue remounts its header, footer and page on, so
// everything re-renders from the new data. Visitors never load any of this: outside
// the editor's frame the plugin returns before touching the content files.

type Json = Record<string, any>

const isObj = (v: unknown): v is Json => Boolean(v) && typeof v === 'object' && !Array.isArray(v)

/** Make `target` equal `src` without replacing any object or array that something may hold. */
function patch(target: Json, src: Json) {
  for (const k of Object.keys(target)) if (!(k in src)) delete target[k]
  for (const [k, v] of Object.entries(src)) {
    const cur = target[k]
    if (Array.isArray(cur) && Array.isArray(v)) cur.splice(0, cur.length, ...v)
    else if (isObj(cur) && isObj(v)) patch(cur, v)
    else target[k] = v
  }
}

export default defineNuxtPlugin((nuxtApp) => {
  if (window.parent === window) return
  try {
    // Same-origin editor only. Reading a cross-origin parent's location throws.
    if (!window.parent.location.pathname.startsWith('/admin')) return
  } catch {
    return
  }

  const rev = useState('admin_preview_rev', () => 0)
  const router = useRouter()
  // Lazy, so the content files are only fetched here, inside the editor's frame. They resolve to
  // the same module objects the pages imported statically.
  const loaders = import.meta.glob<Json>('../content/*.json', { import: 'default' })
  const pristine = new Map<string, string>() // file -> its published JSON, to restore on undo

  const send = (msg: Json) => window.parent.postMessage(msg, location.origin)

  async function apply(files: Record<string, Json>) {
    const y = window.scrollY
    let changed = false
    for (const [key, load] of Object.entries(loaders)) {
      const file = `content/${key.split('/').pop()}`
      const incoming = files[file]
      if (!incoming && !pristine.has(file)) continue // never edited: leave it alone
      const mod = await load()
      if (!pristine.has(file)) pristine.set(file, JSON.stringify(mod))
      const next = incoming ?? JSON.parse(pristine.get(file) as string)
      if (JSON.stringify(mod) === JSON.stringify(next)) continue
      patch(mod, next)
      changed = true
    }
    if (!changed) return
    rev.value++
    await nextTick()
    requestAnimationFrame(() => window.scrollTo(0, y))
  }

  async function go(path: string) {
    if (router.currentRoute.value.fullPath === path) return
    await router.push(path)
  }

  // Messages are applied strictly in order: content first, then any navigation to a page that
  // may only exist in the drafts (a new story or event). One failed step is logged and the chain
  // carries on, so the next edit still reaches the preview.
  // Nothing is applied until hydration has finished ('app:mounted' fires before it does). Drafts
  // patched into a half-hydrated page render wrongly: Vue keeps the server's attributes where they
  // differ, so a draft photo showed the published one.
  const hydrated = new Promise<void>((resolve) => {
    if (nuxtApp.isHydrating) nuxtApp.hooks.hookOnce('app:suspense:resolve', () => resolve())
    else resolve()
  })
  let queue = hydrated
  const enqueue = (step: () => Promise<void>) => {
    queue = queue.then(step).catch((err) => console.warn('[admin preview]', err))
  }
  window.addEventListener('message', (e) => {
    if (e.source !== window.parent || e.origin !== location.origin) return
    const msg = e.data
    if (msg?.type === 'admin-preview:content' && isObj(msg.files)) {
      enqueue(() => apply(msg.files))
    } else if (msg?.type === 'admin-preview:go' && typeof msg.path === 'string' && /^\/(?!\/)/.test(msg.path)) {
      enqueue(() => go(msg.path))
    }
  })

  router.afterEach((to) => send({ type: 'admin-preview:at', path: to.fullPath }))
  hydrated.then(() => send({ type: 'admin-preview:ready' }))
})
