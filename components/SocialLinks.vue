<template>
  <ul v-if="links?.length" class="social-links" aria-label="Social media">
    <li v-for="s in links" :key="s.href">
      <a :href="s.href" target="_blank" rel="noopener noreferrer" :aria-label="s.label" :title="s.label">
        <svg v-if="/facebook/i.test(s.label)" viewBox="0 0 24 24" aria-hidden="true"><path d="M13.5 22v-8h2.7l.4-3.2h-3.1V8.8c0-.9.3-1.6 1.6-1.6h1.7V4.4c-.3 0-1.3-.1-2.5-.1-2.5 0-4.1 1.5-4.1 4.2v2.3H7.4V14h2.8v8h3.3z"/></svg>
        <svg v-else-if="/instagram/i.test(s.label)" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 7.3a4.7 4.7 0 1 0 0 9.4 4.7 4.7 0 0 0 0-9.4zm0 7.7a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm5.9-7.9a1.1 1.1 0 1 1-2.2 0 1.1 1.1 0 0 1 2.2 0zM12 2.2c-2.7 0-3 0-4 .1-1.1 0-1.8.2-2.4.5a4.9 4.9 0 0 0-1.8 1.1 4.9 4.9 0 0 0-1.1 1.8c-.3.6-.4 1.3-.5 2.4-.1 1-.1 1.3-.1 4s0 3 .1 4c0 1.1.2 1.8.5 2.4.2.7.6 1.2 1.1 1.8.6.5 1.1.9 1.8 1.1.6.3 1.3.4 2.4.5 1 .1 1.3.1 4 .1s3 0 4-.1c1.1 0 1.8-.2 2.4-.5a4.9 4.9 0 0 0 1.8-1.1 4.9 4.9 0 0 0 1.1-1.8c.3-.6.4-1.3.5-2.4.1-1 .1-1.3.1-4s0-3-.1-4c0-1.1-.2-1.8-.5-2.4a4.9 4.9 0 0 0-1.1-1.8 4.9 4.9 0 0 0-1.8-1.1c-.6-.3-1.3-.4-2.4-.5-1-.1-1.3-.1-4-.1zm0 1.7c2.7 0 3 0 4 .1 1 0 1.5.2 1.8.3.5.2.8.4 1.2.8.4.4.6.7.8 1.2.1.3.3.8.3 1.8.1 1 .1 1.3.1 4s0 3-.1 4c0 1-.2 1.5-.3 1.8-.2.5-.4.8-.8 1.2-.4.4-.7.6-1.2.8-.3.1-.8.3-1.8.3-1 .1-1.3.1-4 .1s-3 0-4-.1c-1 0-1.5-.2-1.8-.3a3.2 3.2 0 0 1-1.2-.8 3.2 3.2 0 0 1-.8-1.2c-.1-.3-.3-.8-.3-1.8-.1-1-.1-1.3-.1-4s0-3 .1-4c0-1 .2-1.5.3-1.8.2-.5.4-.8.8-1.2.4-.4.7-.6 1.2-.8.3-.1.8-.3 1.8-.3 1-.1 1.3-.1 4-.1z"/></svg>
        <svg v-else-if="/linkedin/i.test(s.label)" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.4 2H3.6C2.7 2 2 2.7 2 3.6v16.8c0 .9.7 1.6 1.6 1.6h16.8c.9 0 1.6-.7 1.6-1.6V3.6c0-.9-.7-1.6-1.6-1.6zM8 19H5V9.5h3V19zM6.5 8.2a1.7 1.7 0 1 1 0-3.5 1.7 1.7 0 0 1 0 3.5zM19 19h-3v-4.6c0-1.1 0-2.5-1.5-2.5s-1.8 1.2-1.8 2.4V19h-3V9.5h2.9v1.3h.1c.4-.8 1.4-1.5 2.8-1.5 3 0 3.5 2 3.5 4.5V19z"/></svg>
        <span v-else>{{ s.label }}</span>
      </a>
    </li>
  </ul>
</template>

<script setup lang="ts">
// Round icon buttons for the org's social profiles. Facebook, Instagram and
// LinkedIn get an icon; any other network name falls back to its text label.
// Sized/coloured for a dark brand background (hero, footer).
defineProps<{ links?: { label: string; href: string }[] }>()
</script>

<style scoped>
.social-links {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.social-links a {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 36px;
  height: 36px;
  padding: 0 4px;
  border-radius: 18px;
  border: 1px solid rgba(255,255,255,0.18);
  color: rgba(255,255,255,0.75);
  font-size: 13px;
  text-decoration: none;
  transition: color .15s ease, border-color .15s ease, background .15s ease;
}
.social-links a:hover {
  color: var(--primary-deep);
  background: var(--accent);
  border-color: var(--accent);
}
.social-links span { padding: 0 8px; }
.social-links svg { width: 18px; height: 18px; fill: currentColor; }
</style>
