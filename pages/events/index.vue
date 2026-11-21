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

    <!-- INTRO — hidden entirely until there is body copy to show -->
    <!-- UPCOMING EVENTS + REGISTRATION -->
    <section class="events-bg">
      <div class="wrap">
        <div class="events-layout" :class="{ 'is-empty': !events.length }">
          <!-- EVENT LIST -->
          <div>
            <div class="sec-head">
              <div class="sec-num" style="color:rgba(255,255,255,0.6);border-color:var(--accent);">{{ content.upcomingLabel }}</div>
              <div>
              </div>
            </div>
            <div class="event-list">
              <div
                class="event"
                v-for="(event, i) in events"
                :key="i"
                :class="{ active: activeIdx === i, 'has-img': event.image }"
                @click="activeIdx = i"
                :aria-pressed="activeIdx === i"
                tabindex="0"
                @keydown.enter="activeIdx = i"
                role="button"
              >
                <div class="event-date" :aria-label="`${event.month} ${event.day}`">
                  <div class="event-month">{{ event.month }}</div>
                  <div class="event-day">{{ event.day }}</div>
                </div>
                <div class="event-thumb" v-if="event.image" aria-hidden="true">
                  <img :src="event.image" alt="" :style="photoFocus(event.image)" />
                </div>
                <div>
                  <h3 class="event-title">{{ event.title }}</h3>
                  <div class="event-meta">
                    <span class="event-tag">{{ event.tag }}</span>
                    <span>{{ event.time }}</span>
                  </div>
                  <p class="event-desc" v-if="event.desc">{{ event.desc }}</p>
                </div>
                <div class="event-arrow" aria-hidden="true">→</div>
              </div>
              <!-- Nothing scheduled: one row where the events would be, and no registration card. -->
              <div v-if="!events.length" class="event-none" role="status">
                <h3 class="event-title">{{ noEventsCopy.title }}</h3>
                <p class="event-desc">{{ noEventsCopy.body }}</p>
              </div>
            </div>
          </div>

          <!-- REGISTRATION CARD -->
          <div class="zoom-card" v-if="events.length" aria-label="Event registration form">
            <div class="zoom-eyebrow">
              <span class="zoom-dot" aria-hidden="true"></span>
              <template v-if="!activeIsOver">{{ content.registration.eyebrowPrefix }} </template>{{ events[activeIdx].tag === 'ZOOM' ? content.registration.zoomLabel : content.registration.inPersonLabel }}
            </div>
            <h3 class="zoom-title">{{ events[activeIdx].title }}</h3>
            <div class="zoom-when">{{ events[activeIdx].date }} · {{ events[activeIdx].time }}</div>

            <!-- Registration lives on Zoom (or wherever the host set it up); we just link out.
                 Until the host shares the link, say so instead of collecting details we can't act on. -->
            <!-- Once the day is past, the link goes away no matter what is saved
                 against the event, so nobody is sent to a meeting that is over. -->
            <div class="zoom-soon zoom-ended" v-if="activeIsOver" role="status">
              <h4>{{ endedCopy.title }}</h4>
              <p>{{ endedCopy.body }}</p>
            </div>

            <template v-else-if="registerUrl">
              <a :href="registerUrl" class="zoom-submit" target="_blank" rel="noopener">
                {{ content.registration.buttonLabel }}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
              </a>
              <p class="zoom-note" v-if="content.registration.buttonNote">{{ content.registration.buttonNote }}</p>
            </template>

            <div class="zoom-soon" v-else role="status">
              <h4>{{ content.registration.comingSoon.title }}</h4>
              <p>{{ content.registration.comingSoon.body }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- PAST EVENTS -->
    <section class="past-bg">
      <div class="wrap">
        <div class="sec-head">
          <div class="sec-num">{{ content.pastHead.eyebrow }}</div>
          <div>
            <h2 class="sec-title" v-html="content.pastHead.title"></h2>
            <p class="sec-sub">{{ content.pastHead.sub }}</p>
          </div>
        </div>
        <div class="past-grid">
          <!-- Only past events with a write-up are clickable. -->
          <component
            :is="past.slug ? PastLink : 'div'"
            class="past"
            :class="{ 'is-link': past.slug }"
            v-for="past in pastEvents"
            :key="past.title"
            :to="past.slug ? `/events/${past.slug}` : undefined"
          >
            <div class="past-date">
              {{ past.date }}<template v-if="past.location"> · {{ past.location }}</template>
            </div>
            <h3 class="past-title">{{ past.title }}</h3>
            <span class="past-link" v-if="past.slug">{{ past.linkLabel || 'Read article' }} →</span>
          </component>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import content from '~/content/events.json'
import { photoFocus } from '~/utils/photoFocus'
import { isEventOver, todayYmd } from '~/utils/eventDate'

definePageMeta({ layout: 'default' })

// Newest to oldest, so the order holds no matter what order events get added in
const byDateDesc = (a, b) => new Date(b.date) - new Date(a.date)
const events = [...content.upcoming].sort(byDateDesc)
const pastEvents = [...content.past].sort(byDateDesc)

// Past-event cards are links only when the event has a write-up page.
const PastLink = resolveComponent('NuxtLink')

// Same convention as story bodies: a blank line starts a new paragraph.
const activeIdx = ref(0)

// Same protocol guard as partner links: editors paste URLs by hand.
const registerUrl = computed(() => {
  const u = String(events[activeIdx.value]?.registerUrl || '').trim()
  if (!u) return ''
  return /^https?:\/\//i.test(u) ? u : `https://${u}`
})

// Finished events keep their place in the list, but stop handing out a link.
//
// This is deliberately a browser-only check. The site is prerendered and only
// rebuilds when someone deploys, so a date worked out at build time would be
// stale the moment an event passed. Staying empty until mount also keeps the
// rendered markup identical to the prerendered HTML, so hydration is clean.
const today = ref('')
onMounted(() => {
  today.value = todayYmd()
})

const activeIsOver = computed(() => isEventOver(events[activeIdx.value], today.value))
const endedCopy = computed(() => ({
  title: content.registration.ended?.title || 'This event has ended.',
  body:
    content.registration.ended?.body ||
    'Thanks to everyone who joined us. Recordings and slides from recent sessions are below, and our next event will be posted here soon.',
}))
// Every upcoming event removed in the editor: the card says so instead of showing an event that isn't there.
const noEventsCopy = computed(() => ({
  title: content.registration.none?.title || 'Nothing scheduled right now.',
  body:
    content.registration.none?.body ||
    'Our next event will be posted here soon. In the meantime, recordings and slides from recent sessions are below.',
}))
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
/* No upcoming events: the list takes the full width, with a single note row in it. */
.events-layout.is-empty { grid-template-columns: 1fr; }
.event-none { padding: 28px 0; border-bottom: 1px solid rgba(255,255,255,0.18); }
.event-none .event-desc { margin-top: 0; max-width: 60ch; }
.event.active {
  background: rgba(254,215,0,0.06);
  padding-left: 16px;
  padding-right: 16px;
  border-left: 2px solid var(--accent);
}
.event.has-img { grid-template-columns: 90px 108px 1fr auto; }
.event-thumb {
  width: 108px;
  aspect-ratio: 4/3;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,0.14);
}
.event-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
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
.event-desc {
  font-size: 14.5px;
  line-height: 1.5;
  color: rgba(255,255,255,0.72);
  margin: 10px 0 0;
  max-width: 52ch;
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
.zoom-submit {
  width: 100%;
  text-decoration: none;
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
.zoom-note { font-size: 13px; color: var(--muted); line-height: 1.4; margin: 12px 0 0; }
.zoom-soon {
  background: rgba(30,1,119,0.04);
  border: 1px dashed var(--primary);
  border-radius: 4px;
  padding: 24px;
  text-align: center;
}
.zoom-soon h4 {
  font-family: var(--serif);
  font-size: 22px;
  margin: 0 0 6px;
  font-weight: 500;
}
.zoom-soon p { font-size: 14px; color: var(--muted); margin: 0; line-height: 1.5; }
/* A finished event reads as settled rather than as something still to come. */
.zoom-ended { opacity: 0.9; }

.past-bg { background: var(--bg); }
.past-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
.past {
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 4px;
  padding: 24px;
  transition: transform .15s ease, box-shadow .15s ease;
  display: block;
  text-decoration: none;
  color: var(--ink);
}
.past.is-link { cursor: pointer; }
.past.is-link:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(23,2,105,0.06); }
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
  .event.has-img { grid-template-columns: 90px 1fr auto; }
  .event-thumb { display: none; }
}
</style>
