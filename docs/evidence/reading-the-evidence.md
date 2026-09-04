---
title: What the evidence supports
parent: Evidence
nav_order: 3
description: A plain reading of the benchmark evidence, the cross-cutting findings, and the reasons task-level percentages must not be applied to a QA budget.
---

# What the evidence supports
{: .no_toc }

<details open markdown="block">
  <summary>Contents</summary>
  {: .text-delta }
- TOC
{:toc}
</details>

## Three modest claims

The evidence supports three modest claims. Task-level time reductions exist for well-specified generation tasks (test scaffolds, unit-test extension, documentation, fix drafting) in the range of one quarter to one half on those tasks. Triage-type tasks (failed-test classification, static-analysis false-positive filtering) show high agreement with human judgement in vendor and academic settings. Adoption is now near-universal.

## What it does not support

It does not support a whole-budget productivity figure, a capacity figure for QA specifically, or any audited hard-dollar saving. It carries a consistent warning that individual output gains coincide with more code churn, longer reviews, higher defect rates and lower delivery stability unless batch size, review discipline and testing are strengthened at the same time. That warning is the reason a quality floor must be a pilot deliverable, not an afterthought.

## Cross-cutting findings

**The only measured, controlled, non-vendor developer study found a slowdown.** Every vendor-run randomized study finds task-level gains of 26-56%, but on pull-request counts or a single synthetic task, never on team delivery or cost. The two results are not in conflict: they measure different things on different populations.

**Every team-level telemetry dataset shows individual output up and organization-level outcomes flat or worse.** DORA 2024, both Faros reports and the Uplevel study show more tasks and pull requests per developer alongside lower stability, more bugs, longer reviews and no company-level improvement.

**Every consultancy source says gains are modest and routinely not monetized.** Bain, McKinsey, Deloitte and Gartner converge on 10-15% "on average", describe the increases as "modest", and state that time saved is not redirected. None provides audited hard-dollar savings.

**Self-reported and lab task-level figures cannot be applied to a whole budget.** The 19% (World Quality Report), 10-15% (Bain) and roughly 2x (McKinsey lab) figures are perception or per-task numbers. Coding and test execution are a minority of total cycle time: Atlassian's survey puts coding at 16% of developer time and Bain puts code generation at 25-35% of idea-to-launch. A 50% task gain on coding dilutes to single digits of total engineering time before any redeployment or headcount decision.

**Experience and complexity change the sign.** McKinsey's lab found savings under 10% on complex tasks and junior developers 7-10% slower; METR's subjects were experienced maintainers on familiar code and were slower; the Microsoft field experiments found the largest gains for less experienced developers on routine tasks. Pilots should record task complexity and developer experience as covariates.

## How to cite the evidence on an executive slide

Use one slide with four lines: task-level gains exist in vendor and lab studies; the independent randomized study was negative; telemetry shows a stability and quality risk; consultancies report 10-15% and say it is rarely monetized. Use a second slide listing what could not be verified. Never cite a paywalled analyst figure that cannot be shown, and never present a self-reported percentage as a measured one. Detailed wording is in [Slide language](../../economics/slide-language/).
