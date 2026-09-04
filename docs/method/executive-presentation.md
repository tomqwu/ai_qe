---
title: Executive presentation
parent: Method
nav_order: 4
description: Structure for a 60-90 minute executive session on AI-enabled QE and AppSec, the recommended message, the decisions to request, and where the AI gateway topic belongs.
---

# Executive presentation
{: .no_toc }

<details open markdown="block">
  <summary>Contents</summary>
  {: .text-delta }
- TOC
{:toc}
</details>

## Structure for a 60-90 minute session

| Segment | Time | Content | Purpose |
|---|---|---|---|
| 1. The question and the concern | 5 min | The recommended framing sentence; the sponsor's central question from the questionnaire; spending concerns ranked | Show the session is about their problem, not a product |
| 2. What we heard | 10 min | Questionnaire results in six charts: primary outcome, top concerns, top-three effort activities, automation and regression profile, trusted-metric grid, acceptable autonomy level | Current-state questions rather than conclusions; no savings number yet |
| 3. What the external evidence actually says | 10 min | One slide: task gains exist (vendor and lab), METR's early-2025 study found a slowdown and its follow-up is inconclusive, surveys and telemetry show quality risks alongside some output gains, consultancy estimates do not establish audited QA savings; one slide: what could not be verified | Credibility; pre-empts "the analysts say" |
| 4. Automation, assistance and agency | 5 min | The autonomy ladder; what is proposed for the pilot (levels 1-5 with human approval) and what is explicitly out (autonomous merge or deploy) | Governance boundary in plain language |
| 5. Where the opportunity is | 10 min | QA: seven candidate use cases with the two defaults; AppSec: triage and prioritization with draft remediation; the engineering gaps that are not AI problems | Separate foundational automation from AI |
| 6. Conservative savings hypothesis | 10 min | Scenario table in percentages; the base-case waterfall per $10M with assumptions visible; the four-level distinction | Discipline; no dollar forecast |
| 7. The phased model | 10 min | Phases 0-4 with duration, ceiling, deliverables and stop rules; applications proposed | Minimize upfront spend; show early exit |
| 8. Controls and regulatory alignment | 5 min | One-page control mapping | Turn caution into a regulatory strength |
| 9. Supporting architecture note | 3 min | Where an AI gateway or control plane would sit if Phase 4 is reached; not proposed now | Answer the question before it is asked |
| 10. Decisions requested | 5 min | Named sponsor; Finance partner and recognition rule; one or two applications; approved AI platform and pilot project; Phase 0-1 ceiling; second-line observer | Specific asks |
| Discussion | 15-30 min | | |

## The recommended message

See the one-paragraph message in [Slide language](../../economics/slide-language/). The decision requested is whether to fund Phases 0 and 1, not whether to transform QA.

## Where the AI gateway or control-plane topic belongs

Not in this presentation as a proposal. A first pilot must use the approved enterprise AI platform, which already provides the access control, logging and cost visibility a pilot needs. A multi-vendor gateway becomes relevant only when several capabilities, models or vendors are in production and the bank needs central policy, routing, cost allocation and portability. Include one supporting-architecture slide so the sponsor sees the roadmap is coherent, and offer a separate executive conversation on enterprise AI governance and gateway architecture alongside the broader AI security, risk and agentic-autonomy topics. Combining the two in one session dilutes the QA and AppSec economics discussion and reads as a platform sale.

## Charts worth drawing

Six questionnaire charts (segment 2) and the scenario waterfall (segment 6) are the only visuals that earn their place. Everything else is a table or a sentence.
