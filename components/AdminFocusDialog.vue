<template>
  <dialog ref="dialogEl" class="fd" aria-labelledby="fd-title" @close="focus.close()">
    <div v-if="src" class="fd-inner">
      <div class="fd-main">
        <h3 id="fd-title" class="fd-title">Choose what shows</h3>
        <p class="fd-help">
          Click or drag to the most important part of the photo, like a face or a sign. Wherever the website trims
          this photo to fit a shape, it keeps that part in view.
        </p>
        <div class="fd-stage">
          <div
            ref="frame"
            class="fd-frame"
            tabindex="0"
            role="slider"
            aria-label="Most important part of the photo"
            :aria-valuetext="`${xy[0]}% across, ${xy[1]}% down`"
            @pointerdown="press"
            @pointermove="drag"
            @pointerup="release"
            @pointercancel="release"
            @lostpointercapture="release"
            @keydown="nudge"
          >
            <img :src="photos.src(src)" alt="" draggable="false" class="fd-img" />
            <span class="fd-mark" :class="{ unset: !point }" :style="{ left: `${xy[0]}%`, top: `${xy[1]}%` }" aria-hidden="true">
              <span />
            </span>
          </div>
        </div>
      </div>

      <div class="fd-side">
        <p class="fd-label">How it looks on the site</p>
        <div class="fd-shapes">
          <figure v-for="s in shapes" :key="s.label" class="fd-shape">
            <div class="fd-shape-box" :style="{ aspectRatio: s.ratio }">
              <img :src="photos.src(src)" alt="" :style="{ objectPosition: point || s.usual }" />
            </div>
            <figcaption>{{ s.label }}</figcaption>
          </figure>
        </div>
        <p class="fd-note">The website preview beside the editor updates as you choose.</p>

        <div class="fd-actions">
          <button type="button" class="fd-btn" :disabled="!point" @click="setPoint('')">Use the usual crop</button>
          <div class="fd-row">
            <button type="button" class="fd-btn" @click="dialogEl?.close()">Cancel</button>
            <button type="button" class="fd-btn primary" @click="done">Done</button>
          </div>
        </div>
      </div>
    </div>
  </dialog>
</template>

<script setup>
// "Choose what shows": click or drag on a photo to mark the part that matters most, and see how it
// comes out in the shapes the website crops photos to. Ported from the abaileyevents editor; the
// point is kept as a pending change by composables/usePhotoFocus.ts.
const focus = usePhotoFocus()
const photos = usePendingPhotos()
const dialogEl = ref(null)
const frame = ref(null)

const src = computed(() => focus.editing.value)
const point = ref('') // the point being chosen, "x% y%"; '' is the site's usual crop

// The site's crops (object-fit: cover) and where each one looks when nothing is chosen.
const shapes = [
  { label: 'Story card', ratio: '4 / 5', usual: '50% 0%' }, // pages/stories: top center
  { label: 'Home and event cards', ratio: '4 / 3', usual: '50% 50%' },
  { label: 'Event gallery', ratio: '3 / 2', usual: '50% 50%' },
]

const xy = computed(() => {
  const [x, y] = (point.value || '50% 50%').split(/\s+/).map((v) => parseFloat(v))
  return [Number.isFinite(x) ? x : 50, Number.isFinite(y) ? y : 50]
})

watch(src, (s) => {
  if (!s) {
    if (dialogEl.value?.open) dialogEl.value.close()
    return
  }
  point.value = focus.pointOf(s)
  if (!dialogEl.value?.open) dialogEl.value?.showModal()
})

function setPoint(p) {
  point.value = p
  focus.show(src.value, p || null)
}

const clamp = (n) => Math.round(Math.min(100, Math.max(0, n)))

let dragging = false
function place(e) {
  const box = frame.value?.getBoundingClientRect()
  if (!box?.width || !box.height) return
  setPoint(`${clamp(((e.clientX - box.left) / box.width) * 100)}% ${clamp(((e.clientY - box.top) / box.height) * 100)}%`)
}
function press(e) {
  if (e.button !== 0) return
  dragging = true
  frame.value?.setPointerCapture(e.pointerId)
  place(e)
}
function drag(e) {
  if (dragging) place(e)
}
function release() {
  dragging = false
}

// Arrow keys move the mark for anyone not using a mouse or touch.
const moves = { ArrowLeft: [-5, 0], ArrowRight: [5, 0], ArrowUp: [0, -5], ArrowDown: [0, 5] }
function nudge(e) {
  const m = moves[e.key]
  if (!m) return
  e.preventDefault()
  setPoint(`${clamp(xy.value[0] + m[0])}% ${clamp(xy.value[1] + m[1])}%`)
}

function done() {
  focus.save(src.value, point.value || null)
  dialogEl.value?.close() // @close clears the preview override; the saved draft now shows instead
}

onBeforeUnmount(() => focus.close())
</script>

<style scoped>
.fd {
  width: min(900px, calc(100vw - 32px));
  max-height: calc(100vh - 48px);
  padding: 0;
  border: none;
  border-radius: 14px;
  box-shadow: 0 24px 64px rgba(26, 22, 38, 0.3);
  background: #fff;
  color: var(--ink);
  overflow-y: auto;
}
.fd::backdrop {
  background: rgba(26, 22, 38, 0.45);
}
.fd-inner {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 230px;
  gap: 24px;
  padding: 22px 24px 24px;
}
.fd-title {
  margin: 0;
  font-size: 19px;
}
.fd-help {
  margin: 6px 0 0;
  max-width: 52ch;
  font-size: 14px;
  line-height: 1.5;
  color: var(--muted, #6b6b6b);
}
.fd-stage {
  display: grid;
  place-items: center;
  margin-top: 16px;
  padding: 12px;
  border-radius: 10px;
  background: #f4f1ea;
}
.fd-frame {
  position: relative;
  display: inline-block;
  max-width: 100%;
  cursor: crosshair;
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
  outline: none;
  border-radius: 8px;
}
.fd-frame:focus-visible {
  box-shadow: 0 0 0 3px #fff, 0 0 0 5px var(--primary, #5634c9);
}
.fd-img {
  display: block;
  width: auto;
  max-width: 100%;
  max-height: min(56vh, 520px);
  border-radius: 8px;
  pointer-events: none;
}
.fd-mark {
  position: absolute;
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  transform: translate(-50%, -50%);
  border: 3px solid #fff;
  border-radius: 50%;
  box-shadow: 0 0 0 1px rgba(34, 33, 31, 0.35), 0 4px 14px rgba(34, 33, 31, 0.35);
  pointer-events: none;
}
.fd-mark > span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 0 0 1px rgba(34, 33, 31, 0.35);
}
.fd-mark.unset {
  opacity: 0.55;
  border-style: dashed;
}
.fd-side {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.fd-label {
  margin: 0;
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--muted, #6b6b6b);
}
.fd-shapes {
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: end;
  gap: 12px;
}
.fd-shape {
  margin: 0;
  display: grid;
  gap: 5px;
}
.fd-shape-box {
  overflow: hidden;
  border-radius: 8px;
  background: #eee8da;
  box-shadow: inset 0 0 0 1px rgba(34, 33, 31, 0.1);
}
.fd-shape-box img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.fd-shape figcaption {
  font-size: 12px;
  line-height: 1.3;
  text-align: center;
  color: var(--muted, #6b6b6b);
}
.fd-note {
  margin: 0;
  font-size: 12.5px;
  color: var(--muted, #6b6b6b);
}
.fd-actions {
  display: grid;
  gap: 10px;
  margin-top: auto;
}
.fd-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.fd-btn {
  padding: 9px 14px;
  border: 1px solid #cfc4ec;
  border-radius: 6px;
  background: #fff;
  color: var(--primary, #5634c9);
  font: inherit;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}
.fd-btn:hover {
  background: #f4f0ff;
}
.fd-btn:disabled {
  opacity: 0.55;
  cursor: default;
}
.fd-btn.primary {
  border-color: transparent;
  background: var(--primary, #5634c9);
  color: #fff;
}
.fd-btn.primary:hover {
  filter: brightness(1.08);
}
@media (max-width: 760px) {
  .fd-inner {
    grid-template-columns: 1fr;
    padding: 18px 16px 0;
  }
  .fd-img {
    max-height: 42vh;
  }
  .fd-shapes {
    grid-template-columns: repeat(3, 1fr);
  }
  /* Keep the buttons in reach at the bottom of a phone screen while the dialog scrolls. */
  .fd-actions {
    position: sticky;
    bottom: 0;
    margin: 0 -16px;
    padding: 12px 16px;
    border-top: 1px solid #e6e0d4;
    background: #fff;
  }
}
</style>
