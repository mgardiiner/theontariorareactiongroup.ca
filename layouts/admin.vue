<template>
  <div class="ed-shell">
    <!-- Top bar (Screen 1) -->
    <header class="ed-topbar">
      <button type="button" class="ed-brand" @click="goHomeNav">
        <img src="/logo.png" width="28" height="28" alt="" />
        <span class="ed-brand-text">Ontario Rare · <strong>Website editor</strong></span>
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

    <main class="ed-main">
      <slot />
    </main>

    <!-- Bottom bar (Screen 1) -->
    <footer class="ed-bottombar">
      <div class="ed-bottom-left">
        <span class="ed-saved">✓ Everything you type is saved automatically</span>
        <span class="ed-changes">{{ changesLine }}</span>
      </div>
      <div class="ed-bottom-right">
        <button type="button" class="ed-preview" @click="previewSite">Preview the site</button>
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
        </div>

        <div v-if="publishing" class="sheet-publishing">
          <span class="sheet-spinner" aria-hidden="true"></span>
          <span>Sending your changes to the website…</span>
        </div>

        <p v-if="publishError" class="sheet-error">{{ publishError }}</p>
        <p v-if="publishNotice" class="sheet-notice">{{ publishNotice }}</p>

        <div class="sheet-foot">
          <button type="button" class="sheet-close" @click="closePublish">{{ closeLabel }}</button>
          <button
            v-if="conflict"
            type="button"
            class="sheet-confirm"
            :disabled="rebasing"
            @click="doRebase"
          >
            {{ rebasing ? 'Publishing…' : 'Publish anyway' }}
          </button>
          <button v-else-if="canPublish" type="button" class="sheet-confirm" @click="doPublish">
            Yes, publish it
          </button>
        </div>
      </div>
    </div>

    <!-- Toast (Screen 8) -->
    <div v-if="toast" class="toast" role="status" aria-live="polite">
      <span>{{ toast.message }}</span>
      <button v-if="toast.undoKey" type="button" class="toast-undo" @click="onToastUndo">Undo</button>
    </div>
  </div>
</template>

<script setup>
import { pageNameFor } from '~/admin/diff'

const router = useRouter()
const { pending, pendingCount, publishAll, rebaseOnLatest, changeDetails, undo } = useDrafts()

const openKey = ref(null)
function toggleDetails(key) {
  openKey.value = openKey.value === key ? null : key
}
function detailsFor(key) {
  return changeDetails(key)?.lines ?? []
}
const { screen, toast, showToast, hideToast, editorName, editorInitials } = useAdminUi()
const { logout } = useAdminAuth()

const publishOpen = ref(false)
const publishing = ref(false)
const publishError = ref('')
const publishNotice = ref('')
const conflict = ref(false)
const rebasing = ref(false)
const publishedJustNow = ref(false)
const sheetEl = ref(null)

const changesLine = computed(() => {
  const c = pendingCount.value
  if (c === 0) {
    return publishedJustNow.value
      ? 'Published. Your website is updating now.'
      : 'Nothing waiting — the website matches what you see here.'
  }
  return `${c} change${c === 1 ? ' is' : 's are'} waiting to go live. Visitors can't see them yet.`
})

const publishLabel = computed(() =>
  pendingCount.value === 0 ? 'Everything is published' : `Review & publish (${pendingCount.value})`,
)

const sheetList = computed(() => publishOpen.value && !publishing.value && pendingCount.value > 0)
const canPublish = computed(() => !publishing.value && pendingCount.value > 0)
const closeLabel = computed(() =>
  publishing.value ? 'Close' : pendingCount.value > 0 ? 'Not yet' : 'Close',
)

const sheetTitle = computed(() => {
  if (publishing.value) return 'Publishing…'
  const c = pendingCount.value
  return c === 0 ? 'Nothing to publish' : `Publish ${c} change${c === 1 ? '' : 's'} to the website?`
})

const sheetBody = computed(() => {
  if (publishing.value) return 'You can close this and carry on — it keeps going in the background.'
  return pendingCount.value === 0
    ? "Everything you've done is already live. Make a change and it'll show up here."
    : "These will appear on ontariorare.ca in about two minutes — if you don't see them, refresh the page. If something's wrong you can undo any of them first."
})

// Once a new change lands, we're no longer in the "just published" state.
watch(pendingCount, (val, old) => {
  if (val > old) publishedJustNow.value = false
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
  router.push('/admin/login')
}
function previewSite() {
  const win = window.open('/', 'orag-preview')
  if (!win) {
    showToast('Your browser blocked the preview tab. Allow pop-ups for this page, then try again.')
    return
  }
  win.focus()
  showToast(
    pendingCount.value > 0
      ? "Opened the site in a new tab. It shows what's live now — your waiting changes appear there once you publish."
      : 'Opened the site in a new tab.',
  )
}
function openPublish() {
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
  if (k) undo(k)
  hideToast()
}

function describeOverlaps(overlaps) {
  return overlaps
    .map((o) => `${pageNameFor(o.file)} (${o.sections.join(', ')})`)
    .join('; ')
}

async function doPublish() {
  publishing.value = true
  publishError.value = ''
  publishNotice.value = ''
  conflict.value = false
  try {
    try {
      await publishAll()
    } catch (e) {
      if (!e || e.code !== 'conflict') throw e
      // Someone published since these drafts were loaded. Pick up their version, keep our edits
      // on top, and publish straight away unless we both touched the same section.
      const overlaps = await rebaseOnLatest()
      if (overlaps.length) {
        publishing.value = false
        conflict.value = true
        publishError.value = `Someone else also edited ${describeOverlaps(overlaps)} since you started. Your changes are safe and now sit on top of the latest version. Publishing will replace their version of those parts with yours — undo the ones below you'd rather not, then click "Publish anyway".`
        return
      }
      await publishAll()
    }
    publishing.value = false
    publishOpen.value = false
    publishedJustNow.value = true
    showToast('Published. Your website is updating now.')
  } catch (e) {
    publishing.value = false
    if (e && e.code === 'conflict') {
      publishError.value = `The website changed again while publishing (${pageNameFor(e.file || '')}). Please try again.`
    } else {
      publishError.value = (e && e.message) || 'Something went wrong publishing. Please try again.'
    }
  }
}

async function doRebase() {
  // Reached only via "Publish anyway": drafts are already on the latest version, so just publish.
  rebasing.value = true
  conflict.value = false
  try {
    await publishAll()
    publishOpen.value = false
    publishedJustNow.value = true
    showToast('Published. Your website is updating now.')
  } catch (e) {
    publishError.value =
      e && e.code === 'conflict'
        ? `The website changed again while publishing (${pageNameFor(e.file || '')}). Please try again.`
        : (e && e.message) || 'Something went wrong publishing. Please try again.'
  } finally {
    rebasing.value = false
  }
}

function onKey(e) {
  if (e.key === 'Escape' && publishOpen.value) closePublish()
}
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
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

/* ---- Responsive ---- */
@media (max-width: 900px) {
  .ed-main {
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
