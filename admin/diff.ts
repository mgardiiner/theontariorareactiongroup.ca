// Plain-language "what changed" summaries for the publish sheet.
// Compares two snapshots of a content file and reports the edited fields using the
// same friendly labels the editor forms use (from admin/schema), so an editor can
// tell at a glance what each pending change actually did.

import { sections, type Field } from '~/admin/schema'

export interface DiffLine {
  kind: 'changed' | 'added' | 'removed'
  label: string
  before?: string
  after?: string
}

const MAX_LINES = 8
const MAX_VALUE = 70

export function pageNameFor(file: string): string {
  const s = sections.find((x) => x.file === file)
  if (s) return s.label
  return file.replace(/^content\//, '').replace(/\.json$/, '')
}

function humanize(key: string): string {
  return key
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[-_]/g, ' ')
    .replace(/^./, (c) => c.toUpperCase())
}

function short(v: unknown): string {
  if (v == null || v === '') return '(empty)'
  const s = typeof v === 'string' ? v : JSON.stringify(v)
  const oneLine = s.replace(/\s+/g, ' ').trim()
  return oneLine.length > MAX_VALUE ? oneLine.slice(0, MAX_VALUE - 1) + '…' : oneLine
}

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b)

function mostlySame(x: unknown, y: unknown): boolean {
  if (!x || !y || typeof x !== 'object' || typeof y !== 'object') return false
  const keys = new Set([...Object.keys(x as object), ...Object.keys(y as object)])
  let shared = 0
  for (const k of keys) if (same((x as any)[k], (y as any)[k])) shared++
  return shared * 2 > keys.size
}

function itemName(item: unknown, field?: Field): string {
  if (item && typeof item === 'object' && !Array.isArray(item)) {
    const o = item as Record<string, unknown>
    const keys = [field?.itemLabelKey, 'title', 'name', 'label', 'heading', 'quote'].filter(Boolean) as string[]
    for (const k of keys) if (typeof o[k] === 'string' && o[k]) return `"${short(o[k])}"`
    return 'an item'
  }
  return `"${short(item)}"`
}

function walk(
  before: any,
  after: any,
  fields: Field[] | undefined,
  crumbs: string[],
  out: DiffLine[],
) {
  if (out.length > MAX_LINES) return
  if (same(before, after)) return

  const label = crumbs.length ? crumbs.join(' › ') : 'Content'

  // Arrays: report added / removed items, recurse into items that moved from one thing to another.
  if (Array.isArray(before) && Array.isArray(after)) {
    const listField = fields?.length === 1 && fields[0].type === 'list' ? fields[0] : undefined
    const itemFields = listField?.fields
    const b = [...before]
    const a = [...after]
    // Drop identical items so only real differences remain.
    for (let i = b.length - 1; i >= 0; i--) {
      const j = a.findIndex((x) => same(x, b[i]))
      if (j >= 0) {
        b.splice(i, 1)
        a.splice(j, 1)
      }
    }
    if (!b.length && !a.length) {
      out.push({ kind: 'changed', label, after: 'Reordered' })
      return
    }
    // Items with the same title on both sides were edited in place; recurse into them.
    for (let i = b.length - 1; i >= 0; i--) {
      const name = itemName(b[i], listField)
      const j = a.findIndex((x) => itemName(x, listField) === name)
      if (j >= 0) {
        walk(b[i], a[j], itemFields, [...crumbs, name], out)
        b.splice(i, 1)
        a.splice(j, 1)
      }
    }
    // A lone leftover on each side that still shares most of its fields is a retitled item, not a swap.
    if (b.length === 1 && a.length === 1 && mostlySame(b[0], a[0])) {
      walk(b[0], a[0], itemFields, [...crumbs, itemName(a[0], listField)], out)
      return
    }
    for (const x of b) out.push({ kind: 'removed', label, before: itemName(x, listField) })
    for (const x of a) out.push({ kind: 'added', label, after: itemName(x, listField) })
    return
  }

  // Objects: recurse key by key with schema labels when we have them.
  if (
    before && after &&
    typeof before === 'object' && typeof after === 'object' &&
    !Array.isArray(before) && !Array.isArray(after)
  ) {
    const keys = new Set([...Object.keys(before), ...Object.keys(after)])
    for (const k of keys) {
      const f = fields?.find((x) => x.key === k)
      const name = f?.label ?? humanize(k)
      const childFields = f?.type === 'list' ? [f] : f?.fields
      walk(before[k], after[k], childFields, [...crumbs, name], out)
    }
    return
  }

  // Leaf value.
  out.push({ kind: 'changed', label, before: short(before), after: short(after) })
}

/** Lines describing how `after` differs from `before` for the given content file. */
export function describeChange(file: string, before: any, after: any): DiffLine[] {
  const out: DiffLine[] = []
  const fields = sections.find((s) => s.file === file)?.fields
  if (before == null) {
    out.push({ kind: 'changed', label: pageNameFor(file), after: 'First edit to this page' })
    return out
  }
  walk(before, after, fields, [], out)
  if (out.length > MAX_LINES) {
    const extra = out.length - MAX_LINES
    out.length = MAX_LINES
    out.push({ kind: 'changed', label: `…and ${extra} more`, after: '' })
  }
  return out
}
