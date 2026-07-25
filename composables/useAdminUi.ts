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
}

// Module-scoped so the auto-dismiss timer is shared no matter which component
// calls showToast().
let toastTimer: ReturnType<typeof setTimeout> | null = null

export const EDITOR_NAME = 'Admin'

export function useAdminUi() {
  const screen = useState<AdminScreen>('admin_screen', () => 'home')
  const toast = useState<AdminToast | null>('admin_toast', () => null)

  function showToast(message: string, undoKey: string | null = null) {
    toast.value = { message, undoKey }
    if (toastTimer) clearTimeout(toastTimer)
    toastTimer = setTimeout(() => {
      toast.value = null
      toastTimer = null
    }, 5000)
  }

  function hideToast() {
    if (toastTimer) {
      clearTimeout(toastTimer)
      toastTimer = null
    }
    toast.value = null
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

  return { screen, toast, showToast, hideToast, editorName, editorInitials }
}
