<script setup>
useHead({ bodyAttrs: { style: 'background:#FBF7EE;' } })
</script>

<template>
  <div>
    <header class="nav">
      <div class="wrap nav-inner">
        <NuxtLink to="/" class="brand">
          <div class="brand-mark">R</div>
          <div class="brand-name">Ontario Rare<span>Action Group</span></div>
        </NuxtLink>
        <nav class="nav-links" aria-label="Main navigation">
          <NuxtLink to="/advocacy">Advocacy</NuxtLink>
          <NuxtLink to="/challenges">Challenges</NuxtLink>
          <NuxtLink to="/stories">Stories</NuxtLink>
          <NuxtLink to="/events">Events</NuxtLink>
          <NuxtLink to="/videos">Videos</NuxtLink>
          <NuxtLink to="/partners">Partners</NuxtLink>
          <NuxtLink to="/contact">Contact</NuxtLink>
        </nav>
        <NuxtLink to="/contact" class="nav-cta">Join the movement</NuxtLink>
      </div>
    </header>

    <main>
      <slot />
    </main>

    <footer>
      <div class="wrap">
        <div class="foot-grid">
          <div>
            <div class="foot-brand-name">Ontario Rare Action Group</div>
            <p class="foot-tag">A patient-led, registered Ontario non-profit advocating for the 1.3 million Ontarians living with a rare disease.</p>
          </div>
          <div class="foot-col">
            <h5>Explore</h5>
            <ul>
              <li><NuxtLink to="/advocacy">Advocacy</NuxtLink></li>
              <li><NuxtLink to="/challenges">Challenges</NuxtLink></li>
              <li><NuxtLink to="/stories">Patient stories</NuxtLink></li>
              <li><NuxtLink to="/events">Events</NuxtLink></li>
              <li><NuxtLink to="/videos">Videos</NuxtLink></li>
              <li><NuxtLink to="/partners">Partners</NuxtLink></li>
            </ul>
          </div>
          <div class="foot-col">
            <h5>Get involved</h5>
            <ul>
              <li><NuxtLink to="/contact">Volunteer</NuxtLink></li>
              <li><NuxtLink to="/contact">Donate</NuxtLink></li>
              <li><NuxtLink to="/contact">Share your story</NuxtLink></li>
              <li><NuxtLink to="/contact">Become a partner</NuxtLink></li>
            </ul>
          </div>
          <div class="foot-col">
            <h5>Contact</h5>
            <ul>
              <li><a href="mailto:contact@ontariorare.ca">contact@ontariorare.ca</a></li>
              <li>Toronto, ON</li>
            </ul>
          </div>
        </div>
        <div class="foot-bottom">
          <div>© 2026 The Ontario Rare Action Group · Non-Profit</div>
          <div>Site by the rare community, for the rare community.</div>
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
  width: 38px;
  height: 38px;
  background: var(--primary);
  color: var(--accent);
  display: grid;
  place-items: center;
  font-family: var(--serif);
  font-weight: 600;
  font-size: 22px;
  border-radius: 2px;
  flex-shrink: 0;
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
