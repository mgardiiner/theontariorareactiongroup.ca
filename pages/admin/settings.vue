<template>
  <div class="settings">
    <button type="button" class="back-link" @click="goHome">← Back to the editor</button>

    <div class="settings-head">
      <h1 class="settings-title">Advanced settings — full editor</h1>
      <p class="settings-note">
        The four tasks and the site search cover almost everything you'll need. This
        is the full field-by-field editor for the rest — page headings, the home
        hero, advocacy goals, and the contact form's delivery key. Open a section to
        edit anything the guided tasks don't reach; each section saves on its own.
      </p>
    </div>

    <div class="settings-grid">
      <NuxtLink v-for="s in sections" :key="s.key" :to="`/admin/${s.key}`" class="settings-card">
        <span class="settings-card-title">{{ s.label }}</span>
        <span v-if="s.description" class="settings-card-desc">{{ s.description }}</span>
      </NuxtLink>
    </div>

    <div class="settings-foot">
      <button type="button" class="signout" @click="handleLogout">Sign out</button>
    </div>
  </div>
</template>

<script setup>
import { sections } from '~/admin/schema'

definePageMeta({ layout: 'admin', middleware: 'admin-auth' })

const router = useRouter()
const { logout } = useAdminAuth()
const { screen } = useAdminUi()

function goHome() {
  screen.value = 'home'
  router.push('/admin')
}

function handleLogout() {
  logout()
  router.push('/admin/login')
}
</script>

<style scoped>
.settings {
  max-width: 900px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 26px;
}
.back-link {
  align-self: flex-start;
  background: none;
  border: none;
  padding: 0;
  font-size: 14px;
  color: var(--muted);
  cursor: pointer;
}
.back-link:hover {
  color: var(--primary);
}
.settings-head {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.settings-title {
  margin: 0;
  font-family: var(--serif);
  font-size: 34px;
  font-weight: 500;
  color: var(--primary-deep);
  line-height: 1.1;
}
.settings-note {
  margin: 0;
  font-size: 15.5px;
  line-height: 1.6;
  color: var(--muted);
  max-width: 66ch;
}
.settings-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.settings-card {
  display: flex;
  flex-direction: column;
  gap: 6px;
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 22px 24px;
  text-decoration: none;
  color: inherit;
  transition: border-color 0.15s ease, transform 0.15s ease;
}
.settings-card:hover {
  border-color: var(--primary);
  transform: translateY(-2px);
}
.settings-card-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--primary-deep);
}
.settings-card-desc {
  font-size: 14px;
  line-height: 1.5;
  color: var(--muted);
}
.settings-foot {
  padding-top: 8px;
}
.signout {
  background: none;
  border: 1px solid #d8cfbb;
  border-radius: 999px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  color: var(--ink);
  cursor: pointer;
}
.signout:hover {
  border-color: var(--primary);
  color: var(--primary);
}

@media (max-width: 900px) {
  .settings-grid {
    grid-template-columns: 1fr;
  }
  .settings-title {
    font-size: 28px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .settings-card:hover {
    transform: none;
  }
}
</style>
