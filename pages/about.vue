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

    <!-- CONTENT BLOCKS — alternating cream / white bands -->
    <section
      v-for="(block, i) in content.blocks"
      :key="block.eyebrow || i"
      :class="{ 'block-bg': i % 2 === 1 }"
    >
      <div class="wrap">
        <div class="sec-head">
          <div class="sec-num">{{ block.eyebrow }}</div>
          <div>
            <h2 class="sec-title" v-html="block.title"></h2>
          </div>
        </div>
        <div class="block-body">
          <p v-for="(para, p) in paragraphs(block.body)" :key="p">{{ para }}</p>
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
import content from '~/content/about.json'

definePageMeta({ layout: 'default' })

// Same convention as story bodies: a blank line starts a new paragraph.
function paragraphs (body) {
  return (body || '').split('\n\n').map(p => p.trim()).filter(Boolean)
}
</script>

<style scoped>
.block-bg { background: #fff; }
.sec-head { margin-bottom: 40px; }
.block-body {
  max-width: 68ch;
  margin-left: 248px; /* aligns with the .sec-head text column (200px + 48px gap) */
}
.block-body p {
  font-size: 17px;
  line-height: 1.65;
  color: var(--muted);
  margin: 0 0 20px;
  text-wrap: pretty;
}
.block-body p:last-child { margin-bottom: 0; }

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

/* Matches the 980px breakpoint where the global .sec-head collapses to one column. */
@media (max-width: 980px) {
  .block-body { margin-left: 0; }
}
</style>
