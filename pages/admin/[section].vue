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
          <a v-if="section.path" :href="section.path" target="_blank" rel="noopener" class="view-page">View this page ↗</a>
        </div>
        <div class="ed-actions">
          <span v-if="dirty" class="dirty-dot" title="Unsaved changes">● unsaved</span>
          <button type="button" class="save" :disabled="!canSave" @click="save">Save</button>
        </div>
      </div>

      <p v-if="loadError" class="banner err">{{ loadError }}</p>
      <p v-if="saveError" class="banner err">{{ saveError }}</p>
      <p v-if="saveOk" class="banner ok">
        Saved. Press <strong>Review &amp; publish</strong> at the bottom when you're ready to put it live.
      </p>

      <div v-if="loading" class="loading">Loading current content from GitHub…</div>

      <form v-else-if="data" class="ed-form" @submit.prevent="save">
        <AdminField v-for="f in mainFields" :key="f.key" :field="f" :obj="data" />

        <!-- Technical / rarely-touched fields live behind a fold so the everyday
             form stays short. -->
        <details v-if="advancedFields.length" class="ed-advanced">
          <summary>
            <span class="ed-advanced-title">Advanced</span>
            <span class="ed-advanced-sub">Search-engine text and connections — you'll rarely need these.</span>
          </summary>
          <div class="ed-advanced-body">
            <AdminField v-for="f in advancedFields" :key="f.key" :field="f" :obj="data" />
          </div>
        </details>

        <div class="ed-foot">
          <button type="submit" class="save" :disabled="!canSave">Save</button>
        </div>
      </form>
    </template>
  </div>
</template>

<script setup>
import { getSection, normalize } from '~/admin/schema'
import { parseEventDate } from '~/admin/tasks'

definePageMeta({ layout: 'admin', middleware: 'admin-auth' })

const route = useRoute()
const { getData, stageChange } = useDrafts()
const { showToast } = useAdminUi()

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
const savedSnapshot = ref('')
const loading = ref(true)
const loadError = ref('')
const saveOk = ref(false)
const saveError = ref('')

const dirty = computed(
  () => data.value && JSON.stringify(data.value) !== savedSnapshot.value,
)
const canSave = computed(() => dirty.value)

async function load() {
  if (!section.value) return
  loading.value = true
  loadError.value = ''
  try {
    const json = await getData(section.value.file)
    data.value = normalize(clone(json), section.value.fields)
    savedSnapshot.value = JSON.stringify(data.value)
  } catch (e) {
    loadError.value = e?.message || 'Could not load this section from GitHub.'
  } finally {
    loading.value = false
  }
}

function save() {
  if (!canSave.value || !section.value) return
  saveOk.value = false
  saveError.value = ''
  try {
    // Stage the change locally — publishing is the separate global step
    // (the "Review & publish" bar at the bottom of the screen).
    stageChange(section.value.file, fillDerived(clone(data.value)), `Edited the ${section.value.label} page`)
    savedSnapshot.value = JSON.stringify(data.value)
    saveOk.value = true
    showToast("Saved — press Review & publish when you're ready.")
  } catch (e) {
    saveError.value = e?.message || 'Could not save. Please try again.'
  }
}

onMounted(load)

// Warn before leaving with unsaved changes.
function beforeUnload(e) {
  if (dirty.value) {
    e.preventDefault()
    e.returnValue = ''
  }
}
onMounted(() => window.addEventListener('beforeunload', beforeUnload))
onBeforeUnmount(() => window.removeEventListener('beforeunload', beforeUnload))
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
.dirty-dot { color: #b26a00; font-size: 13px; font-weight: 600; }
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
