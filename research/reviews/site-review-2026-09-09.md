# AI × QE site review — v1.23.0 (main f169fc7, 9 September 2026)

## 1. Verdict

This is a Jekyll advisory site that pitches AI-assisted quality engineering to a Canadian bank through four narrated decks (116 slides), a fictional payments case (PAY-142), a 30-source evidence base, an economics model and an OSFI control mapping. Its discipline is rare: every number traces to a canonical record, the fiction is labelled on every slide, the regulatory dates are correct, and all 116 slides fit 16:9 at every measured viewport with narration, captions, keyboard control and fallbacks. The central problem is that the material does not close. No surface states the decision requested, its fee model or its duration (three pilot clocks coexist); every deck's ask sits mid-deck because later releases appended chapters after the close; the fictional client is literally named "Our Banking Client" on the first slide of a deck shown to a real bank; no author or firm is named; and the value story opens with 0.45% net and "15 packs to recover setup" before throughput, regulatory and risk arguments appear. Presentation mode leaves the slide at 43% of a 1280×720 viewport, and the homepage previews decks at 8.7px type. This week: fix the presentation frame and cover clip, give the industry decks a guided route that ends on the ask, add attribution and a synthetic-media credit, and run the one-day hygiene sweep. Next edition: write the single "decision we are asking for" slide with one reconciled clock, settle the client persona, and reorder the value story.

## 2. What to keep

- **Economics and claims discipline.** Four levels of saving (docs/principles.md:52-61); _data/scenarios.json → scenario_results.json feeds every surface with tools/verify_publication.py asserting agreement (R01 fixed); one canonical Meta TestGen record in _data/claims.json agrees across four surfaces (R02 fixed); 14 further spot-checked numbers reconcile.
- **One worked scenario.** PAY-142 (one timeout, two debits) runs consistently through the case page, both fintech decks, the industry tails and the 3D demo with contract, idempotency key, ledger oracle, evidence YAML and fail-closed gate.
- **Regulatory accuracy.** control-mapping.md maps controls to B-13, E-23 (1 May 2027), B-10 and the July 2026 bulletin; E-21, E-23, EU AI Omnibus, Bill C-36 and WQR figures re-verified against primary sources on 9 Sep 2026.
- **Honesty conventions.** Per-slide fiction disclosure enforced by tools/verify_fintech.py; vendor figures always carry unit, source and caveat; slide-language.md use/avoid/never-say lists; the phased-pilot stop/insufficient/go/extend table with exact boundaries.
- **Narration and packaging.** 116/116 slides with MP3 + VTT + transcript, auto-advance, hash-checked integrity, zero page errors; single-sourced rail, no orphan pages, shareable ?for= filter, 116 deep search anchors, checksummed never-overwritten releases (R07, R08, R13, R14 fixed).
- **Layout, brand and accessibility.** 0 of 116 slides overflow at 1280×720 or 1920×1080; PDFs match live decks (26/36/21/33 pages); coherent brand (navy #152e40 / teal #096d69, self-hosted Source Sans 3); full keyboard operation, 3px focus rings, contrast 7.58:1 / 6.01:1, reduced-motion and WebGL-off fallbacks. R04, L03, L04, L06 fixed; L07 resolved by the mobile "Readable overview" toggle.
- **Engineering hygiene where it counts.** Exact dependency pins, byte-identical regenerated SVGs, all 34 diagrams referenced, AppSec remnants gone from the build.

## 3. Top recommendations

Ranked by impact on landing the pitch per unit of effort. "This week" items are small or have a small first step; "next edition" items change content and need narration re-recording or PDF re-export.

**1. Write one "The decision we are asking for" slide, close both EVP decks, the guided executive route and /discovery/ with it, and reconcile the three pilot clocks to one _data source.** (Next edition.) The only list of decisions requested is docs/method/executive-presentation.md:33, a facilitation guide three levels deep; grep of _site for "we ask|decision required|fixed-fee" hits only phased-pilot and fintech-evidence. The site carries 2+4-6+8-10 weeks (docs/method/phased-pilot.md:24-26), 3+8(+4) weeks (_data/pilot_gates.json) and weeks 1-2/3-8/9-12 (_data/visual_story.json). State the fee model, not dollars, per phased-pilot.md:20. Effort: medium. Resolves F04, F23; feeds F07.

**2. Choose one client frame and enforce it everywhere.** (Next edition.) _data/fintech_case.json:5-6 names the fiction "Our Banking Client" while nav, kicker and URL say "fintech"; 356 occurrences in 21 built files; the name is hard-coded in _data/fintech_decks.json:4,187,198,209,214,282,632 and spoken 13 times. Pick an obviously fictional Canadian bank persona or an unnamed "illustrative payment scenario"; disclose once on cover and PDF page 1; add retired names to the forbidden-string check; re-record the 13 clips. Effort: medium. Resolves F02; supports F33.

**3. Make Present actually present.** (This week, step 1.) Present leaves the canvas at 843×474 (43% of 1280×720) with header, idle 122px narration card and nav visible: narration.js calls setVisible(Boolean(clip)) before playback, narration.css:51-52 subtracts the panel from --frame-width, and slide-master.css:9-12 overrides decks.css:141's :fullscreen rule. Flow-bar slides run a second, smaller formula (757×426); the animated cover image paints over the EVP cover subtitle. Hide the panel until Play, delete the has-flow-controls formula, layer .cover-tag, then floor type with max(cqw, px). Effort: small now, medium for auto-hiding chrome and type floors. Resolves F08, F18, F09, F49; step 2 resolves F10, F35.

**4. End every deck on the ask: guided routes for the industry decks now, native re-sequencing with an Appendix chapter next edition.** (This week first step.) Industry EVP slide 18 is the leadership agenda (briefings/evp.html:105-110) followed by eight slides ending on a 122-second diagram; fintech EVP's brainstorm is slide 12 of 21; the technical decks append 10 and 15 slides after their asks. The route mechanism already exists (decks.js:16-18,77). Then replace industry tails 22-26 / 30-36 with one bridge slide each, cut the technical route to ~12 slides and show "Story n/N · title" with a route-ordered PDF. Effort: small now, medium next edition. Resolves F03, F13, F14, F23.

**5. Say who is asking and what is synthetic.** (This week.) No page or PDF names an author, firm or contact (_includes/nav_footer_custom.html:1; PDF Author = Chromium); nothing client-facing says the illustrations are AI-generated or the narrator is an ElevenLabs voice (releases.md:72 records the last provider signal being removed); the paid-tier licence basis lives only in PR #38 and an unrendered docs/narration/voice-audition.md:3. Add an attribution block in _data/release.yml rendered on footer, room, covers and PDF metadata; _includes/media-credit.html on footer, covers and the narration status line; assets/data/narration-provenance.json and a /credits/ page. Effort: small to medium. Resolves F05, G2A, G2B, G2C.

**6. Reorder the value story: why now, the regulator, a position, then capacity.** (Next edition.) The first value slide is 0.45% net (briefings/evp.html:36-41) and fintech slide 8's "15 packs to recover 480h setup"; "fewer escaped payment defects" first appears at slide 19; "why now|cost of inaction" = 0 hits; OSFI/B-13/E-23 appear in no fintech slide although control-mapping.md:13-24 is the best Canada-specific asset; the one confident paragraph (slide-language.md:39) reaches no deck. Add "Why now" (E-23 1 May 2027, Gartner 2028, vendor-slot cadence), a governance slide from a new _data/control_mapping.json, an "Our position" slide, outcomes before capacity, range not point, and the pack-to-portfolio cross-walk. Effort: medium. Resolves F06, F22, F11, F26.

**7. One-day hygiene sweep.** (This week.) Delete the unused `mermaid:` key (_config.yml:49-50: 328 KB of unpinned jsdelivr JS on 38 of 43 pages); commit the AppSec v2 PDF deletion; remove 42 unreferenced superseded PDFs (70 MB) and replace name lists with an edition rule; audio preload='none' with src assigned on Play (narration.js:15,182-187); html.js inline class to stop the 0.11 CLS; move Dictionary/Downloads out of the scrolling rail; darken sales.css:71 and :101 to #56696a; add the FlakyGuard claim record and the C-27/E-21 wording. Effort: small each. Resolves G1A, F44, F15, F20, F38, F47, F52, F28, F50.

**8. Replace the homepage live iframe with poster cards and keep one audience-aware embed on /briefings/.** (Next edition.) Inside the homepage iframe the slide frame is 562px wide with 8.7px labels and 6.7px footers, a second product header, seven buttons, narration panel and nav; the embed is included twice (index.md:52, briefings/index.md:25), shows two tabs under a "4 audience decks" line, and previews the industry deck while briefings/index.md:9 says start with the fintech case. Key an embed mode off body.embedded (decks.js:10-11); default to the fintech pair; hide the technical route under ?for=evp. Effort: medium. Resolves F01, F12.

**9. Produce the 15-minute leave-behind and declare one default path.** (Next edition.) ~80k visible words over 43 pages, 116 slides and ~77 minutes of narration retell the case on 8+ surfaces; the room's 11-minute 15-slide route has no export; five competing paths use different numbering. Extend tools/export_decks.cjs to emit a route-ordered PDF, pair it with the memo from item 1 at the top of the hero, and drop the 3D demo from the 30-minute plan. Content consolidation is a separate backlog item. Effort: medium. Resolves F07, F12, F54; supports F31.

**10. Slow the release train and make CI runnable locally.** (Structural.) 27 releases v1.8.0-v1.23.0 in ~48 hours with a 68 MB narration zip re-cut each time; changelog copy in every page banner; reachable blob content 7.7 MB → 215.6 MB in three days; an 18-minute serial browser step run twice per change; 20 suites and 8 narration checkers listed only in pages.yml. Gate release on _data/release.yml changes, add a Makefile that pages.yml calls, matrix the browser suites, generate deck PDFs in CI, shrink README to ~60 lines with procedures in CONTRIBUTING.md. Effort: medium. Resolves F16, F39, F40, F42, F17, F51; F21 and F41 follow.

## 4. Findings by theme

Severity is after the verifier's adjustment; effort is the corrected estimate. Screenshot file names refer to captures taken during the review; they are not committed.

### Strategy & narrative

**F04 · The ask is not converged** — high · medium. "Fund Phases 0 and 1" appears only at executive-presentation.md:38 and slide-language.md:39; the decisions-requested row only at executive-presentation.md:33; three clocks (phased-pilot.md:24-26; _data/pilot_gates.json 3/8/+4; visual_story.json 1-2/3-8/9-12); fintech EVP slide 12 note "Proposed next step: a workflow assessment" has no owner, cost or date. Fix: one decision slide rendered from _data with fee model and one clock, reused on both EVP decks, the route and /discovery/.

**F03 · Every deck's ask sits mid-deck** — high · medium. briefings/evp.html: agenda slide 18 (105-110), choices 19-21 (112-128), appended 22-26 (130-156, chapters 1/1/2/1) ending on a 122 s diagram whose only CTA is "open the banking engineering walkthrough"; fintech brainstorm slides are 12/21 and 18/33; technical.html 27-36 appended (152-207); narration.js:247-256 auto-advances to the end. Fix: routes now; re-sequence with an Appendix next edition, budgeting slide-ID, narration-key and PDF re-export.

**F05 · No author, firm or contact** — high · medium. nav_footer_custom.html:1 and _config.yml:30-32 give only a disclaimer and a personal GitHub link; zero pages match "contact|about us|prepared by"; PDF Author = Chromium. Fix: attribution block in release.yml rendered on footer, room, covers, plus a pypdf metadata step in export_decks.cjs.

**F06 · Value story leads with deflating arithmetic** — high · medium. EVP slide 5 opens on base net 0.45% (scenario_results.json; downside −$183,125, slowdown −$450,000); fintech slide 8 "78h / 66h / 33h / 15 packs"; slide 19 "Baseline: Not recorded"; "why now|cost of inaction|status quo" = 0 hits. Fix: "Why now" slide, outcomes before capacity, show the range, relabel "Not recorded" as "to be measured in Phase 1".

**F11 · Hedges outnumber conviction** — medium · medium. Disclaimer regex: 28 hits in fintech_decks.json, 14 in technical.html; fintech slide 15 stacks a panel caveat, a figcaption from _includes/fintech-evidence/results.html and a note; "we recommend" = 0 in all decks; slide-language.md:39 reaches no deck. Fix: "Our position" and "What we will not tell you" slides; figcaption to the drawer; prune notes to decision-changing caveats.

**F22 · OSFI control mapping never reaches a deck** — medium · small. control-mapping.md:13-24 vs 0 hits for OSFI|B-13|E-23|regulat in fintech_decks.json; executive-presentation.md:31 allots 5 minutes to "regulatory strength" with no slide; industry decks show OSFI only as a source label and a governance-loop.svg footnote. Fix: _data/control_mapping.json with a binding/advisory flag rendered into one EVP and one technical slide.

**F23 · R09 partially resolved** — low · small. Slide 18 is three generic pillars with ~40% of the slide empty; its narration ends "local evidence determines the commitment" while slide 19 states the recommendation. Fix: fold into F03; replace slide 18 with the three options plus recommendation; re-record one clip.

**F24 · Framework sprawl** — medium · medium. Built HTML: "four layers" 11× on 7 pages, "autonomy ladder" 8× on 3, plus eight stages, six workstreams, twelve assumptions, five phases, capability horizons (evp.html:91-92,126); /ai-adoption/ never mentions the ladder; nine-step rail. Fix: layers × ladder × strategic-choice mapping table in docs/principles.md; one sequence, one register; decide the rail with F12.

**F25 · Two theses share top billing** — medium · small. index.md:39-41 "AI for QE. QE for AI."; technical slides 5-6 and 13-16 assure AI applications while the client problem is 75 offshore staff and vendor environments (fintech_case.json baseline). Fix: one headline with "QE for AI" as the second horizon; group those slides as an optional chapter a route skips.

**F54 · 3D demo in the 30-minute plan** — low · small. briefings/index.md:23 step 02 links the demo; its 11 nodes match technical slide 2; 687 KB JS + 876 KB GLB + 2.35 MB MP4. Fix: remove from the plan; keep as appendix.

### Information architecture & format

**F02 · "Our Banking Client" + "fictional fintech" identity collision** — high · medium. fintech_case.json:5-6; slide 1 kicker "OUR BANKING CLIENT / FICTIONAL FINTECH CASE" with "75 offshore QA staff" while the room card says "a fictional fintech"; "Fit it into the Our Banking Client delivery plan" (_site/case-studies/fintech/evidence/index.html:637); releases.md:148 still says Northstar and is indexed. Fix: recommendation 2.

**F07 · Format mismatch with a 15-minute decision** — medium · medium. 79,870 visible words over 43 pages; home 5,974px tall; narration 76.6 min; PAY-142 on 12 pages; duplicate search titles ("Four layers…" ×3); the 15-slide route (11.2 min) has no export. Fix: route-ordered PDF + memo at the top of the hero; consolidation as a separate backlog item measured by duplicate titles.

**F12 · Entry paths fork too early** — medium · small. navigation.json nine steps vs index.md:27-30 four differently numbered cards; briefings/index.md:9 says fintech first but the room embeds the industry EVP; under ?for=evp the 22-slide technical route and "Assurance architecture 36 slides" still show; docs/industry/index.md:52 adds "Reading routes". Fix: declare the default, reuse rail numbers, filter routes and embed under ?for=evp, reorder the rail Story → Foundations → Results → Motion → Discovery.

**F33 · Each deck has three to five names** — medium · small. <title> "Assurance architecture" on both the technical deck and /docs/industry/architecture/; room "Design the system behind the AI" (briefing_room.json:77-78); search doc "Technical architecture"; README.md:12 "Technical delivery architecture". Fix: one `name` per deck in briefing_room.json rendered everywhere; rename the docs page; assert unique titles in verify_site.py.

**F34 · /docs/ stubs and label mismatches** — low · small. /docs/method/ 46 words, /docs/economics/ 54 rendered as "Overview"; nav "Research & evidence" → title "Industry research" → H1 "AI × QE: a broader quality mandate"; 15 flat items; site_nav.html:14 hard-codes an exception. Fix: drop stub entries, one string per page, split the group, remove the parent from demos/architecture.html.

**F47 · Utility links below the fold** — medium (raised) · small. At 1366×768 the rail is 778px in a 584px region even with all groups collapsed, so Dictionary (y=774) and Downloads & releases (y=820) are invisible on every page; no scrollbar or fade. Fix: move .sales-nav-utility into the fixed sidebar footer; add a scroll cue; assert visibility at 1366×768.

### Presentation & decks

**F13 · Guided route shows jumping slide numbers** — medium · medium. ArrowRight on fintech-evp/?route=client yields Slide 1 → 3 → 20 → 6 → 21 → 18 … (decks.js:28); technical route is 22 of 33 slides; technical.html:16 lands on "Story 2/22"; PDFs keep original order (README.md:231). Fix: "Story n/N · title" in route mode, a route-ordered PDF, a ~12-slide technical route, link to #slide-1.

**F14 · Industry decks end with fintech near-duplicates** — medium · medium. "What AI contributes, from requirement to release" verbatim on evp 26 and fintech-evp 20; evp 22-26 / technical 30-36 carry "Our Banking Client" kickers inside decks the room calls "Industry perspective" (briefing_room.json:54,76); cross-series Jaccard 0.50-0.70 (the lens's higher values did not reproduce). Fix: one bridge slide per industry deck; re-sync counts, README, manifests, PDFs.

**F19 · No vertical budget** — medium · large. Industry EVP 23 of 26 slides > 60 on-slide words (slide 10: 159); fintech EVP 19 of 21; technical slide 14 leaves 112px of 474px blank at 14.7px cells; fintech cover duplicates its footer line; slide-master.css:17-22 top-anchors fixed-size content. Fix (A, small): centre/scale table and statement slides, drop the duplicate line. (B, large, behind the next narration regeneration): one visual + ≤ 40-50 words per EVP slide.

**F30 · New build vs existing CI/IAM unclear** — medium · medium. Slide 2 shows eight boxes, slide 22 lists tools by layer; "build or buy" = 0 hits; the transcript's "responsibilities, not eleven new products" and phased-pilot.md:64's platform confirmation are off-slide. Fix: component → Phase 2 minimum → realisation → owner table on slide 22 and docs/industry/architecture.md.

**F31 · No presenter notes; PDFs carry none** — medium · medium. Drawer = transcript + citations (decks.js:137-152); narration.css:66 and fintech.css:141 hide notes in print; PDF technical p2 has 111 words and no narrative. Fix: a `talk` array per slide (claim, number, transition) shown first in the drawer; a notes-variant PDF via a second page.pdf call.

**F32 · Stale manifest totals and coverage table** — low · small. narration.json deck-level `duration` is stale (evp 611.2 vs 850.6 s) but unread by code; voice-audition.md:11-16 lists 109 scripts vs 116. The "five-minute static diagram" claim is refuted: narration-flows.json has 13 synchronized cues with a step counter. Fix: regenerate or drop the field; correct the table.

**F45 · EVP titles are labels** — low · small. 16-17 of 21 fintech EVP titles are nouns ("The QA organization"); industry EVP about half. Fix: one-line claims with qualifiers; check recorded transcripts before renaming.

**F46 · Room outlines drifted** — low · small. briefing_room.json lists "Before / after: manual API work…" vs slide 6's actual title; "Guided client route…" matches no slide; two technical items claim slide 27; no check despite README.md:19. Fix: structured {label, from, to} items with a coverage check.

### Visual design & UX

**F01 · Homepage-embedded decks unreadable** — high · medium. Iframe 934×610, .slides 561.8px, node text 8.67px, footer 6.74px (embed-technical-slide2-1280.png); cause narration.css:52 subtracting 160px + panel + gap; nested header, seven buttons, panel and nav; included at index.md:52 and briefings/index.md:25; two tabs under "4 audience decks"; standalone node text is only 11.7px at 1280. Fix: recommendation 8 with a ≥ 11px rendered-SVG-text assertion.

**F08 · "Present" does not present** — high · medium. Canvas 843×474 before and after [data-fullscreen] (43% at 1280×720, 60% at 1920×1080; flow-bar slides 35%/53%); header, empty "English subtitles" card, nav and flow bar remain (tech-2-present-1920.png). Fix: step 1 hide the panel until Play and exclude its height, version chip as text; step 2 auto-hide header, caption overlay, one slim bar, assert canvas ≥ 85% of viewport height.

**F09 · EVP cover subtitle clipped** — medium (lowered) · small. Overlap grows 0 → 6.4px over the 14 s illustration-float cycle (motion.css:46/52) because the h2 has z-index 1 (industry.css:104) and the tag does not; absent with motion off; decks.css:44 is not the cause. Fix: layer .cover-tag, add ~.6cqw slack, smoke-check at the animation's end state.

**F10 · Type 9-12px at laptop sizes (L02 unmet)** — medium · medium. At 1280×720 kicker/footer 9.1-10.1px (slide-master.css:15,23), smallest SVG labels 11.1px (technical #3), median 12.4 over 52 diagram slides, th 11.4px; 6 Sept targets (18/16/12) unmet though remediation row L02 claims "Readable type". Fix: reclaim frame height first, then px floors (max(1.2cqw,12px), max(1.75cqw,16px)), enlarge or split the ~10 diagrams under 13px, add min-font and overflow assertions.

**F18 · Flow-bar slides shrink the canvas 10% (L01 regressed)** — medium · small. 96 slides at 843×474, 20 at 757×426; titles 26.1 vs 23.5px; the has-flow-controls formula (slide-master.css:45, narration.css:52) landed in bf260d2 right after the v1.3.0 "one frame" remediation. Fix: move flow controls into the nav bar or figure strip, delete the formula, assert one width per deck.

**F35 · Mobile header 134px** — low (lowered) · small. Seven buttons in two rows at 390×664; deep links hide the kicker and ~7px of the title (motion.css:78 scroll-margin 4.5rem fits the desktop header only). Fix: mobile scroll-margin from --header-h; collapse tools to Play + Present + overflow.

**F36 · No design tokens** — low (lowered) · medium. 452 distinct hex values across 22 CSS files, 12 files with zero var(); four teals, two navies, three greys; 700px written six ways. Fix: assets/css/tokens.css loaded first; migrate fintech, industry, sales, qe-outcomes; a raw-hex check (plain CSS, no Sass map).

**F37 · Colour semantics** — low (lowered) · small. Fintech decks and 3D demo already agree hue-for-role but label differently; industry diagrams have no legend and their amber current-step highlight (slide-master.css:115) reads as "human". Fix: one key, rename 3D groups, a legend include, a non-semantic highlight.

**F48 · Prose measure 110-157 characters** — low · small. Case-study and dictionary paragraphs run 1096px vs 659px on docs; only .dictionary-definition is capped (dictionary.css:40). Fix: max-width 72ch on prose blocks.

**F49 · Reading-view nav narrower than slides** — low · small. .slides 1200px at x=40 (slide-master.css:67) under a 1081px fixed nav and flow bar (reading-1280.png). Fix: one shared width; hide the flow bar in reading view.

### Evidence & claims

**F26 · Scenario model and pack arithmetic have no bridge** — medium · small. scenarios.json base → 3.30% capacity / 0.45% cash; fintech_case.json profiles[1] 300 → 222 h = 26% gross / 22% net at full adoption; savings-model.md:55 band 15-35%; "26%|22% net|scenario model" = 0 hits anywhere. Fix: a `derivation` object rendered in capacity.html and implementation.md plus one cross-walk sentence on slide 8.

**F28 · FlakyGuard without denominators (R02 repeated)** — medium · small. testing-studies.md:54 and phased-pilot.md:38 "about half … about half"; industry_sources.json E07 warns of different populations; claims.json holds only `testgen`; arXiv 2511.14002 confirms 47.6% / 51.8%. Fix: a `flakyguard` claim record and include; replace "Pilot use" with local-measurement questions.

**F29 · Derived numbers hard-coded** — low (lowered) · small. capacity.html:4 "15 packs", fintech_decks.json:81,83, implementation.md:153-164, fintech.html:54-56; verify_fintech.py:32 checks literals. Correction: fintech-model.test.cjs recomputes from the JSON, so CI would go red, and the inputs have never changed. Fix: Liquid ceil, reuse the include, recompute in verify_fintech.py, a digits-to-words map for the capacity clip.

**F43 · Parallel evidence registers** — low · medium. docs/evidence "Verified 4 September" vs index.md:17 "6 September" vs register max 2026-09-05; ~9 benchmarks.md studies absent from the register; barriers.html:7 "50%" (correct per Capgemini) has no record; two DORA 2025 URLs; JSON/CSV/snapshot copies hand-maintained (README.md:41-42, _config.yml:74). Fix: single register with per-record figures, dates rendered from data, a --check export generator, delete the snapshot.

**F50 · AIDA omitted; date-sensitive wording** — low · small. "AIDA|C-27" = 0 hits; canadian-banking.md:45 "House resumes 21 Sep 2026", :27 "by 1 Sep 2026" as future; C-27 died at prorogation 6 Jan 2025 (parl.ca). Fix: one sentence on C-27; past-tense E-21 milestone; a dated status field with a 90-day staleness check.

**G2A · ElevenLabs licence status unverifiable from the repo** — medium (lowered) · small. 114 served recordings across four batches (#38, #46, #55); the paid tier is stated only in PR #38 and unrendered voice-audition.md:3; generate_elevenlabs_narration.py:144-145 forces receipts (subscription_tier) outside the repo; narration.json has no tier; the bundle README (prepare_release.py:64-75) names no provider or licence; ElevenLabs article 13313564601361 requires attribution for free-tier content. Most likely evidentiary, not a breach. Fix: narration-provenance.json per audio directory, a validate_narration.py assertion, a licence sentence in bundle and notes; regenerate any batch without a receipt.

**G2B · No disclosure of AI-generated images or synthetic voice** — medium · small. index.md:17 figcaption "One platform. Every QA workflow."; four v1.23.0 PDFs: 0 hits for AI-generated/ElevenLabs/synthetic voice; only docs/industry/index.md:46 discloses images; narration.js labels "English narration". Fix: _includes/media-credit.html on footer, four covers (so it reaches PDFs), narration status line and release README; verify_site.py assertion.

**G2C · Provenance records scattered, no credits page** — low · small. Fonts, three.js, images (unpublished research/visual-provenance.md), narration and film records sit in five places; only three-LICENSE.txt reaches _site. Fix: docs/credits.md with three tables rendered from G2A's data; link from footer and releases.md.

### Engineering, repo & release

**F15 · 42 superseded PDFs (70 MB) ship unlinked** — medium · small. 53 PDFs shipped, 11 referenced; /assets/pdf/ai-qe-evp-v1.12.1.pdf returns 200 and predates the client renames; _config.yml:67-73 and verify_qe_scope.py:39-42 are hand lists; verify_publication.py never checks for unreferenced files. Fix: delete the 42, an edition rule in verify_publication.py, a "What to send after the meeting" line, a retention rule on /releases/.

**F16 · A release on every push** — medium · medium. pages.yml:31-37,132-150; release_identity.py:28-31 forces a bump even on PR builds; 27 releases in ~48 h; the 68.3 MB zip is re-cut because prepare_release.py:55 embeds the edition; /releases/ 15,593px, 41 search entries; release-banner.html on 42 pages with changelog copy. Fix: gate on a diff touching release.yml; digest-named zip; banner reduced to version · date · link; search_exclude releases.md; compact history table.

**F17 · README as operations manual; internal note published** — medium · small. README 249 lines / 22 headings; :8 "two audience presentations" (four), :33 "five topic pages" (ten); no CONTRIBUTING.md; docs/narration/voice-audition.md served raw with stale counts and vendor billing notes; "AI-QE" in 10 source files. Fix: ~60-line README, CONTRIBUTING.md, an excluded maintainers/ directory, a no-*.md assertion, brand string replacement.

**F39 · Binaries growing ~69 MB/day** — medium · medium. Reachable blobs 7.7 MB (v1.3.0) → 215.6 MB (v1.23.0): PDF 99.1 MB, audio 71.0 MB, mp4 27.5 MB; .gitattributes covers only *.pdf and *.webp; each edition commits four 1.3-3.5 MB PDFs. Fix: `* text=auto` and binary rules now; generate PDFs in CI from _site; keep only the current edition's audio (LFS bandwidth would not survive this CI cadence).

**F40 · 18-minute serial browser step, run twice per change** — medium · medium. Push runs average 17.7 min, of which the browser step is 18.0; pages.yml:48-49 apt-installs ffmpeg unconditionally; :76-95 runs 20 suites serially, 15 of 32 .cjs loop both engines; ~4.9 runner-hours/day. Fix: checks job uploading _site, browser matrix over 4-5 groups, cached ffprobe; no paths-ignore (docs are site pages).

**F41 · Timing-sensitive suites** — low (lowered) · medium. 10 failed + 4 cancelled of 27 PR runs, 0 of 13 pushes; ~6 timeout-class (narration-test.cjs:119 asserts seek < .15 s), four genuine catches; 28 waitForTimeout calls across 12 suites; all timeouts on WIP branches. Fix: event-driven waits and ordering assertions, shared WAV fixture, one retry for media suites, suite name on failure.

**F42 · No single local entry point; copied harness code** — medium · medium. package.json `test` covers 3 model tests, `test:browser` one suite; 20 suites and 8 narration checkers exist only in pages.yml; _config.yml:64 excludes a non-existent playwright.config.cjs; 22 files define the test base, 15 launch both engines, two WAV builders; no tools/README.md. Fix: Makefile called by pages.yml, tools/lib/harness.cjs, an ownership table, remove the dead exclude.

**F44 · AppSec questionnaire rename uncommitted** — low · small. ` D …-v2.pdf` tracked since cd0c724, `?? …-v2.1.pdf`; both excluded at _config.yml:67-68; verify_qe_scope.py:11 would otherwise fail the tracked file. Fix: git rm v2, drop v2.1, remove the exclusions.

**F51 · Deprecated action majors; unused theme gem** — low · small. Run 34398124556 warns Node 20 for checkout@v4, setup-node@v4, setup-python@v5, upload-artifact@v4; Gemfile:4 installs just-the-docs 0.12.0 while _config.yml:15 renders remote_theme 9c8baeb. Fix: bump majors, add dependabot.yml, keep one theme source.

### Web quality & accessibility

**F20 · Audio fetched on load and every slide change** — medium · small. narration.js:15 preload='metadata', :182/:187 src + load() per render; 18 audio requests after 8 ArrowRight presses with no Play; the homepage iframe fetches slide-1.mp3 before interaction; five unreferenced MP3/VTT pairs (2.3 MB). Fix: preload='none', src inside play(), seed the time display from manifest durations, delete the pairs, assert zero .mp3 before Play.

**F21 · ~236 KB gz of JSON per docs page** — low (lowered) · medium. search-data.json 710 KB raw (116 slide anchors ≈ 160 KB), narration JSON 215 KB, fetched by the theme's just-the-docs.js:78-80 and narrator-notes.js:128-130 unconditionally; cached 10 minutes. Fix: early return in narrator-notes.js, truncate slide entries in finalize_site.py, concatenate site CSS/JS; fork search only if the team will own it.

**F38 · 0.11-0.12 CLS on deck pages** — medium · small. /briefings/evp/ 0.1137, fintech-technical 0.1179; with JS off the page is 18,973px of stacked slides; decks.js:182 collapses them after 14 deferred scripts; at 1.5 Mbps the stack is visible ~0.7 s. Fix: inline html.js class in deck.html, CSS hiding non-first slides until .deck-ready, reserved header height; assert CLS < 0.05.

**F52 · Minor WCAG defects** — low · small. sales.css:71 #697d78 on white 4.37:1 and :101 #5f7474 on #eff4ee 4.45:1 at 12px; 30× identical "Publisher source" links (AA satisfied by context; usability issue); narrator-notes.js:46-48 injects h3s after the h1. Fix: #56696a (5.79:1 / 5.20:1), hidden-span labels, contextual heading level.

**F53 · No accessibility or budget check in CI** — low · medium. No axe in node_modules; no suite asserts CLS, rendered font size, contrast or bytes; every defect above came from ad hoc scripts. Fix: @axe-core/playwright on eight pages; assertions for CLS, .mp3 before Play, SVG text ≥ 11px, cover intersection, frame width, and a bytes budget set just above today's numbers.

**G1A · Unused Mermaid loads 328 KB of unpinned CDN JS on 38 of 43 pages** — medium · small. _config.yml:49-50 triggers the theme's unconditional jsdelivr import; zero mermaid diagrams exist; no integrity or CSP; with the CDN blocked the page and search work. Fix: delete the two lines; assert no cdn.jsdelivr.net in _site.

**G1B · No first-party-script guard** — low (lowered) · small. verify_site.py:35 skips every off-origin src/href; the Mermaid injection passed 47 commits of CI. Fix: fail on off-origin script/stylesheet/iframe/media in verify_site.py with one fixture test.

**G1C · No Content-Security-Policy meta** — low · small. 0 CSP anywhere; after Mermaid removal no executable inline script remains; a strict script-src 'self' meta tested in-flight produced zero violations on /, evp, demo and docs. Fix: add the meta early in head_custom.html, deck.html and demos/architecture.html; keep style-src 'unsafe-inline'.

## 5. Rejected or downgraded items

- **F27 (rejected).** "Mature/year-one savings ranges still published" — removed in f169fc7 (#55): savings-model.md:59 now says "No mature savings range is established"; no such range in source, _site or the PDFs.
- **F07 high → medium.** 79,870 words not 85k; only two pages render source lists; the 11-minute route exists — the gap is the export.
- **F09 high → medium.** 0-6px cyclic clip, absent with motion off, caused by the float animation not decks.css:44.
- **F21 medium → low.** Cached 10 minutes; ~1 s on a 2 Mbps VPN.
- **F23 medium → low.** A subset of F03; R09 was implemented.
- **F29 medium → low.** CI does recompute the pack figures; inputs have never changed.
- **F32 medium → low.** The long clip already has 13 synchronized cues; only metadata is stale.
- **F34 medium → low.** Groups collapse by default; executive-presentation is already retitled.
- **F35 medium → low.** Only the kicker and ~7px of the title are hidden; scroll-margin already exists.
- **F36 medium → low.** Teal variants differ by a few units; not audience-visible.
- **F37 medium → low.** Hues already agree across fintech and 3D; only labels and the industry highlight conflict.
- **F41 medium → low.** ~6 of 10 PR failures were timeouts, four were genuine catches, none on passing code.
- **G1B medium → low.** Preventive control for one vector on a single-theme static build.
- **G2A high → medium.** Two independent statements say the paid plan preceded production; the fix is documentary.
- **F47 low → medium (raised).** Utility links are invisible on every page at 1366×768 even with all groups collapsed.

## 6. Method and limits

Eight lenses (strategy, information architecture, visual design, decks, evidence, engineering, web quality, audience) plus two gap probes (third-party runtime code; media provenance and licensing) produced 61 findings; an independent verifier re-tested each against the CI-identical local build at http://127.0.0.1:61600/ai_qe/ and main f169fc7, which is v1.23.0 rather than the v1.22.0 named in the brief (#55 landed during the review). One finding was rejected as already fixed, thirteen lowered, one raised, and line references corrected. Measurements: Playwright (Chromium, some WebKit) at 1280×720, 1366×768, 1920×1080 and 390×664 with layout-shift observers, computed-style and getScreenCTM font measurement, request logs and CDP throttling; ffprobe on all 116 clips; pypdf scans of the v1.23.0 PDFs; git object accounting; `gh` run and release listings; primary-source checks of OSFI, parl.ca and ElevenLabs on 9 September 2026. Prior reviews (research/reviews/*-2026-09-06.md) were read first: R01, R02, R04, R07, R08, R13, R14, L03, L04, L06, L07 confirmed fixed; R09 partially resolved (F23); L01 regressed (F18); L02 and L05 open (F10, F19). Not done: live user or presenter testing, screen-reader testing beyond structural checks, legal review of the licence question, verification of the FlakyGuard 71.6% figure or the E-21 cover-letter date, browsers other than Chromium/WebKit. This is a one-day snapshot of a repository that shipped 27 editions in 48 hours; evidence lines will shift with the next release.
