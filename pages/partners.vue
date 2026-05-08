<template>
  <div>
    <Head>
      <Title>Affiliated Organizations · Ontario Rare Action Group</Title>
      <Meta name="description" content="Twenty-eight rare-disease organizations across Ontario partner with us on advocacy, research and patient support." />
    </Head>

    <header class="page-header">
      <div class="wrap">
        <div class="crumb">
          <NuxtLink to="/">Home</NuxtLink>
          <span>/</span>
          Affiliated Organizations
        </div>
        <h1 class="page-title">We do this work <em>together.</em></h1>
        <p class="page-lede">Twenty-eight rare-disease organizations across Ontario partner with us on advocacy, research and patient support. Each one brings deep expertise in their condition area — together, we represent more than a million Ontarians.</p>
      </div>
    </header>

    <section>
      <div class="wrap">
        <div v-for="group in partnerGroups" :key="group.label">
          <div class="group-label">{{ group.label }}</div>
          <div class="partners-grid">
            <article class="partner" v-for="p in group.partners" :key="p.abbr" tabindex="0">
              <div class="partner-logo">
                {{ p.abbr }}
                <small>{{ p.region }}</small>
              </div>
              <h4 class="partner-name">{{ p.name }}</h4>
              <p class="partner-focus">{{ p.focus }}</p>
              <span class="partner-link">Visit ↗</span>
            </article>
          </div>
        </div>
      </div>
    </section>

    <!-- BECOME A PARTNER -->
    <section class="become-bg">
      <div class="wrap">
        <div class="become-grid">
          <div>
            <h2 class="become-title">Run a rare-disease organization in Ontario? <em>Let's talk.</em></h2>
            <p>We host a quarterly leaders' roundtable, share advocacy infrastructure, and amplify member campaigns. Affiliation is free.</p>
          </div>
          <div>
            <NuxtLink to="/contact" class="btn btn-dark">
              Become an affiliated organization
              <svg class="btn-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'default' })

const partnerGroups = [
  {
    label: 'National umbrella organizations',
    partners: [
      { abbr: 'CORD', region: 'National', name: 'Canadian Organization for Rare Disorders', focus: 'National advocacy network and umbrella body for Canada\'s rare-disease patient groups.' },
      { abbr: 'RDC', region: 'National', name: 'Rare Disease Canada', focus: 'Federation of patient organizations advocating for the National Strategy implementation.' },
      { abbr: 'NORD', region: 'Cross-border', name: 'National Organization for Rare Disorders (US)', focus: 'Cross-border partner for research, registries and policy benchmarking.' },
      { abbr: 'RDF', region: 'Ontario', name: 'Rare Disease Foundation of Ontario', focus: 'Microgrant research funding for under-studied conditions affecting Ontario families.' },
    ],
  },
  {
    label: 'Condition-specific patient organizations',
    partners: [
      { abbr: 'SCS', region: 'National', name: 'Sickle Cell Society of Canada', focus: 'Patient support, education and equity advocacy for the sickle-cell community.' },
      { abbr: 'MDC', region: 'National', name: 'Muscular Dystrophy Canada', focus: 'Service, research and advocacy for over 160 neuromuscular conditions.' },
      { abbr: 'CCFF', region: 'National', name: 'Cystic Fibrosis Canada', focus: 'Funding research and advocating for affordable access to CF therapies.' },
      { abbr: 'EBC', region: 'National', name: 'Epidermolysis Bullosa Canada', focus: 'Family support and advocacy for those living with the "butterfly skin" condition.' },
      { abbr: 'HSC', region: 'National', name: 'Huntington Society of Canada', focus: 'Resources, research and advocacy for Huntington\'s disease families.' },
      { abbr: 'PWS', region: 'Ontario', name: 'Prader-Willi Syndrome Ontario', focus: 'Family connection, education and provincial advocacy for PWS households.' },
      { abbr: 'PHA', region: 'National', name: 'Pulmonary Hypertension Association Canada', focus: 'Patient support and treatment-access advocacy for the PH community.' },
      { abbr: 'SMA', region: 'National', name: 'Cure SMA Canada', focus: 'Family support and access advocacy for spinal muscular atrophy.' },
    ],
  },
  {
    label: 'Research, clinical & academic partners',
    partners: [
      { abbr: 'SK', region: 'Toronto', name: 'SickKids Centre for Genetic Medicine', focus: 'Clinical and research collaboration on pediatric rare-disease care.' },
      { abbr: 'CHEO', region: 'Ottawa', name: 'CHEO Research Institute', focus: 'Genetic research and pediatric rare-disease registries.' },
      { abbr: 'UHN', region: 'Toronto', name: 'UHN Adult Rare Disease Program', focus: 'Adult clinical care, transition planning and research enrolment.' },
      { abbr: '+13', region: 'Partners', name: 'Full network directory', focus: 'Thirteen additional partners across Ontario — by region and condition area.' },
    ],
  },
]
</script>

<style scoped>
.partners-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0;
  border-top: 1px solid var(--ink);
  border-left: 1px solid var(--line);
  margin-bottom: 0;
}
.partner {
  padding: 32px 24px;
  border-right: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
  display: flex;
  flex-direction: column;
  transition: background .15s ease;
  cursor: pointer;
  min-height: 240px;
}
.partner:hover { background: var(--bg); }
.partner-logo {
  height: 56px;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  font-family: var(--serif);
  font-size: 22px;
  font-weight: 500;
  color: var(--primary);
  letter-spacing: -0.01em;
}
.partner-logo small {
  font-family: var(--sans);
  font-size: 11px;
  font-weight: 500;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-left: 8px;
}
.partner-name {
  font-family: var(--serif);
  font-size: 17px;
  font-weight: 500;
  line-height: 1.25;
  margin: 0 0 8px;
}
.partner-focus {
  font-size: 13.5px;
  color: var(--muted);
  line-height: 1.5;
  margin: 0;
  flex: 1;
}
.partner-link {
  font-family: var(--mono);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--primary);
  margin-top: 18px;
  display: inline-flex;
  gap: 6px;
  align-items: center;
}

.group-label {
  font-family: var(--mono);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: var(--muted);
  padding: 32px 0 16px;
  border-top: 1px solid var(--ink);
  margin-top: 48px;
}
.group-label:first-of-type { margin-top: 0; }

.become-bg { background: var(--accent); color: var(--primary-deep); padding: 96px 0; }
.become-grid {
  display: grid;
  grid-template-columns: 1.3fr 1fr;
  gap: 56px;
  align-items: center;
}
.become-title {
  font-family: var(--serif);
  font-size: clamp(34px, 4.5vw, 52px);
  font-weight: 400;
  line-height: 1.05;
  letter-spacing: -0.02em;
  margin: 0 0 16px;
}
.become-title em { font-style: italic; }
.become-bg p { font-size: 17px; max-width: 50ch; margin: 0; opacity: 0.78; }

@media (max-width: 980px) {
  .partners-grid { grid-template-columns: 1fr 1fr; }
  .become-grid { grid-template-columns: 1fr; }
}
@media (max-width: 600px) {
  .partners-grid { grid-template-columns: 1fr; }
}
</style>
