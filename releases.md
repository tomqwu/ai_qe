---
title: Release history
nav_order: 9
permalink: /releases/
---
# Publication editions

The version identifies the site and presentation player. A player-only patch can retain the previous slide-content and PDF edition, as noted below. Source publication dates remain separate from the site release date. All diagrams are proposed designs or authored synthesis unless explicitly described as study results.

## v1.6.0 · 7 September 2026

Added the [Harbor fintech case explorer]({{ '/case-studies/fintech/' | relative_url }}): a fictional organization with 75 offshore QA staff and a retry-safe payment release. It includes a step-by-step payment simulation, a shared QA architecture, all eight workflow stages, three delivery-maturity profiles, capacity arithmetic and an implementation plan. Every staffing figure, effort estimate and case outcome is labeled as assumed or illustrative.

The case has two dedicated, QA-focused briefings with diagrams and editable web content:

- [EVP strategic vision · 12 slides · v1.6.0]({{ '/briefings/fintech-evp/' | relative_url }}) · [PDF]({{ '/assets/pdf/ai-qe-fintech-evp-v1.6.0.pdf' | relative_url }})
- [Technical QA architecture · 18 slides · v1.6.0]({{ '/briefings/fintech-technical/' | relative_url }}) · [PDF]({{ '/assets/pdf/ai-qe-fintech-technical-v1.6.0.pdf' | relative_url }})

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

Animated slides now have a visible Play/Pause, Next step and Overview bar below the canvas. It stays clear of the diagram and navigation, including in the embedded player. A guided flow plays once when its diagram enters view; Pause, Overview, motion-off and reduced-motion preferences retain control. Diagram controls contains view options and the AppSec path choice.

The slide content and downloadable PDFs remain **edition v1.3.0**. The page banner and player header identify this playback update as **v1.3.1**.

## v1.3.0 · 6 September 2026

Shared slide frame, consistent margins and typography, persistent navigation, explicit presentation modes, source/edition drawers, mobile diagram overviews and searchable slide anchors. The embedded player preserves the current audience and slide in its share URL.

Added strategic choices and a financial-services workflow to the **21-slide EVP deck**; concrete payment reference contracts, failure semantics and AppSec disposition paths to the **29-slide technical deck**. Expanded the library to 32 entries and added research coverage and deployment comparison criteria. Reconciled scenario arithmetic, introduced negative task savings, corrected the TestGen denominator and specified the pilot decision bands.

- [EVP strategic vision · v1.3.0 · 21-page slide PDF]({{ '/assets/pdf/ai-qe-evp-v1.3.0.pdf' | relative_url }})
- [Technical architecture · v1.3.0 · 29-page slide PDF]({{ '/assets/pdf/ai-qe-technical-v1.3.0.pdf' | relative_url }})
- [Interactive EVP deck]({{ '/briefings/evp/' | relative_url }}) · [Interactive technical deck]({{ '/briefings/technical/' | relative_url }})

The PDFs are static exports of this slide edition. Animation, scenario controls, component inspection and expanded research notes are available in the interactive decks and linked research pages.

## v1.2.1 · 6 September 2026

Clarified the architecture tour with uniform context paths, explicit directed steps, a legend, reset and synchronized pause/resume.

## v1.2.0 · 6 September 2026

Expanded the audience presentations to 18 EVP and 26 technical slides, with 17 additional native diagrams covering strategy, test validity, evaluation and operations.

## Original research companion · 5 September 2026

[13-page research brief]({{ '/assets/pdf/ai-qe-industry-research-2026.pdf' | relative_url }}) · 30-source edition. This is the original concise research companion, not an export of the later decks. Its source snapshot remains available as [JSON]({{ '/assets/data/industry-sources-2026-09-05.json' | relative_url }}). The current [document library]({{ '/docs/industry/library/' | relative_url }}) includes later additions.
