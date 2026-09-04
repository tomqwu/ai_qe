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

| Source and date | Setting and method | Headline finding | Sponsor and caveats | Use in pilot design |
|---|---|---|---|---|
| [Meta, "Automated Unit Test Improvement using Large Language Models at Meta" (TestGen-LLM)](https://arxiv.org/abs/2402.09171), Feb 2024, FSE 2024 industry track | LLM extends existing human-written unit tests; filters require build, reliable pass and coverage increase; deployed in test-a-thons | 75% of generated tests built, 57% passed reliably, 25% raised coverage; 73% of filtered recommendations accepted for production; 11.5% of classes improved | Vendor-internal; improves existing tests, does not create suites from scratch | Reference acceptance rate for test-generation use cases: expect roughly half to three quarters of filtered candidates to be accepted |
| [Uber and UT Austin, "FlakyGuard: Automatically Fixing Flaky Tests at Industry Scale"](https://arxiv.org/html/2511.14002v1), Nov 2025 | LLM-guided call-graph exploration on a Go monorepo | 47.6% of reproducible flaky tests received fixes; 51.8% of generated fixes accepted by developers; only 71.6% of flaky tests were reproducible; developers self-estimate under one day to 2-4 days saved per flaky test | Single company and language; time savings self-estimated | Reference for automation-maintenance use cases: about half of reproducible flaky tests fixable, about half of fixes accepted |
| [Google, "LLM-Based Automated Diagnosis of Integration Test Failures at Google"](https://arxiv.org/abs/2604.12108), ICSE 2026 | Gemini 2.5 Flash; deployed on 52,635 failing tests and 91,130 code changes | 90.1% accuracy on 71 manually evaluated failures; 63% helpful rate from explicit feedback; 5.8% "not helpful" | Small manual evaluation (three evaluators); feedback subset self-selected | Reference for failed-test triage use cases: classification accuracy target, helpfulness measurement design |
| [Tianjin University and Huawei Cloud, "Context Matters: Improving the Practical Reliability of LLM-Based Unit Test Generation" (CATGen)](https://arxiv.org/html/2607.19682), Jul 2026 | Industrial Java benchmark plus Defects4J | Compilation success 91.8% vs 51-76% for baselines; 70.1% line coverage; token use down 67-84% | Java only; proprietary benchmark; no developer acceptance rate | Context engineering (project structure, dependencies) is the difference between compiling and non-compiling generated tests |
| "Automated Software Test Generation at Industry Scale Using a Multi-Agent Architecture", ICSE-SEIP 2026 | Not verified: publisher returned 403 | | | |

## AI in application-security triage and remediation

| Source and date | Setting and method | Headline finding | Sponsor and caveats | Use in pilot design |
|---|---|---|---|---|
| [Google, "Scaling security with AI: from detection to solution"](https://security.googleblog.com/2024/01/scaling-security-with-ai-from-detection.html), 31 Jan 2024 | LLM patches for sanitizer bugs found by OSS-Fuzz, human review of candidates | AI-powered patching resolved 15% of targeted bugs; LLM-generated fuzz targets raised coverage up to 29% in 160 projects | Vendor; number of attempts not disclosed | Realistic automated-fix rate for real bugs is a minority of findings |
| [GitHub, "Found means fixed: secure code more than three times faster with Copilot Autofix"](https://github.blog/news-insights/product-news/secure-code-more-than-three-times-faster-with-copilot-autofix/), 14 Aug 2024 | Public-beta customer telemetry May-Jul 2024; new CodeQL alerts in pull requests | Median fix time 28 minutes vs 1.5 hours ("3x"); XSS 22 minutes vs 3 hours; SQL injection 18 minutes vs 3.7 hours | Vendor; no sample size; percentage of alerts fixed not reported; medians only; self-selected beta users | Speed-to-fix is a legitimate pilot metric; report medians with n |
| [Semgrep, "How we built an AppSec AI that security researchers agree with 96% of the time"](https://semgrep.dev/blog/2025/building-an-appsec-ai-that-security-researchers-agree-with-96-of-the-time/), 22 Jan 2025 | Internal benchmark of 2,000+ findings hand-triaged by researchers | 96% agreement on true positives; false-positive agreement improved from 25% to 41% | Vendor; internal dataset; deliberately conservative | Agreement-with-human-triage is the right primary metric for triage pilots |
| [Semgrep, "Our AI Assistant is handling 60% of incoming triage"](https://semgrep.dev/blog/2025/semgrep-is-confidently-handling-60-of-all-triage-for-users-without-reducing-coverage/), 10 Sep 2025 | Customer audit data, year to date | 60% of new SAST findings auto-triaged as high-confidence false positives; 96% customer agreement | Vendor; customer count undisclosed | Only high-confidence false positives are auto-closed; true positives still go to humans |
| [ZeroFalse: Improving Precision in Static Analysis with LLMs](https://arxiv.org/html/2510.02534), Oct 2025 | Academic; CodeQL alerts on the OWASP Java benchmark (1,974 cases) plus 58 real alerts; ten LLMs | Best F1 0.912 on OWASP and 0.955 on real alerts; one frontier model collapsed to F1 0.372 on real-world noise | Independent; tiny real-world set; Java and CodeQL only | Model choice matters more than prompt; validate on the bank's own alerts, not a benchmark |
| ["Sifting the Noise: A Comparative Study of LLM Agents in Vulnerability False Positive Filtering"](https://arxiv.org/abs/2601.22952), Jan 2026 (v3 Jul 2026) | Academic; agent frameworks on OWASP and post-cutoff C/C++ code | False positives reduced from over 92% to 6.3% on OWASP; 95.5% false-positive identification at 95.5% precision on real code vs 36.4% for plain prompting | Independent; "aggressive false-positive reduction can come at the cost of suppressing true vulnerabilities"; strongly backbone- and CWE-dependent; high compute cost | Every triage pilot needs a sampled audit of dismissed findings to catch suppressed true positives |
| Snyk DeepCode AI Fix accuracy claims | Not verified: no independent or vendor statistic located | | | |

## Regulatory reference points for the AppSec use case

The Canadian prudential regulator's April 2026 bulletin on frontier AI anticipates accelerated patch testing and deployment, AI-specific red-teaming and supply-chain remediation capacity; its July 2026 bulletin on generative and agentic AI expects AI-generated code to be validated before production. Both support a triage-and-prioritization pilot with draft-only remediation. See [Canadian banking context](../../governance/canadian-banking/).
