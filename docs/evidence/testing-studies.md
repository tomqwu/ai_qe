---
title: Testing studies
parent: Evidence
nav_order: 2
description: Verified studies specific to AI test generation, test maintenance and failure triage.
---

# Testing studies
{: .no_toc }

Verified 4 September 2026.
{: .fs-5 .fw-300 }

<details open markdown="block">
  <summary>Contents</summary>
  {: .text-delta }
- TOC
{:toc}
</details>

These are the studies that matter for pilot design because they report acceptance rates, coverage deltas, classification accuracy and repair outcomes on real or benchmark code. None reports a dollar saving. Most are vendor-internal deployments, which is a strength for realism and a weakness for generalization.

## AI-generated tests, test maintenance and failure triage

<article class="study" markdown="block">

### [Meta, "Automated Unit Test Improvement using Large Language Models at Meta" (TestGen-LLM)](https://arxiv.org/abs/2402.09171), Feb 2024, FSE 2024 industry track
{: .no_toc .study-title }

**Finding:** {% include claims/testgen.html %}

**Sponsor and caveats:** Vendor-internal; improves existing tests, does not create suites from scratch

**Pilot use:** Use cumulative build, pass and useful-test gates; measure acceptance on the bank’s own candidate and class denominators. Do not transfer the Meta acceptance rate as a pilot expectation.

<details markdown="block">
<summary>Sample and method details</summary>

- **Setting and method:** LLM extends existing human-written unit tests; filters require build, reliable pass and coverage increase; deployed in test-a-thons

</details>

</article>

<article class="study" markdown="block">

### [Uber and UT Austin, "FlakyGuard: Automatically Fixing Flaky Tests at Industry Scale"](https://arxiv.org/html/2511.14002v1), Nov 2025
{: .no_toc .study-title }

**Finding:** 47.6% of reproducible flaky tests received fixes; 51.8% of generated fixes accepted by developers; only 71.6% of flaky tests were reproducible; developers self-estimate under one day to 2-4 days saved per flaky test

**Sponsor and caveats:** Single company and language; time savings self-estimated

**Pilot use:** Reference for automation-maintenance use cases: about half of reproducible flaky tests fixable, about half of fixes accepted

<details markdown="block">
<summary>Sample and method details</summary>

- **Setting and method:** LLM-guided call-graph exploration on a Go monorepo

</details>

</article>

<article class="study" markdown="block">

### [Google, "LLM-Based Automated Diagnosis of Integration Test Failures at Google"](https://arxiv.org/abs/2604.12108), ICSE 2026
{: .no_toc .study-title }

**Finding:** 90.1% accuracy on 71 manually evaluated failures; 63% helpful rate from explicit feedback; 5.8% "not helpful"

**Sponsor and caveats:** Small manual evaluation (three evaluators); feedback subset self-selected

**Pilot use:** Reference for failed-test triage use cases: classification accuracy target, helpfulness measurement design

<details markdown="block">
<summary>Sample and method details</summary>

- **Setting and method:** Gemini 2.5 Flash; deployed on 52,635 failing tests and 91,130 code changes

</details>

</article>

<article class="study" markdown="block">

### [Tianjin University and Huawei Cloud, "Context Matters: Improving the Practical Reliability of LLM-Based Unit Test Generation" (CATGen)](https://arxiv.org/html/2607.19682), Jul 2026
{: .no_toc .study-title }

**Finding:** Compilation success 91.8% vs 51-76% for baselines; 70.1% line coverage; token use down 67-84%

**Sponsor and caveats:** Java only; proprietary benchmark; no developer acceptance rate

**Pilot use:** Context engineering (project structure, dependencies) is the difference between compiling and non-compiling generated tests

<details markdown="block">
<summary>Sample and method details</summary>

- **Setting and method:** Industrial Java benchmark plus Defects4J

</details>

</article>

<article class="study" markdown="block">

### "Automated Software Test Generation at Industry Scale Using a Multi-Agent Architecture", ICSE-SEIP 2026
{: .no_toc .study-title }

**Status:** Not verified: publisher returned 403

<details markdown="block">
<summary>Sample and method details</summary>

- **Setting and method:** Not verified: publisher returned 403

</details>

</article>
