<template>
  <div>
    <Head>
      <Title>Challenges · Ontario Rare Action Group</Title>
      <Meta name="description" content="From the moment a symptom appears to decades into living with a rare condition, Ontario families navigate a healthcare system that wasn't built for them." />
    </Head>

    <header class="page-header">
      <div class="wrap">
        <div class="crumb">
          <NuxtLink to="/">Home</NuxtLink>
          <span>/</span>
          Challenges
        </div>
        <h1 class="page-title">The challenges nobody <em>warns you about.</em></h1>
        <p class="page-lede">From the moment a symptom appears to decades into living with a rare condition, Ontario families navigate a healthcare system that wasn't built for them. Here's what we hear, every day.</p>
      </div>
    </header>

    <!-- CHALLENGES LIST -->
    <section>
      <div class="wrap">
        <div class="ch-list">
          <div class="ch" v-for="item in challenges" :key="item.num">
            <div class="ch-num">{{ item.num }}</div>
            <h3 class="ch-title">{{ item.title }}</h3>
            <p class="ch-desc">{{ item.desc }}</p>
            <div class="ch-stat">
              <div class="ch-stat-num" v-html="item.stat"></div>
              <div class="ch-stat-label">{{ item.statLabel }}</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- PULL QUOTE -->
    <section class="quote-bg">
      <div class="wrap">
        <div class="quote">
          <div class="quote-mark" aria-hidden="true">"</div>
          <div>
            <p class="quote-text">Rare doesn't mean a small problem — it means <em>seven thousand small problems</em> the system has chosen not to solve at scale.</p>
            <div class="quote-attr">Dr. Sofia Reyes · Pediatric geneticist · Hamilton Health Sciences</div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA BAND -->
    <section class="cta-band">
      <div class="wrap">
        <h2>These challenges are <em>solvable.</em></h2>
        <p>Each one of them maps to a concrete commitment in our advocacy platform. See what we're doing about it — and add your name.</p>
        <div class="cta-actions">
          <NuxtLink to="/advocacy" class="btn btn-dark">
            See our advocacy platform
            <svg class="btn-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
          </NuxtLink>
          <NuxtLink to="/stories" class="btn btn-outline-ink">Read patient stories</NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'default' })

const challenges = [
  { num: '01', title: 'The diagnostic odyssey', desc: 'Most patients see seven or more specialists before receiving an accurate diagnosis. That delay costs jobs, marriages, savings — and in some cases, lives.', stat: '5.6 yrs', statLabel: 'avg. wait' },
  { num: '02', title: 'No treatment, no roadmap', desc: 'Even with a diagnosis in hand, the majority of rare-disease patients have no approved therapy and no specialist clinic to manage their condition long-term.', stat: '95%', statLabel: 'no cure' },
  { num: '03', title: 'Unaffordable and unfunded', desc: 'Where therapies do exist, costs can exceed $250,000 per year — and provincial coverage decisions can take half a decade to land.', stat: '$250K+', statLabel: 'per year' },
  { num: '04', title: 'Geographic inequity', desc: 'Patients in rural and northern Ontario travel hours — sometimes days — to reach a specialist who has even heard of their condition.', stat: '11 hrs', statLabel: 'avg. travel' },
  { num: '05', title: 'Caregivers carry it alone', desc: 'Family caregivers provide the equivalent of a full-time job in unpaid labour, with little recognition in provincial policy or labour law.', stat: '38 hrs', statLabel: 'per week' },
  { num: '06', title: 'Mental health falls through the cracks', desc: 'Rare-disease patients and their caregivers report rates of anxiety and depression more than double the general population — yet specialized supports are scarce.', stat: '2.4×', statLabel: 'higher rate' },
  { num: '07', title: 'A research gap that compounds', desc: 'Fewer than 5% of rare diseases attract a single dedicated research grant in Canada, leaving most conditions invisible to the systems meant to study them.', stat: '&lt;5%', statLabel: 'researched' },
]
</script>

<style scoped>
.ch-list { border-top: 1px solid var(--ink); }
.ch {
  display: grid;
  grid-template-columns: 70px 1fr 1.6fr 130px;
  gap: 32px;
  padding: 36px 0;
  border-bottom: 1px solid var(--line);
  align-items: start;
}
.ch-num {
  font-family: var(--mono);
  font-size: 13px;
  color: var(--muted);
  padding-top: 6px;
}
.ch-title {
  font-family: var(--serif);
  font-size: 30px;
  font-weight: 500;
  letter-spacing: -0.015em;
  line-height: 1.12;
  margin: 0;
}
.ch-desc {
  font-size: 15.5px;
  color: var(--muted);
  line-height: 1.6;
  margin: 0;
  padding-top: 8px;
}
.ch-stat { text-align: right; padding-top: 4px; }
.ch-stat-num {
  font-family: var(--serif);
  font-size: 42px;
  font-weight: 400;
  color: var(--primary);
  line-height: 1;
  letter-spacing: -0.02em;
}
.ch-stat-label {
  font-family: var(--mono);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--muted);
  margin-top: 6px;
}

.quote-bg { background: #fff; }
.quote {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 48px;
}
.quote-mark {
  font-family: var(--serif);
  font-size: 180px;
  line-height: 0.8;
  color: var(--accent);
}
.quote-text {
  font-family: var(--serif);
  font-size: clamp(26px, 3vw, 36px);
  line-height: 1.25;
  font-weight: 400;
  letter-spacing: -0.015em;
  margin: 0 0 24px;
  text-wrap: pretty;
}
.quote-text em { font-style: italic; color: var(--primary); }
.quote-attr {
  font-family: var(--mono);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--muted);
}

.cta-band { background: var(--accent); color: var(--primary-deep); padding: 88px 0; }
.cta-band h2 {
  font-family: var(--serif);
  font-size: clamp(34px, 4.5vw, 52px);
  font-weight: 400;
  line-height: 1.05;
  letter-spacing: -0.02em;
  margin: 0 0 16px;
}
.cta-band h2 em { font-style: italic; }
.cta-band p { font-size: 17px; max-width: 60ch; margin: 0 0 28px; opacity: 0.78; }
.cta-actions { display: flex; gap: 12px; flex-wrap: wrap; }

@media (max-width: 800px) {
  .ch { grid-template-columns: 50px 1fr; }
  .ch .ch-desc, .ch .ch-stat { grid-column: 2; text-align: left; padding-top: 0; }
  .quote { grid-template-columns: 1fr; gap: 16px; }
  .quote-mark { font-size: 110px; }
}
</style>
