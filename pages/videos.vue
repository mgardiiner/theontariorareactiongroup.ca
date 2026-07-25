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
        <div class="filter-bar" role="group" aria-label="Filter videos by category">
          <button
            v-for="f in content.filters"
            :key="f"
            class="chip"
            :class="{ on: activeFilter === f }"
            @click="activeFilter = f"
            :aria-pressed="activeFilter === f"
          >{{ f }}</button>
        </div>

        <div class="videos-grid">
          <component
            :is="content.featured.url ? 'a' : 'article'"
            class="video feature"
            :class="content.featured.cls"
            :href="content.featured.url || undefined"
            :target="content.featured.url ? '_blank' : undefined"
            :rel="content.featured.url ? 'noopener' : undefined"
            :tabindex="content.featured.url ? undefined : '0'"
            :role="content.featured.url ? undefined : 'button'"
            :aria-label="`${content.featured.cat}: ${content.featured.title}, ${content.featured.dur}`"
          >
            <div class="video-thumb"></div>
            <div class="video-play" aria-hidden="true">
              <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            </div>
            <div class="video-info">
              <div class="video-cat">{{ content.featured.cat }}</div>
              <h4 class="video-title">{{ content.featured.title }}</h4>
              <div class="video-dur">{{ content.featured.dur }}</div>
            </div>
          </component>

          <component
            :is="v.url ? 'a' : 'article'"
            class="video"
            :class="v.cls"
            v-for="v in filteredSide"
            :key="v.title"
            :href="v.url || undefined"
            :target="v.url ? '_blank' : undefined"
            :rel="v.url ? 'noopener' : undefined"
            :tabindex="v.url ? undefined : '0'"
            :role="v.url ? undefined : 'button'"
            :aria-label="`${v.cat}: ${v.title}, ${v.dur}`"
          >
            <div class="video-thumb"></div>
            <div class="video-play" aria-hidden="true">
              <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            </div>
            <div class="video-info">
              <div class="video-cat">{{ v.cat }}</div>
              <h4 class="video-title">{{ v.title }}</h4>
              <div class="video-dur">{{ v.dur }}</div>
            </div>
          </component>
        </div>

        <div class="more-grid">
          <component
            :is="v.url ? 'a' : 'article'"
            class="video"
            :class="v.cls"
            v-for="v in filteredMore"
            :key="v.title"
            :href="v.url || undefined"
            :target="v.url ? '_blank' : undefined"
            :rel="v.url ? 'noopener' : undefined"
            :tabindex="v.url ? undefined : '0'"
            :role="v.url ? undefined : 'button'"
            :aria-label="`${v.cat}: ${v.title}, ${v.dur}`"
          >
            <div class="video-thumb"></div>
            <div class="video-play" aria-hidden="true">
              <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            </div>
            <div class="video-info">
              <div class="video-cat">{{ v.cat }}</div>
              <h4 class="video-title">{{ v.title }}</h4>
              <div class="video-dur">{{ v.dur }}</div>
            </div>
          </component>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import content from '~/content/videos.json'

definePageMeta({ layout: 'default' })

const activeFilter = ref('All videos')

// An "All …" filter shows everything. Otherwise match each video's category to
// the active filter. Behaviour-safe: if no category matches (e.g. the filter
// labels and cat values don't line up), fall back to showing every video rather
// than an empty grid.
const showAll = computed(() => activeFilter.value.toLowerCase().startsWith('all'))
const sideMatches = computed(() => content.sideVideos.filter(v => v.cat === activeFilter.value))
const moreMatches = computed(() => content.moreVideos.filter(v => v.cat === activeFilter.value))
const noMatches = computed(() => sideMatches.value.length === 0 && moreMatches.value.length === 0)
const filteredSide = computed(() => (showAll.value || noMatches.value) ? content.sideVideos : sideMatches.value)
const filteredMore = computed(() => (showAll.value || noMatches.value) ? content.moreVideos : moreMatches.value)
</script>

<style scoped>
.videos-grid {
  display: grid;
  grid-template-columns: 1.4fr 1fr 1fr;
  gap: 24px;
}
.video {
  border-radius: 4px;
  overflow: hidden;
  position: relative;
  cursor: pointer;
  background: var(--ink);
  aspect-ratio: 16/10;
  display: flex;
  align-items: flex-end;
  transition: transform .2s ease;
}
.video:hover { transform: translateY(-3px); }
.video.feature { aspect-ratio: 16/10; grid-row: span 2; }
.video::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, transparent 30%, rgba(0,0,0,0.7) 100%);
  z-index: 1;
}
.video-thumb {
  position: absolute;
  inset: 0;
}
.v1 .video-thumb { background: linear-gradient(135deg, #170269, #4527A0); }
.v2 .video-thumb { background: linear-gradient(135deg, #1E0177, #2E1188); }
.v3 .video-thumb { background: linear-gradient(135deg, #B89500, #FED700); }
.v4 .video-thumb { background: linear-gradient(135deg, #2E1188, #170269); }
.v5 .video-thumb { background: linear-gradient(135deg, #FED700, #E8A800); }
.v6 .video-thumb { background: linear-gradient(135deg, #170269, #1E0177); }
.v7 .video-thumb { background: linear-gradient(135deg, #4527A0, #2E1188); }
.v8 .video-thumb { background: linear-gradient(135deg, #FED700, #B89500); }

.video-play {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: rgba(255,255,255,0.95);
  display: grid;
  place-items: center;
  z-index: 2;
  transition: transform .2s ease, background .2s ease;
}
.video:hover .video-play { transform: translate(-50%, -50%) scale(1.08); background: var(--accent); }
.video-play svg {
  width: 22px;
  height: 22px;
  fill: var(--primary-deep);
  margin-left: 3px;
}
.video-info {
  position: relative;
  z-index: 2;
  padding: 20px;
  color: #fff;
  width: 100%;
}
.video-cat {
  font-family: var(--mono);
  font-size: 10.5px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--accent);
  margin-bottom: 8px;
}
.video-title {
  font-family: var(--serif);
  font-size: 19px;
  font-weight: 500;
  line-height: 1.2;
  letter-spacing: -0.01em;
  margin: 0 0 6px;
}
.feature .video-title { font-size: 28px; }
.video-dur {
  font-family: var(--mono);
  font-size: 11px;
  color: rgba(255,255,255,0.7);
  letter-spacing: 0.06em;
}

.more-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-top: 24px;
}

@media (max-width: 980px) {
  .videos-grid { grid-template-columns: 1fr; }
  .video.feature { grid-row: auto; }
  .more-grid { grid-template-columns: 1fr; }
}
</style>
