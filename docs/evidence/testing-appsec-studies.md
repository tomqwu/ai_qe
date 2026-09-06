---
title: Testing and AppSec studies
parent: Evidence
nav_order: 2
description: Verified studies specific to AI test generation, test maintenance, failure triage and application-security triage and remediation.
---

# Testing and AppSec studies
{: .no_toc }

Verified 4 September 2026.
{: .fs-5 .fw-300 }

<details open markdown="block">
  <summary>Contents</summary>
  {: .text-delta }
- TOC
{:toc}
</details>

These are the studies that matter for pilot design because they report acceptance rates, coverage deltas, classification accuracy and false-positive reduction on real or benchmark code. None reports a dollar saving. Most are vendor-internal deployments, which is a strength for realism and a weakness for generalization.

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


## AI in application-security triage and remediation

<article class="study" markdown="block">

### [Google, "Scaling security with AI: from detection to solution"](https://security.googleblog.com/2024/01/scaling-security-with-ai-from-detection.html), 31 Jan 2024
{: .no_toc .study-title }

**Finding:** AI-powered patching resolved 15% of targeted bugs; LLM-generated fuzz targets raised coverage up to 29% in 160 projects

**Sponsor and caveats:** Vendor; number of attempts not disclosed

**Pilot use:** Realistic automated-fix rate for real bugs is a minority of findings

<details markdown="block">
<summary>Sample and method details</summary>

- **Setting and method:** LLM patches for sanitizer bugs found by OSS-Fuzz, human review of candidates

</details>

</article>

<article class="study" markdown="block">

### [GitHub, "Found means fixed: secure code more than three times faster with Copilot Autofix"](https://github.blog/news-insights/product-news/secure-code-more-than-three-times-faster-with-copilot-autofix/), 14 Aug 2024
{: .no_toc .study-title }

**Finding:** Median fix time 28 minutes vs 1.5 hours ("3x"); XSS 22 minutes vs 3 hours; SQL injection 18 minutes vs 3.7 hours

**Sponsor and caveats:** Vendor; no sample size; percentage of alerts fixed not reported; medians only; self-selected beta users

**Pilot use:** Speed-to-fix is a legitimate pilot metric; report medians with n

<details markdown="block">
<summary>Sample and method details</summary>

- **Setting and method:** Public-beta customer telemetry May-Jul 2024; new CodeQL alerts in pull requests

</details>

</article>

<article class="study" markdown="block">

### [Semgrep, "How we built an AppSec AI that security researchers agree with 96% of the time"](https://semgrep.dev/blog/2025/building-an-appsec-ai-that-security-researchers-agree-with-96-of-the-time/), 22 Jan 2025
{: .no_toc .study-title }

**Finding:** 96% agreement on true positives; false-positive agreement improved from 25% to 41%

**Sponsor and caveats:** Vendor; internal dataset; deliberately conservative

**Pilot use:** Agreement-with-human-triage is the right primary metric for triage pilots

<details markdown="block">
<summary>Sample and method details</summary>

- **Setting and method:** Internal benchmark of 2,000+ findings hand-triaged by researchers

</details>

</article>

<article class="study" markdown="block">

### [Semgrep, "Our AI Assistant is handling 60% of incoming triage"](https://semgrep.dev/blog/2025/semgrep-is-confidently-handling-60-of-all-triage-for-users-without-reducing-coverage/), 10 Sep 2025
{: .no_toc .study-title }

**Finding:** 60% of new SAST findings auto-triaged as high-confidence false positives; 96% customer agreement

**Sponsor and caveats:** Vendor; customer count undisclosed

**Pilot use:** Only high-confidence false positives are auto-closed; true positives still go to humans

<details markdown="block">
<summary>Sample and method details</summary>

- **Setting and method:** Customer audit data, year to date

</details>

</article>

<article class="study" markdown="block">

### [ZeroFalse: Improving Precision in Static Analysis with LLMs](https://arxiv.org/html/2510.02534), Oct 2025
{: .no_toc .study-title }

**Finding:** Best F1 0.912 on OWASP and 0.955 on real alerts; one frontier model collapsed to F1 0.372 on real-world noise

**Sponsor and caveats:** Independent; tiny real-world set; Java and CodeQL only

**Pilot use:** Model choice matters more than prompt; validate on the bank's own alerts, not a benchmark

<details markdown="block">
<summary>Sample and method details</summary>

- **Setting and method:** Academic; CodeQL alerts on the OWASP Java benchmark (1,974 cases) plus 58 real alerts; ten LLMs

</details>

</article>

<article class="study" markdown="block">

### ["Sifting the Noise: A Comparative Study of LLM Agents in Vulnerability False Positive Filtering"](https://arxiv.org/abs/2601.22952), Jan 2026 (v3 Jul 2026)
{: .no_toc .study-title }

**Finding:** False positives reduced from over 92% to 6.3% on OWASP; 95.5% false-positive identification at 95.5% precision on real code vs 36.4% for plain prompting

**Sponsor and caveats:** Independent; "aggressive false-positive reduction can come at the cost of suppressing true vulnerabilities"; strongly backbone- and CWE-dependent; high compute cost

**Pilot use:** Every triage pilot needs a sampled audit of dismissed findings to catch suppressed true positives

<details markdown="block">
<summary>Sample and method details</summary>

- **Setting and method:** Academic; agent frameworks on OWASP and post-cutoff C/C++ code

</details>

</article>

<article class="study" markdown="block">

### Snyk DeepCode AI Fix accuracy claims
{: .no_toc .study-title }

**Status:** Not verified: no independent or vendor statistic located

<details markdown="block">
<summary>Sample and method details</summary>

- **Setting and method:** Not verified: no independent or vendor statistic located

</details>

</article>


## Regulatory reference points for the AppSec use case

The Canadian prudential regulator's April 2026 bulletin on frontier AI anticipates accelerated patch testing and deployment, AI-specific red-teaming and supply-chain remediation capacity; its July 2026 bulletin on generative and agentic AI expects AI-generated code to be validated before production. Both support a triage-and-prioritization pilot with draft-only remediation. See [Canadian banking context](../../governance/canadian-banking/).
