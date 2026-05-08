export default defineNuxtRouteMiddleware((to) => {
  const allowed = ['/coming-soon', '/preview', '/logout']
  if (allowed.includes(to.path)) return

  const preview = useCookie('preview')
  if (!preview.value) {
    return navigateTo('/coming-soon', { redirectCode: 302 })
  }
})
