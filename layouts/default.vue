<script setup>
import content from '~/content/site.json'

useHead({ bodyAttrs: { style: 'background:#FBF7EE;' } })
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
      </div>
    </header>

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
  .foot-grid { grid-template-columns: 1fr 1fr; gap: 40px; }
}
@media (max-width: 600px) {
  .foot-grid { grid-template-columns: 1fr; }
  .foot-bottom { flex-direction: column; align-items: flex-start; }
}
</style>
