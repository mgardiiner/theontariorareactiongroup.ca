<template>
  <div class="editor-canvas">
    <!-- ===================== HOME (Screen 2) ===================== -->
    <section v-if="activeScreen === 'home'" class="col col-900">
      <div class="home-head">
        <p class="eyebrow">{{ greeting }}</p>
        <h2 class="screen-title">What would you like to do?</h2>
      </div>

      <div class="tiles">
        <button v-for="k in taskKeys" :key="k" type="button" class="tile" @click="openTask(k)">
          <span class="tile-glyph">{{ tasks[k].glyph }}</span>
          <span class="tile-body">
            <span class="tile-title">{{ tasks[k].tile }}</span>
            <span class="tile-desc">{{ tasks[k].desc }}</span>
            <span v-if="counts[k] !== undefined" class="tile-count">{{ counts[k] }} on the site now</span>
          </span>
        </button>
      </div>

      <div class="escape">
        <span class="escape-text">Changing wording somewhere else — a heading, the footer, a typo?</span>
        <button type="button" class="escape-link" @click="goSearch">Search the whole site →</button>
      </div>

      <div class="pending-block">
        <div class="pending-head">
          <p class="eyebrow">Waiting to be published</p>
          <span v-if="pendingCount > 0" class="pending-note">Only you can see these</span>
        </div>
        <div v-for="p in pending" :key="p.key" class="pending-row">
          <span class="pending-left">
            <span class="pending-dot" aria-hidden="true"></span>
            <span class="pending-what">{{ p.what }}</span>
            <span class="pending-when">{{ timeAgo(p.when) }}</span>
          </span>
          <button type="button" class="pending-undo" @click="onUndoPending(p.key)">Undo</button>
        </div>
        <div v-if="pendingCount === 0" class="pending-empty">
          Nothing waiting. The website matches what's in here.
        </div>
      </div>
    </section>

    <!-- ===================== PICK (Screen 3) ===================== -->
    <section v-else-if="activeScreen === 'pick'" class="col col-900">
      <button type="button" class="back-link" @click="goHome">← Back to the start</button>
      <div class="pick-head">
        <h2 class="section-title">{{ tasks[task].pickTitle }}</h2>
        <p class="section-sub">{{ tasks[task].pickDesc }}</p>
      </div>

      <button type="button" class="pick-new" @click="startNew">
        <span class="pick-new-plus" aria-hidden="true">+</span>
        <span class="pick-new-body">
          <span class="pick-new-title">{{ tasks[task].newLabel }}</span>
          <span class="pick-new-sub">Three short questions, then you're done.</span>
        </span>
      </button>

      <div class="pick-existing">
        <p class="eyebrow">{{ tasks[task].existing }}</p>

        <div v-if="loadingTask" class="pick-loading">Loading what's on the site…</div>
        <p v-else-if="loadError" class="pick-error">{{ loadError }}</p>
        <template v-else>
          <div v-for="(it, i) in items" :key="i" class="item-row">
            <span class="item-left">
              <span class="item-thumb">
                <span class="item-thumb-big">{{ it.big }}</span>
                <span v-if="it.small" class="item-thumb-small">{{ it.small }}</span>
              </span>
              <span class="item-meta-wrap">
                <span class="item-title">{{ it.title }}</span>
                <span class="item-meta">{{ it.meta }}</span>
              </span>
            </span>
            <span class="item-actions">
              <button type="button" class="btn-change" @click="onEdit(it)">Change</button>
              <button type="button" class="btn-remove" @click="onRemove(it)">Remove</button>
            </span>
          </div>
          <div v-if="!items.length" class="pick-empty">
            Nothing here yet. Use the button above to add the first one.
          </div>
        </template>
      </div>
    </section>

    <!-- ===================== WIZARD (Screen 4) ===================== -->
    <section v-else-if="activeScreen === 'wizard'" class="col col-900">
      <button type="button" class="back-link" @click="cancel">← Never mind, take me back</button>

      <div class="wiz-head">
        <div class="wiz-title-row">
          <h2 class="section-title">{{ isEdit ? tasks[task].editTitle : tasks[task].newTitle }}</h2>
          <span class="wiz-step" aria-live="polite">STEP {{ step + 1 }} OF {{ stepTotal }}</span>
        </div>
        <div class="wiz-track">
          <div class="wiz-fill" :style="{ width: progress }"></div>
        </div>
      </div>

      <form class="wiz-form" @submit.prevent="next">
        <div class="wiz-card">
          <p ref="questionEl" class="wiz-question" tabindex="-1">{{ currentStep.q }}</p>

          <div v-for="f in currentStep.fields" :key="f.key" class="wiz-field">
            <label class="wiz-label" :for="'f-' + f.key">{{ fieldLabel(f) }}</label>

            <input
              v-if="f.kind === 'text'"
              :id="'f-' + f.key"
              v-model="vals[f.key]"
              type="text"
              class="wiz-input"
              :placeholder="f.placeholder"
              :aria-invalid="isFieldError(f) ? 'true' : undefined"
              :aria-describedby="isFieldError(f) ? 'err-' + f.key : undefined"
            />

            <textarea
              v-else-if="f.kind === 'area'"
              :id="'f-' + f.key"
              v-model="vals[f.key]"
              rows="4"
              class="wiz-area"
              :placeholder="f.placeholder"
              :aria-invalid="isFieldError(f) ? 'true' : undefined"
              :aria-describedby="isFieldError(f) ? 'err-' + f.key : undefined"
            ></textarea>

            <RichText v-else-if="f.kind === 'rich'" v-model="vals[f.key]" />

            <div v-else-if="f.kind === 'choice'" class="wiz-choices">
              <button
                v-for="c in f.choices"
                :key="c"
                type="button"
                class="choice"
                :class="{ on: choiceValue(f) === c }"
                @click="vals[f.key] = c"
              >{{ c }}</button>
            </div>

            <span v-if="isFieldError(f)" :id="'err-' + f.key" class="wiz-field-error">
              This one is needed before you can carry on.
            </span>
            <span v-if="f.help" class="wiz-help">{{ f.help }}</span>
          </div>

          <!-- Review (Step 3) -->
          <div v-if="currentStep.review" class="review">
            <p class="review-intro">
              This is how it will look on the website. Nothing is public until you press Publish.
            </p>
            <div class="review-card">
              <div class="review-square">
                <span class="review-big">{{ previewData.big || '—' }}</span>
                <span v-if="previewData.small" class="review-small">{{ previewData.small }}</span>
              </div>
              <div class="review-body">
                <span class="review-title">{{ previewData.title || 'Not named yet' }}</span>
                <span class="review-meta">{{ previewData.meta || 'No details yet' }}</span>
                <span class="review-text">
                  {{ previewData.body || 'No description yet — you can add one from step 1.' }}
                </span>
              </div>
            </div>
            <div v-if="allMissing.length" class="warn">
              <span class="warn-bang" aria-hidden="true">!</span>
              <span class="warn-text">
                Still needed: {{ allMissing.map((f) => f.label).join(', ') }}. Use Back to fill it
                in — you can't publish without it.
              </span>
            </div>
          </div>
        </div>

        <div v-if="stepErrorText" class="wiz-error">
          <span class="wiz-error-bang" aria-hidden="true">!</span>
          <span class="wiz-error-text">{{ stepErrorText }}</span>
        </div>

        <div class="wiz-foot">
          <button type="button" class="btn-back" @click="back">Back</button>
          <div class="wiz-foot-right">
            <span class="wiz-saved">Saved as you type</span>
            <button type="submit" class="btn-continue">{{ nextLabel }}</button>
          </div>
        </div>
      </form>
    </section>

    <!-- ===================== DONE (Screen 5) ===================== -->
    <section v-else-if="activeScreen === 'done'" class="col col-640 done">
      <span class="done-tick" aria-hidden="true">✓</span>
      <h2 class="done-title">{{ isEdit ? 'Your changes are saved' : tasks[task].done }}</h2>
      <p class="done-body">
        It's saved, but only you can see it. When you're ready, press
        <strong>Review &amp; publish</strong> at the bottom of the screen and it will be on the
        website about two minutes later.
      </p>
      <div class="done-actions">
        <button type="button" class="btn-solid" @click="goHome">Back to the start</button>
        <button type="button" class="btn-outline" @click="again">{{ tasks[task].newLabel }}</button>
      </div>
    </section>

    <!-- ===================== SEARCH (Screen 6) ===================== -->
    <section v-else-if="activeScreen === 'search'" class="col col-840">
      <button type="button" class="back-link" @click="goHome">← Back to the start</button>

      <div class="search-head">
        <h2 class="section-title big">Find any words on the site</h2>
        <p class="section-sub">
          Type what you can see on the page — you don't need to know which page it's on.
        </p>
        <input
          v-model="query"
          type="text"
          class="search-input"
          placeholder="e.g. rare, zoom, maya, email…"
          aria-label="Search the site"
        />
        <div class="search-shortcuts">
          <span class="search-shortcuts-label">Common jobs:</span>
          <button
            v-for="s in shortcuts"
            :key="s.q"
            type="button"
            class="shortcut"
            @click="query = s.q"
          >{{ s.label }}</button>
        </div>
      </div>

      <p class="eyebrow">{{ resultsLabel }}</p>

      <div v-if="searchLoading" class="search-loading">Reading the whole site…</div>
      <div v-else class="search-results">
        <div v-for="r in results" :key="r.id" class="result">
          <div class="result-head">
            <span class="result-where">{{ r.where }}</span>
            <span class="result-label">{{ r.label }}</span>
          </div>

          <div v-if="editId === r.id" class="result-edit">
            <textarea v-model="searchDraft" rows="3" class="result-textarea"></textarea>
            <div class="result-edit-actions">
              <button type="button" class="btn-solid sm" @click="saveSearch(r)">Done</button>
              <span class="result-saved">Saved</span>
            </div>
          </div>
          <div v-else class="result-closed">
            <span class="result-value">{{ displayValue(r) }}</span>
            <button type="button" class="btn-change" @click="openResult(r)">Edit</button>
          </div>
        </div>

        <div v-if="query.trim() && results.length === 0" class="search-empty">
          <span class="search-empty-title">Nothing on the site says that</span>
          <span class="search-empty-sub">
            Try fewer words, or check the spelling matches the page exactly.
          </span>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import {
  tasks,
  readItems,
  applyItem,
  removeItem,
  changeLabel,
  preview,
} from '~/admin/tasks'
import { sections } from '~/admin/schema'

definePageMeta({ layout: 'admin', middleware: 'admin-auth' })

const { getData, stageChange, undo, pending, pendingCount } = useDrafts()
const { screen, showToast, editorName } = useAdminUi()

const taskKeys = ['event', 'story', 'partner', 'video']

// ---- Screen-machine / wizard state (page-local) ----
const task = ref(null) // TaskKey | null
const editRef = ref(null) // item ref (from readItems) when editing, null when adding
const step = ref(0)
const vals = ref({})
const touched = ref(false)

const content = ref(null) // working data for the current task's file
const items = ref([]) // existing items for the current task
const loadingTask = ref(false)
const loadError = ref('')

const counts = ref({}) // task key -> number on the site

// ---- Search state ----
const query = ref('')
const editId = ref(null)
const searchDraft = ref('')
const searchVals = ref({}) // result id -> edited (unsaved-to-index) value
const searchIndex = ref([])
const searchIndexLoaded = ref(false)
const searchLoading = ref(false)

// Guard: pick/wizard/done need a task; if we land there without one, fall home.
const activeScreen = computed(() => {
  const s = screen.value
  if ((s === 'pick' || s === 'wizard' || s === 'done') && !task.value) return 'home'
  return s
})

const greeting = computed(() => `Good afternoon, ${editorName}`)

// ---- Wizard derived ----
const currentStep = computed(() =>
  task.value ? tasks[task.value].steps[step.value] : { q: '', fields: [] },
)
const stepTotal = computed(() => (task.value ? tasks[task.value].steps.length : 3))
const isEdit = computed(() => editRef.value != null)
const progress = computed(() =>
  task.value ? Math.round(((step.value + 1) / stepTotal.value) * 100) + '%' : '0%',
)
const previewData = computed(() =>
  task.value ? preview(task.value, vals.value) : { big: '', small: '', title: '', meta: '', body: '' },
)

function valOf(f) {
  const v = vals.value[f.key]
  if (v != null && v !== '') return v
  return f.kind === 'choice' ? f.choices[0] : ''
}
function choiceValue(f) {
  return vals.value[f.key] != null ? vals.value[f.key] : f.choices[0]
}
function fieldLabel(f) {
  return f.label + (f.required ? '' : '  (optional)')
}
function isFieldError(f) {
  return touched.value && !!f.required && !String(valOf(f)).trim()
}

const missingNow = computed(() =>
  (currentStep.value.fields || []).filter((f) => f.required && !String(valOf(f)).trim()),
)
const allMissing = computed(() => {
  if (!task.value) return []
  const out = []
  for (const st of tasks[task.value].steps) {
    for (const f of st.fields || []) {
      if (f.required && !String(vals.value[f.key] || '').trim()) out.push(f)
    }
  }
  return out
})
const stepErrorText = computed(() => {
  if (!(touched.value && missingNow.value.length)) return ''
  const names = missingNow.value.map((f) => `“${f.label}”`).join(' and ')
  return `Please fill in ${names} before carrying on.`
})
const nextLabel = computed(() =>
  currentStep.value.review
    ? isEdit.value
      ? 'Looks right — save the changes'
      : 'Looks right — save it'
    : 'Continue',
)

// Seed the first choice for every choice field, so what's highlighted matches
// what gets saved (mirrors the prototype's getV default of choices[0]).
function seedDefaults(base) {
  if (!task.value) return { ...base }
  const out = { ...base }
  for (const st of tasks[task.value].steps) {
    for (const f of st.fields || []) {
      if (f.kind === 'choice' && (out[f.key] == null || out[f.key] === '')) out[f.key] = f.choices[0]
    }
  }
  return out
}

const questionEl = ref(null)
function focusQuestion() {
  nextTick(() => questionEl.value?.focus())
}

// ---- Navigation / transitions ----
function goHome() {
  screen.value = 'home'
  task.value = null
  editRef.value = null
  vals.value = {}
  step.value = 0
  touched.value = false
}
function goSearch() {
  screen.value = 'search'
  editId.value = null
}

async function openTask(k) {
  task.value = k
  editRef.value = null
  step.value = 0
  vals.value = {}
  touched.value = false
  screen.value = 'pick'
  loadingTask.value = true
  loadError.value = ''
  try {
    const c = await getData(tasks[k].file)
    content.value = c
    items.value = readItems(k, c)
  } catch (e) {
    loadError.value =
      (e && e.message) || "Couldn't load what's on the site. Check your connection and try again."
    items.value = []
  } finally {
    loadingTask.value = false
  }
}

function startNew() {
  editRef.value = null
  vals.value = seedDefaults({})
  step.value = 0
  touched.value = false
  screen.value = 'wizard'
  focusQuestion()
}
function again() {
  startNew()
}

function onEdit(it) {
  editRef.value = it.ref
  vals.value = seedDefaults({ ...it.vals })
  step.value = 0
  touched.value = false
  screen.value = 'wizard'
  focusQuestion()
}

async function onRemove(it) {
  const k = task.value
  const file = tasks[k].file
  const c = content.value != null ? content.value : await getData(file)
  const newContent = removeItem(k, c, it.ref)
  stageChange(file, newContent, `Removed "${it.title}"`)
  content.value = newContent
  items.value = readItems(k, newContent)
  const key = pending.value.length ? pending.value[pending.value.length - 1].key : null
  showToast(`"${it.title}" removed.`, key)
}

function cancel() {
  screen.value = 'pick'
  vals.value = {}
  step.value = 0
  touched.value = false
}

function next() {
  if (!task.value) return
  if (missingNow.value.length) {
    touched.value = true
    return
  }
  if (step.value < stepTotal.value - 1) {
    step.value += 1
    touched.value = false
    focusQuestion()
  } else {
    save()
  }
}
function back() {
  if (step.value === 0) {
    screen.value = 'pick'
    touched.value = false
  } else {
    step.value -= 1
    touched.value = false
    focusQuestion()
  }
}

async function save() {
  const k = task.value
  const file = tasks[k].file
  const c = content.value != null ? content.value : await getData(file)
  const newContent = applyItem(k, c, { ...vals.value }, editRef.value)
  stageChange(file, newContent, changeLabel(k, vals.value, isEdit.value))
  content.value = newContent
  items.value = readItems(k, newContent)
  screen.value = 'done'
}

function onUndoPending(key) {
  undo(key)
  showToast('Change reverted. The website is untouched.')
}

// ---- Counts (home tiles) ----
async function loadCounts() {
  await Promise.all(
    taskKeys.map(async (k) => {
      try {
        const data = await getData(tasks[k].file)
        counts.value = { ...counts.value, [k]: readItems(k, data).length }
      } catch (_) {
        /* leave the count off if it can't load */
      }
    }),
  )
}

// ---- Search index (built off admin/schema.ts) ----
const STRING_KINDS = new Set(['text', 'textarea', 'html', 'url'])

function whereFor(sectionLabel, parentLabel) {
  return parentLabel ? `${sectionLabel} · ${parentLabel}` : sectionLabel
}

function walkFields(fields, data, basePath, sectionLabel, file, parentLabel, out) {
  const obj = data && typeof data === 'object' ? data : {}
  for (const f of fields) {
    if (f.type === 'heading') continue
    const path = basePath ? `${basePath}.${f.key}` : f.key
    if (f.type === 'object') {
      walkFields(f.fields || [], obj[f.key] ?? {}, path, sectionLabel, file, f.label, out)
    } else if (f.type === 'list') {
      const arr = Array.isArray(obj[f.key]) ? obj[f.key] : []
      if (f.fields && f.fields.length) {
        arr.forEach((item, i) =>
          walkFields(f.fields, item, `${path}.${i}`, sectionLabel, file, f.label, out),
        )
      } else {
        arr.forEach((item, i) => {
          if (typeof item === 'string') {
            out.push({
              id: `${file}:${path}.${i}`,
              file,
              jsonPath: `${path}.${i}`,
              label: f.label,
              where: whereFor(sectionLabel, parentLabel || f.label),
              value: item,
            })
          }
        })
      }
    } else if (STRING_KINDS.has(f.type)) {
      const value = obj[f.key]
      if (typeof value === 'string') {
        out.push({
          id: `${file}:${path}`,
          file,
          jsonPath: path,
          label: f.label,
          where: whereFor(sectionLabel, parentLabel),
          value,
        })
      }
    }
  }
}

async function loadSearchIndex() {
  if (searchIndexLoaded.value || searchLoading.value) return
  searchLoading.value = true
  const out = []
  await Promise.all(
    sections.map(async (sec) => {
      try {
        const data = await getData(sec.file)
        walkFields(sec.fields, data, '', sec.label, sec.file, '', out)
      } catch (_) {
        /* skip a file that won't load */
      }
    }),
  )
  searchIndex.value = out
  searchIndexLoaded.value = true
  searchLoading.value = false
}

const shortcuts = [
  { label: 'The contact email', q: 'email' },
  { label: 'Home page headline', q: 'rare' },
  { label: 'Zoom wording', q: 'zoom' },
  { label: 'Footer tagline', q: 'footer' },
]

const results = computed(() => {
  const q = query.value.trim().toLowerCase()
  const idx = searchIndex.value
  if (!q) return idx.slice(0, 4)
  return idx.filter((r) =>
    `${r.value} ${r.label} ${r.where}`.toLowerCase().includes(q),
  )
})
const resultsLabel = computed(() => {
  const q = query.value.trim()
  if (!q) return 'Recently edited'
  const n = results.value.length
  return `${n} match${n === 1 ? '' : 'es'} for "${q}"`
})

function displayValue(r) {
  return searchVals.value[r.id] != null ? searchVals.value[r.id] : r.value
}
function openResult(r) {
  editId.value = r.id
  searchDraft.value = displayValue(r)
}
function setByPath(obj, path, value) {
  const parts = path.split('.')
  let cur = obj
  for (let i = 0; i < parts.length - 1; i++) {
    if (cur == null) return
    cur = cur[parts[i]]
  }
  if (cur != null) cur[parts[parts.length - 1]] = value
}
async function saveSearch(r) {
  const newVal = searchDraft.value
  const c = await getData(r.file)
  const cloneData = JSON.parse(JSON.stringify(c))
  setByPath(cloneData, r.jsonPath, newVal)
  stageChange(r.file, cloneData, `Changed "${r.label}"`)
  searchVals.value = { ...searchVals.value, [r.id]: newVal }
  const entry = searchIndex.value.find((e) => e.id === r.id)
  if (entry) entry.value = newVal
  editId.value = null
  showToast('Saved. It goes live when you publish.')
}

// ---- Misc ----
function timeAgo(ms) {
  if (!ms) return 'just now'
  const mins = Math.round((Date.now() - ms) / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins} min ago`
  const hrs = Math.round(mins / 60)
  if (hrs < 24) return `${hrs} hr ago`
  return `${Math.round(hrs / 24)} days ago`
}

// Reset the expanded search row when the query changes.
watch(query, () => {
  editId.value = null
})

// Build the search index the first time we enter the search screen.
watch(
  screen,
  (s) => {
    if (s === 'search') loadSearchIndex()
  },
  { immediate: true },
)

// Keep the pick list in sync when pending changes (covers toast-Undo of a removal).
watch(pendingCount, async () => {
  if (screen.value !== 'pick' || !task.value) return
  try {
    const c = await getData(tasks[task.value].file)
    content.value = c
    items.value = readItems(task.value, c)
  } catch (_) {
    /* ignore */
  }
})

onMounted(() => {
  // Arriving at /admin lands on home (or keeps search if the top bar just set it);
  // pick/wizard/done need page-local task state that resets on mount.
  if (screen.value !== 'search') screen.value = 'home'
  loadCounts()
})
</script>

<style scoped>
.editor-canvas {
  font-family: var(--sans);
}
.col {
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 32px;
}
.col-900 { max-width: 900px; }
.col-840 { max-width: 840px; gap: 24px; }
.col-640 { max-width: 640px; }

.eyebrow {
  margin: 0;
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--muted);
}
.back-link {
  align-self: flex-start;
  background: none;
  border: none;
  padding: 0;
  font-size: 14px;
  color: var(--muted);
  cursor: pointer;
}
.back-link:hover { color: var(--primary); }

.screen-title {
  margin: 0;
  font-family: var(--serif);
  font-size: 40px;
  font-weight: 500;
  color: var(--primary-deep);
  line-height: 1.1;
}
.section-title {
  margin: 0;
  font-family: var(--serif);
  font-size: 32px;
  font-weight: 500;
  color: var(--primary-deep);
}
.section-title.big { font-size: 34px; line-height: 1.15; }
.section-sub {
  margin: 0;
  font-size: 15.5px;
  line-height: 1.6;
  color: var(--muted);
}

/* ---- Home ---- */
.home-head {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.tiles {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.tile {
  display: flex;
  align-items: flex-start;
  gap: 18px;
  text-align: left;
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 22px 24px;
  cursor: pointer;
  transition: border-color 0.15s ease, transform 0.15s ease;
}
.tile:hover { border-color: var(--primary); transform: translateY(-2px); }
.tile-glyph {
  width: 46px;
  height: 46px;
  border-radius: 11px;
  background: #fff6c9;
  color: var(--primary-deep);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 23px;
  font-weight: 600;
  flex-shrink: 0;
  font-family: var(--serif);
}
.tile-body { display: flex; flex-direction: column; gap: 4px; }
.tile-title { font-size: 18px; font-weight: 600; color: var(--ink); }
.tile-desc { font-size: 14px; line-height: 1.5; color: var(--muted); }
.tile-count { font-size: 13px; color: #8a8395; padding-top: 2px; }

.escape {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 22px;
  background: #fff;
  border: 1px dashed #d8cfbb;
  border-radius: 12px;
}
.escape-text { font-size: 15px; color: var(--muted); }
.escape-link {
  background: none;
  border: none;
  padding: 0;
  font-size: 15px;
  font-weight: 600;
  color: var(--primary);
  cursor: pointer;
  flex-shrink: 0;
}
.escape-link:hover { text-decoration: underline; }

.pending-block { display: flex; flex-direction: column; gap: 12px; }
.pending-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 16px;
}
.pending-note { font-size: 13.5px; color: var(--muted); }
.pending-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 10px;
  padding: 14px 18px;
}
.pending-left { display: flex; align-items: center; gap: 12px; min-width: 0; }
.pending-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--accent);
  display: block;
  flex-shrink: 0;
}
.pending-what { font-size: 15px; color: var(--ink); }
.pending-when { font-size: 13px; color: #8a8395; flex-shrink: 0; }
.pending-undo {
  background: none;
  border: 1px solid var(--line);
  border-radius: 999px;
  padding: 6px 14px;
  font-size: 13px;
  font-weight: 600;
  color: var(--muted);
  cursor: pointer;
  flex-shrink: 0;
}
.pending-undo:hover { border-color: var(--primary); color: var(--primary); }
.pending-empty {
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 10px;
  padding: 22px;
  font-size: 15px;
  color: var(--muted);
  text-align: center;
}

/* ---- Pick ---- */
.pick-head { display: flex; flex-direction: column; gap: 7px; }
.pick-new {
  display: flex;
  align-items: center;
  gap: 16px;
  text-align: left;
  background: #fff;
  border: 2px solid var(--primary);
  border-radius: 12px;
  padding: 20px 24px;
  cursor: pointer;
  transition: transform 0.15s ease;
}
.pick-new:hover { transform: translateY(-2px); }
.pick-new-plus {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--primary);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  flex-shrink: 0;
}
.pick-new-body { display: flex; flex-direction: column; gap: 3px; }
.pick-new-title { font-size: 17.5px; font-weight: 600; color: var(--primary-deep); }
.pick-new-sub { font-size: 14px; color: var(--muted); }

.pick-existing { display: flex; flex-direction: column; gap: 11px; }
.pick-loading,
.pick-empty {
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 11px;
  padding: 20px 22px;
  font-size: 15px;
  color: var(--muted);
}
.pick-error {
  background: #fbeff1;
  border: 1px solid #e8c4cc;
  border-radius: 11px;
  padding: 16px 20px;
  font-size: 14.5px;
  color: #8a1b30;
  margin: 0;
}
.item-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 11px;
  padding: 16px 20px;
}
.item-left { display: flex; align-items: center; gap: 16px; min-width: 0; }
.item-thumb {
  width: 52px;
  height: 52px;
  border-radius: 9px;
  background: #f3eee1;
  color: var(--primary-deep);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.item-thumb-big { font-family: var(--serif); font-size: 20px; line-height: 1; }
.item-thumb-small {
  font-family: var(--mono);
  font-size: 9.5px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--muted);
}
.item-meta-wrap { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
.item-title { font-size: 16.5px; font-weight: 600; color: var(--ink); }
.item-meta { font-size: 14px; color: var(--muted); }
.item-actions { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
.btn-change {
  background: none;
  border: 1px solid #d8cfbb;
  border-radius: 999px;
  padding: 9px 20px;
  font-size: 14px;
  font-weight: 600;
  color: var(--ink);
  cursor: pointer;
}
.btn-change:hover { border-color: var(--primary); color: var(--primary); }
.btn-remove {
  background: none;
  border: 1px solid #e8d2d6;
  border-radius: 999px;
  padding: 9px 18px;
  font-size: 14px;
  font-weight: 600;
  color: #a6203a;
  cursor: pointer;
}
.btn-remove:hover { background: #fbeff1; }

/* ---- Wizard ---- */
.wiz-head { display: flex; flex-direction: column; gap: 12px; }
.wiz-title-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 16px;
}
.wiz-step {
  font-family: var(--mono);
  font-size: 12px;
  letter-spacing: 0.1em;
  color: var(--muted);
  flex-shrink: 0;
}
.wiz-track {
  height: 6px;
  background: var(--line);
  border-radius: 999px;
  overflow: hidden;
}
.wiz-fill {
  height: 6px;
  background: var(--primary);
  border-radius: 999px;
  transition: width 0.25s ease;
}
.wiz-form { display: flex; flex-direction: column; gap: 26px; }
.wiz-card {
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 14px;
  padding: 34px 36px;
  display: flex;
  flex-direction: column;
  gap: 26px;
}
.wiz-question {
  margin: 0;
  font-family: var(--serif);
  font-size: 27px;
  font-weight: 500;
  color: var(--ink);
  line-height: 1.25;
  outline: none;
}
.wiz-field { display: flex; flex-direction: column; gap: 7px; }
.wiz-label { font-size: 15px; font-weight: 600; color: var(--ink); white-space: pre-wrap; }
.wiz-input,
.wiz-area {
  width: 100%;
  padding: 14px 16px;
  border: 1px solid #d8cfbb;
  border-radius: 9px;
  background: var(--bg);
  color: var(--ink);
  outline: none;
  transition: border-color 0.15s ease, background 0.15s ease, box-shadow 0.15s ease;
}
.wiz-input { font-size: 17px; }
.wiz-area { font-size: 16px; line-height: 1.55; resize: vertical; }
.wiz-input:focus,
.wiz-area:focus {
  border-color: var(--primary);
  background: #fff;
  box-shadow: 0 0 0 3px rgba(30, 1, 119, 0.12);
}
.wiz-choices { display: flex; flex-wrap: wrap; gap: 10px; }
.choice {
  padding: 11px 20px;
  border-radius: 999px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  border: 1px solid #d8cfbb;
  background: #fff;
  color: var(--ink);
}
.choice.on { background: var(--primary); color: #fff; border-color: var(--primary); }
.wiz-field-error { font-size: 13.5px; color: #a6203a; font-weight: 600; }
.wiz-help { font-size: 13.5px; color: var(--muted); line-height: 1.5; }

.review { display: flex; flex-direction: column; gap: 16px; }
.review-intro { margin: 0; font-size: 15px; color: var(--muted); line-height: 1.6; }
.review-card {
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 26px;
  background: var(--bg);
  display: flex;
  gap: 22px;
  align-items: flex-start;
}
.review-square {
  width: 88px;
  height: 88px;
  border-radius: 10px;
  background: var(--primary);
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.review-big { font-family: var(--serif); font-size: 30px; line-height: 1.1; }
.review-small {
  font-family: var(--mono);
  font-size: 10.5px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--accent);
}
.review-body { display: flex; flex-direction: column; gap: 8px; padding-top: 2px; min-width: 0; }
.review-title { font-family: var(--serif); font-size: 24px; font-weight: 500; color: var(--primary-deep); }
.review-meta { font-size: 14.5px; color: var(--muted); }
.review-text { font-size: 15.5px; color: var(--ink); line-height: 1.6; max-width: 52ch; }

.warn {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  background: #fff6c9;
  border: 1px solid #f0de8a;
  border-radius: 10px;
  padding: 14px 18px;
}
.warn-bang { font-weight: 700; color: #8a6a00; flex-shrink: 0; }
.warn-text { font-size: 14.5px; color: #6e5400; line-height: 1.55; }

.wiz-error {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  background: #fbeff1;
  border: 1px solid #e8c4cc;
  border-radius: 10px;
  padding: 14px 18px;
}
.wiz-error-bang { font-weight: 700; color: #a6203a; flex-shrink: 0; }
.wiz-error-text { font-size: 14.5px; color: #8a1b30; line-height: 1.55; }

.wiz-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
.wiz-foot-right { display: flex; align-items: center; gap: 16px; }
.wiz-saved { font-size: 13.5px; color: var(--muted); }
.btn-back {
  background: none;
  border: 1px solid #d8cfbb;
  border-radius: 999px;
  padding: 13px 26px;
  font-size: 15px;
  font-weight: 600;
  color: var(--ink);
  cursor: pointer;
}
.btn-back:hover { border-color: var(--primary); color: var(--primary); }
.btn-continue {
  background: var(--accent);
  border: none;
  border-radius: 999px;
  padding: 14px 30px;
  font-size: 16px;
  font-weight: 700;
  color: var(--primary-deep);
  cursor: pointer;
  transition: transform 0.15s ease;
}
.btn-continue:hover { transform: translateY(-2px); }

/* ---- Done ---- */
.done {
  margin-top: 80px;
  text-align: center;
  align-items: center;
  gap: 18px;
}
.done-tick {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: #e6f6ea;
  color: #1a7a3a;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 34px;
}
.done-title {
  margin: 0;
  font-family: var(--serif);
  font-size: 34px;
  font-weight: 500;
  color: var(--primary-deep);
}
.done-body { margin: 0; font-size: 16.5px; line-height: 1.6; color: var(--muted); }
.done-actions { display: flex; gap: 12px; padding-top: 8px; }
.btn-solid {
  background: var(--primary);
  border: none;
  border-radius: 999px;
  padding: 13px 26px;
  font-size: 15px;
  font-weight: 600;
  color: #fff;
  cursor: pointer;
}
.btn-solid.sm { padding: 10px 22px; font-size: 14.5px; }
.btn-outline {
  background: none;
  border: 1px solid #d8cfbb;
  border-radius: 999px;
  padding: 13px 26px;
  font-size: 15px;
  font-weight: 600;
  color: var(--ink);
  cursor: pointer;
}
.btn-outline:hover { border-color: var(--primary); color: var(--primary); }

/* ---- Search ---- */
.search-head { display: flex; flex-direction: column; gap: 13px; }
.search-input {
  width: 100%;
  padding: 19px 23px;
  border: 2px solid var(--primary);
  border-radius: 14px;
  background: #fff;
  font-size: 18px;
  color: var(--ink);
  outline: none;
}
.search-input:focus { box-shadow: 0 0 0 3px rgba(30, 1, 119, 0.12); }
.search-shortcuts { display: flex; flex-wrap: wrap; align-items: center; gap: 9px; }
.search-shortcuts-label { font-size: 13.5px; color: var(--muted); }
.shortcut {
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 999px;
  padding: 8px 16px;
  font-size: 13.5px;
  font-weight: 600;
  color: var(--ink);
  cursor: pointer;
  white-space: nowrap;
}
.shortcut:hover { border-color: var(--primary); color: var(--primary); }

.search-loading {
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 22px;
  font-size: 15px;
  color: var(--muted);
}
.search-results { display: flex; flex-direction: column; gap: 12px; }
.result {
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.result-head { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.result-where {
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  background: #efe9dc;
  color: var(--muted);
  border-radius: 4px;
  padding: 4px 8px;
}
.result-label { font-size: 14.5px; font-weight: 600; color: var(--ink); }
.result-closed {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
}
.result-value { font-size: 16px; line-height: 1.6; color: var(--ink); flex: 1; }
.result-edit { display: flex; flex-direction: column; gap: 12px; }
.result-textarea {
  width: 100%;
  padding: 13px 15px;
  border: 1px solid var(--primary);
  border-radius: 9px;
  background: #fff;
  font-size: 16px;
  line-height: 1.6;
  color: var(--ink);
  outline: none;
  resize: vertical;
}
.result-textarea:focus { box-shadow: 0 0 0 3px rgba(30, 1, 119, 0.12); }
.result-edit-actions { display: flex; align-items: center; gap: 14px; }
.result-saved { font-size: 13.5px; color: #1a7a3a; font-weight: 600; }
.search-empty {
  background: #fff;
  border: 1px dashed #d8cfbb;
  border-radius: 12px;
  padding: 34px;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.search-empty-title { font-size: 17px; font-weight: 600; color: var(--ink); }
.search-empty-sub { font-size: 15px; color: var(--muted); line-height: 1.6; }

/* ---- Responsive ---- */
@media (max-width: 900px) {
  .tiles { grid-template-columns: 1fr; }
  .screen-title { font-size: 32px; }
  .section-title { font-size: 27px; }
  .wiz-card { padding: 24px 20px; }
  .review-card { flex-direction: column; }
  .done { margin-top: 40px; }
}
@media (prefers-reduced-motion: reduce) {
  .tile:hover,
  .pick-new:hover,
  .btn-continue:hover {
    transform: none;
  }
}
</style>
