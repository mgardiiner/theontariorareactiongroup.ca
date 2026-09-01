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

    <!-- GOALS -->
    <section>
      <div class="wrap">
        <div class="goals">
          <article class="goal" v-for="goal in content.goals" :key="goal.num">
            <div class="goal-num">Goal<strong>{{ goal.num }}</strong></div>
            <div>
              <h3 class="goal-title">{{ goal.title }}</h3>
              <p class="goal-desc">{{ goal.desc }}</p>
            </div>
          </article>
        </div>
      </div>
    </section>

    <!-- PROGRESS TRACKER -->
    <section class="progress-bg">
      <div class="wrap">
        <div class="sec-head">
          <div class="sec-num">{{ content.progressHead.eyebrow }}</div>
          <div>
            <h2 class="sec-title" v-html="content.progressHead.title"></h2>
            <p class="sec-sub">{{ content.progressHead.sub }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA BAND -->
    <section class="cta-band">
      <div class="wrap">
        <div class="cta-grid">
          <div>
            <h2 class="cta-title" v-html="content.ctaBand.title"></h2>
            <p class="cta-lede">{{ content.ctaBand.lede }}</p>
          </div>
          <div class="cta-actions">
            <NuxtLink :to="content.ctaBand.primaryCta.href" class="btn btn-primary" style="justify-content:center;">
              {{ content.ctaBand.primaryCta.label }}
              <svg class="btn-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
            </NuxtLink>
            <NuxtLink :to="content.ctaBand.secondaryCta.href" class="btn btn-ghost" style="justify-content:center;">{{ content.ctaBand.secondaryCta.label }}</NuxtLink>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import content from '~/content/advocacy.json'

definePageMeta({ layout: 'default' })
</script>

<style scoped>
.goals { display: flex; flex-direction: column; }
.goal {
  background: transparent;
  border-bottom: 1px solid var(--line);
  padding: 28px 0 32px;
  display: grid;
  grid-template-columns: 100px 1fr;
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
/* Heading-only band while the report card is in progress — the default 110px
   section padding leaves too much empty white without the tracker rows. */
.progress-bg { background: #fff; padding: 72px 0; }
.progress-bg .sec-head { margin-bottom: 0; }

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
