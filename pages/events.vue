<template>
  <div>
    <Head>
      <Title>Events · Ontario Rare Action Group</Title>
      <Meta name="description" content="Town halls, policy briefings, family meetups and learning sessions — most of them open to anyone, most of them on Zoom." />
    </Head>

    <header class="page-header">
      <div class="wrap">
        <div class="crumb">
          <NuxtLink to="/">Home</NuxtLink>
          <span>/</span>
          Events
        </div>
        <h1 class="page-title">Show up. <em>Be counted.</em></h1>
        <p class="page-lede">Town halls, policy briefings, family meetups and learning sessions — most of them open to anyone, most of them on Zoom so you can join from anywhere in Ontario.</p>
      </div>
    </header>

    <!-- UPCOMING EVENTS + REGISTRATION -->
    <section class="events-bg">
      <div class="wrap">
        <div class="events-layout">
          <!-- EVENT LIST -->
          <div>
            <div class="sec-head">
              <div class="sec-num" style="color:rgba(255,255,255,0.6);border-color:var(--accent);">Upcoming events</div>
              <div>
              </div>
            </div>
            <div class="event-list">
              <div
                class="event"
                v-for="(event, i) in events"
                :key="i"
                :class="{ active: activeIdx === i }"
                @click="activeIdx = i; resetForm()"
                :aria-pressed="activeIdx === i"
                tabindex="0"
                @keydown.enter="activeIdx = i; resetForm()"
                role="button"
              >
                <div class="event-date" :aria-label="`${event.month} ${event.day}`">
                  <div class="event-month">{{ event.month }}</div>
                  <div class="event-day">{{ event.day }}</div>
                </div>
                <div>
                  <h3 class="event-title">{{ event.title }}</h3>
                  <div class="event-meta">
                    <span class="event-tag">{{ event.tag }}</span>
                    <span>{{ event.time }}</span>
                  </div>
                </div>
                <div class="event-arrow" aria-hidden="true">→</div>
              </div>
            </div>
          </div>

          <!-- REGISTRATION CARD -->
          <div class="zoom-card" aria-label="Event registration form">
            <div class="zoom-eyebrow">
              <span class="zoom-dot" aria-hidden="true"></span>
              Register · {{ events[activeIdx].tag === 'ZOOM' ? 'Zoom webinar' : 'In-person event' }}
            </div>
            <h3 class="zoom-title">{{ events[activeIdx].title }}</h3>
            <div class="zoom-when">{{ events[activeIdx].date }} · {{ events[activeIdx].time }}</div>

            <form class="zoom-form" @submit.prevent="handleRegister" v-if="!registered" novalidate>
              <div class="zoom-row">
                <div class="field">
                  <label for="first-name">First name</label>
                  <input id="first-name" type="text" required v-model="form.firstName" />
                </div>
                <div class="field">
                  <label for="last-name">Last name</label>
                  <input id="last-name" type="text" required v-model="form.lastName" />
                </div>
              </div>
              <div class="field">
                <label for="email">Email</label>
                <input id="email" type="email" required placeholder="you@email.ca" v-model="form.email" />
              </div>
              <div class="field">
                <label for="role">I'm joining as</label>
                <select id="role" required v-model="form.role">
                  <option value="">Select one</option>
                  <option>Patient</option>
                  <option>Caregiver / family member</option>
                  <option>Clinician or researcher</option>
                  <option>Policymaker</option>
                  <option>Allied advocate</option>
                  <option>Other</option>
                </select>
              </div>
              <label class="check">
                <input type="checkbox" v-model="form.calendarInvite" />
                <span>Email me a calendar invite and a reminder one hour before the event.</span>
              </label>
              <button type="submit" class="zoom-submit">
                Reserve my spot
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
              </button>
            </form>

            <div class="zoom-success" v-if="registered" role="status">
              <div class="success-check" aria-hidden="true">✓</div>
              <h4>You're registered.</h4>
              <p>Check your inbox for the Zoom link and calendar invite.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- PAST EVENTS -->
    <section class="past-bg">
      <div class="wrap">
        <div class="sec-head">
          <div class="sec-num">Past events</div>
          <div>
            <h2 class="sec-title">Missed one? <em>Catch up.</em></h2>
            <p class="sec-sub">Recordings and slide decks from recent sessions, free to watch and share.</p>
          </div>
        </div>
        <div class="past-grid">
          <NuxtLink class="past" to="/videos" v-for="past in pastEvents" :key="past.title">
            <div class="past-date">{{ past.date }}</div>
            <h3 class="past-title">{{ past.title }}</h3>
            <span class="past-link">Watch recording →</span>
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'default' })

const events = [
  { day: '21', month: 'May', title: "Town Hall: Ontario's Rare Disease Strategy — what's next?", time: '7:00–8:30 PM ET', tag: 'ZOOM', date: 'May 21, 2026' },
  { day: '04', month: 'Jun', title: 'Caregiver Roundtable: navigating ODSP and respite', time: '12:00–1:00 PM ET', tag: 'ZOOM', date: 'Jun 4, 2026' },
  { day: '12', month: 'Jun', title: 'Family Meetup: Toronto picnic in High Park', time: '11:00 AM–3:00 PM ET', tag: 'IRL', date: 'Jun 12, 2026' },
  { day: '26', month: 'Jun', title: 'Policy Briefing: drug-access reform in Ontario', time: '1:00–2:00 PM ET', tag: 'ZOOM', date: 'Jun 26, 2026' },
  { day: '10', month: 'Jul', title: 'Self-advocacy 101 for newly diagnosed adults', time: '6:30–8:00 PM ET', tag: 'ZOOM', date: 'Jul 10, 2026' },
  { day: '24', month: 'Jul', title: 'Researcher Q&A: rare-disease registries in Canada', time: '12:00–1:00 PM ET', tag: 'ZOOM', date: 'Jul 24, 2026' },
]

const pastEvents = [
  { date: 'Mar 18, 2026', title: 'Rare in Ontario: a roadmap for the next ten years' },
  { date: 'Feb 26, 2026', title: 'Caregiver mental health: building a real support system' },
  { date: 'Feb 11, 2026', title: 'Drug-access reform: a conversation with Ontario Health' },
  { date: 'Jan 22, 2026', title: 'Newborn screening: what changes in 2026' },
  { date: 'Dec 5, 2025', title: 'Year-end town hall: 2025 wins and what\'s next' },
  { date: 'Nov 14, 2025', title: 'Self-advocacy 101 for newly diagnosed adults' },
]

const activeIdx = ref(0)
const registered = ref(false)
const form = reactive({ firstName: '', lastName: '', email: '', role: '', calendarInvite: false })

function resetForm() {
  registered.value = false
  form.firstName = ''
  form.lastName = ''
  form.email = ''
  form.role = ''
  form.calendarInvite = false
}

function handleRegister() {
  registered.value = true
}
</script>

<style scoped>
.events-bg { background: var(--primary); color: #fff; padding: 96px 0; }
.events-layout {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 56px;
  align-items: start;
}

.event-list { border-top: 1px solid rgba(255,255,255,0.18); }
.event {
  display: grid;
  grid-template-columns: 90px 1fr auto;
  gap: 28px;
  padding: 28px 0;
  border-bottom: 1px solid rgba(255,255,255,0.18);
  align-items: start;
  cursor: pointer;
  transition: background .15s ease, padding .2s ease;
}
.event:hover { padding-left: 12px; }
.event.active {
  background: rgba(254,215,0,0.06);
  padding-left: 16px;
  padding-right: 16px;
  border-left: 2px solid var(--accent);
}
.event-date {
  text-align: center;
  padding: 12px 8px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.14);
  border-radius: 4px;
}
.event.active .event-date {
  background: var(--accent);
  color: var(--primary-deep);
  border-color: var(--accent);
}
.event-month {
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  opacity: 0.85;
}
.event-day {
  font-family: var(--serif);
  font-size: 32px;
  font-weight: 500;
  line-height: 1;
  margin-top: 4px;
}
.event-title {
  font-family: var(--serif);
  font-size: 22px;
  font-weight: 500;
  letter-spacing: -0.015em;
  line-height: 1.2;
  margin: 0 0 8px;
}
.event-meta {
  font-family: var(--mono);
  font-size: 11.5px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.65);
  display: flex;
  gap: 16px;
  align-items: center;
}
.event-tag {
  background: rgba(254,215,0,0.18);
  color: var(--accent);
  padding: 3px 8px;
  border-radius: 3px;
  letter-spacing: 0.1em;
}
.event-arrow {
  align-self: center;
  font-size: 22px;
  color: rgba(255,255,255,0.4);
  transition: color .15s ease, transform .15s ease;
}
.event:hover .event-arrow { color: var(--accent); transform: translateX(4px); }

.zoom-card {
  background: #fff;
  color: var(--ink);
  border-radius: 6px;
  padding: 32px;
  position: sticky;
  top: 96px;
}
.zoom-eyebrow {
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--primary);
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.zoom-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--accent);
  animation: pulse 1.6s ease-in-out infinite;
  display: inline-block;
}
@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(254,215,0,0.4); }
  50% { box-shadow: 0 0 0 8px rgba(254,215,0,0); }
}
.zoom-title {
  font-family: var(--serif);
  font-size: 26px;
  font-weight: 500;
  letter-spacing: -0.015em;
  line-height: 1.15;
  margin: 0 0 8px;
}
.zoom-when { font-size: 14px; color: var(--muted); margin-bottom: 24px; }
.zoom-form { display: flex; flex-direction: column; gap: 12px; }
.zoom-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.check {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 13px;
  color: var(--muted);
  margin-top: 6px;
  line-height: 1.4;
  cursor: pointer;
}
.check input { margin-top: 2px; accent-color: var(--primary); }
.zoom-submit {
  background: var(--primary);
  color: #fff;
  padding: 14px;
  border-radius: 4px;
  font-weight: 600;
  font-size: 15px;
  margin-top: 12px;
  transition: background .15s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border: none;
  cursor: pointer;
  font-family: var(--sans);
}
.zoom-submit:hover { background: var(--primary-deep); }
.zoom-success {
  background: rgba(30,1,119,0.04);
  border: 1px solid var(--primary);
  border-radius: 4px;
  padding: 24px;
  text-align: center;
}
.success-check { font-size: 32px; line-height: 1; }
.zoom-success h4 {
  font-family: var(--serif);
  font-size: 22px;
  margin: 12px 0 6px;
  font-weight: 500;
}
.zoom-success p { font-size: 14px; color: var(--muted); margin: 0; }

.past-bg { background: var(--bg); }
.past-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
.past {
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 4px;
  padding: 24px;
  cursor: pointer;
  transition: transform .15s ease, box-shadow .15s ease;
  display: block;
  text-decoration: none;
  color: var(--ink);
}
.past:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(23,2,105,0.06); }
.past-date {
  font-family: var(--mono);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--muted);
  margin-bottom: 14px;
}
.past-title {
  font-family: var(--serif);
  font-size: 20px;
  font-weight: 500;
  line-height: 1.2;
  letter-spacing: -0.01em;
  margin: 0 0 12px;
}
.past-link {
  font-family: var(--mono);
  font-size: 11px;
  font-weight: 600;
  color: var(--primary);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  display: block;
}

@media (max-width: 980px) {
  .events-layout { grid-template-columns: 1fr; }
  .past-grid { grid-template-columns: 1fr 1fr; }
  .zoom-card { position: static; }
}
@media (max-width: 600px) {
  .past-grid { grid-template-columns: 1fr; }
  .zoom-row { grid-template-columns: 1fr; }
}
</style>
