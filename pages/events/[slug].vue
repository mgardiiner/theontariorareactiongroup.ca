<template>
  <div v-if="event">
    <Head>
      <Title>{{ event.title }} · Events · Ontario Rare Action Group</Title>
      <Meta name="description" :content="metaDescription" />
    </Head>

    <header class="page-header">
      <div class="wrap">
        <div class="crumb">
          <NuxtLink to="/">Home</NuxtLink>
          <span>/</span>
          <NuxtLink to="/events">Events</NuxtLink>
          <span>/</span>
          {{ event.title }}
        </div>
        <h1 class="page-title">{{ event.title }}</h1>
        <p class="page-lede">
          {{ event.date }}<template v-if="event.location"> · {{ event.location }}</template>
        </p>
      </div>
    </header>

    <section class="recap">
      <div class="wrap wrap-narrow">
        <figure class="recap-hero" v-if="event.image">
          <img :src="event.image" :alt="event.title" />
        </figure>

        <div class="recap-body">
          <p v-for="(para, i) in paragraphs" :key="i">{{ para }}</p>
        </div>

        <!-- Photos from the day. Captions are optional. -->
        <div class="gallery" v-if="photos.length">
          <figure class="shot" v-for="(photo, i) in photos" :key="i">
            <img :src="photo.src" :alt="photo.caption || event.title" loading="lazy" />
            <figcaption v-if="photo.caption">{{ photo.caption }}</figcaption>
          </figure>
        </div>

        <NuxtLink to="/events" class="back">← All events</NuxtLink>
      </div>
    </section>
  </div>

  <div v-else class="wrap not-found">
    <p>Event not found. <NuxtLink to="/events">Back to events →</NuxtLink></p>
  </div>
</template>

<script setup>
import content from '~/content/events.json'

definePageMeta({ layout: 'default' })

const route = useRoute()
const event = content.past.find(e => e.slug === route.params.slug) || null

const paragraphs = computed(() =>
  (event?.body || '').split('\n\n').map(p => p.trim()).filter(Boolean)
)

// Photos may be plain paths or { src, caption } objects — accept either.
const photos = computed(() =>
  (event?.photos || []).map(p => (typeof p === 'string' ? { src: p, caption: '' } : p)).filter(p => p.src)
)

const metaDescription = computed(
  () => paragraphs.value[0] || `${event?.title} — ${event?.date}`
)
</script>

<style scoped>
.recap { padding: 88px 0; }
.recap-hero { margin: 0 0 48px; }
.recap-hero img {
  width: 100%;
  height: auto;
  border-radius: 6px;
  display: block;
  border: 1px solid var(--line);
}
.recap-body p {
  font-size: 18px;
  line-height: 1.7;
  color: var(--ink);
  margin: 0 0 24px;
  text-wrap: pretty;
}
.recap-body p:last-child { margin-bottom: 0; }

.gallery {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-top: 56px;
}
.shot { margin: 0; }
.shot img {
  width: 100%;
  height: 100%;
  aspect-ratio: 3/2;
  object-fit: cover;
  border-radius: 4px;
  display: block;
  border: 1px solid var(--line);
}
.shot figcaption {
  font-family: var(--mono);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--muted);
  margin-top: 10px;
}

.back {
  display: inline-block;
  margin-top: 56px;
  font-family: var(--mono);
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--primary);
  text-decoration: none;
}
.back:hover { text-decoration: underline; }

.not-found { padding: 120px 0; text-align: center; }

@media (max-width: 600px) {
  .recap { padding: 56px 0; }
  .gallery { grid-template-columns: 1fr; }
}
</style>
