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

    <section class="vid-lib">
      <div class="wrap">
        <!-- FEATURED HERO -->
        <component
          v-if="content.featured && content.featured.title"
          :is="content.featured.url ? 'a' : 'article'"
          class="vid-hero"
          :class="content.featured.cls"
          :href="content.featured.url || undefined"
          :target="content.featured.url ? '_blank' : undefined"
          :rel="content.featured.url ? 'noopener' : undefined"
          :tabindex="content.featured.url ? undefined : '0'"
          :role="content.featured.url ? undefined : 'button'"
          :aria-label="`Featured — ${content.featured.cat}: ${content.featured.title}, ${content.featured.dur}`"
        >
          <div class="video-thumb"><img :src="content.featured.image || '/uploads/placeholder-video.svg'" alt="" class="video-photo" /></div>
          <span class="vid-hero-badge">Featured</span>
          <div class="video-play" aria-hidden="true">
            <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
          </div>
          <div class="vid-hero-info">
            <div class="video-cat">{{ content.featured.cat }}</div>
            <h2 class="vid-hero-title">{{ content.featured.title }}</h2>
            <div class="video-dur">{{ content.featured.dur }}</div>
          </div>
        </component>

        <!-- FILTERS -->
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

        <!-- LIBRARY GRID -->
        <div class="video-grid" v-if="filteredVideos.length">
          <component
            :is="v.url ? 'a' : 'article'"
            class="video"
            :class="v.cls"
            v-for="(v, i) in filteredVideos"
            :key="v.title + i"
            :href="v.url || undefined"
            :target="v.url ? '_blank' : undefined"
            :rel="v.url ? 'noopener' : undefined"
            :tabindex="v.url ? undefined : '0'"
            :role="v.url ? undefined : 'button'"
            :aria-label="`${v.cat}: ${v.title}, ${v.dur}`"
          >
            <div class="video-thumb"><img :src="v.image || '/uploads/placeholder-video.svg'" alt="" class="video-photo" /></div>
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

        <p v-else class="video-empty">No videos in this category yet — check back soon.</p>
      </div>
    </section>
  </div>
</template>

<script setup>
import content from '~/content/videos.json'

definePageMeta({ layout: 'default' })

const activeFilter = ref('All videos')

// The filter chips are plural / title-case ("Patient voices") while each video's
// category reads as a singular label ("Patient Voice"). Normalise both ends —
// lowercase, trim, drop a trailing "s" — so a chip lines up with its videos.
function norm(s) {
  const t = String(s || '').toLowerCase().trim()
  return t.endsWith('s') ? t.slice(0, -1) : t
}
const showAll = computed(() => activeFilter.value.toLowerCase().startsWith('all'))
const filteredVideos = computed(() =>
  showAll.value
    ? content.videos
    : content.videos.filter((v) => norm(v.cat) === norm(activeFilter.value)),
)
</script>

<style scoped>
/* ---- FEATURED HERO ---- */
.vid-hero {
  position: relative;
  display: block;
  width: 100%;
  aspect-ratio: 21 / 9;
  border-radius: 6px;
  overflow: hidden;
  background: var(--ink);
  cursor: pointer;
  margin-bottom: 56px;
  transition: transform .2s ease, box-shadow .2s ease;
}
.vid-hero:hover { transform: translateY(-3px); box-shadow: 0 20px 48px rgba(23,2,105,0.18); }
.vid-hero::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0,0,0,0.15) 0%, transparent 34%, rgba(0,0,0,0.35) 62%, rgba(0,0,0,0.82) 100%);
  z-index: 1;
}
.vid-hero-badge {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 3;
  font-family: var(--mono);
  font-size: 10.5px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  background: var(--accent);
  color: var(--primary-deep);
  padding: 6px 12px;
  border-radius: 999px;
}
.vid-hero .video-play { width: 78px; height: 78px; }
.vid-hero .video-play svg { width: 26px; height: 26px; }
.vid-hero-info {
  position: absolute;
  left: 0;
  bottom: 0;
  z-index: 2;
  padding: 40px;
  color: #fff;
  width: 100%;
}
.vid-hero-title {
  font-family: var(--serif);
  font-weight: 500;
  font-size: clamp(26px, 3.6vw, 46px);
  line-height: 1.06;
  letter-spacing: -0.02em;
  margin: 8px 0 10px;
  max-width: 22ch;
  text-wrap: balance;
}

/* ---- LIBRARY GRID ---- */
.video-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
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
.video-photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
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
.video:hover .video-play,
.vid-hero:hover .video-play { transform: translate(-50%, -50%) scale(1.08); background: var(--accent); }
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
.video-dur {
  font-family: var(--mono);
  font-size: 11px;
  color: rgba(255,255,255,0.7);
  letter-spacing: 0.06em;
}

.video-empty {
  text-align: center;
  color: var(--muted);
  font-size: 16px;
  padding: 48px 0 8px;
}

@media (max-width: 980px) {
  .vid-hero { aspect-ratio: 16 / 9; }
  .video-grid { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 600px) {
  .vid-hero { aspect-ratio: 4 / 3; }
  .vid-hero-info { padding: 24px; }
  .video-grid { grid-template-columns: 1fr; }
}
</style>
