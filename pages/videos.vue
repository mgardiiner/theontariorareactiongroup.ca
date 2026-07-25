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
          <article class="video feature v1" tabindex="0" role="button" :aria-label="content.featured.ariaLabel">
            <div class="video-thumb"></div>
            <div class="video-play" aria-hidden="true">
              <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            </div>
            <div class="video-info">
              <div class="video-cat">{{ content.featured.cat }}</div>
              <h4 class="video-title">{{ content.featured.title }}</h4>
              <div class="video-dur">{{ content.featured.dur }}</div>
            </div>
          </article>

          <article class="video v2" v-for="v in content.sideVideos" :key="v.title" tabindex="0" role="button" :aria-label="`${v.cat}: ${v.title}, ${v.dur}`">
            <div class="video-thumb"></div>
            <div class="video-play" aria-hidden="true">
              <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            </div>
            <div class="video-info">
              <div class="video-cat">{{ v.cat }}</div>
              <h4 class="video-title">{{ v.title }}</h4>
              <div class="video-dur">{{ v.dur }}</div>
            </div>
          </article>
        </div>

        <div class="more-grid">
          <article class="video" :class="v.cls" v-for="v in content.moreVideos" :key="v.title" tabindex="0" role="button" :aria-label="`${v.cat}: ${v.title}, ${v.dur}`">
            <div class="video-thumb"></div>
            <div class="video-play" aria-hidden="true">
              <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            </div>
            <div class="video-info">
              <div class="video-cat">{{ v.cat }}</div>
              <h4 class="video-title">{{ v.title }}</h4>
              <div class="video-dur">{{ v.dur }}</div>
            </div>
          </article>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import content from '~/content/videos.json'

definePageMeta({ layout: 'default' })

const activeFilter = ref('All videos')
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
