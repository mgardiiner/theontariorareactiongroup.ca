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
        <div class="filter-bar" role="group" aria-label="Filter stories by type">
          <button
            v-for="f in filters"
            :key="f"
            class="chip"
            :class="{ on: activeFilter === f }"
            @click="activeFilter = f"
            :aria-pressed="activeFilter === f"
          >{{ f }}</button>
        </div>

        <div class="stories-grid">
          <NuxtLink
            class="story"
            v-for="story in filteredStories"
            :key="story.id"
            :to="`/stories/${story.slug}`"
          >
            <div class="story-img" :class="story.imgClass" aria-hidden="true">
              <img :src="story.image || '/uploads/placeholder-story.svg'" alt="" class="story-photo" />
              <span class="story-img-label">{{ story.imgLabel }}</span>
            </div>
            <div class="story-body">
              <div class="story-meta">
                <span class="story-meta-tag">{{ story.category }}</span>
                <span aria-hidden="true">·</span>
                <span>{{ story.readTime }}</span>
              </div>
              <h3 class="story-title">{{ story.title }}</h3>
              <p class="story-quote">{{ story.quote }}</p>
              <div class="story-author">
                <div class="story-avatar" aria-hidden="true">{{ story.initials }}</div>
                <div>
                  <div class="story-author-name">{{ story.authorName }}</div>
                  <div class="story-author-role">{{ story.authorRole }}</div>
                </div>
              </div>
            </div>
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
</template>

<script setup>
import content from '~/content/stories.json'

definePageMeta({ layout: 'default' })

const filters = content.filters
const activeFilter = ref('All stories')

const { stories } = useStories()

const filteredStories = computed(() => {
  if (activeFilter.value === 'All stories') return stories
  return stories.filter(s => s.filterKey === activeFilter.value)
})
</script>

<style scoped>
.stories-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 28px;
}
.story {
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: transform .2s ease, box-shadow .2s ease;
  cursor: pointer;
  text-decoration: none;
  color: inherit;
}
.story:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(23,2,105,0.08); }
.story-img {
  aspect-ratio: 4/3;
  position: relative;
  display: flex;
  align-items: flex-end;
}
.story-photo {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.story-img.s1 { background: linear-gradient(135deg, #2E1188, #5634C9); }
.story-img.s2 { background: linear-gradient(135deg, #170269, #1E0177); }
.story-img.s3 { background: linear-gradient(135deg, #FED700, #F5A623); }
.story-img.s4 { background: linear-gradient(135deg, #1E0177, #4527A0); }
.story-img.s5 { background: linear-gradient(135deg, #B89500, #FED700); }
.story-img.s6 { background: linear-gradient(135deg, #170269, #2E1188); }
.story-img-label {
  position: absolute;
  left: 16px;
  bottom: 16px;
  color: rgba(255,255,255,0.85);
  background: rgba(0,0,0,0.25);
  padding: 4px 10px;
  border-radius: 999px;
  font-family: var(--mono);
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  backdrop-filter: blur(6px);
}
.story-img.s3 .story-img-label,
.story-img.s5 .story-img-label {
  color: var(--primary-deep);
  background: rgba(255,255,255,0.5);
}
.story-body {
  padding: 24px 24px 28px;
  flex: 1;
  display: flex;
  flex-direction: column;
}
.story-meta {
  font-family: var(--mono);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--muted);
  margin-bottom: 14px;
  display: flex;
  gap: 12px;
  align-items: center;
}
.story-meta-tag { color: var(--primary); font-weight: 600; }
.story-title {
  font-family: var(--serif);
  font-size: 22px;
  font-weight: 500;
  letter-spacing: -0.015em;
  line-height: 1.2;
  margin: 0 0 12px;
}
.story-quote {
  font-family: var(--serif);
  font-style: italic;
  font-size: 15px;
  color: var(--muted);
  line-height: 1.5;
  margin: 0 0 22px;
  flex: 1;
}
.story-author {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: auto;
  padding-top: 18px;
  border-top: 1px solid var(--line);
}
.story-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--primary);
  color: var(--accent);
  display: grid;
  place-items: center;
  font-family: var(--serif);
  font-size: 14px;
  font-weight: 500;
  flex-shrink: 0;
}
.story-author-name { font-size: 14px; font-weight: 600; }
.story-author-role { font-size: 12.5px; color: var(--muted); }

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
.share-bg p {
  font-size: 17px;
  color: rgba(255,255,255,0.78);
  max-width: 50ch;
}

@media (max-width: 980px) {
  .stories-grid { grid-template-columns: 1fr 1fr; }
  .share-grid { grid-template-columns: 1fr; }
}
@media (max-width: 600px) {
  .stories-grid { grid-template-columns: 1fr; }
}
</style>
