// Shared UI state for the task-first "Website editor".
//
// - `screen` is the state-machine screen for pages/admin/index.vue. It lives in
//   shared state so the layout's top-bar buttons ("Find words on the site", the
//   brand/home button) can drive the page's flow even from other admin routes.
// - `toast` + `showToast` are the global toast region hosted in layouts/admin.vue.
//   `undoKey` (when present) is a useDrafts() pending key the toast's Undo reverts.
// - `editorName` / `editorInitials` — there is no user profile, so a neutral
//   default is used for the avatar and greeting.

export type AdminScreen = 'home' | 'pick' | 'wizard' | 'done' | 'search'

export interface AdminToast {
  message: string
  undoKey?: string | null
  hasAction?: boolean
}

// Module-scoped so the auto-dismiss timer is shared no matter which component
// calls showToast().
let toastTimer: ReturnType<typeof setTimeout> | null = null
// An Undo that isn't a pending change (e.g. putting back a list item removed in a form).
// Kept out of shared state because it's a function.
let toastAction: (() => void) | null = null

export const EDITOR_NAME = 'Admin'

export function useAdminUi() {
  const screen = useState<AdminScreen>('admin_screen', () => 'home')
  const toast = useState<AdminToast | null>('admin_toast', () => null)

  function showToast(message: string, undoKey: string | null = null, onUndo: (() => void) | null = null) {
    toastAction = onUndo
    toast.value = { message, undoKey, hasAction: Boolean(onUndo) }
    if (toastTimer) clearTimeout(toastTimer)
    // Longer when there's something to undo, so there's time to reach the button.
    toastTimer = setTimeout(hideToast, undoKey || onUndo ? 10000 : 5000)
  }

  function hideToast() {
    if (toastTimer) {
      clearTimeout(toastTimer)
      toastTimer = null
    }
    toastAction = null
    toast.value = null
  }

  /** Run the toast's own Undo action, if it has one. */
  function runToastAction() {
    const fn = toastAction
    hideToast()
    fn?.()
  }

  const editorName = EDITOR_NAME
  const editorInitials = editorName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return { screen, toast, showToast, hideToast, runToastAction, editorName, editorInitials }
}
