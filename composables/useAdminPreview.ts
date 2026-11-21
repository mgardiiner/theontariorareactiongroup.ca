// Shared state for the editor's live preview (components/AdminPreview.vue).
//
// - `path`: the site page the preview shows. Each editor screen sets it to the page it edits.
// - `overrides`: a page form's current values, before its autosave lands in the drafts, so the
//   preview keeps up with typing.
// - `recent`: files just published but not live yet. The preview keeps showing them until the
//   new build is up, instead of flicking back to the old site for a couple of minutes.
// - `open`: whether the preview is showing (remembered on this device).

const OPEN_KEY = 'ontariorare_admin_preview'

export function useAdminPreview() {
  const path = useState<string>('admin_preview_path', () => '/')
  const overrides = useState<Record<string, any>>('admin_preview_overrides', () => ({}))
  const recent = useState<Record<string, any>>('admin_preview_recent', () => ({}))
  const reloads = useState<number>('admin_preview_reloads', () => 0)
  const open = useState<boolean>('admin_preview_open', () => {
    // Beside the form on a wide screen, unless it was closed there; on a smaller screen it covers
    // the form, so it only opens when asked.
    if (!import.meta.client || window.innerWidth < 1280) return false
    try {
      return localStorage.getItem(OPEN_KEY) !== '0'
    } catch {
      return true
    }
  })

  function setOpen(v: boolean) {
    open.value = v
    try {
      localStorage.setItem(OPEN_KEY, v ? '1' : '0')
    } catch {
      /* storage blocked: still toggles for this visit */
    }
  }

  return {
    path,
    overrides,
    recent,
    open,
    setOpen,
    /** Load the site again from scratch (after a publish goes live). */
    reload: () => reloads.value++,
    reloads,
  }
}
