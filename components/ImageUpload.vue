<template>
  <div
    class="iu"
    :class="{ dragging }"
    @dragover.prevent="dragging = true"
    @dragleave.self="dragging = false"
    @drop.prevent="onDrop"
  >
    <div v-if="modelValue" class="iu-current">
      <img
        :src="photos.src(modelValue)"
        alt=""
        class="iu-preview"
        :style="focus.styleFor(modelValue)"
        @error="onImgError"
        @load="error = ''"
      />
      <div class="iu-current-info">
        <span class="iu-name">{{ shortName }}</span>
        <span v-if="photos.isPending(modelValue)" class="iu-badge">New: goes live when you publish</span>
        <div class="iu-current-actions">
          <button
            type="button"
            class="iu-btn"
            :disabled="!focusReady"
            title="Pick the part of the photo to keep in view where the site trims it to fit"
            @click="focus.open(modelValue)"
          >
            Choose what shows
          </button>
          <button type="button" class="iu-btn" :disabled="busy" @click="pickFile">Upload a different photo</button>
          <button type="button" class="iu-btn" @click="chooser?.open()">Choose another</button>
          <button type="button" class="iu-clear" @click="clearValue">Remove</button>
        </div>
      </div>
    </div>

    <div v-else class="iu-empty">
      <button type="button" class="iu-pick-btn" :disabled="busy" @click="pickFile">
        {{ busy ? 'Preparing photo…' : 'Upload a photo' }}
      </button>
      <button type="button" class="iu-btn" @click="chooser?.open()">Choose from the site's photos</button>
      <span class="iu-drop-hint">or drag a photo here</span>
    </div>

    <input ref="fileEl" type="file" accept="image/*" class="iu-file" tabindex="-1" aria-hidden="true" @change="onFile" />

    <p v-if="error" class="iu-error">{{ error }}</p>

    <details class="iu-link" :open="isWebLink">
      <summary>Use a web address instead</summary>
      <input
        type="text"
        inputmode="url"
        class="iu-url"
        :value="modelValue"
        placeholder="https://…  or  /uploads/example.jpg"
        aria-label="Photo web address"
        @input="onUrl"
      />
    </details>

    <AdminPhotoChooser ref="chooser" :current="modelValue" @select="choose" />
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: { type: String, default: '' },
})
const emit = defineEmits(['update:modelValue'])

// New photos aren't sent anywhere yet: they wait on this device until Publish, which sends them
// in the same commit as the change that uses them (composables/usePendingPhotos.ts).
const photos = usePendingPhotos()
// "Choose what shows": the part of the photo the site keeps in view when it crops (usePhotoFocus.ts).
const focus = usePhotoFocus()
const focusReady = focus.ready

const busy = ref(false)
const error = ref('')
const dragging = ref(false)
const fileEl = ref(null)
const chooser = ref(null)

const isWebLink = computed(() => /^https?:\/\//i.test(props.modelValue || ''))
const shortName = computed(() => (props.modelValue || '').split('/').pop())

onMounted(() => {
  photos.ensureLoaded()
  focus.ensureLoaded()
})

function kebab(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function pickFile() {
  fileEl.value?.click()
}

function onUrl(e) {
  error.value = ''
  emit('update:modelValue', e.target.value)
}

function choose(path) {
  error.value = ''
  emit('update:modelValue', path)
}

function clearValue() {
  error.value = ''
  emit('update:modelValue', '')
}

function onImgError() {
  // Keep the value so the editor can correct it.
  error.value = isWebLink.value
    ? "That image didn't load. Check the web address."
    : "This photo isn't showing. If it was just published, it appears in a minute or two; otherwise choose it again."
}

// Photos are downscaled + re-encoded as JPEG, so commits stay small and pages load fast (a phone
// photo can be 5–10 MB otherwise). Vector/animated formats are passed through untouched.
const MAX_UPLOAD_DIM = 1600
const JPEG_QUALITY = 0.82

async function processImage(file) {
  const type = (file.type || '').toLowerCase()
  const dot = file.name.lastIndexOf('.')

  // SVG (vector) and GIF (animation) would be ruined by a canvas re-encode.
  if (type === 'image/svg+xml' || type === 'image/gif') {
    const ext = (kebab(dot >= 0 ? file.name.slice(dot + 1) : '') || 'img').slice(0, 5)
    return { blob: file, ext }
  }

  const url = URL.createObjectURL(file)
  try {
    const img = await new Promise((resolve, reject) => {
      const im = new Image()
      im.onload = () => resolve(im)
      im.onerror = () => reject(new Error('unreadable'))
      im.src = url
    })
    const scale = Math.min(1, MAX_UPLOAD_DIM / Math.max(img.naturalWidth, img.naturalHeight))
    const w = Math.max(1, Math.round(img.naturalWidth * scale))
    const h = Math.max(1, Math.round(img.naturalHeight * scale))
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    // Flatten onto white so transparent PNGs don't turn black when saved as JPEG.
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, w, h)
    ctx.drawImage(img, 0, 0, w, h)
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY))
    return { blob: blob || file, ext: 'jpg' } // toBlob unsupported → the original file
  } finally {
    URL.revokeObjectURL(url)
  }
}

async function addFile(file) {
  if (!file) return
  error.value = ''
  if (!(file.type || '').startsWith('image/') && !/\.(heic|heif)$/i.test(file.name)) {
    error.value = "That isn't a photo. Choose a JPG, PNG or WebP file."
    return
  }
  busy.value = true
  try {
    const { blob, ext } = await processImage(file)
    // A safe, collision-resistant path: /uploads/<kebab-name>-<shorttime>.<ext>
    const dot = file.name.lastIndexOf('.')
    const base = kebab(dot >= 0 ? file.name.slice(0, dot) : file.name) || 'photo'
    const suffix = Date.now().toString(36).slice(-5)
    const path = `/uploads/${base}-${suffix}.${ext}`
    await photos.add(path, blob)
    emit('update:modelValue', path)
    focus.open(path) // straight on to choosing what shows, as the abaileyevents editor does
  } catch (err) {
    error.value =
      err?.message === 'unreadable'
        ? "This photo's format can't be opened here. Try a JPG or PNG (on an iPhone, choose “Most Compatible” under Settings › Camera › Formats)."
        : "Sorry — that photo couldn't be added. Please try again."
  } finally {
    busy.value = false
  }
}

function onFile(e) {
  const input = e.target
  addFile(input.files && input.files[0])
  input.value = '' // allow re-selecting the same file
}

function onDrop(e) {
  dragging.value = false
  addFile(e.dataTransfer?.files?.[0])
}
</script>

<style scoped>
.iu {
  display: flex;
  flex-direction: column;
  gap: 10px;
  border-radius: 8px;
  outline: 2px dashed transparent;
  outline-offset: 4px;
  transition: outline-color 0.15s ease;
}
.iu.dragging {
  outline-color: var(--primary, #5634c9);
  background: #f4f0ff;
}
.iu-file {
  display: none;
}
.iu-empty {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.iu-pick-btn {
  padding: 9px 18px;
  border: none;
  border-radius: 6px;
  background: var(--primary, #5634c9);
  color: #fff;
  font: inherit;
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
}
.iu-pick-btn:disabled {
  opacity: 0.7;
  cursor: default;
}
.iu-btn {
  padding: 8px 14px;
  border: 1px solid #cfc4ec;
  border-radius: 6px;
  background: #fff;
  color: var(--primary, #5634c9);
  font: inherit;
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
}
.iu-btn:hover {
  background: #f4f0ff;
}
.iu-btn:disabled {
  opacity: 0.6;
  cursor: default;
}
.iu-drop-hint {
  font-size: 13px;
  color: #7a7a7a;
}
.iu-current {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  flex-wrap: wrap;
}
.iu-preview {
  display: block;
  width: 180px;
  height: 135px; /* 4:3 like the site's cards, so the chosen focus shows here too */
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid #cfc8ba;
  background: #eee8da;
}
.iu-current-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
  flex: 1;
}
.iu-name {
  font-size: 13px;
  color: #555;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.iu-badge {
  align-self: flex-start;
  font-size: 11.5px;
  font-weight: 600;
  background: #fff4cc;
  color: #8a5a00;
  border-radius: 999px;
  padding: 2px 9px;
}
.iu-current-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 4px;
}
.iu-link summary {
  font-size: 13px;
  color: #6a6a6a;
  cursor: pointer;
}
.iu-url {
  width: 100%;
  margin-top: 8px;
  padding: 9px 11px;
  border: 1px solid #cfc8ba;
  border-radius: 5px;
  background: #fff;
  font: inherit;
  font-size: 14px;
  color: #1a1a1a;
}
.iu-url:focus {
  outline: 2px solid var(--primary, #5634c9);
  border-color: transparent;
}
.iu-error {
  margin: 0;
  font-size: 13px;
  color: #a11;
}
.iu-clear {
  border: 1px solid #e0b4bc;
  background: #fff;
  color: #b23;
  border-radius: 6px;
  padding: 8px 12px;
  font: inherit;
  font-size: 13px;
  cursor: pointer;
}
.iu-clear:hover {
  background: #fbeff1;
}
@media (prefers-reduced-motion: reduce) {
  .iu {
    transition: none;
  }
}
</style>
