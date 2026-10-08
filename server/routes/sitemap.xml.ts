// Prerendered at build time (see nitro.prerender.routes in nuxt.config.ts),
// so GitHub Pages serves it as a static file.
import stories from '../../content/stories.json'
import events from '../../content/events.json'

const SITE = 'https://ontariorare.ca'

const staticPaths = [
  '/',
  '/about',
  '/advocacy',
  '/challenges',
  '/stories',
  '/events',
  '/media',
  '/partners',
  '/contact',
]

export default defineEventHandler((event) => {
  const storyPaths = (stories.stories ?? [])
    .map((s: { slug?: string }) => s.slug)
    .filter(Boolean)
    .map((slug: string) => `/stories/${slug}`)

  const eventPaths = [...(events.upcoming ?? []), ...(events.past ?? [])]
    .map((e: { slug?: string }) => e.slug)
    .filter(Boolean)
    .map((slug: string) => `/events/${slug}`)

  const urls = [...staticPaths, ...storyPaths, ...eventPaths]
    .map((path) => `  <url><loc>${SITE}${path}</loc></url>`)
    .join('\n')

  setHeader(event, 'content-type', 'application/xml; charset=utf-8')
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`
})
