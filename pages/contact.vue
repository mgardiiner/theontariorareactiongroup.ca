<template>
  <div>
    <Head>
      <Title>Contact · Ontario Rare Action Group</Title>
      <Meta name="description" content="We read every message. Whether you're a patient, a caregiver, a clinician, a policymaker — start a conversation." />
    </Head>

    <header class="page-header">
      <div class="wrap">
        <div class="crumb">
          <NuxtLink to="/">Home</NuxtLink>
          <span>/</span>
          Contact
        </div>
        <h1 class="page-title">Have a question? A story? A <em>rare</em> idea?</h1>
        <p class="page-lede">We read every message. Whether you're a patient, a caregiver, a clinician, a policymaker — or just somebody who wants to help — start a conversation with us.</p>
      </div>
    </header>

    <!-- CONTACT GRID -->
    <section>
      <div class="wrap">
        <div class="contact-grid">
          <!-- CHANNELS -->
          <div>
            <div class="contact-channels">
              <div class="channel" v-for="ch in channels" :key="ch.num">
                <div class="ch-num">{{ ch.num }}</div>
                <div>
                  <div class="ch-label">{{ ch.label }}</div>
                  <div class="ch-value" v-html="ch.value"></div>
                  <div class="ch-note" v-if="ch.note">{{ ch.note }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- FORM CARD -->
          <div class="form-card">
            <div class="form-eyebrow">Send us a message</div>
            <h2 class="form-title">Tell us what's on your mind.</h2>
            <p class="form-sub">All messages go to a real person on our team — not a bot, not a queue.</p>

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
                <input id="c-email" type="email" required placeholder="you@email.ca" v-model="form.email" />
              </div>
              <div class="field">
                <label for="c-role">I'm reaching out as</label>
                <select id="c-role" required v-model="form.role">
                  <option value="">Select one</option>
                  <option>Patient</option>
                  <option>Caregiver / family member</option>
                  <option>Clinician or researcher</option>
                  <option>Policymaker</option>
                  <option>Journalist</option>
                  <option>Partner organization</option>
                  <option>Other</option>
                </select>
              </div>
              <div class="field">
                <label for="c-topic">What can we help with?</label>
                <select id="c-topic" required v-model="form.topic">
                  <option value="">Select a topic</option>
                  <option>General inquiry</option>
                  <option>Sharing my story</option>
                  <option>Volunteering</option>
                  <option>Donating</option>
                  <option>Press / media</option>
                  <option>Partnership / affiliation</option>
                  <option>Something else</option>
                </select>
              </div>
              <div class="field">
                <label for="c-message">Your message</label>
                <textarea id="c-message" required placeholder="Tell us what's on your mind…" v-model="form.message"></textarea>
              </div>
              <button type="submit" class="submit-btn" :disabled="sending">
                {{ sending ? 'Sending…' : 'Send message' }}
                <svg v-if="!sending" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
              </button>
              <p v-if="sendError" class="send-error">{{ sendError }}</p>
            </form>

            <div class="form-success" v-if="submitted" role="status">
              <div class="success-check" aria-hidden="true">✓</div>
              <h4>Thank you — we got it.</h4>
              <p>We'll be in touch within two business days.</p>
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
            <h2>Or, just stay in <em>the loop.</em></h2>
            <p>One email a month. Policy updates, event invites, and the stories that matter. No spam, ever.</p>
          </div>
          <form class="news-form" @submit.prevent="handleNewsSubscribe" novalidate>
            <input type="email" placeholder="your@email.ca" required aria-label="Email address for newsletter" v-model="newsEmail" />
            <button type="submit">{{ newsSubscribed ? '✓ Subscribed' : 'Subscribe' }}</button>
          </form>
          <p v-if="newsError" class="news-error">{{ newsError }}</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'default' })

const channels = [
  {
    num: '01',
    label: 'General inquiries',
    value: '<a href="mailto:contact@theontariorareactiongroup.ca?subject=General%20Inquiry%3A%20Website%20Submission">contact@theontariorareactiongroup.ca</a>',
    note: 'We aim to reply within two business days.',
  },
  {
    num: '02',
    label: 'Patient support & story sharing',
    value: '<a href="mailto:stories@theontariorareactiongroup.ca?subject=Story%20Submission%3A%20Website%20Submission">stories@theontariorareactiongroup.ca</a>',
    note: 'Confidential. We can interview you, transcribe your words, or publish a piece you\'ve written.',
  },
  {
    num: '03',
    label: 'Partnerships & affiliation',
    value: '<a href="mailto:partners@theontariorareactiongroup.ca?subject=Partnership%20Inquiry%3A%20Website%20Submission">partners@theontariorareactiongroup.ca</a>',
    note: 'For other rare-disease organizations, clinics and researchers.',
  },
  {
    num: '04',
    label: 'Volunteering',
    value: '<a href="mailto:volunteer@theontariorareactiongroup.ca?subject=Volunteering%3A%20Website%20Submission">volunteer@theontariorareactiongroup.ca</a>',
    note: 'Tell us a bit about yourself and how you\'d like to help.',
  },
  {
    num: '05',
    label: 'Donations & giving',
    value: '<a href="mailto:donate@theontariorareactiongroup.ca?subject=Donations%20%26%20Giving%3A%20Website%20Submission">donate@theontariorareactiongroup.ca</a>',
    note: 'Questions about giving, receipts, or how funds are used.',
  },
]

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
        access_key: '165cdb52-939e-4133-b974-3eed380701c7',
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
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 80px;
  align-items: start;
}

.contact-channels { display: flex; flex-direction: column; gap: 0; border-top: 1px solid var(--ink); }
.channel {
  padding: 24px 0;
  border-bottom: 1px solid var(--line);
  display: grid;
  grid-template-columns: 32px 1fr;
  gap: 16px;
  align-items: start;
}
.ch-num {
  font-family: var(--mono);
  font-size: 11px;
  color: var(--muted);
  padding-top: 4px;
  letter-spacing: 0.08em;
}
.ch-label {
  font-family: var(--mono);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--muted);
  margin-bottom: 6px;
}
.ch-value {
  font-family: var(--serif);
  font-size: 22px;
  font-weight: 500;
  letter-spacing: -0.01em;
  line-height: 1.25;
}
:deep(.ch-value a) {
  border-bottom: 1px solid var(--ink);
  transition: color .15s ease, border-color .15s ease;
}
:deep(.ch-value a:hover) { color: var(--primary); border-color: var(--primary); }
.ch-note { font-size: 13.5px; color: var(--muted); margin-top: 6px; }

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
  .contact-grid { grid-template-columns: 1fr; gap: 40px; }
  .news-grid { grid-template-columns: 1fr; }
  .form-row { grid-template-columns: 1fr; }
}
@media (max-width: 600px) {
  .news-form { flex-direction: column; }
  .news-form button { padding: 14px; }
}
</style>
