<template>
  <div v-if="story">
    <Head>
      <Title>{{ story.authorName }} · Patient Stories · Ontario Rare Action Group</Title>
      <Meta name="description" :content="story.quote" />
    </Head>

    <!-- HERO -->
    <div class="story-hero" :style="{ background: story.imgGradient }">
      <div class="hero-overlay" />
      <div class="wrap hero-inner">
        <div class="crumb">
          <NuxtLink to="/">Home</NuxtLink>
          <span>/</span>
          <NuxtLink to="/stories">Patient Stories</NuxtLink>
          <span>/</span>
          {{ story.authorName }}
        </div>
        <div class="hero-meta">
          <span class="hero-tag">{{ story.category }}</span>
          <span class="hero-dot" aria-hidden="true">·</span>
          <span class="hero-time">{{ story.readTime }}</span>
        </div>
        <h1 class="hero-title">{{ story.title }}</h1>
        <div class="hero-author">
          <div class="hero-avatar" aria-hidden="true">{{ story.initials }}</div>
          <div>
            <div class="hero-author-name">{{ story.authorName }}</div>
            <div class="hero-author-role">{{ story.authorRole }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- BODY -->
    <section class="article-section">
      <div class="article-wrap">

        <!-- Pull quote -->
        <blockquote class="pull-quote">
          <p>{{ story.quote }}</p>
        </blockquote>

        <!-- Story body -->
        <div class="story-body">
          <p v-for="(para, i) in paragraphs" :key="i">{{ para }}</p>
        </div>

        <!-- Back link -->
        <div class="back-row">
          <NuxtLink to="/stories" class="back-link">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
            All stories
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- SHARE CTA -->
    <section class="share-bg">
      <div class="wrap">
        <div class="share-grid">
          <div>
            <h2 class="share-title" v-html="content.shareCta.title"></h2>
            <p>{{ content.shareCta.body }}</p>
          </div>
          <div>
            <NuxtLink :to="content.shareCta.cta.href" class="btn btn-primary">
              {{ content.shareCta.cta.label }}
              <svg class="btn-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>
  </div>

  <div v-else class="wrap not-found">
    <p>Story not found. <NuxtLink to="/stories">Back to stories →</NuxtLink></p>
  </div>
</template>

<script setup>
import content from '~/content/stories.json'

definePageMeta({ layout: 'default' })

const route = useRoute()
const story = useStory(route.params.slug)

const paragraphs = computed(() =>
  story?.body.split('\n\n').filter(p => p.trim()) ?? []
)
</script>

<style scoped>
/* HERO */
.story-hero {
  position: relative;
  min-height: 520px;
  display: flex;
  align-items: flex-end;
  padding-bottom: 64px;
}
.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.55) 100%);
}
.hero-inner {
  position: relative;
  z-index: 1;
  color: #fff;
}
.crumb {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.7);
  margin-bottom: 28px;
}
.crumb a { color: rgba(255,255,255,0.7); transition: color .15s ease; }
.crumb a:hover { color: #fff; }
.crumb span { opacity: 0.4; }
.hero-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: var(--mono);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: rgba(255,255,255,0.75);
  margin-bottom: 20px;
}
.hero-tag { color: var(--accent); font-weight: 600; }
.hero-dot { opacity: 0.4; }
.hero-title {
  font-family: var(--serif);
  font-size: clamp(28px, 4vw, 52px);
  font-weight: 500;
  line-height: 1.1;
  letter-spacing: -0.02em;
  max-width: 22ch;
  margin: 0 0 36px;
}
.hero-author {
  display: flex;
  align-items: center;
  gap: 14px;
}
.hero-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(255,255,255,0.15);
  border: 2px solid rgba(255,255,255,0.4);
  display: grid;
  place-items: center;
  font-family: var(--serif);
  font-size: 16px;
  font-weight: 500;
  color: #fff;
  flex-shrink: 0;
  backdrop-filter: blur(8px);
}
.hero-author-name { font-size: 15px; font-weight: 600; color: #fff; }
.hero-author-role { font-size: 13px; color: rgba(255,255,255,0.7); margin-top: 2px; }

/* ARTICLE */
.article-section { padding: 80px 0 64px; }
.article-wrap { max-width: 720px; margin: 0 auto; padding: 0 32px; }

.pull-quote {
  border-left: 3px solid var(--accent);
  margin: 0 0 52px;
  padding: 4px 0 4px 28px;
}
.pull-quote p {
  font-family: var(--serif);
  font-style: italic;
  font-size: clamp(20px, 2.5vw, 26px);
  font-weight: 400;
  line-height: 1.4;
  letter-spacing: -0.01em;
  color: var(--primary);
  margin: 0;
}

.story-body p {
  font-size: 18px;
  line-height: 1.75;
  color: var(--ink);
  margin: 0 0 28px;
}

.back-row {
  margin-top: 56px;
  padding-top: 32px;
  border-top: 1px solid var(--line);
}
.back-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--primary);
  transition: gap .15s ease;
}
.back-link:hover { gap: 12px; }

/* SHARE CTA */
.share-bg { background: var(--primary); color: #fff; padding: 96px 0; }
.share-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 64px;
  align-items: center;
}
.share-title {
  font-family: var(--serif);
  font-size: clamp(34px, 4.5vw, 52px);
  font-weight: 400;
  line-height: 1.05;
  letter-spacing: -0.02em;
  margin: 0 0 16px;
}
.share-title em { font-style: italic; color: var(--accent); }
.share-bg p { font-size: 17px; color: rgba(255,255,255,0.78); max-width: 50ch; }

.not-found { padding: 80px 0; font-size: 17px; }

@media (max-width: 980px) {
  .share-grid { grid-template-columns: 1fr; }
  .story-hero { min-height: 420px; }
}
@media (max-width: 600px) {
  .article-wrap { padding: 0 20px; }
  .story-hero { padding-bottom: 40px; }
}
</style>
