export default defineNuxtRouteMiddleware((to) => {
  const path = to.path.replace(/\/$/, '') || '/'
  const allowed = ['/coming-soon', '/preview', '/logout']
  if (allowed.includes(path)) return

  const preview = useCookie('preview')
  if (!preview.value) {
    return navigateTo('/coming-soon', { redirectCode: 302 })
  }
})
