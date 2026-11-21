<template>
  <!-- text -->
  <label v-if="field.type === 'text'" :data-req-path="vpath || undefined" class="afld" :class="{ 'is-missing': missing }">
    <span class="afld-label">{{ field.label }}<ChangedNote /></span>
    <input type="text" v-model="obj[field.key]" :aria-invalid="missing || undefined" />
    <MissingNote />
    <span v-if="field.help" class="afld-help">{{ field.help }}</span>
  </label>

  <!-- textarea -->
  <label v-else-if="field.type === 'textarea'" :data-req-path="vpath || undefined" class="afld" :class="{ 'is-missing': missing }">
    <span class="afld-label">{{ field.label }}<ChangedNote /></span>
    <textarea rows="3" v-model="obj[field.key]" :aria-invalid="missing || undefined"></textarea>
    <MissingNote />
    <span v-if="field.help" class="afld-help">{{ field.help }}</span>
  </label>

  <!-- url / link -->
  <div v-else-if="field.type === 'url'" :data-req-path="vpath || undefined" class="afld" :class="{ 'is-missing': missing }">
    <label>
      <span class="afld-label">{{ field.label }}<ChangedNote /></span>
      <input type="text" inputmode="url" v-model="obj[field.key]" placeholder="https://…  or  /a-page" :aria-invalid="missing || undefined" />
      <MissingNote />
      <span class="afld-help">{{ field.help || 'A full web address (https://…) or an internal page like /stories. Leave blank for no link.' }}</span>
    </label>
    <ZoomLinkHelp v-if="field.helper === 'zoom-link'" />
  </div>

  <!-- heading / divider (display only) -->
  <p v-else-if="field.type === 'heading'" :data-req-path="vpath || undefined" class="afld-heading">
    {{ field.label }}
    <span v-if="field.help" class="afld-heading-help">{{ field.help }}</span>
  </p>

  <!-- html / rich prose -->
  <div v-else-if="field.type === 'html'" :data-req-path="vpath || undefined" class="afld" :class="{ 'is-missing': missing }">
    <span class="afld-label">{{ field.label }}<ChangedNote /></span>
    <RichText v-model="obj[field.key]" :invalid="missing" />
    <MissingNote />
    <span class="afld-help">{{ field.help || 'Select some words and press I to italicize them — that\'s the accent style used in headings across the site.' }}</span>
  </div>

  <!-- number -->
  <label v-else-if="field.type === 'number'" :data-req-path="vpath || undefined" class="afld" :class="{ 'is-missing': missing }">
    <span class="afld-label">{{ field.label }}<ChangedNote /></span>
    <input type="number" v-model.number="obj[field.key]" :aria-invalid="missing || undefined" />
    <MissingNote />
    <span v-if="field.help" class="afld-help">{{ field.help }}</span>
  </label>

  <!-- boolean -->
  <label v-else-if="field.type === 'boolean'" :data-req-path="vpath || undefined" class="afld afld-check">
    <input type="checkbox" v-model="obj[field.key]" />
    <span class="afld-label">{{ field.label }}<ChangedNote /></span>
  </label>

  <!-- select -->
  <label v-else-if="field.type === 'select'" :data-req-path="vpath || undefined" class="afld" :class="{ 'is-missing': missing }">
    <span class="afld-label">{{ field.label }}<ChangedNote /></span>
    <select v-model="obj[field.key]" :aria-invalid="missing || undefined">
      <option v-for="o in resolvedOptions" :key="o.value" :value="o.value">{{ o.label }}</option>
    </select>
    <MissingNote />
    <span v-if="field.help" class="afld-help">{{ field.help }}</span>
  </label>

  <!-- image (upload, pick from the site's photos, or paste a URL) -->
  <div v-else-if="field.type === 'image'" :data-req-path="vpath || undefined" class="afld" :class="{ 'is-missing': missing }">
    <span class="afld-label">{{ field.label }}<ChangedNote /></span>
    <ImageUpload v-model="obj[field.key]" />
    <MissingNote />
    <span v-if="field.help" class="afld-help">{{ field.help }}</span>
  </div>

  <!-- object -->
  <fieldset v-else-if="field.type === 'object'" :data-req-path="vpath || undefined" class="afld-object">
    <legend>{{ field.label }}</legend>
    <p v-if="field.help" class="afld-help afld-group-help">{{ field.help }}</p>
    <AdminField v-for="f in field.fields" :key="f.key" :field="f" :obj="child" :path="childPath(f.key)" :vpath="childVpath(f.key)" />
  </fieldset>

  <!-- list -->
  <fieldset v-else-if="field.type === 'list'" :data-req-path="vpath || undefined" ref="listEl" class="afld-list" :class="{ 'is-sorting': dragFrom >= 0, 'is-missing': missing }">
    <legend>
      {{ field.label }} <span class="afld-count">({{ list.length }})</span><ChangedNote />
    </legend>
    <p v-if="field.help" class="afld-help afld-group-help">{{ field.help }}</p>
    <p v-if="missing" class="afld-error">
      {{
        isPrimitiveList && list.length
          ? 'Fill in the empty one, or remove it with ✕. It would show as a blank choice on your website.'
          : 'The website needs at least one of these. Add one before publishing.'
      }}
    </p>

    <!-- list of plain strings -->
    <template v-if="isPrimitiveList">
      <div v-for="(item, i) in list" :key="i" class="afld-prim" :class="rowClass(i)">
        <span
          v-if="list.length > 1"
          class="afld-grip"
          aria-hidden="true"
          title="Drag to reorder"
          @pointerdown="startDrag($event, i)"
          @pointermove="onDragMove"
          @pointerup="endDrag(true, $event)"
          @pointercancel="endDrag(false, $event)"
          @lostpointercapture="endDrag(false, $event)"
        >⠿</span>
        <textarea v-if="field.itemType === 'textarea'" rows="2" v-model="list[i]" :aria-invalid="blankEntry(item) || undefined"></textarea>
        <input v-else type="text" v-model="list[i]" :aria-invalid="blankEntry(item) || undefined" />
        <span class="afld-item-ctrls">
          <button type="button" @click="move(i, -1)" :disabled="i === 0" title="Move up" aria-label="Move up">↑</button>
          <button type="button" @click="move(i, 1)" :disabled="i === list.length - 1" title="Move down" aria-label="Move down">↓</button>
          <button type="button" class="danger" @click="remove(i)" title="Remove" aria-label="Remove">✕</button>
        </span>
      </div>
    </template>

    <!-- list of objects: each one folds to its title so long lists stay short -->
    <template v-else>
      <div v-if="list.length > 2" class="afld-fold-all">
        <button type="button" @click="setAll(true)">Open all</button>
        <button type="button" @click="setAll(false)">Close all</button>
      </div>
      <div v-for="(item, i) in list" :key="i" class="afld-item" :class="[{ open: isOpen(item) }, rowClass(i)]">
        <div class="afld-item-head">
          <span
            v-if="list.length > 1"
            class="afld-grip"
            aria-hidden="true"
            title="Drag to reorder"
            @pointerdown="startDrag($event, i)"
            @pointermove="onDragMove"
            @pointerup="endDrag(true, $event)"
            @pointercancel="endDrag(false, $event)"
            @lostpointercapture="endDrag(false, $event)"
          >⠿</span>
          <button
            type="button"
            class="afld-item-toggle"
            :aria-expanded="isOpen(item)"
            @click="toggle(item)"
          >
            <span class="afld-chevron" aria-hidden="true">›</span>
            <img
              v-if="thumbs && thumbOf(item)"
              :src="thumbs.photos.src(thumbOf(item))"
              :style="thumbs.focus.styleFor(thumbOf(item))"
              alt=""
              class="afld-thumb"
            />
            <span class="afld-item-title">{{ itemTitle(item, i) }}</span>
            <span v-if="itemMissing(item)" class="afld-item-missing">Needs filling in</span>
          </button>
          <span class="afld-item-ctrls">
            <button type="button" @click="move(i, -1)" :disabled="i === 0" title="Move up" aria-label="Move up">↑</button>
            <button type="button" @click="move(i, 1)" :disabled="i === list.length - 1" title="Move down" aria-label="Move down">↓</button>
            <button type="button" class="danger" @click="remove(i)" title="Remove" aria-label="Remove">✕</button>
          </span>
        </div>
        <div v-if="isOpen(item)" class="afld-item-body">
          <AdminField v-for="f in field.fields" :key="f.key" :field="f" :obj="item" :path="null" :vpath="childVpath(`${i}.${f.key}`)" />
        </div>
      </div>
    </template>

    <button type="button" class="afld-add" @click="add">+ {{ field.addLabel || 'Add item' }}</button>
  </fieldset>
</template>

<script setup lang="ts">
import { h, type Ref } from 'vue'
import { type Field, blankFromFields, isBlank, isBlankText, missingRequired } from '~/admin/schema'

const props = defineProps<{
  field: Field
  obj: Record<string, any>
  // Where this field sits in the page's data (e.g. "hero.title"), so it can be compared with the
  // live site. null inside list items: their position can change, so there's nothing to compare.
  path?: string | null
  // Where it sits for the required-field check, list positions included (e.g. "upcoming.2.date"),
  // matching missingRequired's paths so the publish sheet's "Fill in" can find this exact field.
  vpath?: string | null
}>()

// The whole section's data (provided by the editor page) so a dropdown can source
// its choices from another field, e.g. a story's filterKey from the filters list.
const root = inject<any>('adminRoot', null)
// The live site's copy of the section, for "Changed · Undo".
const published = inject<Ref<any> | null>('adminPublished', null)
const { showToast } = useAdminUi()

const child = computed<Record<string, any>>(() => props.obj[props.field.key] ?? {})
const list = computed<any[]>(() => {
  const v = props.obj[props.field.key]
  return Array.isArray(v) ? v : []
})
const isPrimitiveList = computed(() => !(props.field.fields && props.field.fields.length))
const childPath = (key: string) => (props.path ? `${props.path}.${key}` : null)
const childVpath = (key: string) => (props.vpath ? `${props.vpath}.${key}` : null)

function getByPath(obj: any, path: string): any {
  return path.split('.').reduce((o, k) => (o == null ? o : o[k]), obj)
}

const clone = (v: any) => (v === undefined ? v : JSON.parse(JSON.stringify(v)))

// ---- "Changed · Undo": this field differs from the live site ----
const publishedValue = computed(() =>
  props.path && published?.value ? getByPath(published.value, props.path) : undefined,
)
const changed = computed(
  () =>
    publishedValue.value !== undefined &&
    JSON.stringify(props.obj[props.field.key] ?? '') !== JSON.stringify(publishedValue.value ?? ''),
)
function revert() {
  props.obj[props.field.key] = clone(publishedValue.value)
}
const ChangedNote = () =>
  changed.value
    ? h('span', { class: 'afld-changed' }, [
        'Changed · ',
        h(
          'button',
          {
            type: 'button',
            class: 'afld-revert',
            title: 'Put back what the live website has',
            onClick: (e: Event) => {
              e.preventDefault()
              revert()
            },
          },
          'Undo',
        ),
      ])
    : null

// ---- Required: the live page shows this with no fallback, so publishing waits until it's filled ----
const missing = computed(() => !!props.field.required && isBlank(props.field, props.obj[props.field.key]))
// One empty entry in a required list of words (see isBlank), marked so "Fill in" lands on it.
const blankEntry = (v: unknown) => !!props.field.required && typeof v === 'string' && isBlankText(v)
const MissingNote = () =>
  missing.value ? h('span', { class: 'afld-error' }, 'This shows on your website, so it needs something in it.') : null
// A folded item hides its fields, so its row says when something inside it is still empty.
const itemMissing = (item: any) => missingRequired(item, props.field.fields || []).length > 0

// "Fill in" in the publish sheet: the page bumps this, and each list opens the items with gaps
// (the page bumps it again for lists inside items that only just opened).
const reveal = inject<Ref<number> | null>('adminRevealMissing', null)
if (props.field.type === 'list' && reveal) {
  watch(reveal, () => {
    for (const item of list.value) if (itemMissing(item)) openItems.add(item)
  })
}

const resolvedOptions = computed<{ label: string; value: string }[]>(() => {
  if (props.field.optionsFrom && root && (root as any).value) {
    const src = getByPath((root as any).value, props.field.optionsFrom)
    if (Array.isArray(src)) {
      return src
        .filter((v) => typeof v === 'string')
        .map((v) => ({ label: v as string, value: v as string }))
    }
  }
  return (props.field.options || []).map((o) =>
    typeof o === 'string' ? { label: o, value: o } : o,
  )
})

function stripTags(s: unknown): string {
  return typeof s === 'string' ? s.replace(/<[^>]+>/g, '').trim() : ''
}

function itemTitle(item: Record<string, any>, i: number): string {
  const key = props.field.itemLabelKey
  const raw = key ? stripTags(item?.[key]) : ''
  if (raw) return raw
  // No title field set: use the first bit of text in the item, or the photo's file name (its
  // thumbnail sits beside the title, so the full /uploads/ path would only repeat it).
  const first = Object.entries(item || {}).find(([k, v]) => k !== imageKey && typeof v === 'string' && stripTags(v))
  if (first) return stripTags(first[1]).slice(0, 80)
  return thumbOf(item).split('/').pop() || `Item ${i + 1}`
}

// ---- Folding: remembered per item (not per position), so it follows an item when moved ----
const openItems = reactive(new WeakSet<object>())
const isOpen = (item: any) => Boolean(item && typeof item === 'object' && openItems.has(item))
function toggle(item: any) {
  if (openItems.has(item)) openItems.delete(item)
  else openItems.add(item)
}
function setAll(open: boolean) {
  for (const item of list.value) {
    if (open) openItems.add(item)
    else openItems.delete(item)
  }
}

function add() {
  if (isPrimitiveList.value) {
    list.value.push('')
    return
  }
  list.value.push(blankFromFields(props.field.fields || []))
  openItems.add(list.value[list.value.length - 1]) // a new item opens, ready to fill in
}

function remove(i: number) {
  const arr = list.value
  const [removed] = arr.splice(i, 1)
  const name = isPrimitiveList.value ? stripTags(removed) : itemTitle(removed, i)
  showToast(`Removed ${name ? `“${name.slice(0, 60)}”` : 'an item'}.`, null, () => {
    arr.splice(Math.min(i, arr.length), 0, removed)
  })
}

function move(i: number, dir: number) {
  const j = i + dir
  if (j < 0 || j >= list.value.length) return
  const arr = list.value
  ;[arr[i], arr[j]] = [arr[j], arr[i]]
}

// ---- Drag to reorder by the ⠿ grip (mouse or touch); ↑/↓ stay for keyboards ----
// Pointer events rather than HTML drag-and-drop, which phones don't support. The grip captures the
// pointer, so moves keep arriving here wherever the finger goes; near the top or bottom edge of the
// editor's scroll area the list scrolls itself.
const listEl = ref<HTMLElement | null>(null)
const dragFrom = ref(-1)
const dropAt = ref(-1) // the gap it would land in: 0 is above the first row, list.length below the last
let pointerY = 0
let scroller: HTMLElement | null = null
let frame = 0

// Only this list's own rows: a list inside an item has rows of its own.
const rows = () =>
  Array.from(listEl.value?.querySelectorAll<HTMLElement>(':scope > .afld-prim, :scope > .afld-item') ?? [])

// The gaps either side of the dragged row leave the order as it is.
const willMove = computed(
  () => dragFrom.value >= 0 && dropAt.value >= 0 && dropAt.value !== dragFrom.value && dropAt.value !== dragFrom.value + 1,
)
const rowClass = (i: number) => ({
  'is-dragging': dragFrom.value === i,
  'drop-before': willMove.value && dropAt.value === i,
  'drop-after': willMove.value && dropAt.value === list.value.length && i === list.value.length - 1,
})

function scrollParent(el: HTMLElement | null): HTMLElement {
  for (let p = el?.parentElement; p; p = p.parentElement) {
    const oy = getComputedStyle(p).overflowY
    if ((oy === 'auto' || oy === 'scroll') && p.scrollHeight > p.clientHeight) return p
  }
  return document.scrollingElement as HTMLElement
}

function updateDrop() {
  const rs = rows()
  const k = rs.findIndex((r) => {
    const box = r.getBoundingClientRect()
    return pointerY < box.top + box.height / 2
  })
  dropAt.value = k < 0 ? rs.length : k
}

function autoscroll() {
  frame = requestAnimationFrame(autoscroll)
  if (!scroller) return
  const box = scroller === document.scrollingElement ? { top: 0, bottom: innerHeight } : scroller.getBoundingClientRect()
  const EDGE = 56
  const into = pointerY < box.top + EDGE ? pointerY - (box.top + EDGE) : pointerY > box.bottom - EDGE ? pointerY - (box.bottom - EDGE) : 0
  if (!into) return
  const before = scroller.scrollTop
  scroller.scrollTop += Math.sign(into) * Math.min(18, Math.max(2, Math.abs(into) / 3))
  if (scroller.scrollTop !== before) updateDrop()
}

let dragPointer = -1 // the one finger or mouse doing the drag; a second touch is ignored

function startDrag(e: PointerEvent, i: number) {
  if (e.button !== 0 || list.value.length < 2 || dragFrom.value >= 0) return
  e.preventDefault() // no text selection or touch scrolling while dragging
  // That also stops the press taking focus from a field being typed in, so blur it now and it saves
  // into its own item. Rows reuse their fields by position and a rich-text box ignores new text
  // while focused, so after the move it would write its old text into the item now in its place.
  const active = document.activeElement as HTMLElement | null
  if (active && listEl.value?.contains(active)) active.blur()
  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  dragPointer = e.pointerId
  dragFrom.value = i
  pointerY = e.clientY
  scroller = scrollParent(listEl.value)
  updateDrop()
  cancelAnimationFrame(frame)
  frame = requestAnimationFrame(autoscroll)
}

function onDragMove(e: PointerEvent) {
  if (dragFrom.value < 0 || e.pointerId !== dragPointer) return
  pointerY = e.clientY
  updateDrop()
}

/** Drop (commit) or abandon the drag. Pointer-up commits; cancel and a lost capture abandon. */
function endDrag(commit: boolean, e?: PointerEvent) {
  if (dragFrom.value < 0 || (e && e.pointerId !== dragPointer)) return
  if (commit && willMove.value) {
    const arr = list.value
    const from = dragFrom.value
    const [moved] = arr.splice(from, 1)
    arr.splice(dropAt.value > from ? dropAt.value - 1 : dropAt.value, 0, moved)
  }
  dragFrom.value = -1
  dropAt.value = -1
  dragPointer = -1
  scroller = null
  cancelAnimationFrame(frame)
}
onBeforeUnmount(() => endDrag(false))

// ---- A small photo beside each item's title, for lists of things with a photo ----
const imageKey = props.field.fields?.find((f) => f.type === 'image')?.key
const thumbs = imageKey ? { photos: usePendingPhotos(), focus: usePhotoFocus() } : null
if (thumbs) {
  onMounted(() => {
    thumbs.photos.ensureLoaded()
    thumbs.focus.ensureLoaded()
  })
}
const thumbOf = (item: any): string => (imageKey && typeof item?.[imageKey] === 'string' ? item[imageKey] : '')
</script>

<style scoped>
.afld {
  display: block;
  margin: 0 0 16px;
}
.afld-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 5px;
  color: #2a2a2a;
}
.afld-tag {
  font-weight: 400;
  font-style: normal;
  font-size: 11px;
  color: #8a7fb8;
  margin-left: 6px;
}
.afld-help {
  display: block;
  font-size: 12px;
  color: #7a7a7a;
  margin-top: 4px;
}
.afld input[type='text'],
.afld input[type='number'],
.afld textarea,
.afld select {
  width: 100%;
  padding: 9px 11px;
  border: 1px solid #cfc8ba;
  border-radius: 5px;
  background: #fff;
  font: inherit;
  font-size: 14px;
  color: #1a1a1a;
}
.afld textarea {
  resize: vertical;
  line-height: 1.5;
}
.afld textarea.mono {
  font-family: var(--mono, monospace);
  font-size: 13px;
}
.afld input:focus,
.afld textarea:focus,
.afld select:focus {
  outline: 2px solid var(--primary, #5634c9);
  border-color: transparent;
}
.afld-check {
  display: flex;
  align-items: center;
  gap: 8px;
}
.afld-check input { width: auto; }
.afld-check .afld-label { margin: 0; }
.afld-preview {
  display: block;
  max-width: 160px;
  max-height: 90px;
  margin-top: 8px;
  border-radius: 4px;
  border: 1px solid #cfc8ba;
}

.afld-heading {
  font-family: var(--mono, monospace);
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: #8a7fb8;
  margin: 26px 0 12px;
  padding-bottom: 6px;
  border-bottom: 1px solid #e3ddd0;
}
.afld-heading-help {
  display: block;
  font-family: var(--sans, sans-serif);
  font-weight: 400;
  text-transform: none;
  letter-spacing: 0;
  font-size: 12px;
  color: #9a7a3a;
  margin-top: 4px;
}

.afld-object,
.afld-list {
  border: 1px solid #ddd5c6;
  border-radius: 7px;
  padding: 16px 18px;
  margin: 0 0 20px;
  background: #fbf9f3;
  /* A fieldset won't shrink below its widest unbreakable content by default, so one long
     item title (they're single-line with an ellipsis) pushed the editor wider than a phone. */
  min-width: 0;
}
.afld-object > legend,
.afld-list > legend {
  font-family: var(--serif, Georgia, serif);
  font-size: 17px;
  font-weight: 600;
  padding: 0 8px;
  color: var(--primary-deep, #1c0f52);
}
.afld-count { font-family: var(--mono, monospace); font-size: 12px; color: #8a7fb8; font-weight: 400; }

.afld-item {
  border: 1px solid #e3ddd0;
  border-radius: 6px;
  padding: 8px 10px 8px 6px;
  margin-bottom: 8px;
  background: #fff;
}
.afld-item.open {
  padding-bottom: 2px;
  border-color: #cfc4ec;
}
.afld-item-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
.afld-item-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
  background: none;
  border: none;
  padding: 4px;
  font: inherit;
  text-align: left;
  cursor: pointer;
  border-radius: 5px;
}
.afld-item-toggle:hover .afld-item-title {
  color: var(--primary, #1e0177);
}
.afld-chevron {
  display: inline-block;
  width: 14px;
  font-size: 17px;
  line-height: 1;
  color: #8a7fb8;
  transition: transform 0.15s ease;
  flex-shrink: 0;
}
.afld-item.open .afld-chevron {
  transform: rotate(90deg);
}
.afld-item-title {
  font-weight: 600;
  font-size: 13.5px;
  color: #444;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.afld-item-body {
  padding: 12px 4px 0 26px;
}
.afld-fold-all {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin: -4px 0 8px;
}
.afld-fold-all button {
  background: none;
  border: none;
  padding: 0;
  font: inherit;
  font-size: 12.5px;
  color: var(--primary, #1e0177);
  text-decoration: underline;
  cursor: pointer;
}
.afld-group-help {
  margin: -4px 0 12px;
}
.afld-changed {
  margin-left: 8px;
  font-size: 12px;
  font-weight: 500;
  color: #8a5a00;
  background: #fff4cc;
  border-radius: 999px;
  padding: 2px 8px;
  white-space: nowrap;
}
.afld-revert {
  background: none;
  border: none;
  padding: 0;
  font: inherit;
  color: inherit;
  font-weight: 600;
  text-decoration: underline;
  cursor: pointer;
}
/* Required and still empty: a red border, the reason under it, and a chip on a folded item */
.afld-error {
  display: block;
  margin-top: 6px;
  font-size: 12.5px;
  font-weight: 500;
  color: #a3261b;
}
.afld.is-missing input[type='text'],
.afld.is-missing input[type='number'],
.afld.is-missing textarea,
.afld.is-missing select,
.afld-prim [aria-invalid='true'] {
  border-color: #d2564a;
}
.afld-item-missing {
  margin-left: 8px;
  font-size: 12px;
  font-weight: 500;
  color: #a3261b;
  background: #fdeaea;
  border-radius: 999px;
  padding: 2px 8px;
  white-space: nowrap;
  flex-shrink: 0;
}
@media (prefers-reduced-motion: reduce) {
  .afld-chevron { transition: none; }
}
.afld-item-ctrls { display: flex; gap: 4px; flex-shrink: 0; }
.afld-prim {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 8px;
}
.afld-prim input,
.afld-prim textarea {
  flex: 1;
  padding: 8px 10px;
  border: 1px solid #cfc8ba;
  border-radius: 5px;
  font: inherit;
  font-size: 14px;
}
.afld-item-ctrls button,
.afld-add {
  border: 1px solid #cfc8ba;
  background: #fff;
  border-radius: 4px;
  cursor: pointer;
  font: inherit;
}
.afld-item-ctrls button {
  width: 28px;
  height: 28px;
  font-size: 13px;
  color: #555;
}
.afld-item-ctrls button:disabled { opacity: 0.35; cursor: not-allowed; }
.afld-item-ctrls .danger { color: #b23; border-color: #e0b4bc; }

/* Drag to reorder */
.afld-grip {
  display: grid;
  place-items: center;
  width: 20px;
  height: 28px;
  flex-shrink: 0;
  border-radius: 4px;
  color: #a49cc4;
  font-size: 15px;
  line-height: 1;
  cursor: grab;
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
}
.afld-grip:hover {
  color: var(--primary, #5634c9);
  background: #f4f0ff;
}
.afld-prim .afld-grip { height: 36px; }
.afld-list.is-sorting,
.afld-list.is-sorting * {
  cursor: grabbing !important;
  user-select: none;
  -webkit-user-select: none;
}
.afld-item,
.afld-prim {
  position: relative;
}
.afld-item.is-dragging,
.afld-prim.is-dragging {
  opacity: 0.45;
}
.drop-before::before,
.drop-after::after {
  content: '';
  position: absolute;
  left: -1px;
  right: -1px;
  height: 3px;
  border-radius: 2px;
  background: var(--primary, #5634c9);
  pointer-events: none;
}
.drop-before::before { top: -6px; }
.drop-after::after { bottom: -6px; }
.afld-thumb {
  width: 36px;
  height: 27px;
  flex-shrink: 0;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid #e3ddd0;
  background: #eee8da;
}
.afld-add {
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 600;
  color: var(--primary, #5634c9);
  border-color: var(--primary, #5634c9);
}
.afld-add:hover { background: #f0ebff; }
</style>
