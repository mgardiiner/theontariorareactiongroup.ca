<script setup>
import content from '~/content/site.json'

const route = useRoute()
const menuOpen = ref(false)
const toggleEl = ref(null)
const panelEl = ref(null)

useHead({
  bodyAttrs: {
    style: 'background:#FBF7EE;',
    class: computed(() => (menuOpen.value ? 'nav-open' : ''))
  }
})

function closeMenu () {
  if (!menuOpen.value) return
  menuOpen.value = false
  toggleEl.value?.focus()
}

// Close on navigation so tapping a link actually takes you somewhere.
watch(() => route.fullPath, () => { menuOpen.value = false })

// Move focus into the drawer when it opens.
watch(menuOpen, async (open) => {
  if (!open) return
  await nextTick()
  panelEl.value?.focus()
})

function onKeydown (e) {
  if (e.key === 'Escape') closeMenu()
}

let mq
function onBreakpoint (e) {
  if (!e.matches) menuOpen.value = false
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
  mq = window.matchMedia('(max-width: 980px)')
  mq.addEventListener('change', onBreakpoint)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  mq?.removeEventListener('change', onBreakpoint)
})
</script>

<template>
  <div>
    <header class="nav">
      <div class="wrap nav-inner">
        <NuxtLink to="/" class="brand">
          <img class="brand-mark" src="/logo.png" width="40" height="40" alt="Ontario Rare Action Group" />
          <div class="brand-name">Ontario Rare<span>Action Group</span></div>
        </NuxtLink>
        <nav class="nav-links" aria-label="Main navigation">
          <NuxtLink v-for="link in content.nav" :key="link.href" :to="link.href">{{ link.label }}</NuxtLink>
        </nav>
        <NuxtLink :to="content.cta.href" class="nav-cta">{{ content.cta.label }}</NuxtLink>
        <button
          ref="toggleEl"
          type="button"
          class="nav-toggle"
          :class="{ 'is-open': menuOpen }"
          :aria-expanded="menuOpen"
          :aria-label="menuOpen ? 'Close menu' : 'Open menu'"
          aria-controls="mobile-nav"
          @click="menuOpen = !menuOpen"
        >
          <span class="nav-toggle-bars" aria-hidden="true"><i /><i /><i /></span>
        </button>
      </div>
    </header>

    <!-- Fixed + clipped so the drawer's slide-out never widens the page. -->
    <div class="nav-overlay">
      <Transition name="scrim">
        <div v-if="menuOpen" class="nav-scrim" @click="closeMenu" />
      </Transition>

      <Transition name="drawer">
        <nav
          v-if="menuOpen"
          id="mobile-nav"
          ref="panelEl"
          class="mobile-nav"
          tabindex="-1"
          aria-label="Main navigation"
        >
          <div class="mobile-nav-head">
            <span class="mobile-nav-label">Menu</span>
            <button type="button" class="mobile-nav-close" aria-label="Close menu" @click="closeMenu">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                <path d="M1 1l16 16M17 1L1 17" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
              </svg>
            </button>
          </div>
          <ul class="mobile-nav-links">
            <li><NuxtLink to="/" @click="closeMenu">Home</NuxtLink></li>
            <li v-for="link in content.nav" :key="link.href">
              <NuxtLink :to="link.href" @click="closeMenu">{{ link.label }}</NuxtLink>
            </li>
          </ul>
          <NuxtLink :to="content.cta.href" class="mobile-nav-cta" @click="closeMenu">{{ content.cta.label }}</NuxtLink>
        </nav>
      </Transition>
    </div>

    <main>
      <slot />
    </main>

    <footer>
      <div class="wrap">
        <div class="foot-grid">
          <div>
            <div class="foot-brand-name">{{ content.footer.brandName }}</div>
            <p class="foot-tag">{{ content.footer.tagline }}</p>
          </div>
          <div class="foot-col">
            <h5>{{ content.footer.explore.heading }}</h5>
            <ul>
              <li v-for="link in content.footer.explore.links" :key="link.label"><NuxtLink :to="link.href">{{ link.label }}</NuxtLink></li>
            </ul>
          </div>
          <div class="foot-col">
            <h5>{{ content.footer.getInvolved.heading }}</h5>
            <ul>
              <li v-for="link in content.footer.getInvolved.links" :key="link.label"><NuxtLink :to="link.href">{{ link.label }}</NuxtLink></li>
            </ul>
          </div>
          <div class="foot-col">
            <h5>{{ content.footer.contact.heading }}</h5>
            <ul>
              <li><a :href="'mailto:' + content.footer.contact.email">{{ content.footer.contact.email }}</a></li>
              <li>{{ content.footer.contact.location }}</li>
            </ul>
            <ul v-if="content.footer.socials?.length" class="foot-socials" aria-label="Social media">
              <li v-for="s in content.footer.socials" :key="s.href">
                <a :href="s.href" target="_blank" rel="noopener noreferrer" :aria-label="s.label" :title="s.label">
                  <svg v-if="/facebook/i.test(s.label)" viewBox="0 0 24 24" aria-hidden="true"><path d="M13.5 22v-8h2.7l.4-3.2h-3.1V8.8c0-.9.3-1.6 1.6-1.6h1.7V4.4c-.3 0-1.3-.1-2.5-.1-2.5 0-4.1 1.5-4.1 4.2v2.3H7.4V14h2.8v8h3.3z"/></svg>
                  <svg v-else-if="/instagram/i.test(s.label)" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 7.3a4.7 4.7 0 1 0 0 9.4 4.7 4.7 0 0 0 0-9.4zm0 7.7a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm5.9-7.9a1.1 1.1 0 1 1-2.2 0 1.1 1.1 0 0 1 2.2 0zM12 2.2c-2.7 0-3 0-4 .1-1.1 0-1.8.2-2.4.5a4.9 4.9 0 0 0-1.8 1.1 4.9 4.9 0 0 0-1.1 1.8c-.3.6-.4 1.3-.5 2.4-.1 1-.1 1.3-.1 4s0 3 .1 4c0 1.1.2 1.8.5 2.4.2.7.6 1.2 1.1 1.8.6.5 1.1.9 1.8 1.1.6.3 1.3.4 2.4.5 1 .1 1.3.1 4 .1s3 0 4-.1c1.1 0 1.8-.2 2.4-.5a4.9 4.9 0 0 0 1.8-1.1 4.9 4.9 0 0 0 1.1-1.8c.3-.6.4-1.3.5-2.4.1-1 .1-1.3.1-4s0-3-.1-4c0-1.1-.2-1.8-.5-2.4a4.9 4.9 0 0 0-1.1-1.8 4.9 4.9 0 0 0-1.8-1.1c-.6-.3-1.3-.4-2.4-.5-1-.1-1.3-.1-4-.1zm0 1.7c2.7 0 3 0 4 .1 1 0 1.5.2 1.8.3.5.2.8.4 1.2.8.4.4.6.7.8 1.2.1.3.3.8.3 1.8.1 1 .1 1.3.1 4s0 3-.1 4c0 1-.2 1.5-.3 1.8-.2.5-.4.8-.8 1.2-.4.4-.7.6-1.2.8-.3.1-.8.3-1.8.3-1 .1-1.3.1-4 .1s-3 0-4-.1c-1 0-1.5-.2-1.8-.3a3.2 3.2 0 0 1-1.2-.8 3.2 3.2 0 0 1-.8-1.2c-.1-.3-.3-.8-.3-1.8-.1-1-.1-1.3-.1-4s0-3 .1-4c0-1 .2-1.5.3-1.8.2-.5.4-.8.8-1.2.4-.4.7-.6 1.2-.8.3-.1.8-.3 1.8-.3 1-.1 1.3-.1 4-.1z"/></svg>
                  <svg v-else-if="/linkedin/i.test(s.label)" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.4 2H3.6C2.7 2 2 2.7 2 3.6v16.8c0 .9.7 1.6 1.6 1.6h16.8c.9 0 1.6-.7 1.6-1.6V3.6c0-.9-.7-1.6-1.6-1.6zM8 19H5V9.5h3V19zM6.5 8.2a1.7 1.7 0 1 1 0-3.5 1.7 1.7 0 0 1 0 3.5zM19 19h-3v-4.6c0-1.1 0-2.5-1.5-2.5s-1.8 1.2-1.8 2.4V19h-3V9.5h2.9v1.3h.1c.4-.8 1.4-1.5 2.8-1.5 3 0 3.5 2 3.5 4.5V19z"/></svg>
                  <span v-else>{{ s.label }}</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div class="foot-bottom">
          <div>{{ content.footer.copyright }}</div>
          <div>{{ content.footer.credit }}</div>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
/* ---- NAV ---- */
.nav {
  position: sticky;
  top: 0;
  z-index: 50;
  background: var(--bg);
  border-bottom: 1px solid var(--line);
}
.nav-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 76px;
}
.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
}
.brand-mark {
  width: 40px;
  height: 40px;
  border-radius: 3px;
  flex-shrink: 0;
  display: block;
}
.brand-name {
  font-family: var(--serif);
  font-weight: 500;
  font-size: 19px;
  letter-spacing: -0.01em;
  line-height: 1.05;
  color: var(--ink);
}
.brand-name span {
  display: block;
  font-family: var(--sans);
  font-weight: 500;
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--muted);
  margin-top: 2px;
}
.nav-links {
  display: flex;
  align-items: center;
  gap: 28px;
  font-size: 14.5px;
  font-weight: 500;
  white-space: nowrap;
}
.nav-links a {
  color: var(--ink);
  position: relative;
  padding: 6px 0;
  transition: color .15s ease;
  text-decoration: none;
}
.nav-links a:hover { color: var(--primary); }
.nav-links a.router-link-active::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: -2px;
  height: 2px;
  background: var(--accent);
}
.nav-cta {
  background: var(--primary);
  color: #fff;
  padding: 10px 18px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 600;
  transition: background .15s ease, transform .15s ease;
  text-decoration: none;
  white-space: nowrap;
}
.nav-cta:hover { background: var(--primary-deep); transform: translateY(-1px); }

/* ---- MOBILE NAV TOGGLE ---- */
.nav-toggle {
  display: none;
  width: 44px;
  height: 44px;
  margin-right: -10px;
  border-radius: 8px;
  align-items: center;
  justify-content: center;
  color: var(--ink);
  flex-shrink: 0;
}
.nav-toggle:hover { background: rgba(30, 1, 119, 0.06); }
.nav-toggle:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }
.nav-toggle-bars {
  position: relative;
  display: block;
  width: 22px;
  height: 14px;
}
.nav-toggle-bars i {
  position: absolute;
  left: 0;
  width: 100%;
  height: 2px;
  border-radius: 2px;
  background: currentColor;
  transition: transform .22s ease, opacity .18s ease;
}
.nav-toggle-bars i:nth-child(1) { top: 0; }
.nav-toggle-bars i:nth-child(2) { top: 6px; }
.nav-toggle-bars i:nth-child(3) { top: 12px; }
.nav-toggle.is-open .nav-toggle-bars i:nth-child(1) { transform: translateY(6px) rotate(45deg); }
.nav-toggle.is-open .nav-toggle-bars i:nth-child(2) { opacity: 0; }
.nav-toggle.is-open .nav-toggle-bars i:nth-child(3) { transform: translateY(-6px) rotate(-45deg); }

/* ---- MOBILE NAV DRAWER ---- */
.nav-overlay {
  position: fixed;
  inset: 0;
  z-index: 90;
  overflow: hidden;
  pointer-events: none;
}
.nav-overlay > * { pointer-events: auto; }
.nav-scrim {
  position: absolute;
  inset: 0;
  z-index: 1;
  background: rgba(26, 22, 38, 0.45);
  backdrop-filter: blur(2px);
}
.mobile-nav {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 2;
  width: min(340px, 86vw);
  bottom: 0;
  background: var(--bg);
  border-left: 1px solid var(--line);
  box-shadow: -18px 0 48px rgba(26, 22, 38, 0.14);
  display: flex;
  flex-direction: column;
  padding: 20px 24px calc(28px + env(safe-area-inset-bottom));
  overflow-y: auto;
  overscroll-behavior: contain;
}
.mobile-nav:focus { outline: none; }
.mobile-nav-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 44px;
  margin-bottom: 12px;
}
.mobile-nav-label {
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--muted);
}
.mobile-nav-close {
  width: 40px;
  height: 40px;
  margin-right: -10px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--ink);
}
.mobile-nav-close:hover { background: rgba(30, 1, 119, 0.06); }
.mobile-nav-close:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }
.mobile-nav-links {
  list-style: none;
  margin: 0 0 28px;
  padding: 0;
  flex: 1;
}
.mobile-nav-links li + li { border-top: 1px solid var(--line); }
.mobile-nav-links a {
  display: block;
  padding: 15px 0;
  font-family: var(--serif);
  font-size: 22px;
  font-weight: 400;
  letter-spacing: -0.01em;
  color: var(--ink);
  transition: color .15s ease;
}
.mobile-nav-links a:hover { color: var(--primary); }
.mobile-nav-links a.router-link-exact-active { color: var(--primary); }
.mobile-nav-links a.router-link-exact-active::before {
  content: "";
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent);
  margin-right: 10px;
  vertical-align: middle;
}
.mobile-nav-cta {
  display: block;
  text-align: center;
  background: var(--primary);
  color: #fff;
  padding: 15px 20px;
  border-radius: 999px;
  font-size: 15px;
  font-weight: 600;
}
.mobile-nav-cta:hover { background: var(--primary-deep); }

.drawer-enter-active, .drawer-leave-active { transition: transform .26s cubic-bezier(.4, 0, .2, 1); }
.drawer-enter-from, .drawer-leave-to { transform: translateX(100%); }
.scrim-enter-active, .scrim-leave-active { transition: opacity .26s ease; }
.scrim-enter-from, .scrim-leave-to { opacity: 0; }

@media (prefers-reduced-motion: reduce) {
  .drawer-enter-active, .drawer-leave-active,
  .scrim-enter-active, .scrim-leave-active,
  .nav-toggle-bars i { transition: none; }
}

/* ---- FOOTER ---- */
footer {
  background: var(--primary-deep);
  color: rgba(255,255,255,0.75);
  padding: 72px 0 32px;
}
.foot-grid {
  display: grid;
  grid-template-columns: 1.3fr 1fr 1fr 1fr;
  gap: 48px;
  margin-bottom: 56px;
}
.foot-brand-name {
  font-family: var(--serif);
  color: #fff;
  font-size: 24px;
  font-weight: 500;
  letter-spacing: -0.01em;
  margin-bottom: 12px;
}
.foot-tag {
  font-size: 14px;
  line-height: 1.6;
  color: rgba(255,255,255,0.6);
  max-width: 32ch;
  margin: 0;
}
.foot-col h5 {
  font-family: var(--mono);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: var(--accent);
  margin: 0 0 18px;
  font-weight: 500;
}
.foot-col ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  font-size: 14px;
}
.foot-col a:hover { color: #fff; }
.foot-col li { transition: color .15s ease; }
.foot-col .foot-socials {
  flex-direction: row;
  gap: 8px;
  margin-top: 18px;
}
.foot-socials a {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid rgba(255,255,255,0.18);
  color: rgba(255,255,255,0.75);
  transition: color .15s ease, border-color .15s ease, background .15s ease;
}
.foot-socials a:hover {
  color: var(--primary-deep);
  background: var(--accent);
  border-color: var(--accent);
}
.foot-socials svg { width: 18px; height: 18px; fill: currentColor; }
.foot-bottom {
  border-top: 1px solid rgba(255,255,255,0.12);
  padding-top: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12.5px;
  color: rgba(255,255,255,0.5);
  font-family: var(--mono);
  letter-spacing: 0.05em;
  flex-wrap: wrap;
  gap: 8px;
}

@media (max-width: 980px) {
  .nav-links { display: none; }
  .nav-toggle { display: flex; }
  .nav-inner { gap: 16px; }
  /* Keeps the CTA grouped with the toggle instead of floating mid-header. */
  .nav-cta { margin-left: auto; }
  .foot-grid { grid-template-columns: 1fr 1fr; gap: 40px; }
}
@media (max-width: 600px) {
  .nav-inner { height: 64px; }
  .nav-cta { display: none; }
  .brand-mark { width: 34px; height: 34px; }
  .brand { gap: 10px; }
  .brand-name { font-size: 17px; }
  .brand-name span { font-size: 10px; letter-spacing: 0.1em; }
  footer { padding: 56px 0 28px; }
  .foot-grid { grid-template-columns: 1fr; gap: 32px; margin-bottom: 40px; }
  .foot-bottom { flex-direction: column; align-items: flex-start; }
}
</style>
