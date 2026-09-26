// Cloudflare Web Analytics: cookie-free visit counts, including the router's page changes.
// The token isn't secret; it ends up in the page either way.
const TOKEN = '8a30d3632dc847dea68d5d341b65c6ad'

// Leave out local dev, the admin pages, and any browser signed in to admin, so the owner's own
// visits don't count.
export default defineNuxtPlugin(() => {
  if (import.meta.dev || location.pathname.startsWith('/admin')) return
  if (localStorage.getItem('ontariorare_admin_token')) return

  const script = document.createElement('script')
  script.src = 'https://static.cloudflareinsights.com/beacon.min.js'
  script.dataset.cfBeacon = JSON.stringify({ token: TOKEN, spa: true })
  document.head.append(script)
})
