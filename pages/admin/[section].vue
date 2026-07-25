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
          <button type="button" class="save" :disabled="!canSave" @click="save">
            {{ saving ? 'Saving…' : 'Save & publish' }}
          </button>
        </div>
      </div>

      <p v-if="loadError" class="banner err">{{ loadError }}</p>
      <p v-if="saveError" class="banner err">{{ saveError }}</p>
      <p v-if="saveOk" class="banner ok">
        Saved. Your change is publishing now — it should be live in a couple of minutes.
      </p>

      <div v-if="loading" class="loading">Loading current content from GitHub…</div>

      <form v-else-if="data" class="ed-form" @submit.prevent="save">
        <AdminField v-for="f in section.fields" :key="f.key" :field="f" :obj="data" />

        <div class="ed-foot">
          <button type="submit" class="save" :disabled="!canSave">
            {{ saving ? 'Saving…' : 'Save & publish' }}
          </button>
        </div>
      </form>
    </template>
  </div>
</template>

<script setup>
import { getSection, normalize } from '~/admin/schema'
import { loadJsonFile, saveJsonFile } from '~/utils/adminGithub'

definePageMeta({ layout: 'admin', middleware: 'admin-auth' })

const route = useRoute()
const { token, canWrite } = useAdminAuth()

const section = computed(() => getSection(route.params.section))

const data = ref(null)
// Expose the section's data so nested dropdowns can source choices from sibling
// fields (e.g. a story's filterKey from the filters list).
provide('adminRoot', data)
const sha = ref('')
const savedSnapshot = ref('')
const loading = ref(true)
const loadError = ref('')
const saving = ref(false)
const saveOk = ref(false)
const saveError = ref('')

const dirty = computed(
  () => data.value && JSON.stringify(data.value) !== savedSnapshot.value,
)
const canSave = computed(() => canWrite.value && dirty.value && !saving.value)

async function load() {
  if (!section.value || !token.value) return
  loading.value = true
  loadError.value = ''
  try {
    const { data: json, sha: fileSha } = await loadJsonFile(token.value, section.value.file)
    data.value = normalize(json, section.value.fields)
    sha.value = fileSha
    savedSnapshot.value = JSON.stringify(data.value)
  } catch (e) {
    loadError.value = e?.message || 'Could not load this section from GitHub.'
  } finally {
    loading.value = false
  }
}

async function save() {
  if (!canSave.value || !section.value || !token.value) return
  saving.value = true
  saveOk.value = false
  saveError.value = ''
  try {
    const newSha = await saveJsonFile(
      token.value,
      section.value.file,
      data.value,
      sha.value,
      `Update ${section.value.label} via admin`,
    )
    sha.value = newSha
    savedSnapshot.value = JSON.stringify(data.value)
    saveOk.value = true
  } catch (e) {
    if (e?.status === 409) {
      saveError.value =
        'Someone else changed this section since you opened it. Reload the page to get the latest version (your unsaved edits will be lost).'
    } else {
      saveError.value = e?.message || 'Could not save. Please try again.'
    }
  } finally {
    saving.value = false
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
</style>
