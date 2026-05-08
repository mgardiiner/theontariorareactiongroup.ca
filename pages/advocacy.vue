<template>
  <div>
    <Head>
      <Title>Advocacy · Ontario Rare Action Group</Title>
      <Meta name="description" content="Six commitments shape every meeting, every brief, and every campaign we bring to Queen's Park." />
    </Head>

    <header class="page-header">
      <div class="wrap">
        <div class="crumb">
          <NuxtLink to="/">Home</NuxtLink>
          <span>/</span>
          Advocacy
        </div>
        <h1 class="page-title">What we are <em>fighting for.</em></h1>
        <p class="page-lede">Six commitments shape every meeting, every brief, and every campaign we bring to Queen's Park. They were written by patients and caregivers — and they're updated each year alongside our community.</p>
      </div>
    </header>

    <!-- GOALS -->
    <section>
      <div class="wrap">
        <div class="goals">
          <article class="goal" v-for="goal in goals" :key="goal.num">
            <div class="goal-num">Goal<strong>{{ goal.num }}</strong></div>
            <div>
              <h3 class="goal-title">{{ goal.title }}</h3>
              <p class="goal-desc">{{ goal.desc }}</p>
              <a class="goal-link" href="#" @click.prevent>Read the brief</a>
            </div>
            <div class="goal-side">
              <span class="pill" :class="goal.statusClass">{{ goal.status }}</span>
              <ul class="goal-pts">
                <li v-for="pt in goal.points" :key="pt">{{ pt }}</li>
              </ul>
            </div>
          </article>
        </div>
      </div>
    </section>

    <!-- PROGRESS TRACKER -->
    <section class="progress-bg">
      <div class="wrap">
        <div class="sec-head">
          <div class="sec-num">Progress tracker</div>
          <div>
            <h2 class="sec-title">Where each <em>file</em> stands.</h2>
            <p class="sec-sub">Live snapshot of where our advocacy work is moving — and where it's stuck. Updated quarterly.</p>
          </div>
        </div>
        <div>
          <div class="progress-row" v-for="item in progress" :key="item.title">
            <div>
              <h4 class="pr-title">{{ item.title }}</h4>
              <div class="pr-meta">{{ item.meta }}</div>
            </div>
            <div class="pr-status" :class="item.statusClass">{{ item.status }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA BAND -->
    <section class="cta-band">
      <div class="wrap">
        <div class="cta-grid">
          <div>
            <h2 class="cta-title">Want to put your name behind this <em>work?</em></h2>
            <p class="cta-lede">Sign on as a community supporter, write to your MPP using our templates, or join one of our advocacy working groups.</p>
          </div>
          <div class="cta-actions">
            <NuxtLink to="/contact" class="btn btn-primary" style="justify-content:center;">
              Sign the supporter list
              <svg class="btn-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
            </NuxtLink>
            <NuxtLink to="/contact" class="btn btn-ghost" style="justify-content:center;">Get the MPP letter templates</NuxtLink>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'default' })

const goals = [
  {
    num: '01',
    title: 'A Provincial Rare Disease Strategy',
    desc: 'Implementation of Canada\'s National Strategy at the Ontario level — with funding, accountability and patient governance built in from the start.',
    status: 'Tabled',
    statusClass: '',
    points: ['Standing patient council with binding input', 'Five-year funding tied to outcomes', 'Annual public reporting on equity'],
  },
  {
    num: '02',
    title: 'Faster, fairer diagnosis',
    desc: 'Universal newborn screening expansion and reimbursed genetic testing, so families don\'t wait years for answers.',
    status: 'Drafting',
    statusClass: 'pill-draft',
    points: ['Newborn panel aligned with U.S. RUSP', 'OHIP exome and genome sequencing', 'Adult diagnostic-odyssey program'],
  },
  {
    num: '03',
    title: 'Equitable drug access',
    desc: 'A transparent, patient-informed reimbursement pathway for rare-disease therapies — including pediatric and ultra-rare medications.',
    status: 'In review',
    statusClass: 'pill-draft',
    points: ['Defined post-approval timelines', 'A managed-access fund', 'Patient seats on EAP review'],
  },
  {
    num: '04',
    title: 'Caregiver and family supports',
    desc: 'Recognition of unpaid caregivers in provincial labour and benefit policy, including respite and mental-health funding.',
    status: 'Active',
    statusClass: '',
    points: ['Paid caregiver leave protections', 'Direct respite-care subsidies', 'Mental-health coverage for caregivers'],
  },
  {
    num: '05',
    title: 'Coordinated, multidisciplinary care',
    desc: 'Designated Centres of Expertise across Ontario so rural and northern patients receive the same standard of care as those in the GTA.',
    status: 'Piloting',
    statusClass: 'pill-draft',
    points: ['Centre of Expertise per Health Region', 'Permanent telehealth funding', 'Travel & accommodation grants'],
  },
  {
    num: '06',
    title: 'Research investment',
    desc: 'Dedicated provincial funding for rare-disease research, registries and patient-reported outcome programs.',
    status: 'Open',
    statusClass: 'pill-open',
    points: ['Provincial fund matched to federal', 'Connected patient registry network', 'Mandatory patient partners'],
  },
]

const progress = [
  { title: 'Newborn screening expansion (Bill 142)', meta: 'Ministry of Health · Standing Committee', status: 'In progress', statusClass: 'pr-progress' },
  { title: 'Genetic testing OHIP coverage', meta: 'Ontario Health Technology Advisory Committee', status: 'Open', statusClass: 'pr-open' },
  { title: 'Patient seat on EAP committee', meta: 'Exceptional Access Program', status: 'Win — Mar 2025', statusClass: 'pr-win' },
  { title: 'Caregiver leave amendments (Bill 87)', meta: 'Ministry of Labour · Second reading', status: 'In progress', statusClass: 'pr-progress' },
  { title: 'Northern Centre of Expertise pilot', meta: 'Ontario Health · Sudbury / Thunder Bay', status: 'Win — Nov 2025', statusClass: 'pr-win' },
  { title: 'Provincial rare-disease research fund', meta: 'Treasury Board · Pre-budget submission', status: 'Open', statusClass: 'pr-open' },
]
</script>

<style scoped>
.goals { display: flex; flex-direction: column; }
.goal {
  background: transparent;
  border-bottom: 1px solid var(--line);
  padding: 28px 0 32px;
  display: grid;
  grid-template-columns: 100px 1fr 240px;
  gap: 36px;
  cursor: default;
  transition: background .2s ease, padding .2s ease;
  align-items: start;
}
.goal:first-child { border-top: 2px solid var(--ink); }
.goal:hover { background: #fff; padding-left: 16px; padding-right: 16px; }
.goal-num {
  font-family: var(--mono);
  font-size: 11px;
  font-weight: 600;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.15em;
  padding-top: 6px;
}
.goal-num strong {
  display: block;
  font-family: var(--serif);
  font-size: 44px;
  font-weight: 400;
  color: var(--primary);
  font-style: italic;
  letter-spacing: -0.02em;
  line-height: 1;
  margin-top: 6px;
}
.goal-title {
  font-family: var(--serif);
  font-size: 26px;
  line-height: 1.18;
  font-weight: 500;
  letter-spacing: -0.012em;
  margin: 0 0 12px;
}
.goal-desc {
  font-size: 15px;
  color: var(--muted);
  line-height: 1.6;
  margin: 0;
  max-width: 58ch;
}
.goal-side { display: flex; flex-direction: column; gap: 12px; align-items: flex-start; }
.goal-pts {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.goal-pts li {
  font-family: var(--mono);
  font-size: 11px;
  color: var(--muted);
  line-height: 1.55;
  padding-left: 14px;
  position: relative;
}
.goal-pts li::before {
  content: "·";
  position: absolute;
  left: 4px;
  color: var(--primary);
  font-weight: 700;
}
.goal-link {
  font-family: var(--mono);
  font-size: 11px;
  font-weight: 600;
  color: var(--primary);
  display: inline-flex;
  align-items: center;
  gap: 8px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-top: 10px;
  cursor: pointer;
}
.goal-link::after { content: "→"; transition: transform .15s ease; }
.goal:hover .goal-link::after { transform: translateX(4px); }

.progress-bg { background: #fff; }
.progress-row {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 24px;
  padding: 24px 0;
  border-bottom: 1px solid var(--line);
  align-items: center;
}
.progress-row:first-child { border-top: 1px solid var(--ink); }
.pr-title {
  font-family: var(--serif);
  font-size: 22px;
  font-weight: 500;
  margin: 0 0 6px;
  letter-spacing: -0.01em;
}
.pr-meta {
  font-family: var(--mono);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--muted);
}
.pr-status {
  font-family: var(--mono);
  font-size: 11px;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: 999px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  white-space: nowrap;
}
.pr-win { background: rgba(30,1,119,0.08); color: var(--primary); }
.pr-progress { background: var(--accent); color: var(--primary-deep); }
.pr-open { background: transparent; color: var(--muted); border: 1px solid var(--line); }

.cta-band { background: var(--primary); color: #fff; padding: 88px 0; }
.cta-grid {
  display: grid;
  grid-template-columns: 1.3fr 1fr;
  gap: 56px;
  align-items: center;
}
.cta-title {
  font-family: var(--serif);
  font-size: clamp(34px, 4.5vw, 52px);
  font-weight: 400;
  line-height: 1.05;
  letter-spacing: -0.02em;
  margin: 0 0 20px;
}
.cta-title em { font-style: italic; color: var(--accent); }
.cta-lede {
  font-size: 17px;
  color: rgba(255,255,255,0.78);
  margin: 0 0 28px;
  max-width: 50ch;
}
.cta-actions { display: flex; flex-direction: column; gap: 12px; }

@media (max-width: 800px) {
  .goal { grid-template-columns: 1fr; gap: 16px; }
  .cta-grid { grid-template-columns: 1fr; }
}
</style>
