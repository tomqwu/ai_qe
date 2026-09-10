---
title: Presentation room
nav_order: 1.5
description: Choose a strategic vision or architecture briefing, lead a fintech conversation and open the supporting diagrams and evidence.
permalink: /briefings/
has_toc: false
---

<div class="room-intro"><p class="eyebrow">Ready for the conversation</p><h1>Choose the audience.<br>Open the right story.</h1><p>Start with the fintech case for a concrete discussion. Use the industry briefings when the conversation calls for a wider strategic vision or a deeper architecture.</p></div>

<p><strong>Listen to any briefing.</strong> Open a deck and select <strong>Play narration</strong>. Audio narration guides you through each slide with English subtitles; the presentation holds for two seconds after the audio finishes, then advances. Pause for discussion, replay a slide or open its transcript at any time. Narration also follows the selected guided route. Every slide includes its spoken explanation under <strong>Sources &amp; notes</strong>; existing site diagrams offer <strong>Listen to explanation</strong> and expandable narrator notes.</p>

<section id="guided-routes"><p class="eyebrow">Start here</p><h2>Choose a focused story, then go deeper</h2><p>The banking executive route is the default starting point. Each route ends with a decision or the questions needed to make it. Full decks retain every supporting slide; the 3D demo remains optional.</p><div class="vs-route-cards">{% for entry in site.data.briefing_routes %}{% assign route = entry[1] %}<article data-route-audience="{{ route.audience }}"><p class="vs-node-meta">{{ route.audience | replace: 'evp', 'Executive' | capitalize }}</p><h3>{{ route.title }}</h3><p>{{ route.slides.size }} selected slides · audio plus discussion</p><a class="btn btn-primary" href="{{ route.url | relative_url }}?route=client#slide-1">Start guided story →</a><p><a href="{{ '/assets/pdf/' | append: route.pdf_prefix | append: '-guided-v' | append: site.data.release[route.edition] | append: '.pdf' | relative_url }}">Download this route as PDF ↓</a></p></article>{% endfor %}</div><p><a href="{{ '/discovery/#decision-brief' | relative_url }}">One-page decision brief: scope, owners and evidence →</a></p></section>

<section data-presentation-room aria-label="Choose a presentation">
  <div class="room-filters" hidden role="group" aria-label="Filter briefings by audience"><button type="button" data-room-filter="all" aria-pressed="true">All briefings</button><button type="button" data-room-filter="evp" aria-pressed="false">Executives &amp; sponsors</button><button type="button" data-room-filter="technical" aria-pressed="false">Technical SDs &amp; leads</button></div>
  <p class="room-status" data-room-status role="status" aria-live="polite">4 briefings · all audiences</p>
  <div class="room-grid">{% for deck in site.data.briefing_room %}{% assign edition = site.data.release[deck.edition] %}
    <article class="room-card" data-deck-audience="{{ deck.audience }}"><div class="room-cover"><span class="room-audience">{{ deck.audience_label }} / {{ deck.series }}</span><strong>{{ deck.cover }}</strong></div><div class="room-body"><h2>{{ deck.title }}</h2><p class="room-meta">{{ deck.slides }} slides · {{ deck.time }} with discussion · PDF v{{ edition }}</p><p>{{ deck.description }}</p><details><summary>See the conversation outline</summary><ul>{% for point in deck.outline %}<li><a href="{{ deck.url | relative_url }}#slide-{{ point.slide }}">{{ point.label }}</a></li>{% endfor %}</ul></details><div class="room-actions"><a class="btn btn-primary" href="{{ deck.url | relative_url }}">Present this deck ↗</a><a href="{{ '/assets/pdf/' | append: deck.pdf_prefix | append: '-v' | append: edition | append: '.pdf' | relative_url }}">Download PDF ↓</a></div></div></article>
  {% endfor %}</div>
</section>

<aside class="meeting-route"><h2>A suggested 30-minute conversation</h2><ol><li><strong>01 / Align · 5 minutes</strong>Which part of QA creates the most delay or repeated work?<small>Start with the fintech Executive story.</small></li><li><strong>02 / Explore · 15 minutes</strong>Follow one workflow and show the platform services behind it.<small><a href="{{ '/case-studies/fintech/' | relative_url }}#ai-journey">AI contribution end to end →</a></small></li><li><strong>03 / Agree · 10 minutes</strong>Choose the process, owner and evidence needed for a first pilot.<small><a href="{{ '/discovery/' | relative_url }}">Discovery guide →</a></small></li></ol></aside>

<section class="home-section" id="briefings" aria-labelledby="preview-title"><div class="section-heading"><div><p class="eyebrow">Preview before you present</p><h2 id="preview-title">Preview the banking presentation.</h2></div></div>{% include briefing-embed.html %}</section>

<section class="home-section"><h2>Keep the supporting material close</h2><div class="resource-grid"><a class="resource-link" href="{{ '/docs/industry/library/' | relative_url }}"><span class="resource-number">When asked “what is the evidence?”</span><h3 class="no_anchor">Open the source library ↗</h3><p>{{ site.data.industry_sources | size }} sources with findings, methods and limitations.</p></a><a class="resource-link" href="{{ '/dictionary/' | relative_url }}"><span class="resource-number">When a term needs explaining</span><h3 class="no_anchor">Use the dictionary ↗</h3><p>Plain-language explanations linked to the architecture.</p></a></div></section>

Our Banking Client is an illustrative payment-testing scenario; its results are not client observations. Industry studies support specific findings, not a guaranteed client outcome. Presentation mode supports arrow keys, full screen, diagrams and source notes; each deck links back to this room.
