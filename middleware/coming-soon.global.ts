export default defineNuxtRouteMiddleware((to) => {
  const path = to.path.replace(/\/$/, '') || '/'
  const allowed = ['/coming-soon', '/preview', '/logout']
  if (allowed.includes(path)) return

  // The admin panel has its own key-based gate; never send it to the coming-soon page.
  if (path === '/admin' || path.startsWith('/admin/')) return

  const preview = useCookie('preview')
  if (!preview.value) {
    return navigateTo('/coming-soon', { redirectCode: 302 })
  }
})
