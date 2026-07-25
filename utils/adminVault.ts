// Password-protected "vault" for the GitHub token, so admins sign in with a
// password instead of holding the raw token. The token is encrypted with the
// password (PBKDF2 -> AES-GCM) and only the CIPHERTEXT ships in the app; the
// password never leaves the browser and the plaintext token is only recovered
// client-side after a correct password. (Because the ciphertext is public, the
// password must be strong — the blob is offline-guessable.)

import vaultFile from '~/admin/vault.json'

const PBKDF2_ITERATIONS = 310000
const LS_VAULT = 'ontariorare_admin_vault'

export interface Vault {
  configured: boolean
  v?: number
  iter?: number
  salt?: string // base64
  iv?: string // base64
  ct?: string // base64 ciphertext
}

// ---- base64 helpers for byte arrays ----
function toB64(bytes: Uint8Array): string {
  let s = ''
  for (const b of bytes) s += String.fromCharCode(b)
  return btoa(s)
}
function fromB64(b64: string): Uint8Array {
  const bin = atob(b64)
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
  return out
}

async function deriveKey(password: string, salt: Uint8Array, iterations: number) {
  const base = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveKey'],
  )
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
    base,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  )
}

/** Encrypt a token with a password into a shippable vault blob. */
export async function encryptToken(token: string, password: string): Promise<Vault> {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const key = await deriveKey(password, salt, PBKDF2_ITERATIONS)
  const ct = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    new TextEncoder().encode(token),
  )
  return {
    configured: true,
    v: 1,
    iter: PBKDF2_ITERATIONS,
    salt: toB64(salt),
    iv: toB64(iv),
    ct: toB64(new Uint8Array(ct)),
  }
}

/** Recover the token from a vault with the password. Throws on a wrong password. */
export async function decryptToken(vault: Vault, password: string): Promise<string> {
  if (!vault?.configured || !vault.salt || !vault.iv || !vault.ct) {
    throw new Error('Admin sign-in is not set up yet.')
  }
  const key = await deriveKey(password, fromB64(vault.salt), vault.iter || PBKDF2_ITERATIONS)
  const pt = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: fromB64(vault.iv) },
    key,
    fromB64(vault.ct),
  ) // AES-GCM auth tag makes a wrong password throw here
  return new TextDecoder().decode(pt)
}

/** The active vault: a locally-saved one (this browser set it up) takes precedence over the bundled file. */
export function getVault(): Vault {
  if (import.meta.client) {
    try {
      const raw = localStorage.getItem(LS_VAULT)
      if (raw) return JSON.parse(raw) as Vault
    } catch {
      /* ignore */
    }
  }
  return vaultFile as Vault
}

export function saveVaultLocal(vault: Vault): void {
  if (import.meta.client) localStorage.setItem(LS_VAULT, JSON.stringify(vault))
}

export function isConfigured(): boolean {
  return Boolean(getVault()?.configured)
}

// A small, dependency-free passphrase suggester for the one-time setup.
const WORDS =
  'amber anchor apple arbor autumn beacon birch breeze cedar cinder clover coral cove crane dawn delta ember fable falcon fern fjord flint forest garden gentle glade harbor hazel heron ivory jade juniper lantern larch leaf lily maple meadow mint moss north oak olive opal orchard otter pebble pine quartz quill raven reed river robin sage slate sparrow spruce stone summit thistle tide timber topaz trail tulip umber valley violet willow winter wren'.split(
    ' ',
  )

export function suggestPassphrase(): string {
  const pick = () => WORDS[crypto.getRandomValues(new Uint32Array(1))[0] % WORDS.length]
  const num = crypto.getRandomValues(new Uint32Array(1))[0] % 90 + 10
  return `${pick()}-${pick()}-${pick()}-${pick()}-${num}`
}
