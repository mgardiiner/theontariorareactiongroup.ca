<template>
  <div>
    <Head>
      <Title>Ontario Rare Action Group</Title>
      <Meta name="description" content="A coalition of patients, caregivers and clinicians building a more humane rare-disease system for Ontario." />
    </Head>

    <!-- HERO -->
    <section class="hero" style="padding: 0;">
      <div class="wrap">
        <div class="hero-grid">
          <div class="hero-main">
            <div class="hero-eyebrow">Patient-led · Ontario</div>
            <h1 class="hero-title">No one should face <em>rare</em> alone.</h1>
            <p class="hero-lede">A coalition of patients, caregivers and clinicians building a more humane rare-disease system for Ontario.</p>
            <div class="hero-actions">
              <NuxtLink to="/contact" class="btn btn-primary">
                Add your voice
                <svg class="btn-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
              </NuxtLink>
              <NuxtLink to="/events" class="btn btn-ghost">See upcoming events</NuxtLink>
            </div>
          </div>
          <aside class="hero-side" aria-label="Key statistics">
            <div class="stat-card">
              <div class="stat-num">2.8M</div>
              <div class="stat-label">Canadians live with one of more than 7,000 known rare diseases.</div>
            </div>
            <div class="stat-card">
              <div class="stat-num">5+</div>
              <div class="stat-label">Average years it takes to receive an accurate rare-disease diagnosis in Canada.</div>
            </div>
            <div class="stat-card">
              <div class="stat-num">95%</div>
              <div class="stat-label">Of rare diseases still have no approved treatment available to patients.</div>
            </div>
          </aside>
        </div>
      </div>
    </section>

    <!-- MARQUEE -->
    <div class="hero-marquee" aria-hidden="true">
      <div class="marquee-track">
        <span>Funding equity</span><span>Faster diagnosis</span><span>Drug access</span><span>Caregiver support</span><span>Research investment</span><span>Patient voice</span>
        <span>Funding equity</span><span>Faster diagnosis</span><span>Drug access</span><span>Caregiver support</span><span>Research investment</span><span>Patient voice</span>
      </div>
    </div>

    <!-- MISSION -->
    <section class="mission-bg">
      <div class="wrap">
        <div class="mission-grid">
          <div>
            <div class="mission-eyebrow">Who we are</div>
            <NuxtLink to="/contact" class="btn btn-dark">Get involved</NuxtLink>
          </div>
          <p class="mission-text">
            An Ontario non-profit network of patients, families and clinicians, working to <em>shape provincial policy and build a system that sees rare patients.</em>
          </p>
        </div>
      </div>
    </section>

    <!-- OVERVIEW / EXPLORE -->
    <section>
      <div class="wrap">
        <div class="sec-head">
          <div class="sec-num">Explore the site</div>
          <div>
            <h2 class="sec-title">Everything we do, in <em>one place.</em></h2>
            <p class="sec-sub">Each section below has its own page with the full picture — open any one to dive in.</p>
          </div>
        </div>

        <div class="overview-list">
          <NuxtLink class="ov" to="/advocacy">
            <div class="ov-idx" aria-hidden="true">01</div>
            <div class="ov-visual" aria-hidden="true">
              <div class="ov-img-placeholder"></div>
              <span class="ov-visual-tag">Policy</span>
              <span class="ov-visual-arrow" aria-hidden="true">→</span>
            </div>
            <div class="ov-body">
              <div class="ov-tag">Advocacy</div>
              <h3 class="ov-title">What we are fighting for at Queen's Park.</h3>
              <p class="ov-desc">Six provincial commitments — strategy, faster diagnosis, drug access, caregiver supports, multidisciplinary care, research investment.</p>
            </div>
            <div class="ov-meta" aria-label="6 Commitments">
              <div class="ov-meta-num">6</div>
              <div class="ov-meta-label">Commitments</div>
            </div>
          </NuxtLink>

          <NuxtLink class="ov" to="/challenges">
            <div class="ov-idx" aria-hidden="true">02</div>
            <div class="ov-visual" aria-hidden="true">
              <div class="ov-img-placeholder ov-img-2"></div>
              <span class="ov-visual-tag">Reality</span>
              <span class="ov-visual-arrow" aria-hidden="true">→</span>
            </div>
            <div class="ov-body">
              <div class="ov-tag">Rare Challenges</div>
              <h3 class="ov-title">The realities families face every day.</h3>
              <p class="ov-desc">Five-year diagnostic odysseys, geographic inequity, caregiver burnout — the system was not built for the rare community.</p>
            </div>
            <div class="ov-meta" aria-label="7 Issues">
              <div class="ov-meta-num">7</div>
              <div class="ov-meta-label">Issues</div>
            </div>
          </NuxtLink>

          <NuxtLink class="ov" to="/stories">
            <div class="ov-idx" aria-hidden="true">03</div>
            <div class="ov-visual" aria-hidden="true">
              <div class="ov-img-placeholder ov-img-3"></div>
              <span class="ov-visual-tag">Voices</span>
              <span class="ov-visual-arrow" aria-hidden="true">→</span>
            </div>
            <div class="ov-body">
              <div class="ov-tag">Patient Stories</div>
              <h3 class="ov-title">Patients, caregivers and clinicians, in their own words.</h3>
              <p class="ov-desc">Behind every statistic is a person. The voices reshaping Ontario's approach to rare disease.</p>
            </div>
            <div class="ov-meta" aria-label="24 Stories">
              <div class="ov-meta-num">24</div>
              <div class="ov-meta-label">Stories</div>
            </div>
          </NuxtLink>

          <NuxtLink class="ov" to="/events">
            <div class="ov-idx" aria-hidden="true">04</div>
            <div class="ov-visual" aria-hidden="true">
              <div class="ov-img-placeholder ov-img-4"></div>
              <span class="ov-visual-tag">Live</span>
              <span class="ov-visual-arrow" aria-hidden="true">→</span>
            </div>
            <div class="ov-body">
              <div class="ov-tag">Upcoming Events</div>
              <h3 class="ov-title">Town halls, briefings &amp; meetups — most on Zoom.</h3>
              <p class="ov-desc">Register for upcoming sessions and join the conversation from anywhere in Ontario.</p>
            </div>
            <div class="ov-meta" aria-label="6 Upcoming events">
              <div class="ov-meta-num">6</div>
              <div class="ov-meta-label">Upcoming</div>
            </div>
          </NuxtLink>

          <NuxtLink class="ov" to="/videos">
            <div class="ov-idx" aria-hidden="true">05</div>
            <div class="ov-visual" aria-hidden="true">
              <div class="ov-img-placeholder ov-img-5"></div>
              <span class="ov-visual-tag">Watch</span>
              <span class="ov-visual-arrow" aria-hidden="true">→</span>
            </div>
            <div class="ov-body">
              <div class="ov-tag">Video Library</div>
              <h3 class="ov-title">Recorded panels, explainers and patient interviews.</h3>
              <p class="ov-desc">A growing library — share with your community, your doctor, your MPP.</p>
            </div>
            <div class="ov-meta" aria-label="38 Videos">
              <div class="ov-meta-num">38</div>
              <div class="ov-meta-label">Videos</div>
            </div>
          </NuxtLink>

          <NuxtLink class="ov" to="/partners">
            <div class="ov-idx" aria-hidden="true">06</div>
            <div class="ov-visual" aria-hidden="true">
              <div class="ov-img-placeholder ov-img-6"></div>
              <span class="ov-visual-tag">Network</span>
              <span class="ov-visual-arrow" aria-hidden="true">→</span>
            </div>
            <div class="ov-body">
              <div class="ov-tag">Affiliated Organizations</div>
              <h3 class="ov-title">Twenty-eight Ontario rare-disease organizations we work alongside.</h3>
              <p class="ov-desc">From national umbrella bodies to single-condition patient groups — we don't do this work alone.</p>
            </div>
            <div class="ov-meta" aria-label="28 Partners">
              <div class="ov-meta-num">28</div>
              <div class="ov-meta-label">Partners</div>
            </div>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- FEATURED EVENT -->
    <section class="feat-bg">
      <div class="wrap">
        <div class="feat-grid">
          <div>
            <div class="feat-eyebrow"><span class="feat-dot" aria-hidden="true"></span>Next event · Open to all</div>
            <h2 class="feat-title">Town Hall: Ontario's Rare Disease Strategy — what's next?</h2>
            <p class="feat-meta">A conversation with patient leaders and invited MPPs about what implementation should look like for Ontario in 2026.</p>
            <div class="hero-actions">
              <NuxtLink to="/events" class="btn btn-primary">
                Register on Zoom
                <svg class="btn-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
              </NuxtLink>
              <NuxtLink to="/events" class="btn btn-ghost">All events</NuxtLink>
            </div>
          </div>
          <div class="feat-card" aria-label="Event date: May 21, 2026, 7:00–8:30 PM ET, Zoom, Free">
            <div class="feat-card-date">Save the date</div>
            <div class="feat-day">21</div>
            <div class="feat-month">May 2026</div>
            <div class="feat-time">
              <span>7:00–8:30 PM ET</span>
              <span>Zoom · Free</span>
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
            <h2 class="contact-band-title">Have a question? A story? A <em>rare</em> idea?</h2>
            <p class="contact-band-lede">We read every message. Whether you're a patient, caregiver, clinician, policymaker — start a conversation.</p>
            <a href="mailto:hello@ontariorare.ca" class="contact-band-email">hello@ontariorare.ca</a>
          </div>
          <div class="news-card">
            <h3>Stay in the loop</h3>
            <p>One email a month. Policy updates, event invites, and the stories that matter. No spam, ever.</p>
            <form class="news-form" @submit.prevent="handleNewsSubscribe">
              <input type="email" placeholder="your@email.ca" required aria-label="Email address" v-model="newsEmail" />
              <button type="submit">{{ newsSubscribed ? '✓ Subscribed' : 'Subscribe' }}</button>
            </form>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'default' })

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
