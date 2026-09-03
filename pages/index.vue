<template>
  <div>
    <Head>
      <Title>{{ content.seo.title }}</Title>
      <Meta name="description" :content="content.seo.description" />
    </Head>

    <!-- HERO -->
    <section class="hero" style="padding: 0;">
      <div class="wrap">
        <div class="hero-grid">
          <div class="hero-main">
            <div class="hero-eyebrow">{{ content.hero.eyebrow }}</div>
            <h1 class="hero-title" v-html="content.hero.title"></h1>
            <p class="hero-lede">{{ content.hero.lede }}</p>
            <div class="hero-actions">
              <NuxtLink :to="content.hero.primaryCta.href" class="btn btn-primary">
                {{ content.hero.primaryCta.label }}
                <svg class="btn-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
              </NuxtLink>
              <NuxtLink :to="content.hero.secondaryCta.href" class="btn btn-ghost">{{ content.hero.secondaryCta.label }}</NuxtLink>
            </div>
            <div v-if="site.footer.socials?.length" class="hero-socials">
              <span class="hero-socials-label">Follow us</span>
              <SocialLinks :links="site.footer.socials" />
            </div>
          </div>
          <aside class="hero-side" aria-label="Key statistics">
            <div class="stat-card" v-for="stat in content.stats" :key="stat.num">
              <div class="stat-num">{{ stat.num }}</div>
              <div class="stat-label">{{ stat.label }}</div>
            </div>
          </aside>
        </div>
      </div>
    </section>

    <!-- MARQUEE -->
    <div class="hero-marquee" aria-hidden="true">
      <div class="marquee-track">
        <span v-for="(term, i) in content.marquee" :key="'a' + i">{{ term }}</span>
        <span v-for="(term, i) in content.marquee" :key="'b' + i">{{ term }}</span>
      </div>
    </div>

    <!-- MISSION -->
    <section class="mission-bg">
      <div class="wrap">
        <div class="mission-grid">
          <div>
            <div class="mission-eyebrow">{{ content.mission.eyebrow }}</div>
            <NuxtLink :to="content.mission.cta.href" class="btn btn-dark">{{ content.mission.cta.label }}</NuxtLink>
          </div>
          <p class="mission-text" v-html="content.mission.text"></p>
        </div>
      </div>
    </section>

    <!-- OVERVIEW / EXPLORE -->
    <section>
      <div class="wrap">
        <div class="sec-head">
          <div class="sec-num">{{ content.overviewHead.eyebrow }}</div>
          <div>
            <h2 class="sec-title" v-html="content.overviewHead.title"></h2>
            <p class="sec-sub">{{ content.overviewHead.sub }}</p>
          </div>
        </div>

        <div class="overview-list">
          <NuxtLink class="ov" v-for="item in content.overview" :key="item.href" :to="item.href">
            <div class="ov-idx" aria-hidden="true">{{ item.idx }}</div>
            <div class="ov-visual" aria-hidden="true">
              <div class="ov-img-placeholder" :class="item.imgClass"></div>
              <img v-if="item.image" :src="item.image" alt="" class="ov-photo" />
              <span class="ov-visual-tag">{{ item.visualTag }}</span>
              <span class="ov-visual-arrow" aria-hidden="true">→</span>
            </div>
            <div class="ov-body">
              <div class="ov-tag">{{ item.tag }}</div>
              <h3 class="ov-title">{{ item.title }}</h3>
              <p class="ov-desc">{{ item.desc }}</p>
            </div>
            <div class="ov-meta" :aria-label="`${countFor(item)} ${item.countLabel}`">
              <div class="ov-meta-num">{{ countFor(item) }}</div>
              <div class="ov-meta-label">{{ item.countLabel }}</div>
            </div>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- FEATURED EVENT -->
    <section class="feat-bg" v-if="featured">
      <div class="wrap">
        <div class="feat-grid">
          <div>
            <div class="feat-eyebrow"><span class="feat-dot" aria-hidden="true"></span>{{ content.featuredEvent.eyebrow }}</div>
            <h2 class="feat-title">{{ featured.title }}</h2>
            <p class="feat-meta" v-if="content.featuredEvent.meta">{{ content.featuredEvent.meta }}</p>
            <div class="hero-actions">
              <!-- Goes straight to Zoom once the event has a registration link; otherwise to the events page. -->
              <NuxtLink
                :to="featured.registerUrl || content.featuredEvent.primaryCta.href"
                :target="featured.registerUrl ? '_blank' : undefined"
                class="btn btn-primary"
              >
                {{ featured.registerUrl ? content.featuredEvent.primaryCta.label : 'Event details' }}
                <svg class="btn-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
              </NuxtLink>
              <NuxtLink :to="content.featuredEvent.secondaryCta.href" class="btn btn-ghost">{{ content.featuredEvent.secondaryCta.label }}</NuxtLink>
            </div>
          </div>
          <div class="feat-card" :aria-label="`${content.featuredEvent.savedateLabel} ${featured.day} ${featuredMonth}, ${featured.time}, ${content.featuredEvent.locationLabel}`">
            <div class="feat-card-date">{{ content.featuredEvent.savedateLabel }}</div>
            <div class="feat-day">{{ featured.day }}</div>
            <div class="feat-month">{{ featuredMonth }}</div>
            <div class="feat-time">
              <span>{{ featured.time }}</span>
              <span>{{ content.featuredEvent.locationLabel }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CONTACT BAND -->
    <section class="contact-band-bg">
      <div class="wrap">
        <div class="contact-band-grid">
          <div>
            <h2 class="contact-band-title" v-html="content.contactBand.title"></h2>
            <p class="contact-band-lede">{{ content.contactBand.lede }}</p>
            <a :href="'mailto:' + content.contactBand.email" class="contact-band-email">{{ content.contactBand.email }}</a>
          </div>
          <div class="news-card">
            <h3>{{ content.newsletter.heading }}</h3>
            <p>{{ content.newsletter.body }}</p>
            <form class="news-form" @submit.prevent="handleNewsSubscribe">
              <input type="email" :placeholder="content.newsletter.placeholder" required aria-label="Email address" v-model="newsEmail" />
              <button type="submit">{{ newsSubscribed ? '✓ Subscribed' : content.newsletter.submitLabel }}</button>
            </form>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import content from '~/content/home.json'
import site from '~/content/site.json'
import events from '~/content/events.json'
import stories from '~/content/stories.json'
import partners from '~/content/partners.json'
import media from '~/content/media.json'
import advocacy from '~/content/advocacy.json'
import challenges from '~/content/challenges.json'

definePageMeta({ layout: 'default' })

// The overview cards' numbers come from the content itself, so they can't go
// stale when someone adds a story or removes a partner in the editor.
const liveCounts = {
  '/advocacy': advocacy.goals.length,
  '/challenges': challenges.challenges.length,
  '/stories': stories.stories.length,
  '/events': events.upcoming.length,
  '/media': media.coverage.length,
  '/partners': partners.partnerGroups.reduce((n, g) => n + g.partners.length, 0),
}
const countFor = (item) => liveCounts[item.href] ?? item.count ?? ''

// Featured upcoming event is sourced from events.json (flagged with "featured": true)
const featured = events.upcoming.find(e => e.featured)

// "September 2026" from the event's own date, so the home card can't drift out
// of sync with events.json. Falls back to the hand-typed label if the date
// doesn't parse.
const featuredMonth = computed(() => {
  const d = new Date(featured?.date || '')
  return isNaN(d)
    ? content.featuredEvent.monthLabel
    : d.toLocaleDateString('en-CA', { month: 'long', year: 'numeric' })
})

const newsEmail = ref('')
const newsSubscribed = ref(false)

function handleNewsSubscribe() {
  newsSubscribed.value = true
}
</script>

<style scoped>
/* ---- HERO ---- */
.hero {
  background: var(--primary);
  color: #fff;
  position: relative;
  overflow: hidden;
}
.hero-grid {
  display: grid;
  grid-template-columns: 1.15fr 0.85fr;
  gap: 72px;
  align-items: end;
  padding: 88px 0 96px;
}
.hero-eyebrow {
  font-family: var(--mono);
  font-size: 12px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--accent);
  margin-bottom: 28px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.hero-eyebrow::before {
  content: "";
  width: 28px;
  height: 1px;
  background: var(--accent);
  display: block;
}
.hero-title {
  font-family: var(--serif);
  font-weight: 400;
  font-size: clamp(42px, 6.2vw, 84px);
  line-height: 1.02;
  letter-spacing: -0.025em;
  margin: 0 0 28px;
  text-wrap: pretty;
}
.hero-title em { font-style: italic; color: var(--accent); font-weight: 400; }
.hero-lede {
  font-size: 19px;
  line-height: 1.55;
  color: rgba(255,255,255,0.82);
  max-width: 50ch;
  margin: 0 0 36px;
}
.hero-actions { display: flex; gap: 14px; flex-wrap: wrap; }
.hero-socials {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: 32px;
}
.hero-socials-label {
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.55);
}
.hero-side { display: flex; flex-direction: column; gap: 16px; }
.stat-card {
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.12);
  padding: 24px;
  border-radius: 4px;
  backdrop-filter: blur(8px);
}
.stat-num {
  font-family: var(--serif);
  font-weight: 400;
  font-size: 56px;
  line-height: 1;
  letter-spacing: -0.02em;
  color: var(--accent);
}
.stat-label {
  font-size: 13.5px;
  color: rgba(255,255,255,0.75);
  margin-top: 10px;
  line-height: 1.45;
}

/* ---- MARQUEE ---- */
.hero-marquee {
  background: var(--accent);
  color: var(--primary-deep);
  padding: 14px 0;
  overflow: hidden;
  border-bottom: 1px solid rgba(0,0,0,0.1);
}
.marquee-track {
  display: flex;
  gap: 56px;
  animation: marquee 38s linear infinite;
  white-space: nowrap;
  font-family: var(--mono);
  font-size: 13px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  font-weight: 500;
}
.marquee-track span {
  display: flex;
  align-items: center;
  gap: 56px;
}
.marquee-track span::after {
  content: "✦";
  opacity: 0.5;
}

/* ---- MISSION ---- */
.mission-bg { background: #fff; }
.mission-grid {
  display: grid;
  grid-template-columns: 1fr 1.4fr;
  gap: 80px;
  align-items: start;
}
.mission-eyebrow {
  font-family: var(--mono);
  font-size: 12px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--muted);
  padding-top: 14px;
  border-top: 1px solid var(--ink);
  margin-bottom: 32px;
}
.mission-text {
  font-family: var(--serif);
  font-size: clamp(28px, 3vw, 38px);
  line-height: 1.2;
  font-weight: 400;
  letter-spacing: -0.015em;
  margin: 0;
  text-wrap: pretty;
}
.mission-text em { font-style: italic; color: var(--primary); }

/* ---- OVERVIEW LIST ---- */
.overview-list {
  display: flex;
  flex-direction: column;
  border-top: 2px solid var(--ink);
}
.ov {
  display: grid;
  grid-template-columns: 80px 280px 1fr 200px;
  gap: 40px;
  padding: 36px 0;
  border-bottom: 1px solid var(--line);
  align-items: center;
  text-decoration: none;
  color: var(--ink);
  transition: background .2s ease, padding .2s ease;
  position: relative;
}
.ov:hover { padding-left: 16px; padding-right: 16px; background: #fff; }
.ov-idx {
  font-family: var(--serif);
  font-size: 56px;
  font-weight: 400;
  line-height: 1;
  letter-spacing: -0.04em;
  color: var(--primary);
  align-self: center;
  transition: color .2s ease;
}
.ov:hover .ov-idx { color: var(--accent); -webkit-text-stroke: 1px var(--primary); }
.ov-visual {
  aspect-ratio: 4/3;
  border-radius: 4px;
  position: relative;
  overflow: hidden;
}
.ov-img-placeholder {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #2E1188, #5634C9);
}
.ov-photo {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 2;
}
.ov-img-2 { background: linear-gradient(135deg, #1E0177, #4527A0); }
.ov-img-3 { background: linear-gradient(135deg, #170269, #2E1188); }
.ov-img-4 { background: linear-gradient(135deg, #4527A0, #170269); }
.ov-img-5 { background: linear-gradient(135deg, #B89500, #FED700); }
.ov-img-6 { background: linear-gradient(135deg, #FED700, #B89500); }
.ov-visual-tag {
  position: absolute;
  left: 14px;
  bottom: 14px;
  z-index: 3;
  font-family: var(--mono);
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(255,255,255,0.85);
  color: var(--primary-deep);
  backdrop-filter: blur(8px);
}
.ov-visual-arrow {
  position: absolute;
  right: 14px;
  bottom: 14px;
  z-index: 3;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(255,255,255,0.85);
  color: var(--primary-deep);
  display: grid;
  place-items: center;
  backdrop-filter: blur(8px);
  font-size: 13px;
  font-weight: 700;
  transition: transform .2s ease, background .2s ease;
}
.ov:hover .ov-visual-arrow { transform: translateX(3px); background: var(--accent); }
.ov-body { display: flex; flex-direction: column; gap: 8px; }
.ov-tag {
  font-family: var(--mono);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: var(--primary);
  font-weight: 600;
}
.ov-title {
  font-family: var(--serif);
  font-size: 30px;
  line-height: 1.1;
  font-weight: 500;
  letter-spacing: -0.015em;
  margin: 4px 0 8px;
  text-wrap: balance;
}
.ov-desc {
  font-size: 15px;
  color: var(--muted);
  line-height: 1.55;
  margin: 0;
  max-width: 56ch;
}
.ov-meta { align-self: center; text-align: right; }
.ov-meta-num {
  font-family: var(--serif);
  font-size: 28px;
  font-weight: 400;
  color: var(--primary);
  line-height: 1;
  letter-spacing: -0.02em;
}
.ov-meta-label {
  font-family: var(--mono);
  font-size: 10.5px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--muted);
  margin-top: 6px;
}

/* ---- FEATURED EVENT ---- */
.feat-bg { background: var(--primary); color: #fff; }
.feat-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 64px;
  align-items: center;
}
.feat-eyebrow {
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--accent);
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.feat-dot {
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
.feat-title {
  font-family: var(--serif);
  font-size: clamp(34px, 4.5vw, 52px);
  font-weight: 400;
  line-height: 1.05;
  letter-spacing: -0.02em;
  margin: 0 0 24px;
  text-wrap: balance;
}
.feat-meta {
  font-size: 16px;
  color: rgba(255,255,255,0.75);
  margin-bottom: 32px;
}
.feat-card {
  background: var(--accent);
  color: var(--primary-deep);
  border-radius: 6px;
  padding: 40px;
}
.feat-card-date {
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  margin-bottom: 16px;
}
.feat-day {
  font-family: var(--serif);
  font-size: 96px;
  font-weight: 400;
  line-height: 1;
  letter-spacing: -0.04em;
}
.feat-month {
  font-family: var(--serif);
  font-size: 28px;
  font-weight: 400;
  margin-top: 4px;
}
.feat-time {
  border-top: 1px solid rgba(23,2,105,0.25);
  margin-top: 32px;
  padding-top: 20px;
  display: flex;
  justify-content: space-between;
  font-family: var(--mono);
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-weight: 500;
}

/* ---- CONTACT BAND ---- */
.contact-band-bg { background: var(--accent); color: var(--primary-deep); }
.contact-band-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 64px;
  align-items: center;
}
.contact-band-title {
  font-family: var(--serif);
  font-size: clamp(40px, 5vw, 64px);
  line-height: 1.02;
  font-weight: 400;
  letter-spacing: -0.02em;
  margin: 0 0 24px;
  text-wrap: balance;
}
.contact-band-title em { font-style: italic; }
.contact-band-lede {
  font-size: 17px;
  line-height: 1.55;
  opacity: 0.78;
  max-width: 42ch;
  margin: 0 0 32px;
}
.contact-band-email {
  font-family: var(--serif);
  font-size: 24px;
  font-weight: 500;
  letter-spacing: -0.01em;
  border-bottom: 2px solid var(--primary-deep);
  padding-bottom: 4px;
  display: inline-block;
  transition: opacity .15s ease;
}
.contact-band-email:hover { opacity: 0.75; }
.news-card {
  background: var(--primary-deep);
  color: #fff;
  padding: 36px;
  border-radius: 4px;
}
.news-card h3 {
  font-family: var(--serif);
  font-weight: 500;
  font-size: 24px;
  margin: 0 0 8px;
  letter-spacing: -0.015em;
}
.news-card p {
  color: rgba(255,255,255,0.75);
  font-size: 14.5px;
  margin: 0 0 24px;
}
.news-form { display: flex; gap: 8px; }
.news-form input {
  flex: 1;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.18);
  border-radius: 4px;
  padding: 13px 14px;
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
  white-space: nowrap;
  cursor: pointer;
  border: none;
  font-family: var(--sans);
  transition: opacity .15s ease;
}
.news-form button:hover { opacity: 0.9; }

/* ---- RESPONSIVE ---- */
@media (max-width: 980px) {
  .hero-grid { grid-template-columns: 1fr; gap: 40px; }
  .hero-side { flex-direction: row; flex-wrap: wrap; }
  .hero-side .stat-card { flex: 1; min-width: 200px; }
  .feat-grid { grid-template-columns: 1fr; gap: 40px; }
  .contact-band-grid { grid-template-columns: 1fr; gap: 40px; }
  .mission-grid { grid-template-columns: 1fr; gap: 40px; }
  .ov { grid-template-columns: 50px 1fr; gap: 20px; }
  .ov-visual, .ov-meta { display: none; }
  .ov-idx { font-size: 36px; }
}
@media (max-width: 600px) {
  .hero-side { flex-direction: column; }
  .news-form { flex-direction: column; }
  .news-form button { padding: 13px 22px; }
}
</style>
