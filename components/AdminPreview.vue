<template>
  <div class="pv">
    <div class="pv-bar">
      <div class="pv-head">
        <span class="pv-title">Preview</span>
        <span class="pv-note">{{ note }}</span>
      </div>
      <div class="pv-devices" role="group" aria-label="Preview size">
        <button type="button" :aria-pressed="device === 'desktop'" @click="setDevice('desktop')">Computer</button>
        <button type="button" :aria-pressed="device === 'phone'" @click="setDevice('phone')">Phone</button>
      </div>
      <button type="button" class="pv-close" aria-label="Close the preview" title="Close the preview" @click="emit('close')">✕</button>
    </div>

    <div ref="stageEl" class="pv-stage" :class="device">
      <div class="pv-frame" :style="frameBox">
        <iframe
          ref="frameEl"
          :key="reloads"
          :src="src"
          title="Preview of the website with your unpublished changes"
          :style="frameStyle"
        ></iframe>
      </div>
      <div v-if="!ready" class="pv-loading">Loading the preview…</div>
    </div>
  </div>
</template>

<script setup>
import { FOCUS_FILE } from '~/admin/schema'

const emit = defineEmits(['close'])

const { path, overrides, recent, reloads } = useAdminPreview()
const { draftFiles, pendingCount } = useDrafts()
const photos = usePendingPhotos()

const DEVICE_KEY = 'ontariorare_admin_preview_device'
const WIDTH = { desktop: 1280, phone: 390 }

const device = ref('desktop')
const stageEl = ref(null)
const frameEl = ref(null)
const stage = reactive({ w: 0, h: 0 })
const ready = ref(false)
// The page the frame first loads. Later page changes are sent as messages so the preview can
// open pages that only exist in your drafts (a new story or event has no published page yet).
const src = ref(path.value)

const note = computed(() =>
  pendingCount.value > 0 || Object.keys(recent.value).length
    ? 'Shows your unpublished changes. Only you can see them.'
    : 'Matches the live website.',
)

function setDevice(d) {
  device.value = d
  try {
    localStorage.setItem(DEVICE_KEY, d)
  } catch {
    /* storage blocked */
  }
}

// The site is drawn at a real desktop or phone width, then scaled down to fit the pane.
const scale = computed(() => {
  const pad = device.value === 'phone' ? 24 : 0
  return Math.min(1, Math.max(0.1, (stage.w - pad) / WIDTH[device.value]))
})
const frameBox = computed(() => {
  const s = scale.value
  const pad = device.value === 'phone' ? 24 : 0
  return { width: `${WIDTH[device.value] * s}px`, height: `${Math.max(0, stage.h - pad)}px` }
})
const frameStyle = computed(() => {
  const s = scale.value
  const pad = device.value === 'phone' ? 24 : 0
  return {
    width: `${WIDTH[device.value]}px`,
    height: `${Math.max(0, stage.h - pad) / s}px`,
    transform: `scale(${s})`,
  }
})

function post(msg) {
  const win = frameEl.value?.contentWindow
  if (win && ready.value) win.postMessage(msg, location.origin)
}

function sendContent() {
  // Plain JSON copies: Vue's reactive proxies can't be posted between windows.
  const files = {}
  for (const [file, data] of Object.entries({ ...recent.value, ...draftFiles.value, ...overrides.value })) {
    const plain = JSON.parse(JSON.stringify(data))
    files[file] = file === FOCUS_FILE ? focusBothWays(plain) : photos.withLocalUrls(plain)
  }
  post({ type: 'admin-preview:content', files })
}

// focus.json is keyed by photo path. A page the preview is sent shows a photo still on this device
// (or published this visit) by its local URL, but a page it isn't sent still names the path, so key
// each point both ways to match either.
function focusBothWays(map) {
  const out = { ...map }
  for (const [path, point] of Object.entries(map)) out[photos.src(path)] = point
  return out
}
const sendGo = () => post({ type: 'admin-preview:go', path: path.value })

let timer = null
watch(
  [draftFiles, overrides, recent, () => photos.paths.value.length],
  () => {
    clearTimeout(timer)
    timer = setTimeout(sendContent, 150)
  },
  { deep: true },
)
watch(path, sendGo)
watch(reloads, () => {
  ready.value = false
  src.value = path.value
})

function onMessage(e) {
  if (!frameEl.value || e.source !== frameEl.value.contentWindow || e.origin !== location.origin) return
  if (e.data?.type === 'admin-preview:ready') {
    ready.value = true
    sendContent()
    sendGo()
  }
}

let observer = null
onMounted(() => {
  try {
    const saved = localStorage.getItem(DEVICE_KEY)
    device.value = saved === 'phone' || saved === 'desktop' ? saved : window.innerWidth < 768 ? 'phone' : 'desktop'
  } catch {
    device.value = window.innerWidth < 768 ? 'phone' : 'desktop'
  }
  photos.ensureLoaded()
  window.addEventListener('message', onMessage)
  observer = new ResizeObserver(([entry]) => {
    stage.w = entry.contentRect.width
    stage.h = entry.contentRect.height
  })
  if (stageEl.value) observer.observe(stageEl.value)
})
onBeforeUnmount(() => {
  clearTimeout(timer)
  window.removeEventListener('message', onMessage)
  observer?.disconnect()
})
</script>

<style scoped>
.pv {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  background: #ECE6D8;
}
.pv-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: #fff;
  border-bottom: 1px solid var(--line);
  flex-shrink: 0;
}
.pv-head {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
}
.pv-title {
  font-size: 13.5px;
  font-weight: 600;
  color: var(--ink);
}
.pv-note {
  font-size: 12px;
  color: var(--muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.pv-devices {
  display: inline-flex;
  border: 1px solid var(--line);
  border-radius: 999px;
  padding: 2px;
  background: var(--bg);
  flex-shrink: 0;
}
.pv-devices button {
  border: none;
  background: none;
  border-radius: 999px;
  padding: 5px 12px;
  font: inherit;
  font-size: 12.5px;
  color: var(--muted);
  cursor: pointer;
}
.pv-devices button[aria-pressed='true'] {
  background: var(--primary);
  color: #fff;
}
.pv-close {
  border: none;
  background: none;
  font-size: 15px;
  line-height: 1;
  padding: 6px;
  color: var(--muted);
  cursor: pointer;
  border-radius: 6px;
  flex-shrink: 0;
}
.pv-close:hover {
  background: var(--bg);
  color: var(--ink);
}
.pv-stage {
  position: relative;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}
.pv-stage.phone {
  display: flex;
  justify-content: center;
  padding-top: 12px;
}
.pv-frame {
  overflow: hidden;
  background: #fff;
}
.pv-stage.phone .pv-frame {
  border-radius: 22px;
  box-shadow: 0 0 0 6px #1a1626, 0 12px 32px rgba(26, 22, 38, 0.25);
}
.pv-frame iframe {
  display: block;
  border: 0;
  transform-origin: top left;
  background: var(--bg);
}
.pv-loading {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13.5px;
  color: var(--muted);
  background: rgba(236, 230, 216, 0.85);
  pointer-events: none;
}
</style>
