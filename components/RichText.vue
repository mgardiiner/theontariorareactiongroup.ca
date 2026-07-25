<template>
  <div class="rt">
    <div class="rt-toolbar">
      <button
        type="button"
        class="rt-btn rt-b"
        title="Bold"
        aria-label="Bold"
        @mousedown.prevent="cmd('bold')"
      >B</button>
      <button
        type="button"
        class="rt-btn rt-i"
        title="Italic"
        aria-label="Italic"
        @mousedown.prevent="cmd('italic')"
      >I</button>
      <button
        type="button"
        class="rt-btn rt-link"
        title="Add a link"
        @mousedown.prevent="makeLink"
      >Link</button>
      <span class="rt-divider" aria-hidden="true"></span>
      <span class="rt-hint">Select some words, then press a button</span>
    </div>
    <div
      ref="editor"
      class="rt-editable"
      contenteditable="true"
      role="textbox"
      aria-multiline="true"
      @input="onInput"
      @blur="onBlur"
    ></div>
  </div>
</template>

<script setup>
import { sanitizeHtml } from '~/utils/sanitizeHtml'

const props = defineProps({
  modelValue: { type: String, default: '' },
})
const emit = defineEmits(['update:modelValue'])

const editor = ref(null)

function setDom(html) {
  if (editor.value) editor.value.innerHTML = sanitizeHtml(html || '')
}

onMounted(() => {
  try {
    document.execCommand('styleWithCSS', false, false)
  } catch (_) {
    /* older browsers */
  }
  setDom(props.modelValue)
})

// Reflect external model changes only while the field is NOT focused, so we never
// move the caret out from under someone who is typing.
watch(
  () => props.modelValue,
  (val) => {
    if (!editor.value) return
    if (document.activeElement === editor.value) return
    if (sanitizeHtml(val || '') !== editor.value.innerHTML) setDom(val)
  },
)

function emitClean() {
  if (!editor.value) return
  emit('update:modelValue', sanitizeHtml(editor.value.innerHTML))
}

// While typing: emit the sanitized value but don't rewrite the DOM (keeps caret).
function onInput() {
  emitClean()
}

// On blur it's safe to normalize the visible DOM to the clean subset too.
function onBlur() {
  emitClean()
  setDom(sanitizeHtml(editor.value ? editor.value.innerHTML : ''))
}

function cmd(command) {
  try {
    document.execCommand('styleWithCSS', false, false)
  } catch (_) {
    /* ignore */
  }
  document.execCommand(command)
  if (editor.value) editor.value.focus()
  nextTick(emitClean)
}

function makeLink() {
  const url = window.prompt('Paste the web address (starting with https://)')
  if (url != null) {
    const trimmed = url.trim()
    if (trimmed) document.execCommand('createLink', false, trimmed)
  }
  if (editor.value) editor.value.focus()
  nextTick(emitClean)
}
</script>

<style scoped>
.rt {
  border: 1px solid #d8cfbb;
  border-radius: 9px;
  background: #fff;
  overflow: hidden;
}
.rt-toolbar {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 7px 8px;
  border-bottom: 1px solid #efe9dc;
  background: #fdfbf6;
}
.rt-btn {
  height: 32px;
  border: none;
  border-radius: 6px;
  background: none;
  color: var(--ink);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.rt-btn:hover {
  background: #efe9dc;
}
.rt-b {
  width: 34px;
  font-size: 16px;
  font-weight: 800;
}
.rt-i {
  width: 34px;
  font-size: 17px;
  font-style: italic;
  font-family: var(--serif);
}
.rt-link {
  padding: 0 12px;
  font-size: 14.5px;
  font-weight: 600;
  color: var(--primary);
  text-decoration: underline;
}
.rt-divider {
  width: 1px;
  height: 18px;
  background: var(--line);
  margin: 0 8px;
  display: block;
}
.rt-hint {
  font-size: 12.5px;
  color: var(--muted);
}
.rt-editable {
  padding: 16px;
  min-height: 150px;
  font-size: 16.5px;
  line-height: 1.65;
  color: var(--ink);
  outline: none;
}
.rt-editable:focus {
  outline: none;
}
:deep(.rt-editable a) {
  color: var(--primary);
  text-decoration: underline;
}
</style>
