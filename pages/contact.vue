<template>
  <div>
    <Head>
      <Title>{{ content.seo.title }}</Title>
      <Meta name="description" :content="content.seo.description" />
    </Head>

    <header class="page-header">
      <div class="wrap">
        <div class="crumb">
          <NuxtLink to="/">Home</NuxtLink>
          <span>/</span>
          {{ content.header.crumb }}
        </div>
        <h1 class="page-title" v-html="content.header.title"></h1>
        <p class="page-lede">{{ content.header.lede }}</p>
      </div>
    </header>

    <!-- CONTACT GRID -->
    <section>
      <div class="wrap">
        <div class="contact-grid">
          <!-- FORM CARD -->
          <div class="form-card">
            <div class="form-eyebrow">{{ content.form.eyebrow }}</div>
            <h2 class="form-title">{{ content.form.title }}</h2>
            <p class="form-sub">{{ content.form.sub }}</p>

            <form class="form-grid" @submit.prevent="handleContact" v-if="!submitted" novalidate>
              <div class="form-row">
                <div class="field">
                  <label for="c-first">First name</label>
                  <input id="c-first" type="text" required v-model="form.firstName" />
                </div>
                <div class="field">
                  <label for="c-last">Last name</label>
                  <input id="c-last" type="text" required v-model="form.lastName" />
                </div>
              </div>
              <div class="field">
                <label for="c-email">Email</label>
                <input id="c-email" type="email" required :placeholder="content.form.emailPlaceholder" v-model="form.email" />
              </div>
              <div class="field">
                <label for="c-role">I'm reaching out as</label>
                <select id="c-role" required v-model="form.role">
                  <option value="">{{ content.form.rolePlaceholder }}</option>
                  <option v-for="opt in content.form.roleOptions" :key="opt">{{ opt }}</option>
                </select>
              </div>
              <div class="field">
                <label for="c-topic">What can we help with?</label>
                <select id="c-topic" required v-model="form.topic">
                  <option value="">{{ content.form.topicPlaceholder }}</option>
                  <option v-for="opt in content.form.topicOptions" :key="opt">{{ opt }}</option>
                </select>
              </div>
              <div class="field">
                <label for="c-message">Your message</label>
                <textarea id="c-message" required :placeholder="content.form.messagePlaceholder" v-model="form.message"></textarea>
              </div>
              <button type="submit" class="submit-btn" :disabled="sending">
                {{ sending ? content.form.sending : content.form.submit }}
                <svg v-if="!sending" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
              </button>
              <p v-if="sendError" class="send-error">{{ sendError }}</p>
            </form>

            <div class="form-success" v-if="submitted" role="status">
              <div class="success-check" aria-hidden="true">✓</div>
              <h4>{{ content.form.success.title }}</h4>
              <p>{{ content.form.success.body }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- NEWSLETTER BAND -->
    <section class="news-bg">
      <div class="wrap">
        <div class="news-grid">
          <div>
            <h2 v-html="content.newsletter.heading"></h2>
            <p>{{ content.newsletter.body }}</p>
          </div>
          <form class="news-form" @submit.prevent="handleNewsSubscribe" novalidate>
            <input type="email" :placeholder="content.newsletter.placeholder" required aria-label="Email address for newsletter" v-model="newsEmail" />
            <button type="submit">{{ newsSubscribed ? '✓ Subscribed' : content.newsletter.submitLabel }}</button>
          </form>
          <p v-if="newsError" class="news-error">{{ newsError }}</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import content from '~/content/contact.json'

definePageMeta({ layout: 'default' })

const submitted = ref(false)
const sending = ref(false)
const sendError = ref('')
const form = reactive({ firstName: '', lastName: '', email: '', role: '', topic: '', message: '' })

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

async function handleContact() {
  sendError.value = ''
  if (!isValidEmail(form.email)) {
    sendError.value = 'Please enter a valid email address.'
    return
  }
  sending.value = true
  try {
    const res = await $fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      body: {
        access_key: content.web3formsKey,
        subject: 'Website Contact Form Submission',
        name: `${form.firstName} ${form.lastName}`,
        email: form.email,
        role: form.role,
        topic: form.topic,
        message: form.message,
      },
    })
    if (res.success) {
      submitted.value = true
    } else {
      sendError.value = 'Something went wrong. Please try again or email us directly.'
    }
  } catch {
    sendError.value = 'Something went wrong. Please try again or email us directly.'
  } finally {
    sending.value = false
  }
}

const newsEmail = ref('')
const newsSubscribed = ref(false)
const newsError = ref('')
function handleNewsSubscribe() {
  newsError.value = ''
  if (!isValidEmail(newsEmail.value)) {
    newsError.value = 'Please enter a valid email address.'
    return
  }
  newsSubscribed.value = true
}
</script>

<style scoped>
.contact-grid {
  max-width: 640px;
  margin: 0 auto;
}

.form-card {
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 6px;
  padding: 40px;
}
.form-eyebrow {
  font-family: var(--mono);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: var(--primary);
  margin-bottom: 12px;
}
.form-title {
  font-family: var(--serif);
  font-size: 30px;
  font-weight: 500;
  letter-spacing: -0.015em;
  line-height: 1.15;
  margin: 0 0 8px;
}
.form-sub { font-size: 15px; color: var(--muted); margin: 0 0 28px; }
.form-grid { display: flex; flex-direction: column; gap: 14px; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.submit-btn {
  background: var(--primary);
  color: #fff;
  padding: 14px;
  border-radius: 4px;
  font-weight: 600;
  font-size: 15px;
  margin-top: 8px;
  transition: background .15s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border: none;
  cursor: pointer;
  font-family: var(--sans);
}
.submit-btn:hover { background: var(--primary-deep); }
.submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
.send-error { color: #c0392b; font-size: 14px; margin: 4px 0 0; }
.form-success {
  background: rgba(30,1,119,0.04);
  border: 1px solid var(--primary);
  border-radius: 4px;
  padding: 32px;
  text-align: center;
}
.success-check { font-size: 36px; line-height: 1; }
.form-success h4 {
  font-family: var(--serif);
  font-size: 26px;
  margin: 12px 0 6px;
  font-weight: 500;
}
.form-success p { color: var(--muted); margin: 0; }

.news-bg { background: var(--primary); color: #fff; padding: 80px 0; }
.news-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 56px;
  align-items: center;
}
.news-grid h2 {
  font-family: var(--serif);
  font-size: clamp(34px, 4.5vw, 52px);
  font-weight: 400;
  line-height: 1.05;
  letter-spacing: -0.02em;
  margin: 0 0 16px;
}
.news-grid h2 em { font-style: italic; color: var(--accent); }
.news-grid p { font-size: 17px; color: rgba(255,255,255,0.78); max-width: 50ch; margin: 0; }
.news-form { display: flex; gap: 8px; }
.news-form input {
  flex: 1;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.18);
  border-radius: 4px;
  padding: 14px;
  color: #fff;
  font-family: var(--sans);
  font-size: 14.5px;
  min-width: 0;
}
.news-form input::placeholder { color: rgba(255,255,255,0.5); }
.news-form input:focus { outline: none; border-color: var(--accent); }
.news-form button {
  background: var(--accent);
  color: var(--primary-deep);
  padding: 0 22px;
  border-radius: 4px;
  font-weight: 600;
  font-size: 14px;
  border: none;
  cursor: pointer;
  font-family: var(--sans);
  white-space: nowrap;
  transition: opacity .15s ease;
}
.news-form button:hover { opacity: 0.9; }
.news-error { font-size: 13.5px; color: #ff8a8a; margin: 8px 0 0; }

@media (max-width: 980px) {
  .news-grid { grid-template-columns: 1fr; }
  .form-row { grid-template-columns: 1fr; }
}
@media (max-width: 600px) {
  .form-card { padding: 28px 22px; }
  .news-form { flex-direction: column; }
  .news-form button { padding: 14px; }
}
</style>
