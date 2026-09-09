# AI-Enabled Quality Engineering Research Base

A static documentation site (Jekyll + just-the-docs, deployed with GitHub Actions to GitHub Pages)
that collects evidence and reusable method for AI-assisted quality engineering in regulated financial services.

[Browse the research site](https://tomqwu.github.io/ai_qe/).

The homepage includes two audience presentations:

- [Executive strategic vision](https://tomqwu.github.io/ai_qe/briefings/evp/): 26 slides on
  industry outlook, strategic vision, value, ownership and capability expansion.
- [Technical delivery architecture](https://tomqwu.github.io/ai_qe/briefings/technical/):
  36 slides on context, test validity, evaluation, agent controls, deployment, recovery and integration.

These are research-informed perspectives and a proposed architecture, not measured bank results.

## Conversation-led navigation

The homepage leads from the audience briefings to the fintech example, architecture and a scoped discovery. `_data/navigation.json` defines the primary menu and supporting reference groups. `_data/briefing_room.json` holds the four presentation cards; `/briefings/?for=evp` and `/briefings/?for=technical` are shareable audience views. Keep card counts and outlines aligned with the actual decks.

`_includes/brand/mark.svg` is the shared vector mark. `assets/css/brand.css` supplies the wordmark and deck/demo treatment; `assets/css/sales.css` and `assets/js/sales-navigation.js` provide the site navigation and presentation room. The mobile menu supports Escape and returns keyboard focus to its button. Without JavaScript, navigation and all briefing links remain available.

Run `node tools/sales-navigation-test.cjs` against a built preview to check all four deck/PDF paths, audience sharing, search, mobile menus, current-page indicators and no-JavaScript access.

Run `node tools/search-navigation-test.cjs` to verify actual search-result navigation in Chromium and WebKit at desktop, narrow and touch sizes. This covers nested link targets, dictionary and slide anchors, keyboard selection, dismissal, and modifier-opened tabs. Install both engines with `npx playwright install chromium webkit`. Set `QE_TEST_URL` to check a deployed site.

## Industry research edition (September 2026)

The [industry research section](https://tomqwu.github.io/ai_qe/docs/industry/) adds a research overview, five
topic pages and a filterable library backed by `_data/industry_sources.json`.
It distinguishes forecasts, surveys, experiments, cases, frameworks and product docs.
Public Gartner abstracts are labeled; no licensed findings or vendor rankings are implied.

- `assets/pdf/ai-qe-industry-research-v1.7.0.pdf`: current 13-page QA brief.
- `tools/build_industry_brief.py`: rebuild with reportlab and Pillow.
- `tools/gather_industry_docs.py`: gather public PDFs into ignored `research/downloads/`.
- `research/document-manifest.json`: retrieval status, provenance and SHA-256 hashes.
- `research/visual-provenance.md`: exact ImageGen prompts and final image paths.
- `assets/data/industry-sources.csv`: portable source register; JSON renders from Jekyll data.

Publisher documents remain local and excluded from Pages. Their original URLs are linked
in the public library. Update CSV when changing the source JSON. Research figures use
explicit units and caveats; diagrams are authored proposed designs, not measured rankings.

## QE modernization

[QE modernization](https://tomqwu.github.io/ai_qe/qe-modernization/) connects readiness gaps to six workstreams, a proposed repeatable test environment and application-specific execution patterns. `_data/modernization.json` is canonical for the thirteen primary references, workstreams, capability progression, application surfaces and directed walkthrough. CSV/JSON source exports are distributed on the page and in GitHub releases.

Shared editable diagrams live in `_includes/modernization/` and are reused in the industry and fintech decks. Run `node tools/modernization-browser-test.cjs` against the preview to verify surface switching, source exports, search navigation, responsive layout, real packet movement, pause behavior and no-JavaScript access. The diagram is a teaching architecture and does not run containers.

## Site version and latest change

`_data/release.yml` is the shared release record for every site page and both audience decks.
For each published update, increment `version`, set `updated` to the publication date in
America/Toronto, and write one concise `latest_change` sentence. Version 1.0.0 is the first
numbered edition; earlier iterations were unversioned. Use patch increments for corrections,
minor increments for substantive content or features, and major increments for a changed scope.
The page banner and slide footers render from this record. The publication date identifies
the site edition; source review dates remain attached to their individual research entries.

## Maintaining the briefings

The [fintech case explorer](https://tomqwu.github.io/ai_qe/case-studies/fintech/) has its own 21-slide executive and 33-slide technical decks. `_data/fintech_case.json` holds the fictional assumptions, workflow, sources and maturity profiles. `_data/fintech_decks.json` holds the slide narratives; `_includes/fintech/` contains their editable diagrams and shared layouts. Keep this illustrative case distinct from observed industry findings.

Run `node tools/export_decks.cjs --fintech` against the preview to export the case PDFs. The edition in the case data, deck front matter and `fintech_edition` release field must agree. Run `node tools/fintech-browser-test.cjs` and `python tools/verify_fintech.py _site` after the build. `npm test` includes capacity and payment-model checks. The browser case is a deterministic teaching model; it does not connect to a payment service or invoke the example QA frameworks.

Edit the slide sections in `briefings/evp.html` and `briefings/technical.html`. Keep the
numbered slide IDs, descriptive headings and source links. Update `slide_count` and the
`briefing_minutes` estimate when adding or removing slides. The audience selector reads the count and duration from each deck.

`_layouts/deck.html`, `assets/css/decks.css` and `assets/js/decks.js` provide a shared
player. It supports previous/next, arrow and Page Up/Down keys, Home/End, direct slide
links, full screen, continuous reading and browser printing. With JavaScript disabled,
all slides remain visible. The iframe adjusts its height to each slide; on narrow
screens, diagrams and columns flow vertically for reading.

`assets/js/briefing-embed.js` switches audiences on the homepage and briefing index.
The site and decks share a self-hosted Source Sans 3 font, licensed under the SIL Open
Font License in `assets/fonts/OFL.md`. No external presentation service is required.

Before publishing, review every slide at desktop and mobile widths, exercise audience
switching, keyboard navigation and reading mode, then run the verification below.

## Research conventions

- No client, partner or engagement names. Use "the bank", "the sponsor", "the advisory team".
- Research sources (academic papers, regulators, analyst and consultancy reports, vendor studies)
  are cited by name because the citation is the evidence; no vendor is endorsed.
- Every benchmark record includes date, sample, method, unit, self-reported vs measured, sponsor,
  and what claim it can support. Anything unverifiable is listed as such.
- New research goes in `docs/research-log.md` first (dated entry), then into the topic page.

## Local preview

```bash
bundle install
bundle exec jekyll serve --livereload
# open http://127.0.0.1:4000/ai_qe/
```

## Deploy

Push to `main`. In the repository settings, set Pages > Build and deployment > Source to
"GitHub Actions". The workflow in `.github/workflows/pages.yml` builds and deploys the site.

After a successful deployment, the workflow publishes the site version as a GitHub release. `tools/prepare_release.py` assembles the six current PDFs, MP4, captions, CSV/JSON source registers and checksums in an empty output directory. `tools/publish_release.py` uploads a draft using the job's repository-scoped token, verifies GitHub's SHA-256 digests, and publishes only after all assets are complete. An existing published edition is never overwritten; increment the site version for a new commit. A matching interrupted draft can resume.

For a local package preview, run `python tools/prepare_release.py --output /tmp/ai-qe-release-preview` using a new empty directory. Run `python -m unittest discover -s tools -p 'test_release.py'` to check upload sequencing, failed-upload behavior, edition protection and package integrity. Publishing itself runs only inside GitHub Actions. [GitHub release API](https://docs.github.com/en/rest/releases/releases) · [Release asset checksums](https://docs.github.com/en/rest/releases/assets).


## Questionnaire generator

```bash
python -m pip install -r tools/requirements.txt
python tools/questionnaire_form.py
```

The generator updates the fillable questionnaire in `assets/pdf/`. An optional output
path can be passed as its first argument. Update the question descriptions in
`docs/method/discovery-questionnaire.md` whenever response options change.

## Verification

```bash
bundle exec jekyll build
python tools/verify_site.py _site
python tools/verify_industry.py _site
node --test tools/qe-model.test.cjs
python tools/verify_pdf.py
python tools/verify_qe_scope.py _site
```

These checks run on pull requests and before deployment. They validate local links,
anchors, search results, PDF field integrity, continuous numeric response ranges,
generator consistency and saving long narrative answers. External citations require
source review; the link check does not treat a successful HTTP response as evidence
that a claim is correct.

The scope check also inspects published page content, data, PDF metadata and form fields
to keep retired material out of the QA publication. Historical source files remain
excluded from the site through `_config.yml`.

Evidence pages use study summaries with findings and caveats visible and methodology
in native expandable details. Preserve these fields when adding a study. The remote
theme is pinned in `_config.yml`; update it deliberately and check desktop/mobile layout.

### Visual research briefings

The audience decks embed native SVG architecture and research charts from `_includes/diagrams/`. Run `python3 tools/build_expanded_diagrams.py` to regenerate geometry; edit shared styling in `assets/css/diagrams.css`. Research findings, design implications, citations and text descriptions live in `_data/diagram_research.json`. The platform diagram supports keyboard and pointer inspection. On narrow screens, the diagram canvas pans horizontally while the explanatory text reflows.

### Presentation motion

`assets/js/motion.js` and `assets/css/motion.css` add directional light pulses to the existing
SVG arrows, guided platform playback, chart reveals and gentle illustration movement.
`_data/architecture_flow.json` supplies nine walkthrough stages with explicit directed routes; the diagram generator
keeps component connections in `data-from` / `data-to` attributes. Animations indicate
direction in a proposed workflow, not live telemetry or measured execution timing.

The platform starts in Overview with equal emphasis on all connections. During the tour,
gold paths represent the current stage; the remaining teal paths stay visible as static
context. Component inspection highlights direct incoming and outgoing connections and
labels that state separately. Overview clears the selection. The tour returns to Overview
automatically after its final step. The walkthrough covers the parallel AI-evaluation branch and the regression
feedback loop. `verify_industry.py` checks that every named route exists and every platform
connection is explained by the tour. Diagram labels and nodes stay fully visible during
playback and pause; they do not fade or replay an entrance animation.

Pulses and their trails share one SVG clock. Guided pulses finish within their stage;
Pause flow stops both the SVG motion and the stage timer. Next step provides a static
walkthrough, and Resume flow continues from that stage. Other diagrams animate their
authored directional edges uniformly; axes and sequence lifelines remain static.

Present mode adds a dark architecture stage with illuminated paths. The Motion control pauses effects across same-origin site and deck windows. The preference
is stored locally when storage is available. Reduced-motion settings, hidden tabs, offscreen
figures and printing suspend animation; Next step remains available for a static walkthrough.

Browser API references: [SVG motion](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/animateMotion),
[pausing SVG animation](https://developer.mozilla.org/en-US/docs/Web/API/SVGSVGElement/pauseAnimations),
and [visibility observation](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API).

## Release validation

Run `npm ci`, `npx playwright install chromium` and `pip install -r tools/requirements.txt`. Then run `npm test`, `python tools/validate_contracts.py`, `bundle exec jekyll build`, `python tools/finalize_site.py _site`, `python tools/verify_site.py _site`, `python tools/verify_industry.py _site` and `python tools/verify_publication.py _site`.

Serve the build under `/ai_qe/` on port 61600 and run `npm run test:browser`. Set `QE_TEST_URL` to test another build. The browser suite checks all industry slides at 1280×720, 1920×1080 and 375×812, SVG label bounds, player modes, focus, motion, sharing and search. CI runs it before publication.

Canonical economics live in `_data/scenarios.json`; regenerate derived tables with `node tools/build_scenario_data.cjs`. Regenerate diagrams in order with `python tools/build_expanded_diagrams.py` then `python tools/build_audit_diagrams.py`. The payment reference contracts and failure fixtures are under `assets/examples/payments/`.

For a content release, update `version` and `slide_edition` in `_data/release.yml`, regenerate the static audience PDFs using `node tools/export_decks.cjs`, render and visually inspect every page, and update the release history. A player-only patch may advance `version` while retaining `slide_edition` and its existing PDFs; document that distinction in the release notes. The 13-page QA research companion has its own edition; it is not a slide export. Superseded mixed-scope downloads are excluded from publication.

## Dictionary authoring

`_data/dictionary.json` is the canonical term register for `/dictionary/`, the site search index and the 3D component definition links. Keep IDs stable for shared links. Each entry needs a category, aliases, an original definition, an illustrative example, related term IDs and a context page. Optional `reference` links identify primary terminology sources. The 11 component entries also carry a unique `demo_node` matching the architecture graph.

`dictionary.html` renders every definition without JavaScript; `assets/js/dictionary.js` adds search, topic filters, URL state and accessible anchor navigation. `tools/finalize_site.py` indexes each term and its aliases. After a build, run `node tools/dictionary-test.cjs` against the preview (`QE_TEST_URL` overrides its default); CI includes it. Changes to the demo's template or renderer also require a refreshed film manifest, as below.

The finalizer also applies a narrow null-focus guard to the pinned Just the Docs search script. Without it, a search input or result losing focus to the browser can throw on `relatedTarget.id`. The finalizer checks the exact upstream statement so a theme update requires an explicit review; the dictionary browser test exercises native blur on both search surfaces.

## Blender and Three.js architecture demonstration

The `/demos/architecture/` page is a dedicated 3D viewer. The landing page links a lightweight poster, so ordinary research and slide pages do not load the WebGL renderer.

- `assets/data/architecture-demo.json`: 11 modules, 12 directed routes and four authored scenario narratives.
- `tools/architecture-demo/build_scene.py`: Blender geometry, a steady editable camera and native flow-packet animation. Run `/Applications/Blender.app/Contents/MacOS/Blender --background --python tools/architecture-demo/build_scene.py` on this host, or use the Blender binary on another host.
- `assets/models/assurance-platform.blend` and `.glb`: editable source scene and browser model. The Blender timeline contains the generated-test walkthrough; the Three.js viewer adds the other interactive scenarios.
- `tools/architecture-demo/main.js`: Three.js viewer source. Run `node tools/build_architecture_demo.cjs` after edits. Three.js and esbuild are pinned in `package-lock.json`; the browser bundle is served locally. Three.js's MIT license is retained under `assets/licenses/`.
- `node tools/architecture-demo/export_film.cjs`: capture 49 seconds at 1920×1080 / 24 fps from a running preview, using Playwright and FFmpeg. Set `QE_TEST_URL` or `FFMPEG` if needed. Produces an MP4, captions, poster, provenance hashes and review frames in `/tmp/ai-qe-film-proof`.
- `node tools/architecture-demo/browser-test.cjs` and `python tools/verify_architecture_demo.py`: exercise real rendering/motion, authorization and failed-check semantics, fallback and artifact agreement. CI runs these checks; Blender and FFmpeg are authoring dependencies, not required on the deployment runner.

The film is a silent render of the Three.js demonstration using the Blender-authored model. It is not live telemetry, a performance model or a claim that all flows occur simultaneously. After scene, narrative or visual changes, rebuild the model/bundle as needed, rebuild Jekyll, re-export the film, inspect its stage frames and rerun validation.

## Adoption dependencies

`_data/adoption.json` defines twelve explicit client assumptions, evidence, owners, sources and nine workflow scopes (the eight QA stages plus diagnosis-only evidence review). `/platform-readiness/` renders the canonical register. The pure `readiness-model.js` determines required capability gaps without an average score; `readiness.js` provides scenario controls and a local downloadable worksheet. Client inputs are self-assessments and do not authorize adoption. Hub, fintech case and four briefings share editable dependency diagrams in `_includes/adoption/`.

Run `node --test tools/readiness-model.test.cjs` and `node tools/readiness-browser-test.cjs` against a built preview. When changing assumptions, keep the case implementation notes, discovery and pilot prerequisites consistent. Re-export all four decks when their content edition changes.

## Financial-services evidence and client trials

The [fintech evidence explorer](https://tomqwu.github.io/ai_qe/case-studies/fintech/evidence/) connects seven cases to bounded client trials. `_data/fintech_evidence.json` is canonical for source records, case boundaries, practices, charts, trial content and the rejection walkthrough. `_includes/fintech-evidence/` supplies shared editable presentation visuals. CSV/JSON exports include the ten source records.

Run `node tools/fintech-evidence-browser-test.cjs` against a built preview. It checks filtering, deep links, trial selection and Markdown download contents, actual rejection-route motion, pause/reduced motion, no-JS reading and responsive layouts. Keep the guided rejection path separate from the context-only accepted path. `research/fintech-evidence-brief.md` records the research contract; downloaded publisher originals stay private.


## Connected visual story

`_data/visual_story.json` holds the proposed integration nodes for Our Banking Client, authored PAY-142 artifacts, lifecycle stages, modernization grouping and curated audience routes. Dependency requirements remain canonical in `_data/adoption.json` and are evaluated by `readiness-model.js`; the map adds no competing maturity score. Diagnosis-only review and execution/retest have distinct prerequisites.

Shared HTML views live in `_includes/visual-story/`, with role styling and progressive enhancement in `assets/css/visual-story.css` and `assets/js/visual-story.js`. The six workstreams group twelve adoption assumptions; a marked matrix cell refers to selected capabilities within that workstream. Original claims and evidence limits remain in the fintech evidence register.

Fintech decks accept `?route=client#slide-N` for a curated sequence. Original anchors, slide picker and full PDF order remain available. `tools/visual-story-browser-test.cjs` checks dependency/model agreement, scoped trial links, artifact deep links, setup/test failure paths, guided navigation, mobile overflow and no-JavaScript access in Chromium and WebKit. Run it against the built site with `QE_TEST_URL` when the preview uses a non-default port.

## AI adoption roadmap

`_data/ai_adoption.json` defines four capability layers, PAY-142 examples, authority boundaries, prerequisites, evidence gates and reviewed primary sources. `/ai-adoption/` provides an interactive leadership view; the same native diagrams appear on fintech executive slide 17 and technical slide 28. Layer 4 supports reuse of layers 1–3; shared foundations start at every layer and agent authority is optional. This is an authored roadmap, not a client maturity assessment. Run `node tools/ai-adoption-browser-test.cjs` for selection, history, readiness links, responsive layout, search and no-JavaScript access.

The banking AI walkthrough uses `_data/qe_journey.json` for nine explicit handoffs and the three-state comparison. Caption-anchored profiles in `assets/data/narration-flows.json` synchronize the same visuals on pages and slides. The QA effort model retains its eight stages; developer unit work has no added savings assumption.
