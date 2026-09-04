export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  ssr: process.env.NODE_ENV !== 'development' ? false : undefined,
  nitro: { preset: process.env.NODE_ENV !== 'development' ? 'github-pages' : undefined },
  runtimeConfig: {
    public: {
      // Dev-only convenience: unlocks the admin vault automatically on localhost.
      // Baked in as '' for any non-development build, so it never ships.
      devAdminPassword:
        process.env.NODE_ENV === 'development' ? (process.env.ADMIN_PASSWORD ?? '') : '',
    },
  },
  css: ['~/assets/css/main.css'],
  app: {
    baseURL: '/',
    head: {
      htmlAttrs: { lang: 'en' },
      bodyAttrs: { style: 'background:#FBF7EE;' },
      meta: [
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'Ontario Rare Action Group' },
        { property: 'og:title', content: 'No one should face rare alone.' },
        {
          property: 'og:description',
          content:
            'A coalition of patients, caregivers and clinicians building a more humane rare-disease system for Ontario.',
        },
        { property: 'og:url', content: 'https://ontariorare.ca' },
        { property: 'og:image', content: 'https://ontariorare.ca/og-image.png' },
        { property: 'og:image:type', content: 'image/png' },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        {
          property: 'og:image:alt',
          content:
            'Ontario Rare Action Group — No one should face rare alone.',
        },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:image', content: 'https://ontariorare.ca/og-image.png' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
      ],
    },
  },
})
