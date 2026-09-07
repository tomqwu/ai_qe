---
title: Downloads & releases
nav_order: 9
permalink: /releases/
---
# Publication editions

The version identifies the site and presentation player. A player-only patch can retain the previous slide-content and PDF edition, as noted below. Source publication dates remain separate from the site release date. All diagrams are proposed designs or authored synthesis unless explicitly described as study results.

<div class="hero-actions"><a class="btn btn-primary" href="https://github.com/tomqwu/ai_qe/releases">GitHub releases &amp; assets ↗</a><a class="text-link" href="{{ '/briefings/' | relative_url }}">Open the presentation room →</a></div>

## v1.8.0 · 7 September 2026

A new visual identity and conversation-led navigation connect the strategic vision, fintech case, architecture demonstration and discovery guide. The presentation room brings all four audience decks together with audience filters, outlines and direct presentation and PDF links. Research, economics and delivery controls remain available as supporting evidence.

[GitHub release v1.8.0](https://github.com/tomqwu/ai_qe/releases/tag/v1.8.0) includes the current PDFs, architecture film, captions, source registers and SHA-256 checksums. Future versions publish a GitHub release after the site deploys successfully.

This is a site and presentation-player update. **All four slide/PDF editions and the research companion retain v1.7.0; the fillable questionnaire remains v3.** Slide content is unchanged. The architecture film is refreshed to display site v1.8.0.

<div class="release-downloads">{% for deck in site.data.briefing_room %}{% assign edition = site.data.release[deck.edition] %}<a href="{{ '/assets/pdf/' | append: deck.pdf_prefix | append: '-v' | append: edition | append: '.pdf' | relative_url }}">{{ deck.series }} · {{ deck.audience_label }}<br><strong>{{ deck.slides }} slides · PDF v{{ edition }} ↓</strong></a>{% endfor %}<a href="{{ '/assets/pdf/ai-qe-industry-research-v' | append: site.data.release.research_edition | append: '.pdf' | relative_url }}">QA research companion<br><strong>13 pages · PDF v{{ site.data.release.research_edition }} ↓</strong></a><a href="{{ '/assets/pdf/ai-qe-discovery-questionnaire-v' | append: site.data.release.questionnaire_edition | append: '.pdf' | relative_url }}">Discovery questionnaire<br><strong>Fillable PDF v{{ site.data.release.questionnaire_edition }} ↓</strong></a></div>

## v1.7.0 · 7 September 2026

Focused the publication on AI-assisted quality engineering across the homepage, shared branding, research pages, presentations, diagrams, dictionary and questionnaire. The interactive capability map now includes test maintenance. The technical deck closes with repair, retest and a time-limited flaky-test quarantine, with separate animated paths and an explicit unresolved-work record.

- [EVP strategic vision · 21 slides · v1.7.0 PDF]({{ '/assets/pdf/ai-qe-evp-v1.7.0.pdf' | relative_url }})
- [Technical architecture · 29 slides · v1.7.0 PDF]({{ '/assets/pdf/ai-qe-technical-v1.7.0.pdf' | relative_url }})
- [QA research companion · 13 pages · v1.7.0 PDF]({{ '/assets/pdf/ai-qe-industry-research-v1.7.0.pdf' | relative_url }})
- [QA discovery questionnaire · fillable v3 PDF]({{ '/assets/pdf/ai-qe-discovery-questionnaire-v3.pdf' | relative_url }})

The current library contains 30 sources and the dictionary contains 62 terms. Superseded mixed-scope downloads are no longer published. The architecture film has been refreshed to match the site edition. Fintech case decks and PDFs are also re-exported as **v1.7.0** to remove the old branding from PDF metadata; their QA narrative is unchanged. [Fintech EVP PDF]({{ '/assets/pdf/ai-qe-fintech-evp-v1.7.0.pdf' | relative_url }}) · [Fintech technical PDF]({{ '/assets/pdf/ai-qe-fintech-technical-v1.7.0.pdf' | relative_url }}).

## v1.6.1 · 7 September 2026

Corrected the [fintech workflow explorer]({{ '/case-studies/fintech/#workflow' | relative_url }}): field labels now align above their descriptions, and all eight stage buttons form an even grid with four columns on desktop and two on smaller screens. Narrow screens show workflow details in one column. The staffing labels use the same left alignment.

The payment simulation's stage strip stacks vertically on the narrowest phones so the page stays within the screen. Its arrows continue to follow the flow direction.

Fintech slides and PDFs retain **edition v1.6.0**, research decks retain **v1.3.0**, and the architecture film retains its **v1.6.0** edition.

## v1.6.0 · 7 September 2026

Added the [Harbor fintech case explorer]({{ '/case-studies/fintech/' | relative_url }}): a fictional organization with 75 offshore QA staff and a retry-safe payment release. It includes a step-by-step payment simulation, a shared QA architecture, all eight workflow stages, three delivery-maturity profiles, capacity arithmetic and an implementation plan. Every staffing figure, effort estimate and case outcome is labeled as assumed or illustrative.

The case has two dedicated, QA-focused briefings with diagrams and editable web content:

- [EVP strategic vision · 12 slides · v1.6.0]({{ '/briefings/fintech-evp/' | relative_url }})
- [Technical QA architecture · 18 slides · v1.6.0]({{ '/briefings/fintech-technical/' | relative_url }})

The industry research decks retain **slide edition v1.3.0**. Refreshed the existing architecture film's site edition label to v1.6.0; its scenario content is unchanged.

Fixed the theme's search focus handling when focus leaves the page or returns to browser controls. A missing next focus target now closes search without a JavaScript error.

## v1.5.0 · 6 September 2026

Added the [AI × QE dictionary]({{ '/dictionary/' | relative_url }}) with plain-language definitions, acronyms, concrete examples and related terms across six topics. Search, topic filters and A–Z navigation support quick lookup; each term has a shareable link and appears in the site-wide search.

All 11 architecture components link between the dictionary and the 3D inspector. The homepage, site navigation and briefing notes also link to the dictionary. Definitions remain readable without JavaScript. Refreshed the architecture film's edition label. Slide content and PDFs remain **edition v1.3.0**.

## v1.4.2 · 6 September 2026

Retains the clearer 3D architecture introduced in v1.4.1. Playback now also checks the current reduced-motion preference on the next visible frame, covering browsers that delay the preference-change event. Switching reduced motion on pauses playback and disables camera motion; switching it off restores the controls without starting playback automatically.

## v1.4.1 · 6 September 2026

Made [Architecture in motion]({{ '/demos/architecture/' | relative_url }}) easier to follow. Inputs, AI generation, checks and evidence now have distinct colors and text badges. Larger labels, a numbered current-step marker and white directional flows identify what is happening. Full map reveals the other connections.

A light explanation panel uses simpler language and a short route summary. The camera stays still by default, each stage lasts seven seconds, and a pace selector supports slower viewing. Updated the [49-second film]({{ '/assets/video/assurance-architecture.mp4' | relative_url }}), captions, poster and editable Blender scene to match. Slide content and PDFs remain **edition v1.3.0**.

## v1.4.0 · 6 September 2026

Added [Architecture in motion]({{ '/demos/architecture/' | relative_url }}), a Blender-authored 3D model with a Three.js interactive viewer. Explore 11 modules, four scenarios, moving signals, camera orbit and component inspection. Denied requests stop at authorization; failed checks reach a held release decision. The AI-application evaluation branch remains distinct from generated-test execution.

Includes a downloadable [35-second architecture film]({{ '/assets/video/assurance-architecture.mp4' | relative_url }}), captions, a static fallback and the [editable Blender scene]({{ '/assets/models/assurance-platform.blend' | relative_url }}). Motion respects reduced-motion settings. Slide content and PDFs remain **edition v1.3.0**.

## v1.3.1 · 6 September 2026

Animated slides now have a visible Play/Pause, Next step and Overview bar below the canvas. It stays clear of the diagram and navigation, including in the embedded player. A guided flow plays once when its diagram enters view; Pause, Overview, motion-off and reduced-motion preferences retain control. Diagram controls provides view options and branch selection.

The slide content and downloadable PDFs remain **edition v1.3.0**. The page banner and player header identify this playback update as **v1.3.1**.

## v1.3.0 · 6 September 2026

Shared slide frame, consistent margins and typography, persistent navigation, explicit presentation modes, source/edition drawers, mobile diagram overviews and searchable slide anchors. The embedded player preserves the current audience and slide in its share URL.

Added strategic choices and a financial-services workflow to the **21-slide EVP deck**; concrete payment reference contracts, failure semantics and a branched evidence workflow to the **29-slide technical deck**. Expanded the library to 32 entries and added research coverage and deployment comparison criteria. Reconciled scenario arithmetic, introduced negative task savings, corrected the TestGen denominator and specified the pilot decision bands.

- [Interactive EVP deck]({{ '/briefings/evp/' | relative_url }}) · [Interactive technical deck]({{ '/briefings/technical/' | relative_url }})

The PDFs are static exports of this slide edition. Animation, scenario controls, component inspection and expanded research notes are available in the interactive decks and linked research pages.

## v1.2.1 · 6 September 2026

Clarified the architecture tour with uniform context paths, explicit directed steps, a legend, reset and synchronized pause/resume.

## v1.2.0 · 6 September 2026

Expanded the audience presentations to 18 EVP and 26 technical slides, with 17 additional native diagrams covering strategy, test validity, evaluation and operations.

## Original research companion · 5 September 2026

The original concise companion had 13 pages and 30 sources. It has been superseded by the QA research companion linked in the current edition above. The [document library]({{ '/docs/industry/library/' | relative_url }}) is the current source register.
