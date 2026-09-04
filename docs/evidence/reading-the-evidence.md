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

The evidence supports three modest claims. Task-level time reductions exist for well-specified generation tasks (test scaffolds, unit-test extension, documentation, fix drafting) in the range of one quarter to one half on those tasks. Triage-type tasks (failed-test classification, static-analysis false-positive filtering) show high agreement with human judgement in vendor and academic settings. Adoption is widespread in the cited surveys, whose populations and definitions differ (using, piloting, or planning to use AI).

## What it does not support

It does not support a whole-budget productivity figure, a capacity figure for QA specifically, or any audited hard-dollar saving. It carries a consistent warning that individual output gains coincide with more code churn, longer reviews, higher defect rates and lower delivery stability unless batch size, review discipline and testing are strengthened at the same time. That warning is the reason a quality floor must be a pilot deliverable, not an afterthought.

## Cross-cutting findings

**Controlled studies measure different outcomes on different populations.** [METR's early-2025 study](../benchmarks/#controlled-and-independent-studies) found 19% longer completion times on familiar repositories. Its February 2026 follow-up has speedup point estimates, but confidence intervals cross zero and selection bias limits interpretation. Vendor-affiliated experiments report 55.8% shorter completion time on a synthetic task (Peng), 26.1% more completed tasks (Cui), and 8.7% more pull requests (GitHub/Accenture). These percentages are different metrics, not one transferable productivity range.

**Surveys and telemetry show a mix of output gains and quality risks.** [DORA's surveys](../benchmarks/#surveys-and-telemetry-datasets) report a negative throughput association in 2024 and a positive one in 2025, with a negative stability association in both years; they are self-reported associations, not telemetry or causal estimates. Faros's customer telemetry reports output gains alongside more review work, bugs and incidents; Uplevel reports no significant productivity gain and more bugs. These findings justify measuring quality alongside effort, not a claim that every organizational outcome worsens.

**Consultancy estimates are not a consensus effect size.** [Bain reports average efficiency or productivity gains around 10-15%](../benchmarks/#consultancy-and-analyst-positions) and difficulty monetizing them. McKinsey reports task-specific lab results and higher-performing-company outcomes; Deloitte's banking numbers are forecasts; Gartner primarily offers adoption predictions. These differ in population, method and unit. None of the cited sources establishes audited hard-dollar savings for the bank's QA function.

**Self-reported and lab task-level figures cannot be applied to a whole budget.** The 19% (World Quality Report), 10-15% (Bain) and roughly 2x (McKinsey lab) figures are perception or per-task numbers. Coding and test execution are a minority of total cycle time: Atlassian's survey puts coding at 16% of developer time and Bain puts code generation at 25-35% of idea-to-launch. A 50% task gain on coding dilutes to single digits of total engineering time before any redeployment or headcount decision.

**Experience and complexity change the sign.** McKinsey's lab found savings under 10% on complex tasks and junior developers 7-10% slower; METR's subjects were experienced maintainers on familiar code and were slower; the Microsoft field experiments found the largest gains for less experienced developers on routine tasks. Pilots should record task complexity and developer experience as covariates.

## How to cite the evidence on an executive slide

Use one slide with four lines: controlled studies report different task and output measures; METR found a slowdown in early 2025 and its follow-up is inconclusive; surveys and telemetry show quality risks alongside some output gains; consultancy estimates are not audited QA savings. Use a second slide listing what could not be verified. Never cite a paywalled analyst figure that cannot be shown, and never present a self-reported percentage as a measured one. Detailed wording is in [Slide language](../../economics/slide-language/).
