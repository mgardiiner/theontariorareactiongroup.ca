// Client-side gate for protected /admin pages. The site is statically generated,
// so auth lives entirely in the browser (localStorage). On the server we do nothing.
export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) return

  // On localhost, sign in automatically from .env instead of showing the form.
  if (import.meta.dev && !localStorage.getItem('ontariorare_admin_token')) {
    await useAdminAuth().devAutoLogin()
  }

  const hasKey = Boolean(localStorage.getItem('ontariorare_admin_token'))
  if (!hasKey && to.path !== '/admin/login') {
    return navigateTo('/admin/login')
  }
})
