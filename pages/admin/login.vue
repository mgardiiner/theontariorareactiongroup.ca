<template>
  <div class="login-wrap">
    <div class="login-card">
      <h1>Site admin</h1>
      <p class="sub">Paste your GitHub key to sign in and edit the site.</p>

      <form @submit.prevent="submit">
        <label class="field">
          <span>GitHub key</span>
          <input
            v-model="key"
            type="password"
            autocomplete="current-password"
            placeholder="github_pat_…"
            :disabled="busy"
          />
        </label>

        <p v-if="error" class="error">{{ error }}</p>
        <p v-if="warn" class="warn">{{ warn }}</p>

        <button type="submit" :disabled="busy || !key.trim()">
          {{ busy ? 'Checking…' : 'Sign in' }}
        </button>
      </form>

      <details class="help">
        <summary>How do I get a key?</summary>
        <ol>
          <li>Go to GitHub → <strong>Settings → Developer settings → Personal access tokens → Fine-grained tokens</strong>.</li>
          <li>Click <strong>Generate new token</strong>. Give it a name and an expiry.</li>
          <li>Under <strong>Repository access</strong>, choose <em>Only select repositories</em> → <strong>theontariorareactiongroup.ca</strong>.</li>
          <li>Under <strong>Permissions → Repository permissions</strong>, set <strong>Contents</strong> to <strong>Read and write</strong>.</li>
          <li>Generate it, copy the <code>github_pat_…</code> value, and paste it above.</li>
        </ol>
        <p class="help-note">Your key stays in this browser only — it's never sent anywhere except GitHub.</p>
      </details>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'admin' })

const { login } = useAdminAuth()
const router = useRouter()

const key = ref('')
const busy = ref(false)
const error = ref('')
const warn = ref('')

async function submit() {
  error.value = ''
  warn.value = ''
  busy.value = true
  try {
    const { push } = await login(key.value)
    if (!push) {
      warn.value =
        'This key can read the site but not save changes (needs Contents: Read and write). You can look around, but saving will fail.'
    }
    router.push('/admin')
  } catch (e) {
    const status = e?.status
    if (status === 401) error.value = 'That key was rejected by GitHub. Check you copied it correctly.'
    else if (status === 404)
      error.value =
        "Key accepted, but it can't see this repository. Make sure it's scoped to theontariorareactiongroup.ca."
    else error.value = e?.message || 'Could not sign in. Please try again.'
  } finally {
    busy.value = false
  }
}
</script>

<style scoped>
.login-wrap {
  display: flex;
  justify-content: center;
  padding-top: 40px;
}
.login-card {
  width: 100%;
  max-width: 440px;
  background: #fff;
  border: 1px solid #e3ddd0;
  border-radius: 10px;
  padding: 32px 30px;
}
h1 {
  font-family: var(--serif, Georgia, serif);
  font-size: 28px;
  margin: 0 0 6px;
  color: var(--primary-deep, #1c0f52);
}
.sub { margin: 0 0 22px; color: #6a6a6a; font-size: 15px; }
.field span {
  display: block;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 6px;
}
.field input {
  width: 100%;
  padding: 11px 13px;
  border: 1px solid #cfc8ba;
  border-radius: 6px;
  font: inherit;
  font-size: 14px;
}
.field input:focus { outline: 2px solid var(--primary, #5634c9); border-color: transparent; }
button[type='submit'] {
  margin-top: 18px;
  width: 100%;
  padding: 12px;
  background: var(--primary, #5634c9);
  color: #fff;
  border: none;
  border-radius: 6px;
  font: inherit;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
}
button[type='submit']:disabled { opacity: 0.5; cursor: not-allowed; }
.error { color: #b23; font-size: 13.5px; margin: 14px 0 0; }
.warn { color: #9a6a00; font-size: 13.5px; margin: 14px 0 0; }
.help { margin-top: 24px; font-size: 13.5px; }
.help summary { cursor: pointer; font-weight: 600; color: var(--primary, #5634c9); }
.help ol { margin: 12px 0; padding-left: 20px; line-height: 1.7; color: #444; }
.help code { background: #f0ece2; padding: 1px 5px; border-radius: 3px; font-size: 12px; }
.help-note { color: #6a6a6a; font-style: italic; }
</style>
