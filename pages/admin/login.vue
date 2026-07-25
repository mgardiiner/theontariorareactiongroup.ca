<template>
  <div class="signin">
    <div class="signin-card">
      <div class="signin-brand">
        <img src="/logo.png" width="34" height="34" alt="" />
        <span class="signin-org">Ontario Rare Action Group</span>
      </div>

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

      <p class="signin-foot">
        Nothing you do here is public until you press Publish. You can't break the
        website from this screen.
      </p>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: false })

const { login } = useAdminAuth()
const router = useRouter()

const password = ref('')
const busy = ref(false)
const error = ref('')

async function submit() {
  error.value = ''
  busy.value = true
  try {
    await login(password.value)
    router.push('/admin')
  } catch (_) {
    error.value =
      "That password didn't work. Check for extra spaces, or email hello@… for a new one."
  } finally {
    busy.value = false
  }
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
