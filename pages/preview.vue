<template>
  <div class="page">
    <Head><Title>Preview · Ontario Rare Action Group</Title></Head>

    <main class="container">
      <div class="brand-mark" aria-hidden="true">R</div>
      <div class="org-name">Ontario Rare Action Group</div>
      <h1 class="headline">Site <em>preview.</em></h1>
      <p class="lede">Enter the password to access the full site.</p>

      <form class="form" @submit.prevent="handleSubmit" novalidate>
        <input
          id="password"
          type="password"
          placeholder="Password"
          required
          autocomplete="current-password"
          v-model="password"
        />
        <button type="submit">Access site</button>
      </form>

      <p v-if="error" class="error">{{ error }}</p>
    </main>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'empty' })
useHead({ bodyAttrs: { style: 'background:rgb(30,1,119);' } })

const config = useRuntimeConfig()
const password = ref('')
const error = ref('')

async function handleSubmit() {
  error.value = ''
  if (password.value !== config.public.previewPassword) {
    error.value = 'Incorrect password.'
    return
  }
  const preview = useCookie('preview', { maxAge: 60 * 60 })
  preview.value = 'true'
  await navigateTo('/')
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: var(--primary);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 32px;
}
.container {
  max-width: 480px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.brand-mark {
  width: 48px;
  height: 48px;
  background: var(--accent);
  color: var(--primary-deep);
  display: grid;
  place-items: center;
  font-family: var(--serif);
  font-weight: 600;
  font-size: 28px;
  border-radius: 3px;
  margin-bottom: 24px;
}
.org-name {
  font-family: var(--mono);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: rgba(255,255,255,0.55);
  margin-bottom: 40px;
}
.headline {
  font-family: var(--serif);
  font-size: clamp(40px, 6vw, 64px);
  font-weight: 400;
  line-height: 1.02;
  letter-spacing: -0.025em;
  margin: 0 0 16px;
}
.headline em { font-style: italic; color: var(--accent); }
.lede {
  font-size: 16px;
  color: rgba(255,255,255,0.65);
  margin: 0 0 32px;
}
.form {
  display: flex;
  gap: 8px;
  width: 100%;
  margin-bottom: 12px;
}
.form input {
  flex: 1;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 4px;
  padding: 14px 16px;
  color: #fff;
  font-family: var(--sans);
  font-size: 15px;
  min-width: 0;
  transition: border-color .15s ease;
}
.form input::placeholder { color: rgba(255,255,255,0.35); }
.form input:focus { outline: none; border-color: var(--accent); }
.form button {
  background: var(--accent);
  color: var(--primary-deep);
  padding: 0 24px;
  border-radius: 4px;
  font-family: var(--sans);
  font-weight: 600;
  font-size: 15px;
  border: none;
  cursor: pointer;
  white-space: nowrap;
  transition: opacity .15s ease;
}
.form button:hover { opacity: 0.88; }
.error {
  font-size: 13.5px;
  color: #ff8a8a;
  margin: 0;
}
@media (max-width: 480px) {
  .form { flex-direction: column; }
  .form button { padding: 14px; }
}
</style>
