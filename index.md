---
title: Overview
layout: home
nav_order: 1
description: A strategic vision and practical architecture for AI-assisted quality engineering and application security in regulated financial services.
permalink: /
has_toc: false
---

<section class="home-hero" aria-labelledby="home-title">
  <p class="eyebrow">Industry research / September 2026</p>
  <h1 id="home-title">Quality engineering<br>for the AI era.</h1>
  <p class="hero-lead">A strategic vision and assurance architecture for AI-assisted delivery, AI applications and the teams accountable for quality.</p>
  <div class="hero-actions"><a class="btn btn-primary" href="{{ "/docs/industry/" | relative_url }}">Explore the research →</a><a class="text-link" href="#briefings">View audience briefings →</a></div>
  <img class="industry-cover" src="{{ "/assets/images/industry/quality-studio.webp" | relative_url }}" alt="Conceptual quality engineering studio connecting specification, AI generation, testing, human review and release" width="1536" height="1024">
  <div class="research-edition"><span>{{ site.data.industry_sources | size }} curated sources</span><span>Gartner · McKinsey · DORA · primary studies</span><span>Reviewed 6 September 2026</span></div>
</section>

<section class="home-section" aria-labelledby="fintech-case-title">
  <p class="eyebrow">New / Fintech case study / v{{ site.data.release.fintech_edition }}</p>
  <h2 id="fintech-case-title">75 QA staff. One payment release.</h2>
  <p>A fictional fintech customer retries a payment after a timeout. Follow the failure, inspect the shared QA platform and explore AI assistance at all eight workflow stages. Change the delivery-maturity assumptions to see the capacity model respond.</p>
  <div class="hero-actions"><a class="btn btn-primary" href="{{ '/case-studies/fintech/' | relative_url }}">Explore the fintech story →</a><a class="text-link" href="{{ '/case-studies/fintech/' | relative_url }}#briefings">30 new audience slides →</a></div>
</section>

<section class="home-section" id="capabilities" aria-labelledby="capabilities-title">
  <div class="section-heading"><div><p class="eyebrow">The expanded quality mandate</p><h2 id="capabilities-title">AI for QE. QE for AI.</h2></div><a class="text-link" href="{{ '/docs/industry/library/' | relative_url }}">Browse the document library →</a></div>
  {% include industry/capabilities.html %}
</section>

<section class="home-section explorer-section" id="explore" aria-labelledby="explore-title">
  <div class="section-heading"><div><h2 id="explore-title">Explore the assurance system.</h2></div><p>Inspect the architecture. Test the economics.<br>Understand the uncertainty.</p></div>
  {% include explorers/workbench.html %}
  <a class="architecture-demo-feature" href="{{ '/demos/architecture/' | relative_url }}"><img src="{{ '/assets/images/architecture-3d-poster.jpg' | relative_url }}?v={{ site.data.release.version }}" width="1920" height="1080" loading="lazy" alt="Three-dimensional assurance platform with a gateway, verification chambers and independent release authority"><span><span class="eyebrow">Architecture in motion</span><strong>Explore the platform in 3D ↗</strong><span>Orbit the model. Follow a candidate. See where an unsafe action or failed quality check stops.</span><small>Four scenarios · interactive demo + short film</small></span></a>
</section>

<section class="home-section" id="briefings" aria-labelledby="briefings-title">
  <div class="section-heading"><div><p class="eyebrow">Start with your perspective</p><h2 id="briefings-title">Visual briefings for<br>strategy and architecture.</h2></div><p>Strategy for executive leaders.<br>Architecture for the teams who deliver it.</p></div>
  {% include briefing-embed.html %}
  <p>New to the terminology? <a href="{{ '/dictionary/' | relative_url }}">Open the AI × QE dictionary →</a> Plain-language definitions, examples and a guide to the architecture components.</p>
</section>

<section class="home-section" aria-labelledby="research-title">
  <div class="section-heading"><div><p class="eyebrow">Go beneath the slides</p><h2 id="research-title">A research base you can inspect.</h2></div><a class="text-link" href="{{ '/docs/research-log/' | relative_url }}">Verification log →</a></div>
  <div class="resource-grid">
    <a class="resource-link" href="{{ '/docs/evidence/reading-the-evidence/' | relative_url }}"><span class="resource-number">01 / Evidence</span><h3 class="no_anchor">What the research supports <span aria-hidden="true">↗</span></h3><p>Read the findings, their methods and the limits of each claim.</p></a>
    <a class="resource-link" href="{{ '/docs/economics/savings-model/' | relative_url }}"><span class="resource-number">02 / Economics</span><h3 class="no_anchor">How capacity becomes value <span aria-hidden="true">↗</span></h3><p>Separate task efficiency, released capacity and recognized savings.</p></a>
    <a class="resource-link" href="{{ '/docs/governance/control-mapping/' | relative_url }}"><span class="resource-number">03 / Governance</span><h3 class="no_anchor">Controls built into the workflow <span aria-hidden="true">↗</span></h3><p>Connect pilot controls to the Canadian banking supervisory context.</p></a>
    <a class="resource-link" href="{{ '/docs/method/phased-pilot/' | relative_url }}"><span class="resource-number">04 / Delivery</span><h3 class="no_anchor">A measured path to production <span aria-hidden="true">↗</span></h3><p>Scope, baseline, pilot and validate each capability before scale.</p></a>
  </div>
</section>

<aside class="evidence-position" aria-labelledby="position-title"><p class="eyebrow">The working position</p><h2 id="position-title">External evidence informs the opportunity.<br>Local proof earns the right to scale.</h2><p>Selected tasks show gains. Outcomes vary with the work, the team and the review burden. A bank-wide savings claim needs bank-specific measurement and a Finance-approved capture mechanism.</p><a class="text-link" href="{{ '/docs/principles/' | relative_url }}">Read the operating principles →</a></aside>
