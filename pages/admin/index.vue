<template>
  <div>
    <div class="dash-head">
      <div>
        <h1>Edit the site</h1>
        <p class="sub">Pick a section to edit. Saving publishes to the live site in a couple of minutes.</p>
      </div>
      <div v-if="published" class="published">
        <span class="published-label">Last published</span>
        <a :href="published.url" target="_blank" rel="noopener">{{ publishedAgo }}</a>
      </div>
    </div>

    <p v-if="!canWrite" class="ro-banner">
      Heads up: your key is read-only, so <strong>saving won't work</strong>. Sign out and use a key with
      Contents: Read and write to make changes.
    </p>

    <div class="grid">
      <NuxtLink v-for="s in sections" :key="s.key" :to="`/admin/${s.key}`" class="card">
        <span class="card-title">{{ s.label }}</span>
        <span v-if="s.description" class="card-desc">{{ s.description }}</span>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
import { sections } from '~/admin/schema'
import { latestCommit } from '~/utils/adminGithub'

definePageMeta({ layout: 'admin', middleware: 'admin-auth' })

const { token, canWrite } = useAdminAuth()
const published = ref(null)

const publishedAgo = computed(() => {
  if (!published.value?.date) return ''
  const then = new Date(published.value.date).getTime()
  const mins = Math.round((Date.now() - then) / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins} min ago`
  const hrs = Math.round(mins / 60)
  if (hrs < 24) return `${hrs} hr ago`
  return `${Math.round(hrs / 24)} days ago`
})

onMounted(async () => {
  if (token.value) published.value = await latestCommit(token.value)
})
</script>

<style scoped>
.dash-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 24px;
}
h1 {
  font-family: var(--serif, Georgia, serif);
  font-size: 30px;
  margin: 0 0 6px;
  color: var(--primary-deep, #1c0f52);
}
.sub { margin: 0; color: #6a6a6a; font-size: 15px; }
.published { text-align: right; font-size: 12.5px; }
.published-label { display: block; color: #8a8a8a; text-transform: uppercase; letter-spacing: 0.06em; font-size: 11px; }
.published a { color: var(--primary, #5634c9); text-decoration: none; }
.ro-banner {
  background: #fff5e0;
  border: 1px solid #f0d9a8;
  color: #7a5600;
  padding: 12px 16px;
  border-radius: 7px;
  font-size: 14px;
  margin-bottom: 22px;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}
.card {
  display: block;
  background: #fff;
  border: 1px solid #e3ddd0;
  border-radius: 9px;
  padding: 20px;
  text-decoration: none;
  color: inherit;
  transition: border-color 0.15s, transform 0.15s;
}
.card:hover { border-color: var(--primary, #5634c9); transform: translateY(-2px); }
.card-title {
  display: block;
  font-family: var(--serif, Georgia, serif);
  font-size: 19px;
  font-weight: 600;
  color: var(--primary-deep, #1c0f52);
  margin-bottom: 6px;
}
.card-desc { display: block; font-size: 13.5px; color: #6a6a6a; line-height: 1.5; }
</style>
