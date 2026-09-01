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
        <div class="coverage" v-if="content.coverage.length">
          <!-- An item without a link is still worth listing — it just isn't clickable. -->
          <component
            :is="item.url ? 'a' : 'div'"
            class="cov"
            :class="{ 'is-link': item.url }"
            v-for="(item, i) in content.coverage"
            :key="item.title + i"
            :href="item.url || undefined"
            :target="item.url ? '_blank' : undefined"
            :rel="item.url ? 'noopener' : undefined"
          >
            <div class="cov-type">{{ item.type }}</div>
            <div>
              <h3 class="cov-title">{{ item.title }}</h3>
              <div class="cov-outlet" v-if="item.outlet">{{ item.outlet }}</div>
            </div>
            <div class="cov-go" aria-hidden="true">{{ item.url ? '→' : '' }}</div>
          </component>
        </div>

        <p v-else class="cov-empty">Media coverage is on its way — check back soon.</p>
      </div>
    </section>
  </div>
</template>

<script setup>
import content from '~/content/media.json'

definePageMeta({ layout: 'default' })
</script>

<style scoped>
.coverage { display: flex; flex-direction: column; }
.cov {
  display: grid;
  grid-template-columns: 120px 1fr 40px;
  gap: 32px;
  align-items: center;
  padding: 28px 0;
  border-bottom: 1px solid var(--line);
  color: inherit;
  text-decoration: none;
  transition: background .2s ease, padding .2s ease;
}
.cov:first-child { border-top: 2px solid var(--ink); }
.cov.is-link:hover { background: #fff; padding-left: 16px; padding-right: 16px; }
.cov-type {
  font-family: var(--mono);
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: var(--muted);
  align-self: start;
  padding-top: 6px;
}
.cov-title {
  font-family: var(--serif);
  font-size: 24px;
  font-weight: 500;
  line-height: 1.2;
  letter-spacing: -0.012em;
  margin: 0;
  max-width: 54ch;
  text-wrap: pretty;
}
.cov.is-link:hover .cov-title { color: var(--primary); }
.cov-outlet {
  font-family: var(--mono);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--muted);
  margin-top: 10px;
}
.cov-go {
  font-size: 20px;
  color: var(--primary);
  text-align: right;
  transition: transform .15s ease;
}
.cov.is-link:hover .cov-go { transform: translateX(4px); }

.cov-empty {
  text-align: center;
  color: var(--muted);
  font-size: 16px;
  padding: 48px 0 8px;
}

@media (max-width: 800px) {
  .cov { grid-template-columns: 1fr 30px; gap: 12px 16px; align-items: start; }
  .cov-type { grid-column: 1 / -1; padding-top: 0; }
  .cov-go { align-self: center; }
}
</style>
