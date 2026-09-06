# AI-Enabled QE & AppSec Research Base

A static documentation site (Jekyll + just-the-docs, deployed with GitHub Actions to GitHub Pages)
that collects evidence and reusable method for AI-assisted quality engineering and application
security in regulated financial services.

[Browse the research site](https://tomqwu.github.io/ai_qe/).

The homepage includes two audience presentations:

- [EVP strategic vision](https://tomqwu.github.io/ai_qe/briefings/evp/): 18 slides on
  industry outlook, strategic vision, value, ownership and capability expansion.
- [Technical delivery architecture](https://tomqwu.github.io/ai_qe/briefings/technical/):
  26 slides on context, test validity, evaluation, agent controls, deployment, recovery and integration.

These are research-informed perspectives and a proposed architecture, not measured bank results.

## Industry research edition (September 2026)

The [industry research section](https://tomqwu.github.io/ai_qe/docs/industry/) adds a research overview, five
topic pages and a filterable library backed by `_data/industry_sources.json`.
It distinguishes forecasts, surveys, experiments, cases, frameworks and product docs.
Public Gartner abstracts are labeled; no licensed findings or vendor rankings are implied.

- `assets/pdf/ai-qe-industry-research-2026.pdf`: original 13-page brief.
- `tools/build_industry_brief.py`: rebuild with reportlab and Pillow.
- `tools/gather_industry_docs.py`: gather public PDFs into ignored `research/downloads/`.
- `research/document-manifest.json`: retrieval status, provenance and SHA-256 hashes.
- `research/visual-provenance.md`: exact ImageGen prompts and final image paths.
- `assets/data/industry-sources.csv`: portable source register; JSON renders from Jekyll data.

Publisher documents remain local and excluded from Pages. Their original URLs are linked
in the public library. Update CSV when changing the source JSON. Research figures use
explicit units and caveats; diagrams are authored proposed designs, not measured rankings.

## Site version and latest change

`_data/release.yml` is the shared release record for every site page and both audience decks.
For each published update, increment `version`, set `updated` to the publication date in
America/Toronto, and write one concise `latest_change` sentence. Version 1.0.0 is the first
numbered edition; earlier iterations were unversioned. Use patch increments for corrections,
minor increments for substantive content or features, and major increments for a changed scope.
The page banner and slide footers render from this record. The publication date identifies
the site edition; source review dates remain attached to their individual research entries.

## Maintaining the briefings

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
```

These checks run on pull requests and before deployment. They validate local links,
anchors, search results, PDF field integrity, continuous numeric response ranges,
generator consistency and saving long narrative answers. External citations require
source review; the link check does not treat a successful HTTP response as evidence
that a claim is correct.

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
