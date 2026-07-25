<template>
  <div class="page">
    <Head>
      <Title>{{ content.seo.title }}</Title>
      <Meta name="description" :content="content.seo.description" />
    </Head>

    <main class="container">
      <img class="brand-mark" src="/logo.png" width="88" height="88" :alt="content.orgName" />
      <div class="org-name">{{ content.orgName }}</div>
      <h1 class="headline" v-html="content.headline"></h1>
      <p class="lede">{{ content.lede }}</p>

      <form class="signup-form" @submit.prevent="handleSubmit" v-if="!submitted" novalidate>
        <input type="email" :placeholder="content.placeholder" required aria-label="Email address" v-model="email" />
        <button type="submit">{{ content.submitLabel }}</button>
      </form>

      <p v-if="error" class="error">{{ error }}</p>

      <div class="success" v-if="submitted" role="status">
        <span class="check" aria-hidden="true">✓</span>
        {{ content.successText }}
      </div>

      <a :href="'mailto:' + content.contactEmail" class="contact-link">
        {{ content.contactEmail }}
      </a>
    </main>
  </div>
</template>

<script setup>
import content from '~/content/coming-soon.json'

definePageMeta({ layout: 'empty' })
useHead({ bodyAttrs: { style: 'background:rgb(30,1,119);' } })

const email = ref('')
const submitted = ref(false)
const error = ref('')

function handleSubmit() {
  error.value = ''
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    error.value = 'Please enter a valid email address.'
    return
  }

  const callbackName = 'mcCallback_' + Date.now()
  const url = `${content.mailchimp.url}?u=${content.mailchimp.u}&id=${content.mailchimp.id}&EMAIL=${encodeURIComponent(email.value)}&c=${callbackName}`

  window[callbackName] = (data) => {
    delete window[callbackName]
    if (data.result === 'success') {
      submitted.value = true
    } else {
      error.value = 'Something went wrong. Please try again.'
    }
  }

  const script = document.createElement('script')
  script.src = url
  script.onerror = () => { error.value = 'Something went wrong. Please try again.'; delete window[callbackName] }
  document.head.appendChild(script)
  setTimeout(() => script.remove(), 5000)
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
  max-width: 560px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.brand-mark {
  width: 88px;
  height: 88px;
  border-radius: 6px;
  margin-bottom: 24px;
  flex-shrink: 0;
  display: block;
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
  font-size: clamp(48px, 8vw, 80px);
  font-weight: 400;
  line-height: 1.02;
  letter-spacing: -0.025em;
  margin: 0 0 28px;
}
.headline em { font-style: italic; color: var(--accent); }
.lede {
  font-size: 17px;
  line-height: 1.65;
  color: rgba(255,255,255,0.72);
  max-width: 48ch;
  margin: 0 0 40px;
}
.signup-form {
  display: flex;
  gap: 8px;
  width: 100%;
  max-width: 440px;
  margin-bottom: 32px;
}
.signup-form input {
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
.signup-form input::placeholder { color: rgba(255,255,255,0.4); }
.signup-form input:focus { outline: none; border-color: var(--accent); }
.signup-form button {
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
.signup-form button:hover { opacity: 0.88; }
.success {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 15px;
  color: var(--accent);
  margin-bottom: 32px;
  font-weight: 500;
}
.check {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--accent);
  color: var(--primary-deep);
  display: grid;
  place-items: center;
  font-size: 13px;
  font-weight: 700;
  flex-shrink: 0;
}
.error { font-size: 13.5px; color: #ff8a8a; margin: -20px 0 20px; }
.contact-link {
  font-family: var(--mono);
  font-size: 12px;
  letter-spacing: 0.06em;
  color: rgba(255,255,255,0.4);
  border-bottom: 1px solid rgba(255,255,255,0.15);
  padding-bottom: 2px;
  transition: color .15s ease, border-color .15s ease;
}
.contact-link:hover { color: rgba(255,255,255,0.75); border-color: rgba(255,255,255,0.4); }
@media (max-width: 480px) {
  .signup-form { flex-direction: column; }
  .signup-form button { padding: 14px; }
}
</style>
