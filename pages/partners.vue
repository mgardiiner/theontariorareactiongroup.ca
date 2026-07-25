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

    <section>
      <div class="wrap">
        <div v-for="group in content.partnerGroups" :key="group.label">
          <div class="group-label">{{ group.label }}</div>
          <div class="partners-grid">
            <article class="partner" v-for="p in group.partners" :key="p.abbr" tabindex="0">
              <div class="partner-logo">
                {{ p.abbr }}
                <small>{{ p.region }}</small>
              </div>
              <h4 class="partner-name">{{ p.name }}</h4>
              <p class="partner-focus">{{ p.focus }}</p>
              <span class="partner-link">Visit ↗</span>
            </article>
          </div>
        </div>
      </div>
    </section>

    <!-- BECOME A PARTNER -->
    <section class="become-bg">
      <div class="wrap">
        <div class="become-grid">
          <div>
            <h2 class="become-title" v-html="content.becomePartner.title"></h2>
            <p>{{ content.becomePartner.body }}</p>
          </div>
          <div>
            <NuxtLink :to="content.becomePartner.cta.href" class="btn btn-dark">
              {{ content.becomePartner.cta.label }}
              <svg class="btn-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import content from '~/content/partners.json'

definePageMeta({ layout: 'default' })
</script>

<style scoped>
.partners-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0;
  border-top: 1px solid var(--ink);
  border-left: 1px solid var(--line);
  margin-bottom: 0;
}
.partner {
  padding: 32px 24px;
  border-right: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
  display: flex;
  flex-direction: column;
  transition: background .15s ease;
  cursor: pointer;
  min-height: 240px;
}
.partner:hover { background: var(--bg); }
.partner-logo {
  height: 56px;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  font-family: var(--serif);
  font-size: 22px;
  font-weight: 500;
  color: var(--primary);
  letter-spacing: -0.01em;
}
.partner-logo small {
  font-family: var(--sans);
  font-size: 11px;
  font-weight: 500;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-left: 8px;
}
.partner-name {
  font-family: var(--serif);
  font-size: 17px;
  font-weight: 500;
  line-height: 1.25;
  margin: 0 0 8px;
}
.partner-focus {
  font-size: 13.5px;
  color: var(--muted);
  line-height: 1.5;
  margin: 0;
  flex: 1;
}
.partner-link {
  font-family: var(--mono);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--primary);
  margin-top: 18px;
  display: inline-flex;
  gap: 6px;
  align-items: center;
}

.group-label {
  font-family: var(--mono);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: var(--muted);
  padding: 32px 0 16px;
  border-top: 1px solid var(--ink);
  margin-top: 48px;
}
.group-label:first-of-type { margin-top: 0; }

.become-bg { background: var(--accent); color: var(--primary-deep); padding: 96px 0; }
.become-grid {
  display: grid;
  grid-template-columns: 1.3fr 1fr;
  gap: 56px;
  align-items: center;
}
.become-title {
  font-family: var(--serif);
  font-size: clamp(34px, 4.5vw, 52px);
  font-weight: 400;
  line-height: 1.05;
  letter-spacing: -0.02em;
  margin: 0 0 16px;
}
.become-title em { font-style: italic; }
.become-bg p { font-size: 17px; max-width: 50ch; margin: 0; opacity: 0.78; }

@media (max-width: 980px) {
  .partners-grid { grid-template-columns: 1fr 1fr; }
  .become-grid { grid-template-columns: 1fr; }
}
@media (max-width: 600px) {
  .partners-grid { grid-template-columns: 1fr; }
}
</style>
