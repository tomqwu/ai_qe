# AI-Enabled QE & AppSec Research Base

A static documentation site (Jekyll + just-the-docs, deployed with GitHub Actions to GitHub Pages)
that collects evidence and reusable method for AI-assisted quality engineering and application
security in regulated financial services.

[Browse the research site](https://tomqwu.github.io/ai_qe/).

Conventions:

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
