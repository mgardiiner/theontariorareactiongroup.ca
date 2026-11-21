<template>
  <div class="ed-shell" :class="{ 'pv-open': previewOpen }">
    <!-- Top bar (Screen 1) -->
    <header class="ed-topbar">
      <button type="button" class="ed-brand" @click="goHomeNav">
        <img src="/logo.png" width="28" height="28" alt="" />
        <span class="ed-brand-text">Ontario Rare · <strong>Website editor</strong></span>
        <span v-if="localMode" class="ed-local" title="Changes are saved to the files in this checkout, not the live website">Local files</span>
      </button>
      <div class="ed-topbar-right">
        <a href="/" target="_blank" rel="noopener" class="ed-viewlive">View the live site ↗</a>
        <button type="button" class="ed-findwords" @click="goSearchNav">Find words on the site</button>
        <span class="ed-user">
          <span class="ed-avatar">{{ editorInitials }}</span>
          <span class="ed-username">{{ editorName }}</span>
        </span>
        <button type="button" class="ed-signout" @click="handleSignOut">Sign out</button>
      </div>
    </header>

    <div class="ed-body">
      <!-- Every page, always one click away. A dot marks pages with unpublished changes. -->
      <nav class="ed-nav" aria-label="Website editor">
        <button type="button" class="ed-nav-link" :class="{ active: isHome }" @click="goHomeNav">
          <span class="ed-nav-label">Start</span>
        </button>
        <p class="ed-nav-head">Pages</p>
        <NuxtLink
          v-for="s in sections"
          :key="s.key"
          :to="`/admin/${s.key}`"
          class="ed-nav-link"
          active-class="active"
        >
          <span class="ed-nav-label">{{ s.label }}</span>
          <span v-if="changedFiles.has(s.file)" class="ed-nav-dot" title="Has unpublished changes">
            <span class="sr-only">(unpublished changes)</span>
          </span>
        </NuxtLink>
      </nav>

      <main class="ed-main">
        <slot />
      </main>

      <aside v-if="previewOpen" class="ed-pv" aria-label="Preview">
        <AdminPreview @close="preview.setOpen(false)" />
      </aside>
    </div>

    <!-- Bottom bar (Screen 1) -->
    <footer class="ed-bottombar">
      <div class="ed-bottom-left">
        <span v-if="deploy" class="ed-deploy" :class="deploy.state" role="status">
          <span v-if="deploy.state === 'building'" class="sheet-spinner" aria-hidden="true"></span>
          <span v-else-if="deploy.state === 'live' || deploy.state === 'local'" class="ed-deploy-tick" aria-hidden="true">✓</span>
          <span>{{ deployLine }}</span>
          <a v-if="deploy.state === 'live'" href="/" target="_blank" rel="noopener">View it ↗</a>
        </span>
        <template v-else>
          <span class="ed-saved">✓ Everything you type is saved on this device</span>
          <span class="ed-changes">{{ changesLine }}</span>
        </template>
      </div>
      <div class="ed-bottom-right">
        <button type="button" class="ed-preview" :aria-pressed="previewOpen" @click="preview.setOpen(!previewOpen)">
          {{ previewOpen ? 'Hide preview' : 'Preview your changes' }}
        </button>
        <button type="button" class="ed-publish" @click="openPublish">{{ publishLabel }}</button>
      </div>
    </footer>

    <!-- Publish sheet (Screen 7) -->
    <div
      v-if="publishOpen"
      class="sheet-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Review and publish"
      @click.self="closePublish"
    >
      <div ref="sheetEl" class="sheet" tabindex="-1">
        <div class="sheet-head">
          <h3 class="sheet-title">{{ sheetTitle }}</h3>
          <p class="sheet-body">{{ sheetBody }}</p>
        </div>

        <div v-if="sheetList && missingRows.length" class="sheet-missing">
          <p class="sheet-missing-title">
            {{ missingRows.length === 1 ? '1 thing needs' : `${missingRows.length} things need` }} filling in
          </p>
          <p class="sheet-missing-body">
            These show on your website, so they can't be left empty. Fill them in, or undo the change that emptied them.
          </p>
          <ul class="sheet-missing-list">
            <li v-for="r in missingRows" :key="r.id" class="sheet-missing-row">
              <span class="sheet-missing-where"><strong>{{ r.page }}</strong> · {{ r.where }}</span>
              <button type="button" class="sheet-missing-fix" @click="fixMissing(r)">Fill in</button>
            </li>
          </ul>
        </div>

        <div v-if="sheetList" class="sheet-list">
          <div v-for="p in pending" :key="p.key" class="sheet-row" :class="{ open: openKey === p.key }">
            <div class="sheet-row-top">
              <div class="sheet-row-main">
                <span class="sheet-row-what">{{ p.what }}</span>
                <span class="sheet-row-meta">
                  {{ pageNameFor(p.file) }} ·
                  <button type="button" class="sheet-row-toggle" @click="toggleDetails(p.key)">
                    {{ openKey === p.key ? 'Hide details' : 'See what changed' }}
                  </button>
                </span>
              </div>
              <button type="button" class="sheet-undo" @click="undoOne(p.key)">Undo this one</button>
            </div>
            <ul v-if="openKey === p.key" class="sheet-diff">
              <li v-for="(d, i) in detailsFor(p.key)" :key="i" class="sheet-diff-line" :class="d.kind">
                <span class="sheet-diff-label">{{ d.label }}</span>
                <span class="sheet-diff-vals">
                  <template v-if="d.kind === 'added'">Added {{ d.after }}</template>
                  <template v-else-if="d.kind === 'removed'">Removed {{ d.before }}</template>
                  <template v-else-if="d.before != null && d.after">
                    <s>{{ d.before }}</s> <span class="sheet-diff-new">{{ d.after }}</span>
                  </template>
                  <template v-else>{{ d.after }}</template>
                </span>
              </li>
            </ul>
          </div>
          <p v-if="newPhotoCount" class="sheet-photos">
            Plus {{ newPhotoCount }} new photo{{ newPhotoCount === 1 ? '' : 's' }}, sent along with the changes that use {{ newPhotoCount === 1 ? 'it' : 'them' }}.
          </p>
        </div>

        <div v-if="publishing" class="sheet-publishing">
          <span class="sheet-spinner" aria-hidden="true"></span>
          <span>{{ progress || 'Sending your changes to the website…' }}</span>
        </div>

        <p v-if="publishError" class="sheet-error">{{ publishError }}</p>
        <p v-if="publishNotice" class="sheet-notice">{{ publishNotice }}</p>

        <div class="sheet-foot">
          <button
            v-if="canPublish && !conflict"
            type="button"
            class="sheet-discard"
            @click="discardEverything"
          >
            Throw away all changes
          </button>
          <button type="button" class="sheet-close" @click="closePublish">{{ closeLabel }}</button>
          <button
            v-if="conflict && !blocked"
            type="button"
            class="sheet-confirm"
            :disabled="rebasing"
            @click="doRebase"
          >
            {{ rebasing ? 'Publishing…' : 'Publish anyway' }}
          </button>
          <button v-else-if="canPublish && !blocked" type="button" class="sheet-confirm" @click="doPublish">
            Yes, publish it
          </button>
        </div>
      </div>
    </div>

    <!-- Toast (Screen 8) -->
    <div v-if="toast" class="toast" role="status" aria-live="polite">
      <span>{{ toast.message }}</span>
      <button v-if="toast.undoKey || toast.hasAction" type="button" class="toast-undo" @click="onToastUndo">Undo</button>
    </div>
    <ClientOnly><AdminFocusDialog /></ClientOnly>
  </div>
</template>

<script setup>
import { pageNameFor } from '~/admin/diff'
import { missingInFiles, sections } from '~/admin/schema'
import { buildState, isLocal, liveVersion } from '~/utils/adminGithub'

// The vault is never a search result.
useHead({ meta: [{ name: 'robots', content: 'noindex, nofollow' }] })

const router = useRouter()
const route = useRoute()
const { pending, pendingCount, newPhotos, draftFiles, flushEdits, publishAll, rebaseOnLatest, changeDetails, undo, discardAll } =
  useDrafts()
const photos = usePendingPhotos()
const preview = useAdminPreview()
const previewOpen = computed(() => preview.open.value)

const openKey = ref(null)
function toggleDetails(key) {
  openKey.value = openKey.value === key ? null : key
}
function detailsFor(key) {
  return changeDetails(key)?.lines ?? []
}
const { screen, toast, showToast, hideToast, runToastAction, editorName, editorInitials } = useAdminUi()
const { token, logout } = useAdminAuth()
const localMode = computed(() => isLocal(token.value))

const isHome = computed(() => route.path.replace(/\/$/, '') === '/admin')
const changedFiles = computed(() => new Set(pending.value.map((p) => p.file)))
// Only the new photos this publish sends: an upload that was swapped out again stays on this device.
const newPhotoCount = computed(() => newPhotos.value.length)

const publishOpen = ref(false)
const publishing = ref(false)
const progress = ref('')
const publishError = ref('')
const publishNotice = ref('')
const conflict = ref(false)
const rebasing = ref(false)
const sheetEl = ref(null)

// ---- After publishing: follow the deploy until visitors can see the change ----
// { state: 'building' | 'live' | 'failed' | 'slow' | 'unknown' | 'local', commit, at, before }
const deploy = useState('admin_deploy', () => null)
let pollTimer = null

const deployLine = computed(() => {
  switch (deploy.value?.state) {
    case 'building':
      return 'Updating the website… this usually takes about 2 minutes. You can keep working.'
    case 'live':
      return 'Your changes are live.'
    case 'failed':
      return "The website couldn't be updated. Your changes are safely saved; ask whoever set up the site to check the build."
    case 'slow':
      return 'Still updating. It is taking longer than usual; check the site again in a few minutes.'
    case 'unknown':
      return 'Published. Your changes should be live within a few minutes.'
    case 'local':
      return 'Saved to the files on this computer.'
    default:
      return ''
  }
})

function startDeploy(result, before) {
  if (localMode.value) {
    // The files on disk changed: reload the preview so every page in it shows them.
    deploy.value = { state: 'local' }
    preview.reload()
    return
  }
  // Keep showing the published content in the preview until the new build is live.
  preview.recent.value = result.files
  deploy.value = { state: 'building', commit: result.commit, at: Date.now(), before: before?.sha ?? null, builtAt: null }
  pollDeploy()
}

function finishDeploy(state) {
  const d = deploy.value
  if (!d) return
  d.state = state
  clearTimeout(pollTimer)
  if (state === 'live' || state === 'unknown') {
    preview.recent.value = {}
    preview.reload()
  }
  if (state === 'live') showToast('Your changes are live on ontariorare.ca.')
}

async function pollDeploy() {
  clearTimeout(pollTimer)
  const d = deploy.value
  if (!d || d.state !== 'building') return
  const [build, live] = await Promise.all([buildState(token.value, d.commit), liveVersion()])
  if (deploy.value !== d || d.state !== 'building') return
  const now = Date.now()
  if (build === 'failed') return finishDeploy('failed')
  // Live once the site reports this commit, or a build that started after it (which includes it).
  if (live && (live.sha === d.commit || (live.sha !== d.before && Date.parse(live.builtAt) > d.at + 20000))) {
    return finishDeploy('live')
  }
  // Sites built before /version.json existed can't say which commit they are: give GitHub Pages
  // a minute after the build finishes.
  if (!live && build === 'built') {
    d.builtAt ??= now
    if (now - d.builtAt > 60000) return finishDeploy('live')
  }
  if (!live && build === 'unknown' && now - d.at > 3 * 60000) return finishDeploy('unknown')
  if (now - d.at > 12 * 60000) return finishDeploy('slow')
  pollTimer = setTimeout(pollDeploy, 8000)
}

const changesLine = computed(() => {
  const c = pendingCount.value
  if (c === 0) return 'Nothing waiting — the website matches what you see here.'
  return c === 1
    ? "1 change is waiting to go live. Visitors can't see it yet."
    : `${c} changes are waiting to go live. Visitors can't see them yet.`
})

const publishLabel = computed(() =>
  pendingCount.value === 0 ? 'Everything is published' : `Review & publish (${pendingCount.value})`,
)

const sheetList = computed(() => publishOpen.value && !publishing.value && pendingCount.value > 0)
const canPublish = computed(() => !publishing.value && pendingCount.value > 0)

// Required fields left empty in what would go out. The sheet lists them, each with a button that
// opens the page at that field, and holds the publish button back until they're filled.
const missingRows = computed(() =>
  missingInFiles(draftFiles.value).flatMap(({ section, missing }) =>
    missing.map((m) => ({
      id: `${section.key}:${m.path}`,
      key: section.key,
      path: m.path,
      page: section.label,
      where: m.where.join(' › '),
    })),
  ),
)
const blocked = computed(() => missingRows.value.length > 0)
// The section page scrolls to and focuses ?fill= once its form has loaded.
function fixMissing(row) {
  publishOpen.value = false
  router.push({ path: `/admin/${row.key}`, query: { fill: row.path } })
}
const closeLabel = computed(() =>
  publishing.value ? 'Close' : pendingCount.value > 0 ? 'Not yet' : 'Close',
)

const sheetTitle = computed(() => {
  if (publishing.value) return 'Publishing…'
  const c = pendingCount.value
  if (c && blocked.value) return 'Almost ready to publish'
  return c === 0 ? 'Nothing to publish' : `Publish ${c} change${c === 1 ? '' : 's'} to the website?`
})

const sheetBody = computed(() => {
  if (publishing.value) return 'You can close this and carry on — it keeps going in the background.'
  if (pendingCount.value === 0) {
    return "Everything you've done is already live. Make a change and it'll show up here."
  }
  if (blocked.value) return 'Your changes are saved on this device. Publishing opens up once the list below is done.'
  return localMode.value
    ? 'These will be written to the files on this computer. Nothing goes to the live website.'
    : "These will appear on ontariorare.ca in about two minutes; the bar at the bottom tells you when they're live. If something's wrong you can undo any of them first."
})

// A new change means the last publish's status no longer describes what's on screen.
watch(pendingCount, (val, old) => {
  if (val > old && deploy.value && deploy.value.state !== 'building') deploy.value = null
})

function goHomeNav() {
  screen.value = 'home'
  router.push('/admin')
}
function goSearchNav() {
  screen.value = 'search'
  router.push('/admin')
}
function handleSignOut() {
  logout()
  router.push('/admin/login?out=1')
}
function openPublish() {
  flushEdits() // the last half second of typing, so the sheet checks what's actually on screen
  publishError.value = ''
  publishNotice.value = ''
  conflict.value = false
  publishOpen.value = true
  nextTick(() => sheetEl.value?.focus())
}
function closePublish() {
  publishOpen.value = false
}
function undoOne(key) {
  undo(key)
  showToast('Change reverted. The website is untouched.')
}
function onToastUndo() {
  const k = toast.value?.undoKey
  if (k) {
    undo(k)
    hideToast()
  } else runToastAction()
}
async function discardEverything() {
  const c = pendingCount.value
  if (!confirm(`Throw away all ${c} change${c === 1 ? '' : 's'}? This can't be undone. The website stays as it is.`)) return
  await discardAll()
  publishOpen.value = false
  showToast('All changes thrown away. The website is untouched.')
}

function describeOverlaps(overlaps) {
  return overlaps
    .map((o) => `${pageNameFor(o.file)} (${o.sections.join(', ')})`)
    .join('; ')
}

function explain(e) {
  if (e && e.code === 'conflict') {
    return `The website changed again while publishing (${pageNameFor(e.file || '')}). Please try again.`
  }
  if (e && (e.code === 'photo-missing' || e.code === 'missing-fields')) return e.message
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return "You're offline. Your changes are saved on this device; publish again once you're connected."
  }
  return (e && e.message) || 'Something went wrong publishing. Please try again.'
}

async function publishNow() {
  const before = localMode.value ? null : await liveVersion()
  const result = await publishAll((text) => (progress.value = text))
  publishOpen.value = false
  if (result) startDeploy(result, before)
  if (localMode.value) showToast('Saved to the files on this computer.')
}

async function doPublish() {
  publishing.value = true
  progress.value = ''
  publishError.value = ''
  publishNotice.value = ''
  conflict.value = false
  try {
    try {
      await publishNow()
    } catch (e) {
      if (!e || e.code !== 'conflict') throw e
      // Someone published since these drafts were loaded. Pick up their version, keep our edits
      // on top, and publish straight away unless we both touched the same section.
      progress.value = 'Someone else updated the website meanwhile. Combining your changes with theirs…'
      const overlaps = await rebaseOnLatest()
      if (overlaps.length) {
        conflict.value = true
        publishError.value = `Someone else also edited ${describeOverlaps(overlaps)} since you started. Your changes are safe and now sit on top of the latest version. Publishing will replace their version of those parts with yours — undo the ones below you'd rather not, then click "Publish anyway".`
        return
      }
      await publishNow()
    }
  } catch (e) {
    publishError.value = explain(e)
  } finally {
    publishing.value = false
  }
}

async function doRebase() {
  // Reached only via "Publish anyway": drafts are already on the latest version, so just publish.
  rebasing.value = true
  conflict.value = false
  publishError.value = ''
  try {
    await publishNow()
  } catch (e) {
    publishError.value = explain(e)
  } finally {
    rebasing.value = false
  }
}

function onKey(e) {
  if (e.key === 'Escape' && publishOpen.value) closePublish()
}
// Closing the tab mid-publish could leave photos half sent.
function beforeUnload(e) {
  if (publishing.value || rebasing.value) {
    e.preventDefault()
    e.returnValue = ''
  }
}
onMounted(() => {
  photos.ensureLoaded()
  window.addEventListener('keydown', onKey)
  window.addEventListener('beforeunload', beforeUnload)
  if (deploy.value?.state === 'building') pollDeploy()
})
onBeforeUnmount(() => {
  clearTimeout(pollTimer)
  window.removeEventListener('keydown', onKey)
  window.removeEventListener('beforeunload', beforeUnload)
})
</script>

<style scoped>
.ed-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg);
  color: var(--ink);
  font-family: var(--sans);
}

/* ---- Top bar ---- */
.ed-topbar {
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 28px;
  background: var(--primary);
  color: #fff;
  flex-shrink: 0;
}
.ed-brand {
  display: flex;
  align-items: center;
  gap: 11px;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
}
.ed-brand img {
  border-radius: 6px;
  display: block;
}
.ed-brand-text {
  font-family: var(--mono);
  font-size: 13px;
  color: #fff;
}
.ed-brand-text strong {
  font-weight: 500;
}
.ed-topbar-right {
  display: flex;
  align-items: center;
  gap: 22px;
  font-size: 14px;
}
.ed-viewlive {
  color: rgba(255, 255, 255, 0.82);
}
.ed-viewlive:hover {
  color: #fff;
}
.ed-findwords {
  background: none;
  border: 1px solid rgba(255, 255, 255, 0.32);
  border-radius: 999px;
  padding: 7px 16px;
  font-size: 13.5px;
  color: #fff;
  cursor: pointer;
  transition: background 0.15s ease;
}
.ed-findwords:hover {
  background: rgba(255, 255, 255, 0.12);
}
.ed-signout {
  background: none;
  border: none;
  padding: 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.82);
  cursor: pointer;
}
.ed-signout:hover {
  color: #fff;
  text-decoration: underline;
}
.ed-user {
  display: flex;
  align-items: center;
  gap: 9px;
}
.ed-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.16);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
}
.ed-username {
  color: rgba(255, 255, 255, 0.82);
}

/* ---- Main ---- */
.ed-main {
  flex: 1;
  padding: 44px 56px 48px;
}

/* ---- Bottom bar ---- */
.ed-bottombar {
  position: sticky;
  bottom: 0;
  z-index: 20;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 16px 28px;
  background: #fff;
  border-top: 1px solid var(--line);
}
.ed-bottom-left {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.ed-saved {
  font-size: 14.5px;
  font-weight: 600;
  color: #1a7a3a;
}
.ed-changes {
  font-size: 13.5px;
  color: var(--muted);
}
.ed-bottom-right {
  display: flex;
  align-items: center;
  gap: 12px;
}
.ed-preview {
  background: none;
  border: 1px solid #d8cfbb;
  border-radius: 999px;
  padding: 12px 22px;
  font-size: 14.5px;
  font-weight: 600;
  color: var(--ink);
  cursor: pointer;
  transition: border-color 0.15s ease, color 0.15s ease;
}
.ed-preview:hover {
  border-color: var(--primary);
  color: var(--primary);
}
.ed-publish {
  background: var(--accent);
  border: none;
  border-radius: 999px;
  padding: 13px 26px;
  font-size: 15px;
  font-weight: 700;
  color: var(--primary-deep);
  cursor: pointer;
  transition: transform 0.15s ease;
}
.ed-publish:hover {
  transform: translateY(-2px);
}

/* ---- Publish sheet ---- */
.sheet-overlay {
  position: fixed;
  inset: 0;
  z-index: 40;
  background: rgba(26, 22, 38, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px;
  animation: ed-fadein 0.15s ease;
}
.sheet {
  width: 620px;
  max-width: 100%;
  max-height: 100%;
  overflow: auto;
  background: var(--bg);
  border-radius: 16px;
  padding: 34px 36px;
  display: flex;
  flex-direction: column;
  gap: 22px;
  box-shadow: 0 30px 70px rgba(0, 0, 0, 0.35);
  animation: ed-sheetin 0.2s ease;
  outline: none;
}
.sheet-head {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.sheet-title {
  margin: 0;
  font-family: var(--serif);
  font-size: 30px;
  font-weight: 500;
  color: var(--primary-deep);
}
.sheet-body {
  margin: 0;
  font-size: 15.5px;
  line-height: 1.6;
  color: var(--muted);
}
.sheet-list {
  display: flex;
  flex-direction: column;
  gap: 9px;
}
.sheet-missing {
  background: #fbeff1;
  border: 1px solid #e8c4cc;
  border-radius: 10px;
  padding: 14px 18px;
  color: #8a1b30;
}
.sheet-missing-title {
  margin: 0;
  font-size: 15.5px;
  font-weight: 700;
}
.sheet-missing-body {
  margin: 4px 0 10px;
  font-size: 14px;
  line-height: 1.5;
}
.sheet-missing-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.sheet-missing-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  background: #fff;
  border: 1px solid #efd6dc;
  border-radius: 8px;
  padding: 8px 8px 8px 12px;
  font-size: 14px;
  color: var(--ink);
}
.sheet-missing-where {
  min-width: 0;
  overflow-wrap: anywhere;
}
.sheet-missing-fix {
  flex-shrink: 0;
  min-height: 36px;
  padding: 0 14px;
  border: 1px solid #a6203a;
  border-radius: 7px;
  background: #fff;
  color: #a6203a;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}
.sheet-missing-fix:hover {
  background: #a6203a;
  color: #fff;
}
.sheet-row {
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 9px;
  padding: 13px 16px;
}
.sheet-row-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
}
.sheet-row-main {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}
.sheet-row-meta {
  font-size: 12.5px;
  color: var(--muted);
}
.sheet-row-toggle {
  background: none;
  border: none;
  padding: 0;
  font: inherit;
  color: var(--primary);
  cursor: pointer;
  text-decoration: underline;
}
.sheet-diff {
  list-style: none;
  margin: 12px 0 0;
  padding: 10px 0 0;
  border-top: 1px dashed var(--line);
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.sheet-diff-line {
  display: grid;
  grid-template-columns: minmax(120px, 38%) 1fr;
  gap: 12px;
  font-size: 13.5px;
  line-height: 1.45;
}
.sheet-diff-label {
  color: var(--muted);
}
.sheet-diff-vals {
  color: var(--ink);
  overflow-wrap: anywhere;
}
.sheet-diff-vals s {
  color: #a6203a;
  opacity: 0.8;
  margin-right: 6px;
}
.sheet-diff-new {
  color: #1f5a33;
  font-weight: 600;
}
.sheet-diff-line.added .sheet-diff-vals {
  color: #1f5a33;
}
.sheet-diff-line.removed .sheet-diff-vals {
  color: #a6203a;
}
.sheet-row-what {
  font-size: 14.5px;
  color: var(--ink);
}
.sheet-undo {
  background: none;
  border: none;
  padding: 0;
  font-size: 13.5px;
  font-weight: 600;
  color: var(--muted);
  cursor: pointer;
  flex-shrink: 0;
}
.sheet-undo:hover {
  color: #a6203a;
  text-decoration: underline;
}
.sheet-publishing {
  display: flex;
  align-items: center;
  gap: 14px;
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 10px;
  padding: 18px 20px;
  font-size: 15px;
  color: var(--ink);
}
.sheet-spinner {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 3px solid var(--line);
  border-top-color: var(--primary);
  display: block;
  animation: ed-spin 0.9s linear infinite;
  flex-shrink: 0;
}
.sheet-error {
  margin: 0;
  background: #fbeff1;
  border: 1px solid #e8c4cc;
  border-radius: 10px;
  padding: 14px 18px;
  font-size: 14.5px;
  color: #8a1b30;
  line-height: 1.55;
}
.sheet-notice {
  margin: 0;
  background: #eef6f0;
  border: 1px solid #c3dccb;
  border-radius: 10px;
  padding: 14px 18px;
  font-size: 14.5px;
  color: #1f5a33;
  line-height: 1.55;
}
.sheet-confirm:disabled {
  opacity: 0.6;
  cursor: default;
}
.sheet-foot {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
}
.sheet-close {
  background: none;
  border: 1px solid #d8cfbb;
  border-radius: 999px;
  padding: 12px 24px;
  font-size: 15px;
  font-weight: 600;
  color: var(--ink);
  cursor: pointer;
}
.sheet-close:hover {
  border-color: var(--primary);
  color: var(--primary);
}
.sheet-confirm {
  background: var(--accent);
  border: none;
  border-radius: 999px;
  padding: 13px 28px;
  font-size: 15.5px;
  font-weight: 700;
  color: var(--primary-deep);
  cursor: pointer;
  transition: transform 0.15s ease;
}
.sheet-confirm:hover {
  transform: translateY(-2px);
}

/* ---- Toast ---- */
.toast {
  position: fixed;
  left: 50%;
  bottom: 98px;
  transform: translateX(-50%);
  z-index: 50;
  background: var(--ink);
  color: #fff;
  padding: 14px 22px;
  border-radius: 999px;
  font-size: 14.5px;
  display: flex;
  align-items: center;
  gap: 18px;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.28);
  animation: ed-toastin 0.2s ease;
  max-width: calc(100vw - 32px);
}
.toast-undo {
  background: none;
  border: none;
  padding: 0;
  color: var(--accent);
  font-size: 14.5px;
  font-weight: 700;
  cursor: pointer;
  text-decoration: underline;
  flex-shrink: 0;
}

@keyframes ed-fadein {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes ed-sheetin {
  from { opacity: 0; transform: translateY(16px) scale(0.99); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes ed-toastin {
  from { opacity: 0; transform: translate(-50%, 12px); }
  to { opacity: 1; transform: translate(-50%, 0); }
}
@keyframes ed-spin {
  to { transform: rotate(360deg); }
}

/* ---- Body: page list | form | live preview ---- */
.ed-shell {
  --ed-top: 56px;
  --ed-bottom: 74px;
}
.ed-body {
  flex: 1;
  display: flex;
  align-items: flex-start;
  min-height: 0;
}
.ed-main {
  min-width: 0;
}
.pv-open .ed-main {
  padding: 32px 36px 44px;
}
.ed-nav {
  position: sticky;
  top: var(--ed-top);
  width: 232px;
  flex-shrink: 0;
  max-height: calc(100vh - var(--ed-top) - var(--ed-bottom));
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 24px 12px 24px 16px;
  border-right: 1px solid var(--line);
}
.ed-nav-head {
  margin: 18px 10px 6px;
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}
.ed-nav-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
  text-align: left;
  background: none;
  border: none;
  border-radius: 8px;
  padding: 8px 10px;
  font: inherit;
  font-size: 14px;
  line-height: 1.3;
  color: var(--ink);
  text-decoration: none;
  cursor: pointer;
}
.ed-nav-link:hover {
  background: rgba(30, 1, 119, 0.06);
}
.ed-nav-link.active {
  background: rgba(30, 1, 119, 0.1);
  color: var(--primary);
  font-weight: 600;
}
.ed-nav-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #d99a00;
  box-shadow: 0 0 0 3px rgba(254, 215, 0, 0.35);
  flex-shrink: 0;
}
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}
.ed-pv {
  position: sticky;
  top: var(--ed-top);
  width: clamp(420px, 42vw, 780px);
  height: calc(100vh - var(--ed-top) - var(--ed-bottom));
  flex-shrink: 0;
  border-left: 1px solid var(--line);
}
.ed-local {
  margin-left: 4px;
  font-family: var(--sans);
  font-size: 11.5px;
  font-weight: 600;
  background: var(--accent);
  color: var(--ink);
  border-radius: 999px;
  padding: 3px 9px;
}

/* ---- After publishing ---- */
.ed-deploy {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 14px;
  color: var(--ink);
}
.ed-deploy.live,
.ed-deploy.local {
  color: #1f5a33;
  font-weight: 600;
}
.ed-deploy.failed {
  color: #9b2c1f;
}
.ed-deploy a {
  color: var(--primary);
  font-weight: 600;
}
.ed-deploy-tick {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #2e7d4f;
  color: #fff;
  font-size: 12px;
}
.ed-deploy .sheet-spinner {
  width: 16px;
  height: 16px;
}
.sheet-photos {
  margin: 6px 0 0;
  font-size: 13.5px;
  color: var(--muted);
}
.sheet-discard {
  margin-right: auto;
  background: none;
  border: none;
  padding: 0;
  font-size: 14px;
  color: #9b2c1f;
  text-decoration: underline;
  cursor: pointer;
}

/* ---- Responsive ---- */
@media (max-width: 1279px) {
  /* Not enough room beside the form: the preview opens over it instead. */
  .ed-pv {
    position: fixed;
    inset: 0;
    z-index: 30;
    width: auto;
    height: auto;
    border-left: none;
  }
  .pv-open .ed-main {
    padding: 44px 56px 48px;
  }
}
@media (max-width: 1099px) {
  .ed-nav {
    display: none;
  }
}
@media (max-width: 900px) {
  .ed-main,
  .pv-open .ed-main {
    padding: 28px 20px 40px;
  }
  .ed-topbar {
    padding: 12px 18px;
    gap: 12px;
    flex-wrap: wrap;
  }
  .ed-topbar-right {
    gap: 14px;
  }
  .ed-bottombar {
    flex-wrap: wrap;
    gap: 12px;
  }
  .ed-bottom-right {
    width: 100%;
  }
  .ed-publish {
    flex: 1;
    justify-content: center;
    text-align: center;
  }
}

@media (prefers-reduced-motion: reduce) {
  .ed-publish:hover,
  .sheet-confirm:hover {
    transform: none;
  }
  .sheet-overlay,
  .sheet,
  .toast {
    animation: none;
  }
  .sheet-spinner {
    animation-duration: 2s;
  }
}
</style>
