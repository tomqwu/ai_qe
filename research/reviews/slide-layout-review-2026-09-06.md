**Slide layout, readability and navigation review — 6 September 2026**

Edition **1.2.1**, commit `fd1133eddb8b831d2faa6b71bc1a8a09b8b89eae`. This extends the [site audit](/Users/tomwu/Projects/ai_qe/research/reviews/site-audit-2026-09-06.md), particularly its viewport, presentation-mode and navigation findings. It is a review and proposed design standard; the published site has not been changed.

**Assessment:** the decks need a shared slide master and a consistent text scale. The font family and navy/teal identity are coherent, but slide geometry, typography and presentation surfaces change with the content type. Those changes make the deck feel assembled from separate components and require the audience to readjust between slides.

All 44 slides were inspected through rendered layout measurements at 1280 × 720. Representative diagram, table, chart, interactive and cover layouts were compared, with additional live presentation checks at 2560 × 1440, a homepage embed, and three mobile layouts from the published build. Mobile containers were 390px wide with 375px content viewports after scrollbars. Numbers below are CSS pixels, not PowerPoint points or measurements of an actual meeting-room projection.

| Example at 1280 × 720 | Canvas width | Left content edge | Title top | Title size | Horizontal padding |
|---|---:|---:|---:|---:|---:|
| Technical 6 — evaluation table | 1,022.2 | 173.5 | 145.4 | 41.9 | 51.1 |
| Technical 3 — payment sequence | 862.5 | 228.1 | 115.6 | 29.3 | 25.9 |
| Technical 2 — platform | 862.5 | 228.1 | 115.6 | 29.3 | 25.9 |
| EVP 5 — value simulator | 1,022.2 | 173.5 | 130.1 | 33.7 | 51.1 |

**L01 · High priority — Use one canvas, margin grid and title alignment**

The canvas shrinks by about 160px when moving from a table to a diagram. The left text edge shifts about 55px to the right and the title moves about 30px upward. Diagram padding is also roughly half the standard horizontal padding. These differences are driven by layout classes, not by an intentional chapter transition. Canvas heights vary as content expands, which also moves the footer and navigation.

The cause is visible in the [general slide layout](/Users/tomwu/Projects/ai_qe/assets/css/decks.css:22), [diagram padding](/Users/tomwu/Projects/ai_qe/assets/css/diagrams.css:50), [diagram-specific viewport sizing](/Users/tomwu/Projects/ai_qe/assets/css/diagrams.css:81) and [interactive override](/Users/tomwu/Projects/ai_qe/assets/css/explorers.css:78).

**Required outcome:** one fitted presentation canvas, shared safe margins, and fixed alignment lines for kicker, title, content and footer. Cover slides may have an intentional exception. Tables, diagrams and charts should share the same frame and title anchor. Use the content area differently without changing the outer geometry. Reserve space for two-line titles rather than allowing their extra line to move the controls below the viewport.

**L02 · High priority — Size text for the rendered view and scale presentation text with the canvas**

At the laptop viewport, table text is about **14.8px**, footer text **10.4px**, and the platform's 18-unit node text renders at about **12.1px** after the SVG is scaled to 808.8px from a 1,200-unit viewBox. Its 16-unit labels render at about **10.8px**. The homepage embed is slightly smaller: an 888px iframe, an 848px slide and a 795.1px diagram.

Fullscreen does not solve this consistently. The observed table canvas expands to about **2,302px**, but table text is capped at **20px**, the title at **56px**, and the footer at **12.8px**. The adjacent diagram scales its SVG text with the figure: 18-unit text becomes about **27.4px** in an 1,824px-wide figure. The same presentation therefore uses substantially different body-text scales between adjacent slide families.

Evidence: [table font cap](/Users/tomwu/Projects/ai_qe/assets/css/decks.css:85), [footer font cap](/Users/tomwu/Projects/ai_qe/assets/css/decks.css:32), [diagram text rules](/Users/tomwu/Projects/ai_qe/assets/css/diagrams.css:17), [technical table](https://tomqwu.github.io/ai_qe/briefings/technical/#slide-6) and [context diagram](https://tomqwu.github.io/ai_qe/briefings/technical/#slide-7).

**Required outcome:** apply one text hierarchy across HTML and SVG content. Evaluate SVG text at its final rendered size. Simplify crowded diagrams or move detail into an inspection view before shrinking labels. Fullscreen should make body text meaningfully larger, not just increase surrounding whitespace. A legible fact or caveat must not depend on opening a source link.

**L03 · Medium priority — Keep the selected presentation theme consistent across slide types**

In presentation mode, technical slide 6 remains a large white table slide; slide 7 switches to a dark gradient with a shadow and different border color. The switch is triggered by `.diagram-slide`, so it recurs according to content format. It is not a chapter or evidence-category signal. It also coincides with a canvas-size change, making the transition more conspicuous.

The light-mode outer border is already consistently one pixel across the sampled slide families. The problem is the combination of different surfaces, widths, shadows and multiple framing lines, rather than a need to make every border thicker. See [presentation diagram theme](/Users/tomwu/Projects/ai_qe/assets/css/motion.css:58).

**Required outcome:** choose a coherent surface for each viewing mode and apply it to diagrams, tables, charts and covers. The current light reading surface and dark presentation treatment can both remain, provided each is implemented across the complete deck. Use consistent border and divider tokens. Reserve stronger borders and color accents for actual selection, control boundaries or a deliberate chapter treatment.

**L04 · Medium priority — Align the footer and version information; reduce competing framing elements**

The release banner at 1280px is about **1,225px** wide, compared with 1,022px table slides and 863px diagram slides. At 2560px the navigation and banner are capped at 1,360px while the inspected slide canvases are much wider. These independently sized rectangles do not share an alignment line.

Diagram slides also combine a caption, compact citation IDs, an expandable research explanation, a footer containing brand/version/audience/source/slide number, an external slide count and the full latest-change banner. On the platform slide, the tour toolbar and component inspector add more material. Much of this is useful in reading mode, but it competes with the main diagram in presentation mode.

Evidence: [release banner sizing](/Users/tomwu/Projects/ai_qe/assets/css/release.css:7), [deck footer](/Users/tomwu/Projects/ai_qe/assets/css/decks.css:32), [diagram wrapper](/Users/tomwu/Projects/ai_qe/_includes/diagrams/figure.html:1).

**Required outcome:** keep a compact, readable source/footer band at a shared baseline. Retain the requested site version and latest-change information, placing the full change description in an accessible edition/details control during presentation. Put expanded research and component details in a consistent drawer or reading view. Align navigation to the same master frame.

**L05 · Medium priority — Balance density and whitespace through layout, not smaller type**

Technical slide 6's fullscreen table leaves several hundred pixels of unused vertical space below its last row while its body text remains 20px. Meanwhile, technical slide 14 combines a two-line title, a multirow table and a caveat, extending navigation below the laptop viewport. Both come from the same table system. The content area does not have a deliberate density strategy.

Other slide families add their own title widths and padding, which can create unexpected wraps. An identical text length does not receive comparable space across tables, diagrams and interactive slides. Consistency should mean a shared hierarchy and spacing rhythm, not forcing every kind of content into the same arrangement.

**Required outcome:** define a small set of compositions within the common master: cover, diagram, comparison/table, chart and interactive demonstration. Give each composition a readable content budget. Shorten cell wording, split a dense comparison or reveal supporting detail when needed. Preserve evidence and caveats; do not use font reduction as the default overflow repair.

**L06 · High priority — Keep navigation stable and immediately available**

The existing previous/next buttons, chapter-grouped selector and keyboard activation work in the sampled interactions. However, navigation sits after slide content, so its vertical position moves with the slide. The original audit confirmed three slides with navigation below a 720px viewport. On mobile, the evaluated table's navigation began at about **1,184px**, the diagram's at **802px**, and the value simulator's at **869px**, within a 670px-tall frame.

The header is sticky, but it prioritizes Motion, Read all and Present. Slide position and previous/next are below the content. Chapter names are mainly inside the dropdown. Read all hides the slide picker entirely, reducing navigation options in a long document. The original audit's stale embedded link and Read all → Present defects remain relevant.

Evidence: [navigation placement](/Users/tomwu/Projects/ai_qe/_layouts/deck.html:35), [navigation CSS](/Users/tomwu/Projects/ai_qe/assets/css/decks.css:97), [reading-mode controls](/Users/tomwu/Projects/ai_qe/assets/css/decks.css:107), [keyboard and state handling](/Users/tomwu/Projects/ai_qe/assets/js/decks.js:35).

**Required outcome:** provide one stable navigation bar with Previous, current slide/title or chapter, Next and a chapter/slide selector. Keep it visible without covering content. Put viewing-mode controls together as secondary actions. Keep diagram Play/Next step controls inside the figure so their scope stays clear. Reading mode should retain a chapter outline or jump control. The same slide state should survive entering Present, opening the standalone deck and sharing a link.

**L07 · Medium priority — Give mobile diagrams an overview before detailed panning**

The sampled mobile table reflows into readable labelled rows, and the value chart rearranges into a useful horizontal bridge. All three sampled mobile pages stayed within their 375px content width. These are strengths to preserve.

The diagram uses the same 920px-wide canvas inside a much smaller window. At the initial position on the context slide, only the first part of the workflow is visible. Users must pan to discover the remainder and mentally join the pieces. The pan hint and text description help, but neither provides an immediate visual overview. The platform tour has automatic panning; the other diagrams have no equivalent guided navigation.

**Required outcome:** provide a simplified vertical/mobile overview, an accessible step list, or an explicit overview/detail control. Retain the detailed diagram for inspection. Keep the meaning of connection direction, branch choice and state visible when the diagram is rearranged. Do not shrink the complete canvas into unreadable miniature text to avoid panning.

**L08 · Medium priority — Strengthen orientation and verify accessibility across viewing modes**

Visible keyboard focus was observed on activated navigation controls, and the source includes keyboard handling and live slide-count announcements. The current announcement is mainly a number such as `07 / 26`, rather than a slide title and chapter. That gives limited context when the content changes. Mode transitions, focused controls, hidden slides and expanded details need to be tested together.

Selected solid-color contrast calculations were healthy: body `#405563` on `#fcfcfa` ≈ **7.58:1**, teal `#096d69` on the same paper ≈ **6.01:1**, caption `#4a626b` ≈ **6.29:1**, and light diagram text `#e1efec` on `#1b3e4c` ≈ **9.65:1**. These spot checks do not certify every state or gradient. Small text remains hard to read even when its color contrast is sufficient.

**Required outcome:** announce the new slide title and position, preserve a predictable focus order, and retain visible focus on every control. Verify text contrast in both themes, including captions, selected controls and diagrams. WCAG specifies at least 4.5:1 for ordinary text and 3:1 for qualifying large text, with defined exceptions; focus must be visibly identifiable. See [W3C contrast guidance](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) and [W3C focus guidance](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html). This review is not a full accessibility certification.

**Proposed acceptance standard for the redesign**

The following text sizes are project-specific starting targets, not WCAG font-size requirements. Verify them at actual browser and presentation sizes and revise composition when required content does not fit.

| Element | Proposed rule |
|---|---|
| Canvas and margins | One fitted 16:9 presentation canvas and common safe area; no width jump between content types; covers are intentional exceptions |
| Title | Shared x/y anchor and hierarchy; normally no more than two lines; reserve title height consistently |
| Primary body at 1280 × 720 | Aim for at least 18px rendered text; diagram labels at least 16px; supporting notes at least 12px |
| Presentation at 1920 × 1080 | Start with body text at least 24px, diagram labels 20px and supporting notes 16px; scale coherently on larger screens |
| Tables | Readable row spacing and short cells; use the available canvas to enlarge content; split genuinely dense material |
| Borders | Consistent frame and divider treatments; heavier emphasis only where it communicates meaning |
| Theme | One consistent palette/surface per active mode across every slide family |
| Footer and edition | Fixed alignment and readable sources; compact version remains visible; full latest-change text remains readily accessible |
| Navigation | Persistent, non-overlapping Previous/Next, position and jump control; stable location in standalone, embedded and mobile views |
| Diagram interaction | Clearly separate next slide from next flow step; active states remain understandable with motion off |
| Mobile | Readable body text and labelled table rows; overview plus detail for large diagrams; navigation available before the end of long content |
| Verification | Measure every slide at two desktop sizes; inspect representative mobile views; test long titles, opened details, reduced motion, keyboard navigation and reading/presentation transitions |

**Implementation order:** fix the shared frame and type scale first, then align navigation and footer behavior. Apply the resulting master to every slide family, resolve density and mobile exceptions, and verify the whole deck before adding further visual effects. Browser print/PDF slide export should receive a separate render check before an offline deck is distributed; it was not visually validated in this follow-up.
