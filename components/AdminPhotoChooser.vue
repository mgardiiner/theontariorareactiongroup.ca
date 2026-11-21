<template>
  <dialog ref="dialogEl" class="pc" aria-labelledby="pc-title" @close="emit('close')" @click.self="close">
    <div class="pc-inner">
      <div class="pc-head">
        <h3 id="pc-title" class="pc-title">Choose a photo</h3>
        <button type="button" class="pc-x" aria-label="Close" @click="close">✕</button>
      </div>
      <input
        v-model="query"
        type="search"
        class="pc-search"
        placeholder="Search by file name, e.g. stairs"
        aria-label="Search photos"
      />
      <p v-if="error" class="pc-msg err">{{ error }}</p>
      <p v-else-if="loading" class="pc-msg">Loading the site's photos…</p>
      <p v-else-if="!shown.length" class="pc-msg">
        {{ query ? `No photos match “${query}”.` : 'No photos on the site yet. Upload one instead.' }}
      </p>
      <ul v-else class="pc-grid">
        <li v-for="p in shown" :key="p">
          <button type="button" class="pc-tile" :class="{ current: p === current }" :title="p" @click="pick(p)">
            <img :src="photos.src(p)" alt="" loading="lazy" />
            <span class="pc-name">{{ nameOf(p) }}</span>
            <span v-if="photos.isPending(p)" class="pc-badge">Not published yet</span>
          </button>
        </li>
      </ul>
    </div>
  </dialog>
</template>

<script setup>
import { listImages } from '~/utils/adminGithub'

const props = defineProps({ current: { type: String, default: '' } })
const emit = defineEmits(['select', 'close'])

const { token } = useAdminAuth()
const photos = usePendingPhotos()
const dialogEl = ref(null)
const query = ref('')
const loading = ref(false)
const error = ref('')

// One listing per visit to the editor, shared by every photo field.
const library = useState('admin_photo_library', () => null)

/**
 * "rareonthestairs-xq1dn.jpg" -> "rareonthestairs". Uploads get a 5-character time suffix, which
 * almost always has a digit; requiring one keeps real words ("toronto-rally") intact.
 */
function nameOf(path) {
  const file = path.split('/').pop() || path
  return file
    .replace(/\.[a-z0-9]+$/i, '')
    .replace(/-(?=[a-z]*\d)[a-z0-9]{5}$/i, '')
    .replace(/[-_]+/g, ' ')
}

const all = computed(() => {
  const pending = [...photos.paths.value].reverse()
  return [...pending, ...(library.value || []).filter((p) => !pending.includes(p))]
})
const shown = computed(() => {
  const q = query.value.trim().toLowerCase()
  return q ? all.value.filter((p) => p.toLowerCase().includes(q) || nameOf(p).includes(q)) : all.value
})

async function open() {
  query.value = ''
  error.value = ''
  dialogEl.value?.showModal()
  await photos.ensureLoaded()
  if (library.value) return
  loading.value = true
  try {
    library.value = await listImages(token.value)
  } catch {
    error.value = "Couldn't load the site's photos. Check your connection and try again."
  } finally {
    loading.value = false
  }
}
function close() {
  dialogEl.value?.close()
}
function pick(path) {
  emit('select', path)
  close()
}

defineExpose({ open })
</script>

<style scoped>
.pc {
  width: min(880px, calc(100vw - 32px));
  max-height: calc(100vh - 64px);
  padding: 0;
  border: none;
  border-radius: 14px;
  box-shadow: 0 24px 64px rgba(26, 22, 38, 0.3);
  background: #fff;
  color: var(--ink);
}
.pc::backdrop {
  background: rgba(26, 22, 38, 0.45);
}
.pc-inner {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 20px 22px 22px;
}
.pc-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.pc-title {
  margin: 0;
  font-size: 19px;
}
.pc-x {
  border: none;
  background: none;
  font-size: 16px;
  padding: 6px 8px;
  border-radius: 6px;
  cursor: pointer;
  color: var(--muted);
}
.pc-x:hover {
  background: var(--bg);
  color: var(--ink);
}
.pc-search {
  padding: 10px 12px;
  border: 1px solid #cfc8ba;
  border-radius: 8px;
  font: inherit;
  font-size: 14.5px;
}
.pc-search:focus {
  outline: 2px solid var(--primary);
  border-color: transparent;
}
.pc-msg {
  margin: 8px 0;
  font-size: 14px;
  color: var(--muted);
}
.pc-msg.err {
  color: #a11;
}
.pc-grid {
  list-style: none;
  margin: 0;
  padding: 2px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 12px;
  overflow-y: auto;
  max-height: calc(100vh - 260px);
}
.pc-tile {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
  padding: 6px;
  border: 2px solid transparent;
  border-radius: 10px;
  background: var(--bg);
  cursor: pointer;
  text-align: left;
  font: inherit;
}
.pc-tile:hover,
.pc-tile:focus-visible {
  border-color: var(--primary);
}
.pc-tile.current {
  border-color: #d99a00;
}
.pc-tile img {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  border-radius: 6px;
  background: #e9e3d4;
}
.pc-name {
  font-size: 12.5px;
  color: var(--ink);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.pc-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  font-size: 11px;
  font-weight: 600;
  background: var(--accent);
  color: var(--ink);
  border-radius: 999px;
  padding: 2px 8px;
}
</style>
