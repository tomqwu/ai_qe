---
title: Home
layout: home
nav_order: 1
description: Evidence base for AI-assisted quality engineering and application security in regulated financial services.
permalink: /
---

# AI-Enabled Quality Engineering & AppSec Research Base
{: .fs-8 }

Verified benchmarks, governance context, a conservative savings model, discovery-questionnaire design, phased pilot design and executive-presentation guidance for AI-assisted quality engineering (QE) and application security (AppSec) in regulated banks.
{: .fs-5 .fw-300 }

[Start with the evidence](docs/evidence/){: .btn .btn-primary .fs-5 .mb-4 .mb-md-0 .mr-2 } [Read the savings model](docs/economics/savings-model/){: .btn .fs-5 .mb-4 .mb-md-0 }

---

## What this site is for

This is a working research base, not a proposal. It exists so that future studies and executive presentations on AI in QE and AppSec start from verified evidence rather than from vendor decks or remembered percentages. Every page is written to be reused: the benchmark tables carry the date, sample, method, unit of measurement, sponsorship and the claim each source can legitimately support; the savings model is a structure with explicit placeholder assumptions; the questionnaire and pilot designs are role-routed and measurement-first.

{: .note }
Client, partner and engagement names have been deliberately removed. Where an engagement is referred to, it is "the bank", "the sponsor" or "the advisory team". Research sources are cited by name because the citation is the evidence; no vendor or product is endorsed.

## The position the evidence supports

External evidence supports three modest claims: task-level time reductions exist for well-specified generation tasks (test scaffolds, unit-test extension, documentation, fix drafting); triage-type tasks (failed-test classification, static-analysis false-positive filtering) show high agreement with human judgement in vendor and academic settings; and adoption is now near-universal. It does not support a whole-budget productivity figure, a capacity figure for QA specifically, or any audited hard-dollar saving. It carries a consistent warning that individual output gains coincide with more code churn, longer reviews, higher defect rates and lower delivery stability unless batch size, review discipline and testing are strengthened at the same time.

The practical consequence is that a pilot exists precisely because the external number cannot be borrowed. See [What the evidence supports](docs/evidence/reading-the-evidence/).

## How the site is organised

| Section | What it holds |
|---|---|
| [Principles](docs/principles/) | The ten operating principles for AI-QE work in a regulated bank and the autonomy ladder used throughout |
| [Evidence](docs/evidence/) | Productivity benchmarks, testing and AppSec studies, and a plain reading of what they do and do not support |
| [Governance](docs/governance/) | Canadian banking supervisory context (OSFI, privacy) and a control mapping for pilots |
| [Economics](docs/economics/) | The four-level savings framework, scenario model, waterfall structure and slide language |
| [Method](docs/method/) | Discovery questionnaire design, interview and data request, phased pilot design, executive presentation outline |
| [Research log](docs/research-log/) | Dated entries recording what was checked, when, and what changed |

## Conventions for adding research

Add a dated entry to the [research log](docs/research-log/) first, then update the topic page. For any new benchmark record: publisher and title, publication date, URL, population and method, unit of measurement and denominator, whether results are self-reported or measured, whether the publisher sells a related product or service, which of the four claim types (task efficiency, team productivity or capacity, cost avoidance, hard-dollar saving) it supports, and any contradictory evidence. If a figure cannot be verified against an accessible primary source, record it under "not verified" rather than citing it.
