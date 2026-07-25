<template>
  <div class="logout-note">Signing you out…</div>
</template>

<script setup>
// A real logout URL: clears the session (the unlocked key) and returns to sign-in.
// The saved password/vault is left intact so you can sign back in with the password.
definePageMeta({ layout: false })

const { logout } = useAdminAuth()
const router = useRouter()

onMounted(() => {
  logout()
  router.replace('/admin/login')
})
</script>

<style scoped>
.logout-note {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary, #1e0177);
  color: #fff;
  font-family: var(--sans, sans-serif);
  font-size: 15px;
}
</style>
