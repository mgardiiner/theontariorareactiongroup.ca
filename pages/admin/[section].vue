<template>
  <div>
    <NuxtLink to="/admin" class="back">← All sections</NuxtLink>

    <template v-if="!section">
      <h1>Section not found</h1>
      <p>There's no editable section called “{{ route.params.section }}”.</p>
    </template>

    <template v-else>
      <div class="ed-head">
        <div>
          <h1>{{ section.label }}</h1>
          <p v-if="section.description" class="sub">{{ section.description }}</p>
          <a v-if="section.path" :href="section.path" target="_blank" rel="noopener" class="view-page">View the live page ↗</a>
        </div>
        <div class="ed-actions" role="status" aria-live="polite">
          <span v-if="saving" class="save-state">Saving…</span>
          <span v-else-if="hasDraft" class="save-state saved">✓ Saved on this device, not published yet</span>
        </div>
      </div>

      <p v-if="loadError" class="banner err">{{ loadError }}</p>
      <p v-if="saveError" class="banner err">{{ saveError }}</p>

      <div v-if="loading" class="loading">Loading current content…</div>

      <form v-else-if="data" ref="formEl" class="ed-form" @submit.prevent="save">
        <AdminField v-for="f in mainFields" :key="f.key" :field="f" :obj="data" :path="f.key" :vpath="f.key" />

        <!-- Technical / rarely-touched fields live behind a fold so the everyday
             form stays short. -->
        <details v-if="advancedFields.length" class="ed-advanced">
          <summary>
            <span class="ed-advanced-title">Advanced</span>
            <span class="ed-advanced-sub">Search-engine text and connections — you'll rarely need these.</span>
          </summary>
          <div class="ed-advanced-body">
            <AdminField v-for="f in advancedFields" :key="f.key" :field="f" :obj="data" :path="f.key" :vpath="f.key" />
          </div>
        </details>

        <p class="ed-foot-note">
          Your changes save as you type. They go live when you press <strong>Review &amp; publish</strong>.
        </p>
      </form>
    </template>
  </div>
</template>

<script setup>
import { getSection, normalize } from '~/admin/schema'
import { parseEventDate } from '~/admin/tasks'

definePageMeta({
  layout: 'admin',
  middleware: 'admin-auth',
  // "Fill in" (?fill=) scrolls to its field once the form has loaded; the usual jump to the top
  // after a page change would land after that and undo it.
  scrollToTop: (to) => !to.query.fill,
})

const route = useRoute()
const { getData, registerFlush, stageChange, publishedData, pending, draftFiles, undo, discardFile } = useDrafts()
const preview = useAdminPreview()

const section = computed(() => getSection(route.params.section))
const mainFields = computed(() => (section.value?.fields || []).filter((f) => !f.advanced))
const advancedFields = computed(() => (section.value?.fields || []).filter((f) => f.advanced))

// Values the site derives from other fields, so editors never have to keep two
// things in sync by hand. Runs on every save; harmless for files without them.
function fillDerived(d) {
  if (Array.isArray(d?.upcoming)) {
    for (const ev of d.upcoming) {
      const { day, month } = parseEventDate(ev.date || '')
      ev.day = day
      ev.month = month
    }
  }
  return d
}

// Deep clone so our edits never mutate the draft store's cached object (which
// stageChange snapshots for Undo). getData returns the local draft if the file
// already has unsaved edits, otherwise a fresh load from GitHub.
const clone = (v) => (v == null ? v : JSON.parse(JSON.stringify(v)))

const data = ref(null)
// Expose the section's data so nested dropdowns can source choices from sibling
// fields (e.g. a story's filterKey from the filters list).
provide('adminRoot', data)
// What the live site has, so each field can offer "Changed · Undo".
const published = ref(null)
provide('adminPublished', published)

// "Fill in" in the review sheet opens this page as ?fill=<path of an empty required field>. Each
// bump of the counter opens the list items that have something missing (AdminField watches it).
const formEl = ref(null)
const revealCount = ref(0)
provide('adminRevealMissing', revealCount)
const router = useRouter()
let loadedFile = null // the file the form holds, so a jump never runs against the previous page's form
async function maybeReveal() {
  const path = route.query.fill
  if (typeof path !== 'string' || loading.value || !data.value || loadedFile !== section.value?.file) return
  // Out of the address again, so a refresh or Back doesn't jump a second time.
  const { fill: _, ...query } = route.query
  router.replace({ query })
  // A nested list only exists once the item holding it is open, so open one level per pass (the
  // first pass is the form itself appearing after the load).
  for (let i = 0; i < 4; i++) {
    revealCount.value++
    await nextTick()
  }
  const form = formEl.value
  if (!form) return
  const el = form.querySelector(`[data-req-path="${CSS.escape(path)}"]`) || form.querySelector('.is-missing')
  if (!el) return
  for (let d = el.closest('details'); d; d = d.parentElement?.closest('details')) d.open = true // "Advanced"
  el.scrollIntoView({ block: 'center' })
  // The box that's marked empty (in a list of words, the empty entry), else the box to type in, ahead
  // of the "Changed · Undo" button that can sit before it; for a list with nothing in it, "+ Add …".
  const target = ['[aria-invalid="true"]', '[contenteditable="true"]', 'input:not([type="file"])', 'textarea', 'select', '.afld-add', 'button']
    .map((s) => el.querySelector(s))
    .find(Boolean)
  target?.focus({ preventScroll: true })
}
watch(() => route.query.fill, maybeReveal) // already on this page; otherwise the load below runs it

const savedSnapshot = ref('')
const loading = ref(true)
const loadError = ref('')
const saveError = ref('')
const saving = ref(false)
// This visit's pending change. Autosaves keep adding to it, so the review list shows one
// "Edited the … page" entry per visit with one Undo, not one per keystroke.
const changeKey = ref(null)

const dirty = computed(() => data.value && JSON.stringify(data.value) !== savedSnapshot.value)
const hasDraft = computed(() => pending.value.some((p) => p.file === section.value?.file))

// Only the latest load may fill the form; an older one finishing late would put back stale content.
let loadSeq = 0

// `quiet`: a redraw because the draft changed elsewhere (Undo, publishing, "Throw away"). It keeps
// the form on screen and uses the copy already loaded, so there's no network wait for typing to
// land in and then be overwritten.
async function load({ quiet = false } = {}) {
  if (!section.value) return
  const seq = ++loadSeq
  if (!quiet) loading.value = true
  loadError.value = ''
  try {
    const json = await getData(section.value.file, { cached: quiet })
    if (seq !== loadSeq) return
    data.value = normalize(clone(json), section.value.fields)
    loadedFile = section.value.file
    savedSnapshot.value = JSON.stringify(data.value)
    lastStaged = currentDraft()
    published.value = normalize(publishedData(section.value.file) ?? clone(json), section.value.fields)
  } catch (e) {
    if (seq === loadSeq) loadError.value = e?.message || 'Could not load this section from GitHub.'
  } finally {
    if (seq === loadSeq) loading.value = false
  }
  if (seq === loadSeq) maybeReveal()
}

function save() {
  clearTimeout(timer)
  timer = null
  saving.value = false
  if (!dirty.value || !section.value) return
  saveError.value = ''
  try {
    const next = fillDerived(clone(data.value))
    const sameAs = (v) =>
      v != null && JSON.stringify(fillDerived(normalize(clone(v), section.value.fields))) === JSON.stringify(next)
    const file = section.value.file
    // Edited back to how it started? Then there's nothing to publish: drop the change rather than
    // keep an empty one in the review list. Back to the live version drops every change to this
    // page; back to where this visit began drops just this visit's.
    const mine = pending.value.find((p) => p.key === changeKey.value)
    const toLive = sameAs(published.value)
    if (toLive || (mine && sameAs(mine.before))) {
      changeKey.value = null
      if (toLive) discardFile(file)
      else undo(mine.key, { flush: false }) // this is the flush: don't save the form again from inside its save
      lastStaged = currentDraft() // our own change: the form already shows this, no reload
      savedSnapshot.value = JSON.stringify(data.value)
      return
    }
    lastStaged = next
    changeKey.value = stageChange(
      section.value.file,
      lastStaged,
      // "Home page" → "Edited the Home page", "About us" → "Edited the About us page"
      `Edited the ${section.value.label.replace(/ page$/i, '')} page`,
      changeKey.value,
    )
    savedSnapshot.value = JSON.stringify(data.value)
  } catch (e) {
    saveError.value = e?.message || 'Could not save. Please try again.'
  }
}

// Autosave shortly after typing stops, and show every keystroke in the preview straight away.
let timer = null
watch(
  data,
  (val) => {
    if (!section.value || !val) return
    preview.overrides.value = { ...preview.overrides.value, [section.value.file]: fillDerived(clone(val)) }
    if (!dirty.value) return
    saving.value = true
    clearTimeout(timer)
    timer = setTimeout(save, 500)
  },
  { deep: true },
)

// This page's draft as the form last loaded or saved it (null: no draft). If the draft changes any
// other way (Undo or "Throw away" in the review list, publishing, or a publish that merged in
// someone else's newer edits), the form reloads, so the next autosave can't write a stale copy
// back over it. Keyed to the draft, not this visit's change, because a page reload or an earlier
// visit's change leaves this form with no change of its own to watch.
let lastStaged = null
const currentDraft = () => (section.value ? toRaw(draftFiles.value[section.value.file]) ?? null : null)
watch([() => section.value?.file, currentDraft], ([file, d], [oldFile]) => {
  if (file !== oldFile) return // another page: the section watcher loads it
  if (d === lastStaged) return // the form's own save
  clearTimeout(timer)
  if (changeKey.value && !pending.value.some((p) => p.key === changeKey.value)) changeKey.value = null
  load({ quiet: true })
})

function clearOverride(file) {
  if (!file || !(file in preview.overrides.value)) return
  const { [file]: _, ...rest } = preview.overrides.value
  preview.overrides.value = rest
}

watch(
  section,
  (s, old) => {
    if (old && old !== s) {
      save()
      clearOverride(old.file)
      changeKey.value = null
      load()
    }
    if (s?.path) preview.path.value = s.path
  },
  { immediate: true },
)

onMounted(load)

// Publishing and merging save what's typed but not yet autosaved before they read the drafts.
const offFlush = registerFlush(save)

// Leaving the page or closing the tab: save whatever was typed in the last half second.
function beforeUnload() {
  save()
}
onMounted(() => window.addEventListener('beforeunload', beforeUnload))
onBeforeUnmount(() => {
  offFlush()
  save()
  clearOverride(section.value?.file)
  window.removeEventListener('beforeunload', beforeUnload)
})
</script>

<style scoped>
.back {
  display: inline-block;
  margin-bottom: 16px;
  color: var(--primary, #5634c9);
  text-decoration: none;
  font-size: 13.5px;
}
.ed-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 20px;
}
h1 {
  font-family: var(--serif, Georgia, serif);
  font-size: 28px;
  margin: 0 0 6px;
  color: var(--primary-deep, #1c0f52);
}
.sub { margin: 0; color: #6a6a6a; font-size: 14.5px; max-width: 60ch; }
.view-page {
  display: inline-block;
  margin-top: 8px;
  font-size: 13px;
  color: var(--primary, #5634c9);
  text-decoration: none;
}
.view-page:hover { text-decoration: underline; }
.ed-actions { display: flex; align-items: center; gap: 14px; flex-shrink: 0; }
.save-state { font-size: 13px; color: var(--muted); }
.save-state.saved { color: #1f5a33; font-weight: 600; }
.ed-foot-note { margin: 28px 0 0; padding-top: 18px; border-top: 1px solid #e3ddd0; font-size: 13.5px; color: var(--muted); }
.save {
  background: var(--primary, #5634c9);
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 11px 20px;
  font: inherit;
  font-size: 14.5px;
  font-weight: 600;
  cursor: pointer;
}
.save:disabled { opacity: 0.45; cursor: not-allowed; }
.banner { padding: 12px 16px; border-radius: 7px; font-size: 14px; margin: 0 0 18px; }
.banner.err { background: #fdeaea; border: 1px solid #f0c0c0; color: #a11; }
.banner.ok { background: #e8f7ec; border: 1px solid #b6e0c2; color: #1a7a3a; }
.loading { color: #6a6a6a; padding: 40px 0; }
.ed-form { max-width: 720px; }
.ed-foot { margin-top: 24px; padding-top: 20px; border-top: 1px solid #e3ddd0; }

.ed-advanced {
  margin-top: 32px;
  border: 1px dashed #d6cfe6;
  border-radius: 8px;
  background: #faf8ff;
}
.ed-advanced summary {
  cursor: pointer;
  padding: 14px 18px;
  display: flex;
  flex-wrap: wrap;
  gap: 4px 14px;
  align-items: baseline;
  list-style: none;
}
.ed-advanced summary::-webkit-details-marker { display: none; }
.ed-advanced summary::before {
  content: '▸';
  color: #8a7fb8;
  margin-right: 6px;
  display: inline-block;
  transition: transform .15s ease;
}
.ed-advanced[open] summary::before { transform: rotate(90deg); }
.ed-advanced-title {
  font-family: var(--mono, monospace);
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: #8a7fb8;
}
.ed-advanced-sub { font-size: 13px; color: #7a7388; }
.ed-advanced-body { padding: 4px 18px 18px; }
</style>
