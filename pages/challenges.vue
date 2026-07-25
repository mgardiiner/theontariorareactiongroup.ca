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

    <!-- CHALLENGES LIST -->
    <section>
      <div class="wrap">
        <div class="ch-list">
          <div class="ch" v-for="item in content.challenges" :key="item.num">
            <div class="ch-num">{{ item.num }}</div>
            <h3 class="ch-title">{{ item.title }}</h3>
            <p class="ch-desc">{{ item.desc }}</p>
            <div class="ch-stat">
              <div class="ch-stat-num">{{ item.stat }}</div>
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
            <p class="quote-text" v-html="content.quote.text"></p>
            <div class="quote-attr">{{ content.quote.attribution }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA BAND -->
    <section class="cta-band">
      <div class="wrap">
        <h2 v-html="content.ctaBand.heading"></h2>
        <p>{{ content.ctaBand.body }}</p>
        <div class="cta-actions">
          <NuxtLink v-for="(action, i) in content.ctaBand.actions" :key="i" :to="action.href" :class="['btn', 'btn-' + action.style]">
            {{ action.label }}
            <svg v-if="action.arrow" class="btn-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import content from '~/content/challenges.json'

definePageMeta({ layout: 'default' })
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
