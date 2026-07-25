<template>
  <!-- text -->
  <label v-if="field.type === 'text'" class="afld">
    <span class="afld-label">{{ field.label }}</span>
    <input type="text" v-model="obj[field.key]" />
    <span v-if="field.help" class="afld-help">{{ field.help }}</span>
  </label>

  <!-- textarea -->
  <label v-else-if="field.type === 'textarea'" class="afld">
    <span class="afld-label">{{ field.label }}</span>
    <textarea rows="3" v-model="obj[field.key]"></textarea>
    <span v-if="field.help" class="afld-help">{{ field.help }}</span>
  </label>

  <!-- html / rich prose -->
  <label v-else-if="field.type === 'html'" class="afld">
    <span class="afld-label">{{ field.label }} <em class="afld-tag">formatting allowed</em></span>
    <textarea rows="2" class="mono" v-model="obj[field.key]"></textarea>
    <span class="afld-help">{{ field.help || 'You can use <em>…</em> for italics and <strong>…</strong> for bold.' }}</span>
  </label>

  <!-- number -->
  <label v-else-if="field.type === 'number'" class="afld">
    <span class="afld-label">{{ field.label }}</span>
    <input type="number" v-model.number="obj[field.key]" />
  </label>

  <!-- boolean -->
  <label v-else-if="field.type === 'boolean'" class="afld afld-check">
    <input type="checkbox" v-model="obj[field.key]" />
    <span class="afld-label">{{ field.label }}</span>
  </label>

  <!-- select -->
  <label v-else-if="field.type === 'select'" class="afld">
    <span class="afld-label">{{ field.label }}</span>
    <select v-model="obj[field.key]">
      <option v-for="o in field.options" :key="o" :value="o">{{ o }}</option>
    </select>
  </label>

  <!-- image (URL for now; media picker added later) -->
  <label v-else-if="field.type === 'image'" class="afld">
    <span class="afld-label">{{ field.label }}</span>
    <input type="text" v-model="obj[field.key]" placeholder="/uploads/example.jpg" />
    <img v-if="obj[field.key]" :src="obj[field.key]" alt="" class="afld-preview" />
  </label>

  <!-- object -->
  <fieldset v-else-if="field.type === 'object'" class="afld-object">
    <legend>{{ field.label }}</legend>
    <AdminField v-for="f in field.fields" :key="f.key" :field="f" :obj="child" />
  </fieldset>

  <!-- list -->
  <fieldset v-else-if="field.type === 'list'" class="afld-list">
    <legend>{{ field.label }} <span class="afld-count">({{ list.length }})</span></legend>

    <!-- list of plain strings -->
    <template v-if="isPrimitiveList">
      <div v-for="(item, i) in list" :key="i" class="afld-prim">
        <textarea v-if="field.itemType === 'textarea'" rows="2" v-model="list[i]"></textarea>
        <input v-else type="text" v-model="list[i]" />
        <span class="afld-item-ctrls">
          <button type="button" @click="move(i, -1)" :disabled="i === 0" title="Move up">↑</button>
          <button type="button" @click="move(i, 1)" :disabled="i === list.length - 1" title="Move down">↓</button>
          <button type="button" class="danger" @click="remove(i)" title="Remove">✕</button>
        </span>
      </div>
    </template>

    <!-- list of objects -->
    <template v-else>
      <div v-for="(item, i) in list" :key="i" class="afld-item">
        <div class="afld-item-head">
          <span class="afld-item-title">{{ itemTitle(item, i) }}</span>
          <span class="afld-item-ctrls">
            <button type="button" @click="move(i, -1)" :disabled="i === 0" title="Move up">↑</button>
            <button type="button" @click="move(i, 1)" :disabled="i === list.length - 1" title="Move down">↓</button>
            <button type="button" class="danger" @click="remove(i)" title="Remove">✕</button>
          </span>
        </div>
        <AdminField v-for="f in field.fields" :key="f.key" :field="f" :obj="item" />
      </div>
    </template>

    <button type="button" class="afld-add" @click="add">+ {{ field.addLabel || 'Add item' }}</button>
  </fieldset>
</template>

<script setup lang="ts">
import { type Field, blankFromFields } from '~/admin/schema'

const props = defineProps<{ field: Field; obj: Record<string, any> }>()

const child = computed<Record<string, any>>(() => props.obj[props.field.key] ?? {})
const list = computed<any[]>(() => {
  const v = props.obj[props.field.key]
  return Array.isArray(v) ? v : []
})
const isPrimitiveList = computed(() => !(props.field.fields && props.field.fields.length))

function stripTags(s: unknown): string {
  return typeof s === 'string' ? s.replace(/<[^>]+>/g, '').trim() : ''
}

function itemTitle(item: Record<string, any>, i: number): string {
  const key = props.field.itemLabelKey
  const raw = key ? stripTags(item?.[key]) : ''
  return raw || `Item ${i + 1}`
}

function add() {
  if (isPrimitiveList.value) list.value.push('')
  else list.value.push(blankFromFields(props.field.fields || []))
}

function remove(i: number) {
  if (confirm('Remove this item?')) list.value.splice(i, 1)
}

function move(i: number, dir: number) {
  const j = i + dir
  if (j < 0 || j >= list.value.length) return
  const arr = list.value
  ;[arr[i], arr[j]] = [arr[j], arr[i]]
}
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

.afld-object,
.afld-list {
  border: 1px solid #ddd5c6;
  border-radius: 7px;
  padding: 16px 18px;
  margin: 0 0 20px;
  background: #fbf9f3;
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
  padding: 14px 14px 2px;
  margin-bottom: 12px;
  background: #fff;
}
.afld-item-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: -2px 0 12px;
  gap: 10px;
}
.afld-item-title {
  font-weight: 600;
  font-size: 13px;
  color: #444;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
.afld-add {
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 600;
  color: var(--primary, #5634c9);
  border-color: var(--primary, #5634c9);
}
.afld-add:hover { background: #f0ebff; }
</style>
