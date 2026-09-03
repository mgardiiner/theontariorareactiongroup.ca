import { validateToken } from '~/utils/adminGithub'
import { decryptToken, getVault } from '~/utils/adminVault'

const STORAGE_KEY = 'ontariorare_admin_token'

export function useAdminAuth() {
  // SSR-safe shared state; hydrated from localStorage on the client.
  const token = useState<string | null>('admin_token', () => null)
  const canWrite = useState<boolean>('admin_can_write', () => false)

  // Hydrate once on the client.
  if (import.meta.client && token.value === null) {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) token.value = saved
  }

  const isAuthenticated = computed(() => Boolean(token.value))

  /** Validate the key against the repo, and persist it if it works. */
  async function login(candidate: string): Promise<{ push: boolean }> {
    const trimmed = candidate.trim()
    if (!trimmed) throw new Error('Please paste your GitHub key.')
    const result = await validateToken(trimmed) // throws on invalid/no-access
    token.value = trimmed
    canWrite.value = result.push
    if (import.meta.client) localStorage.setItem(STORAGE_KEY, trimmed)
    return result
  }

  function logout() {
    token.value = null
    canWrite.value = false
    if (import.meta.client) localStorage.removeItem(STORAGE_KEY)
  }

  /**
   * Dev-only: on localhost, unlock the vault with ADMIN_PASSWORD from .env so
   * there's no sign-in step while working. Returns true if we're now signed in.
   * In any non-development build `devAdminPassword` is baked in as '', so this
   * is a no-op there.
   */
  async function devAutoLogin(): Promise<boolean> {
    if (!import.meta.dev || !import.meta.client) return false
    if (isAuthenticated.value) return true

    const password = useRuntimeConfig().public.devAdminPassword
    if (!password) return false

    try {
      await login(await decryptToken(getVault(), password))
      return true
    } catch (e) {
      console.warn('[admin] dev auto-login failed, falling back to the sign-in form:', e)
      return false
    }
  }

  return { token, isAuthenticated, canWrite, login, logout, devAutoLogin }
}
