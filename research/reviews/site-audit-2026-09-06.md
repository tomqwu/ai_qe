**AI × QE site review — 6 September 2026**

Reviewed edition: **1.2.1**, commit `fd1133eddb8b831d2faa6b71bc1a8a09b8b89eae`. Public site: [AI-QE & AppSec](https://tomqwu.github.io/ai_qe/).

**Assessment: needs revision before a polished EVP or technical leadership presentation.** The visual foundation is strong: the site has two audience decks, native architecture diagrams, source-linked explanations, an interactive economic model and a useful research library. The main gaps are inconsistent information across editions, presentation behavior, and the depth of the strategic and implementation narratives.

This audit identifies **14 findings: four high priority, nine medium priority and one lower priority**. High priority means resolve before the next senior-audience presentation; it does not mean a security incident or a site outage. Functional defects, content inconsistencies and editorial recommendations are distinguished below. No site fixes or deployment were performed during this review.

The follow-up [slide layout, readability and navigation review](/Users/tomwu/Projects/ai_qe/research/reviews/slide-layout-review-2026-09-06.md) develops the visual findings with measured margins, title sizes, canvas widths, mobile behavior and a proposed acceptance standard. Its layout observations refine this audit rather than forming a separate additive issue count.

**Scope and evidence**

The review covered the published source and generated structure for 28 HTML pages, all 18 EVP and 26 technical slides, the economics, research, method and governance material, shared diagram and presentation behavior, and the downloadable research brief. Browser checks covered the live homepage, embedded and standalone decks, search, source filtering and the value model. All 44 slides were measured at 1280 × 720. Presentation mode was also inspected at 2560 × 1440. Mobile layouts were sampled in 390px iframe containers, with 375px content viewports after scrollbars, using a local build of the published revision.

Research verification was selective, with primary-source checks of Meta TestGen-LLM, OSFI B-13, Canada's Bill C-36 status and the European Commission's AI Omnibus dates. This was not a new exhaustive literature search or a recertification of every legal and product claim. Automated link checks covered internal references, not every external publisher URL. Accessibility inspection covered structure and selected keyboard interactions; it was not a full WCAG conformance audit or an assistive-technology user test. No real bank outcomes or questionnaire responses were available to validate.

The pre-existing local questionnaire PDF rename was excluded from the build snapshot and preserved. It is not reported as a published broken link.

| Check | Result | Practical limit |
|---|---|---|
| Jekyll build | Passed | Theme Sass deprecation warnings remain |
| Internal navigation and search structure | 28 pages, 2,047 references, 209 search entries passed | Slide content is excluded from search; see R07 |
| Source and diagram validator | 30 matching source records, valid citations, 12 guided connections, complete decks | Checks structural integrity, not the truth of every claim |
| Economic model tests | All 7 passed | Does not reconcile the separate Markdown waterfall or permit negative task saving |
| Questionnaire validator | 8 pages, 210 fields, 230 widgets; save/reopen and range checks passed | Used the published PDF, not the user's pending renamed file |
| Additional HTML inspection | No duplicate IDs or images missing `alt` attributes in generated HTML | Does not establish complete accessibility |
| Live value model | Base $45k; no-capture −$120k per $10M | Both are illustrative assumptions |
| Live source filtering | Filtering changed the results; Clear restored 30 records | Not a comprehensive external-link availability test |
| Slide viewport fit | 3 of 44 had navigation extending below 720px | Selected fullscreen and mobile checks supplemented this |
| Research PDF | 13 pages; dated 5 September; cover rendered and inspected; text extracted throughout | Companion brief, not a current deck export; no full PDF accessibility certification |

**R01 — High priority · Content inconsistency: two different “base case” economics**

The live simulator and its fallback table use `55% × 60% × 50% × 20% = 3.30%` released capacity. At 50% capture, less 1.0% AI/pilot cost and 0.2% quality allowance, the net is **0.45%, or $45,000 per $10 million**. The written base-case waterfall substitutes 4% capacity and reports **0.8%, or $80,000**. Both calculations are internally understandable, but the shared “base case” label conceals different assumptions. The scenario table also mixes exact products and planning ranges in rows labelled calculated.

Evidence: [model inputs and formula](/Users/tomwu/Projects/ai_qe/assets/js/qe-model.js:4), [static scenario and waterfall](/Users/tomwu/Projects/ai_qe/docs/economics/savings-model.md:61), [live savings page](https://tomqwu.github.io/ai_qe/docs/economics/savings-model/). The waterfall begins at line 76.

**Acceptance:** generate the simulator, static table and any briefing calculation from the same scenario data. Alternatively, give the 4% example a distinct name and explicitly explain the difference. Separate illustrative inputs, exact calculated results and planning ranges. Every surface should reconcile without the presenter explaining an unstated rounding policy.

**R02 — High priority · Research inconsistency: an older Meta record uses the wrong population**

The newer technical slide correctly presents 75% / 57% / 25% as proportions of target test classes with at least one qualifying generated test. The older evidence page calls them percentages of generated tests. Its “Pilot use” paragraph, repeated in the pilot plan, further recommends expecting roughly half to three quarters of filtered candidates to be accepted. That turns a company-specific case into a transferable expectation without establishing that range.

Evidence: [older finding and pilot interpretation](/Users/tomwu/Projects/ai_qe/docs/evidence/testing-appsec-studies.md:30), [pilot plan](/Users/tomwu/Projects/ai_qe/docs/method/phased-pilot.md:36), [current technical slide 4](https://tomqwu.github.io/ai_qe/briefings/technical/#slide-4). The paper itself uses imprecise shorthand in its abstract, but [Meta's detailed evaluation, §3.3](https://arxiv.org/html/2402.09171v1#S3.SS3), specifies test classes. The 73% recommendation acceptance result belongs to a deployment population and should stay separate.

**Acceptance:** maintain a canonical claim record with population, denominator, metric and caveat, and render it everywhere the finding appears. Replace the suggested bank acceptance range with a local measurement question. The older page should retain the same precision as the slide.

**R03 — High priority · Confirmed functional defect: Read all → Present breaks slide mode**

Reproduction: open the technical deck, select **Read all**, then **Present**. The body retains both `reading-view` and `presentation-mode`; all 26 slides remain visible, while slide navigation and the control for leaving reading view are hidden. At the observed presentation viewport the document was about 35,158px tall. Exiting presentation restores the reading control, so this is recoverable, but it interrupts a live presentation.

Evidence: [reading and presentation state handling](/Users/tomwu/Projects/ai_qe/assets/js/decks.js:54), [presentation control visibility](/Users/tomwu/Projects/ai_qe/assets/css/decks.css:187), [technical deck](https://tomqwu.github.io/ai_qe/briefings/technical/).

**Acceptance:** entering Present should activate a defined single-slide state and preserve the current slide. On exit, either restore the previous reading state or return to a clearly labelled slide view. Verify reading → present → exit, ordinary present → exit, and Escape in both standalone and embedded decks.

**R04 — High priority · Confirmed layout defect: some slides exceed the presentation viewport**

At 1280 × 720, EVP slide 13 and technical slide 2 placed the slide bottom at approximately **779px** and navigation bottom at **835px**. Technical slide 14 placed navigation bottom at **731px**. The platform slide also put navigation below the viewport in the inspected 2560 × 1440 presentation view. Opening additional research or inspector detail can add more height. The layout is controlled by width and aspect-ratio assumptions rather than the actual combined height of title, figure, controls and footer.

Evidence: [diagram sizing rule](/Users/tomwu/Projects/ai_qe/assets/css/diagrams.css:81), [deck layout](/Users/tomwu/Projects/ai_qe/assets/css/decks.css:24), [platform slide](https://tomqwu.github.io/ai_qe/briefings/technical/#slide-2), [judge-calibration slide](https://tomqwu.github.io/ai_qe/briefings/technical/#slide-14).

Mobile text layouts were readable in the sampled views and had no whole-page horizontal overflow. The architecture deliberately uses a 920px canvas inside a measured 317px diagram window. Panning and a text description are provided, and the platform tour includes automatic panning. This is a usable fallback, but the complete architecture cannot be understood at a glance on a phone.

**Acceptance:** reserve space for navigation and keep the presentation canvas within the viewport at common laptop and projector sizes. Put expanded research details in a drawer or reading mode. Add a fit-to-view overview or a simplified vertical mobile map alongside the detailed pannable diagram; preserve readable labels and keyboard access.

**R05 — Medium priority · Analytical gap: the simulator cannot model a task slowdown**

The net-task-saving slider permits only 0–50%, and even the Downside preset assumes a positive 10% task saving. Users can model a negative financial return through cost or lack of capture, but cannot represent AI increasing human effort through review and correction. This omits a central downside discussed in the site's own evidence lens.

Evidence: [slider minimum](/Users/tomwu/Projects/ai_qe/_includes/explorers/value.html:8), [preset definitions](/Users/tomwu/Projects/ai_qe/assets/js/qe-model.js:4).

**Acceptance:** include a slowdown scenario with explicitly defined additional labor/rework costs. Avoid blindly applying a cash-capture factor to negative capacity. Distinguish additional effort, released capacity and captured benefit in the result labels. Negative task saving, zero capture and fixed costs should each have a coherent treatment.

**R06 — Medium priority · Measurement gap: promotion rules leave decisions undefined**

Technical slide 24 says the pilot plan specifies a **10–15% review band**. The plan defines a go threshold of at least 15% on one use case and a stop threshold below 10% on both, but does not specify an action for the intervening cases. It also asks quality measures to stay within a two-quarter baseline range without defining normalization, the relevant exposure, minimum sample or how uncertain results affect the decision. Elsewhere the plan appropriately requests confidence ranges, but that principle is not connected to the promotion table.

Evidence: [technical slide claim](/Users/tomwu/Projects/ai_qe/briefings/technical.html:136), [phase gates](/Users/tomwu/Projects/ai_qe/docs/method/phased-pilot.md:26), [quality floors](/Users/tomwu/Projects/ai_qe/docs/method/phased-pilot.md:52).

**Acceptance:** publish a decision table for go, extend/redesign, stop and insufficient evidence. Define denominators and comparison periods for defect and incident measures, the owner of each decision, and how uncertainty is handled. Avoid implying a short pilot can establish the absence of rare failures.

**R07 — Medium priority · Confirmed discovery and sharing defects: slide state is not carried through the site**

All 44 slides are excluded from the site's search index. A search can find related documentation but cannot return the actual technical slide 25 or other slide-specific content as a direct result. There is also a reproducible stale-link issue: click the homepage's **Mutation testing** feature link, advance the embedded deck from slide 10 to 11, and inspect **Open assurance architecture**. It still points to slide 10. The parent address remains `/#briefings`, so copying it also loses the audience and current slide.

Evidence: [EVP search exclusion](/Users/tomwu/Projects/ai_qe/briefings/evp.html:9), [technical search exclusion](/Users/tomwu/Projects/ai_qe/briefings/technical.html:9), [embed navigation handling](/Users/tomwu/Projects/ai_qe/assets/js/briefing-embed.js:58), [homepage briefings](https://tomqwu.github.io/ai_qe/#briefings). The generated search index contains zero standalone-deck records.

**Acceptance:** index slide titles and substantive content with direct anchors. Have the iframe report its current audience and slide; synchronize the open-deck link and a shareable parent URL. Reloading or opening the copied link should reproduce the same audience and slide.

**R08 — Medium priority · Information architecture gap: legacy presentation guidance competes with the current decks**

The published **Executive presentation** page describes a 60–90-minute pilot economics session and still says only the questionnaire charts and waterfall merit visuals, with everything else a table or sentence. The current EVP deck is an 18-slide strategic vision briefing. These can serve different purposes, but the older page does not clearly route readers to the newer experience. Parallel “Industry research” and “Evidence” sections also maintain overlapping summaries, contributing to R02.

Evidence: [older executive page](/Users/tomwu/Projects/ai_qe/docs/method/executive-presentation.md:17), [visual guidance](/Users/tomwu/Projects/ai_qe/docs/method/executive-presentation.md:42), [current audience briefings](https://tomqwu.github.io/ai_qe/briefings/).

**Acceptance:** establish explicit routes for strategic vision, architecture, evidence and pilot delivery. Rename and label the older page as a pilot business-case facilitation guide, update its visual guidance, and link to the current audience decks. Reuse canonical evidence records rather than editing the same findings in multiple places. Also distinguish a model-provider gateway from action authorization when reconciling the older gateway advice with the new architecture.

**R09 — Medium priority · Editorial gap: the EVP vision needs sharper strategic choices**

The deck already has a target-state diagram, portfolio map, ownership model, investment layers and capability horizons. Its remaining weakness is the argument connecting them. “Quality as a shared capability” is sensible, but broad enough to fit almost any enterprise. The closing agenda asks leaders to choose ambition, foundations and evidence without making the competing strategic options concrete.

Evidence: [EVP deck](/Users/tomwu/Projects/ai_qe/briefings/evp.html:19), particularly [portfolio slide 8](https://tomqwu.github.io/ai_qe/briefings/evp/#slide-8), [horizons slide 15](https://tomqwu.github.io/ai_qe/briefings/evp/#slide-15) and [leadership agenda slide 18](https://tomqwu.github.io/ai_qe/briefings/evp/#slide-18).

**Acceptance:** build a clear strategic chain: how AI changes delivery economics and risk; what quality capability the enterprise needs; which shared assets matter; which decisions remain with domains; and what sequencing avoids fragmentation. Use one banking workflow to show the proposed change from today's process to the target state. Compare concrete choices such as isolated assistants, shared assurance services and bounded agents, including tradeoffs. Label any bank-specific starting conditions as hypotheses until supplied. Preserve the user's strategic-vision emphasis rather than turning the deck into a funding pitch.

**R10 — Medium priority · Architecture depth gap: logical diagrams need a worked engineering contract**

The technical deck covers context, configuration identity, test oracles, mutation, judges, authority, isolation, release, recovery and telemetry. Architecture is present. However, the “integration contracts” are prose lists of fields, and the payment-API and poisoned-document examples stop before showing actual request, decision and evidence artifacts. An SD or lead cannot yet evaluate interface compatibility or failure semantics from a concrete example.

Evidence: [technical integration contracts](/Users/tomwu/Projects/ai_qe/briefings/technical.html:127), [poisoned-document walkthrough](/Users/tomwu/Projects/ai_qe/briefings/technical.html:139), [architecture reference page](https://tomqwu.github.io/ai_qe/docs/industry/architecture/).

**Acceptance:** add one end-to-end worked example with a task envelope, permission decision, versioned evaluation manifest and evidence record, plus their validation rules. Specify choices for timeouts, duplicate requests/idempotency, stale policy, unavailable authorization and evidence-store failure. Tie the component, sequence, deployment and recovery diagrams to the same example. These can be concise reference artifacts; a complete production implementation is not required for the briefing.

**R11 — Medium priority · Research coverage gap: the industry assessment is still a curated introduction**

The site accurately labels its 30-source review as curated, non-exhaustive and independent of Gartner/McKinsey. That transparency is a strength. Relative to the requested depth, the technology landscape remains six representative products described largely from documentation, and the case narrative centers on Meta, Google and Uber. AI-assisted AppSec has useful older studies but no equivalent end-to-end architecture walkthrough in the technical deck. Several broader QE domains appear in discovery material without a corresponding researched view of opportunity and limits.

Evidence: [research method](/Users/tomwu/Projects/ai_qe/docs/industry/index.md:38), [technology landscape](/Users/tomwu/Projects/ai_qe/docs/industry/landscape.md:7), [testing/AppSec studies](https://tomqwu.github.io/ai_qe/docs/evidence/testing-appsec-studies/), [source register](https://tomqwu.github.io/ai_qe/docs/industry/library/).

**Acceptance:** add a coverage matrix across test design, data, execution, maintenance, triage, security, nonfunctional testing and AI-system evaluation, identifying what is supported, weakly evidenced or out of scope. Record the research questions and inclusion/exclusion choices. Expand the landscape by comparable requirements and deployment options, with evidence grades instead of unsupported vendor scores. Add an AppSec finding-to-reviewed-fix walkthrough that includes validation and auditing dismissed findings. A deeper review does not require reproducing licensed analyst reports or inventing bank case results.

**R12 — Medium priority · Visual storytelling gap: motion is not yet tailored to each diagram's logic**

The platform's overview, inspection and nine-step tour now have an explicit visual meaning. The remaining flow diagrams use the generic arrow animation. On technical slide 19, all four recovery transitions pulse indefinitely at the same time, with no guided controls or active state. The caption correctly says this shows direction rather than live activity, so it is not a claim of real system behavior. It is nevertheless less useful for teaching the sequence. Decision branches and numbered sequence messages need a different presentation rhythm from a relationship map.

Evidence: [generic path animation](/Users/tomwu/Projects/ai_qe/assets/js/motion.js:20), [platform-only tour wrapper](/Users/tomwu/Projects/ai_qe/_includes/diagrams/figure.html:3), [recovery slide 19](https://tomqwu.github.io/ai_qe/briefings/technical/#slide-19).

**Acceptance:** define motion by diagram type: a steady overview for component maps; ordered message reveals for sequences; one selected branch for decisions; and an explicit current state for recovery flows. Give presenters step/replay controls for a few high-value demonstrations. Keep passive relationships visible and retain the existing motion-off and reduced-motion behavior. A compelling example would let the audience trigger an unauthorized action, observe the denial, inspect its evidence and step through recovery.

**R13 — Lower priority · Publication packaging gap: site, research and downloadable editions need clearer labels**

The site prominently displays version 1.2.1 and a latest-change line. Source review dates remain distinct. The downloadable research PDF is a dated 13-page companion, created on 5 September, without the site version or the expanded 18/26-slide content. The research log explains that distinction, but download links do not consistently state the brief's edition and relationship to the current decks. There is no direct, versioned deck PDF download in the briefing controls.

Evidence: [release data](/Users/tomwu/Projects/ai_qe/_data/release.yml:1), [research download description](/Users/tomwu/Projects/ai_qe/docs/industry/index.md:36), [companion clarification](/Users/tomwu/Projects/ai_qe/docs/research-log.md:18), [research brief](https://tomqwu.github.io/ai_qe/assets/pdf/ai-qe-industry-research-2026.pdf).

**Acceptance:** label the companion's date/page count at the download point, distinguish site edition from research cutoff, and offer stable, versioned audience handouts if offline sharing is part of the intended use. Keep an accessible release history linked from the version banner. Do not relabel the existing PDF as an export of the expanded decks.

**R14 — Medium priority · Maintenance gap: release checks do not cover the failures the audience encounters**

The existing checks are valuable and pass. They verify build output, internal links, citation references, slide counts, flow-route coverage, PDF fields and model arithmetic. They do not exercise reading/presentation transitions, slide viewport fit, iframe state propagation or agreement between model data and prose. Those omissions explain how a structurally valid release can still contain R01, R03, R04 and R07.

Evidence: [Pages workflow](/Users/tomwu/Projects/ai_qe/.github/workflows/pages.yml:30), [site validator](/Users/tomwu/Projects/ai_qe/tools/verify_site.py:1), [industry validator](/Users/tomwu/Projects/ai_qe/tools/verify_industry.py:1).

**Acceptance:** add a small browser smoke suite for the actual presentation journeys, viewport assertions for all slides at two desktop sizes and one mobile size, and regression checks for shared claims/scenarios. Include a brief visual review of representative diagram, chart, table, embedded and expanded-detail states. These checks should target user-visible failure modes rather than merely mirror CSS or JavaScript implementation.

**Recommended sequence**

1. Resolve R01–R04 before the next presentation: consistent economics and evidence, predictable viewing modes, visible slide navigation.
2. Resolve R05–R08 and R14: complete the downside and gate logic, synchronize sharing/search, clarify the content routes and prevent recurrence.
3. Develop R09–R12 as the substantive next edition: a sharper EVP argument, worked technical contracts, broader evidence coverage and scenario-led motion.
4. Finish R13 when preparing the offline distribution package.

The useful next step is a focused editorial and interaction pass on this foundation. Additional slides or effects should serve specific unanswered audience questions and demonstrate a mechanism, decision or tradeoff.
