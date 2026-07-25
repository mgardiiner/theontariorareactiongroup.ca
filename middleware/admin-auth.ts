// Client-side gate for protected /admin pages. The site is statically generated,
// so auth lives entirely in the browser (localStorage). On the server we do nothing.
export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server) return

  const hasKey = Boolean(localStorage.getItem('ontariorare_admin_token'))
  if (!hasKey && to.path !== '/admin/login') {
    return navigateTo('/admin/login')
  }
})
