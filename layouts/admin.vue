<template>
  <div class="admin-shell">
    <header class="admin-bar">
      <div class="admin-bar-inner">
        <NuxtLink to="/admin" class="admin-brand">
          <img src="/logo.png" width="30" height="30" alt="" />
          <span>Ontario Rare · <strong>Admin</strong></span>
        </NuxtLink>
        <nav v-if="isAuthenticated" class="admin-nav">
          <NuxtLink to="/admin">Sections</NuxtLink>
          <a href="/" target="_blank" rel="noopener">View site ↗</a>
          <button type="button" class="admin-logout" @click="handleLogout">Log out</button>
        </nav>
      </div>
    </header>
    <main class="admin-main">
      <slot />
    </main>
  </div>
</template>

<script setup>
const { isAuthenticated, logout } = useAdminAuth()
const router = useRouter()

function handleLogout() {
  logout()
  router.push('/admin/login')
}
</script>

<style scoped>
.admin-shell {
  min-height: 100vh;
  background: #f4efe4;
  color: var(--ink);
  font-family: var(--sans, 'DM Sans', system-ui, sans-serif);
}
.admin-bar {
  background: var(--primary-deep, #1c0f52);
  color: #fff;
  position: sticky;
  top: 0;
  z-index: 10;
}
.admin-bar-inner {
  max-width: 1040px;
  margin: 0 auto;
  padding: 14px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
.admin-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #fff;
  text-decoration: none;
  font-family: var(--mono, monospace);
  font-size: 13px;
  letter-spacing: 0.02em;
}
.admin-brand img { border-radius: 5px; }
.admin-brand strong { font-weight: 600; }
.admin-nav {
  display: flex;
  align-items: center;
  gap: 20px;
  font-size: 14px;
}
.admin-nav a {
  color: rgba(255, 255, 255, 0.82);
  text-decoration: none;
}
.admin-nav a:hover { color: #fff; }
.admin-logout {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.35);
  color: #fff;
  padding: 6px 14px;
  border-radius: 4px;
  font: inherit;
  font-size: 13px;
  cursor: pointer;
}
.admin-logout:hover { background: rgba(255, 255, 255, 0.12); }
.admin-main {
  max-width: 1040px;
  margin: 0 auto;
  padding: 32px 24px 80px;
}
</style>
