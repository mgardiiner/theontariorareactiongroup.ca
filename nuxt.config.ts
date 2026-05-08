export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  ssr: process.env.NODE_ENV !== 'development' ? false : undefined,
  nitro: { preset: process.env.NODE_ENV !== 'development' ? 'github-pages' : undefined },
  runtimeConfig: {
    public: {
      previewPassword: process.env.PREVIEW_PASSWORD ?? '',
    },
  },
  css: ['~/assets/css/main.css'],
  app: {
    baseURL: '/',
    head: {
      htmlAttrs: { lang: 'en' },
      bodyAttrs: { style: 'background:#FBF7EE;' },
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
      ],
    },
  },
})
