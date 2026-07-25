import { validateToken } from '~/utils/adminGithub'

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

  return { token, isAuthenticated, canWrite, login, logout }
}
