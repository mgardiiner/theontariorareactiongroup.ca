<template>
  <div class="signin">
    <div class="signin-card">
      <div class="signin-brand">
        <img src="/logo.png" width="34" height="34" alt="" />
        <span class="signin-org">Ontario Rare Action Group</span>
      </div>

      <!-- ============ PASSWORD MODE (normal sign-in) ============ -->
      <template v-if="mode === 'password'">
        <div class="signin-heading">
          <h2>Sign in to edit the website</h2>
          <p>
            Use the password the group shared with you. If you don't have it, email
            <a href="mailto:hello@theontariorareactiongroup.ca">hello@theontariorareactiongroup.ca</a>
            and someone will send it over.
          </p>
        </div>

        <form class="signin-form" @submit.prevent="submit">
          <label class="signin-field">
            <span class="signin-label">Password</span>
            <input
              v-model="password"
              type="password"
              autocomplete="current-password"
              placeholder="Type or paste it here"
              :disabled="busy"
            />
          </label>

          <p v-if="error" class="signin-error">{{ error }}</p>

          <button type="submit" class="signin-btn" :disabled="busy">
            {{ busy ? 'Checking…' : 'Sign in' }}
          </button>
        </form>
      </template>

      <!-- ============ SETUP MODE (one-time, owner) ============ -->
      <template v-else>
        <div class="signin-heading">
          <h2>Set up admin sign-in</h2>
          <p>
            One-time setup. Connect your GitHub key once and choose a password — after this,
            you and your team sign in with just the password and never touch the key again.
          </p>
        </div>

        <form class="signin-form" @submit.prevent="submit">
          <label class="signin-field">
            <span class="signin-label">GitHub key</span>
            <input
              v-model="tokenInput"
              type="password"
              autocomplete="off"
              placeholder="github_pat_…"
              :disabled="busy"
            />
            <span class="signin-help">Pasted once, encrypted, and never shown again.</span>
          </label>

          <label class="signin-field">
            <span class="signin-label">Choose a password for your team</span>
            <input
              v-model="password"
              type="text"
              autocomplete="off"
              placeholder="A long phrase, e.g. four random words"
              :disabled="busy"
            />
            <button type="button" class="signin-suggest" :disabled="busy" @click="suggest">
              Suggest a strong one
            </button>
            <span class="signin-help">
              Make it long (12+ characters). Write it down to share with your team — there's no way to
              recover it, and a weak password weakens the protection.
            </span>
          </label>

          <label class="signin-field">
            <span class="signin-label">Type the password again</span>
            <input v-model="confirmPw" type="text" autocomplete="off" :disabled="busy" />
          </label>

          <p v-if="error" class="signin-error">{{ error }}</p>

          <button type="submit" class="signin-btn" :disabled="busy">
            {{ busy ? 'Setting up…' : 'Set up and sign in' }}
          </button>
        </form>
      </template>

      <p class="signin-foot">
        Nothing you do here is public until you press Publish. You can't break the website from
        this screen.
      </p>
    </div>
  </div>
</template>

<script setup>
import {
  getVault,
  saveVaultLocal,
  isConfigured,
  encryptToken,
  decryptToken,
  suggestPassphrase,
} from '~/utils/adminVault'
import { commitFiles } from '~/utils/adminGithub'

definePageMeta({ layout: false })

const { login } = useAdminAuth()
const router = useRouter()

const mode = ref('password')
const password = ref('')
const confirmPw = ref('')
const tokenInput = ref('')
const busy = ref(false)
const error = ref('')

onMounted(() => {
  mode.value = isConfigured() ? 'password' : 'setup'
})

function suggest() {
  const p = suggestPassphrase()
  password.value = p
  confirmPw.value = p
}

async function submit() {
  error.value = ''
  busy.value = true
  try {
    if (mode.value === 'setup') {
      const tok = tokenInput.value.trim()
      if (!tok) throw new Error('SETUP_NO_TOKEN')
      if (password.value.length < 12) throw new Error('SETUP_WEAK')
      if (password.value !== confirmPw.value) throw new Error('SETUP_MISMATCH')
      // Validate the key (and store it for this session).
      await login(tok)
      // Encrypt it under the password and commit the vault so everyone else can use the password.
      const vault = await encryptToken(tok, password.value)
      await commitFiles(
        tok,
        [{ path: 'admin/vault.json', content: JSON.stringify(vault, null, 2) + '\n' }],
        'Set up admin sign-in password',
      )
      saveVaultLocal(vault)
      router.push('/admin')
    } else {
      let tok
      try {
        tok = await decryptToken(getVault(), password.value)
      } catch {
        throw new Error('WRONG_PW')
      }
      await login(tok) // confirm the key still works, and store it
      router.push('/admin')
    }
  } catch (e) {
    error.value = messageFor(e)
  } finally {
    busy.value = false
  }
}

function messageFor(e) {
  const code = e?.message
  if (code === 'SETUP_NO_TOKEN') return 'Please paste your GitHub key first.'
  if (code === 'SETUP_WEAK') return 'Please choose a longer password — at least 12 characters.'
  if (code === 'SETUP_MISMATCH') return "The two passwords don't match."
  if (code === 'WRONG_PW') return "That password didn't work. Check for extra spaces, or ask whoever set it up."
  const status = e?.status
  if (mode.value === 'setup') {
    if (status === 401 || status === 404)
      return 'That GitHub key was rejected. Check you pasted it correctly and that it can write to this repository.'
    return e?.message || 'Could not finish setup. Please try again.'
  }
  // password mode, after a correct password but the key failed
  return 'Your team access has expired — the site owner needs to run setup again with a fresh key.'
}
</script>

<style scoped>
.signin {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary);
  padding: 40px;
  font-family: var(--sans);
}
.signin-card {
  width: 100%;
  max-width: 520px;
  background: var(--bg);
  border-radius: 18px;
  padding: 44px 46px;
  display: flex;
  flex-direction: column;
  gap: 22px;
  box-shadow: 0 30px 70px rgba(0, 0, 0, 0.3);
}
.signin-brand {
  display: flex;
  align-items: center;
  gap: 12px;
}
.signin-brand img {
  border-radius: 8px;
  display: block;
}
.signin-org {
  font-family: var(--mono);
  font-size: 13px;
  color: var(--muted);
}
.signin-heading {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.signin-heading h2 {
  margin: 0;
  font-family: var(--serif);
  font-size: 34px;
  font-weight: 500;
  color: var(--primary-deep);
  line-height: 1.1;
}
.signin-heading p {
  margin: 0;
  font-size: 15.5px;
  line-height: 1.6;
  color: var(--muted);
}
.signin-heading a {
  color: var(--primary);
  text-decoration: underline;
}
.signin-form {
  display: flex;
  flex-direction: column;
  gap: 22px;
}
.signin-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.signin-label {
  font-size: 14.5px;
  font-weight: 600;
  color: var(--ink);
}
.signin-field input {
  width: 100%;
  padding: 15px 17px;
  border: 1px solid #d8cfbb;
  border-radius: 10px;
  background: #fff;
  font-size: 17px;
  color: var(--ink);
  outline: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}
.signin-field input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(30, 1, 119, 0.12);
}
.signin-help {
  font-size: 13px;
  color: var(--muted);
  line-height: 1.5;
}
.signin-suggest {
  align-self: flex-start;
  background: none;
  border: none;
  padding: 0;
  font-size: 13.5px;
  font-weight: 600;
  color: var(--primary);
  text-decoration: underline;
  cursor: pointer;
}
.signin-error {
  margin: -8px 0 0;
  font-size: 14px;
  color: #a6203a;
  line-height: 1.5;
}
.signin-btn {
  background: var(--accent);
  border: none;
  border-radius: 999px;
  padding: 16px 30px;
  font-size: 17px;
  font-weight: 700;
  color: var(--primary-deep);
  cursor: pointer;
  transition: transform 0.15s ease;
}
.signin-btn:hover:not(:disabled) {
  transform: translateY(-2px);
}
.signin-btn:disabled {
  opacity: 0.7;
  cursor: default;
}
.signin-foot {
  margin: 0;
  font-size: 13.5px;
  color: var(--muted);
  line-height: 1.6;
}

@media (prefers-reduced-motion: reduce) {
  .signin-btn:hover:not(:disabled) {
    transform: none;
  }
}
@media (max-width: 560px) {
  .signin-card {
    padding: 32px 24px;
  }
}
</style>
