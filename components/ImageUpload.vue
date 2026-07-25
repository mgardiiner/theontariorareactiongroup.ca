<template>
  <div class="iu">
    <div class="iu-row">
      <label class="iu-pick">
        <input
          type="file"
          accept="image/*"
          class="iu-file"
          :disabled="uploading"
          @change="onFile"
        />
        <span class="iu-pick-btn">{{ uploading ? 'Uploading…' : 'Upload a photo' }}</span>
      </label>
      <span class="iu-or">or paste a link</span>
      <input
        type="text"
        inputmode="url"
        class="iu-url"
        :value="modelValue"
        placeholder="/uploads/example.jpg  or  https://…"
        @input="onUrl"
      />
    </div>

    <p v-if="error" class="iu-error">{{ error }}</p>

    <div v-if="modelValue" class="iu-preview-wrap">
      <img :src="previewSrc" alt="" class="iu-preview" @error="onImgError" />
      <button type="button" class="iu-clear" @click="clearValue">Remove</button>
    </div>
  </div>
</template>

<script setup>
import { saveBinaryFile } from '~/utils/adminGithub'

const props = defineProps({
  modelValue: { type: String, default: '' },
})
const emit = defineEmits(['update:modelValue'])

const { token } = useAdminAuth()

const uploading = ref(false)
const error = ref('')

// A freshly-picked file is previewed straight from its own bytes (an object URL)
// so the thumbnail appears instantly. The committed /uploads/… path isn't served
// until the site redeploys, which is what used to make the preview look broken.
const localPreview = ref('')
const previewSrc = computed(() => localPreview.value || props.modelValue)

function setLocalPreview(file) {
  if (localPreview.value) URL.revokeObjectURL(localPreview.value)
  localPreview.value = file ? URL.createObjectURL(file) : ''
}

onBeforeUnmount(() => {
  if (localPreview.value) URL.revokeObjectURL(localPreview.value)
})

function kebab(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function onUrl(e) {
  // A typed/pasted link should preview itself, not a stale just-uploaded file.
  setLocalPreview(null)
  error.value = ''
  emit('update:modelValue', e.target.value)
}

function clearValue() {
  error.value = ''
  setLocalPreview(null)
  emit('update:modelValue', '')
}

function onImgError() {
  // The preview couldn't load — surface a gentle hint but keep the value so the
  // editor can correct it (an uploaded image may not be live on the branch yet).
  error.value = "That image didn't load. If you just uploaded it, give it a moment; otherwise check the link."
}

/** Read a Blob/File as a base64 string (without the data:...;base64, prefix). */
function readBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = String(reader.result || '')
      const comma = result.indexOf(',')
      resolve(comma >= 0 ? result.slice(comma + 1) : result)
    }
    reader.onerror = () => reject(new Error('Could not read that file.'))
    reader.readAsDataURL(file)
  })
}

// Photos are downscaled + re-encoded as JPEG before upload, so commits stay small
// and pages load fast (a phone photo can be 5–10 MB otherwise). Vector/animated
// formats are passed through untouched.
const MAX_UPLOAD_DIM = 1600
const JPEG_QUALITY = 0.82

async function processImage(file) {
  const type = (file.type || '').toLowerCase()
  const dot = file.name.lastIndexOf('.')

  // SVG (vector) and GIF (animation) would be ruined by a canvas re-encode.
  if (type === 'image/svg+xml' || type === 'image/gif' || !type.startsWith('image/')) {
    const ext = (kebab(dot >= 0 ? file.name.slice(dot + 1) : '') || 'img').slice(0, 5)
    return { base64: await readBase64(file), ext }
  }

  const url = URL.createObjectURL(file)
  try {
    const img = await new Promise((resolve, reject) => {
      const im = new Image()
      im.onload = () => resolve(im)
      im.onerror = () => reject(new Error('Could not read that image.'))
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
    if (!blob) return { base64: await readBase64(file), ext: 'jpg' } // toBlob unsupported → original
    return { base64: await readBase64(blob), ext: 'jpg' }
  } finally {
    URL.revokeObjectURL(url)
  }
}

async function onFile(e) {
  const input = e.target
  const file = input.files && input.files[0]
  if (!file) return
  error.value = ''

  if (!token.value) {
    error.value = 'Please sign in again before uploading.'
    input.value = ''
    return
  }

  uploading.value = true
  try {
    const { base64, ext } = await processImage(file)

    // Build a safe, collision-resistant path: uploads/<kebab-name>-<shorttime>.<ext>
    const dot = file.name.lastIndexOf('.')
    const base = kebab(dot >= 0 ? file.name.slice(0, dot) : file.name) || 'image'
    const suffix = Date.now().toString(36).slice(-5)
    const path = `uploads/${base}-${suffix}.${ext}`

    await saveBinaryFile(token.value, 'public/' + path, base64, 'Upload image ' + path)
    setLocalPreview(file) // show the picked file immediately, before the deploy serves it
    error.value = ''
    emit('update:modelValue', '/' + path)
  } catch (err) {
    error.value =
      (err && err.message) ||
      "Sorry — that photo couldn't be uploaded. Please try again."
  } finally {
    uploading.value = false
    input.value = '' // allow re-selecting the same file
  }
}
</script>

<style scoped>
.iu { display: flex; flex-direction: column; gap: 10px; }
.iu-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.iu-pick { position: relative; display: inline-block; flex-shrink: 0; }
.iu-file {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}
.iu-file:disabled { cursor: default; }
.iu-pick-btn {
  display: inline-block;
  padding: 9px 18px;
  border-radius: 6px;
  background: var(--primary, #5634c9);
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
}
.iu-or { font-size: 13px; color: #7a7a7a; }
.iu-url {
  flex: 1;
  min-width: 180px;
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
.iu-preview-wrap {
  display: flex;
  align-items: flex-end;
  gap: 12px;
}
.iu-preview {
  display: block;
  max-width: 200px;
  max-height: 120px;
  border-radius: 4px;
  border: 1px solid #cfc8ba;
}
.iu-clear {
  border: 1px solid #e0b4bc;
  background: #fff;
  color: #b23;
  border-radius: 4px;
  padding: 6px 12px;
  font: inherit;
  font-size: 13px;
  cursor: pointer;
}
.iu-clear:hover { background: #fbeff1; }
</style>
