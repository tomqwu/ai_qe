---
title: Savings model
parent: Economics
nav_order: 1
description: Assessment of common planning ranges, a downside/base/upside scenario model, an illustrative waterfall per $10M of addressable QA spend, and accounting treatment by cost type.
---

# Savings model
{: .no_toc }

<details open markdown="block">
  <summary>Contents</summary>
  {: .text-delta }
- TOC
{:toc}
</details>

## The formulas

```text
Net task saving %
  = (baseline human hours
     - AI-assisted human hours
     - review and correction hours
     - additional control effort)
    / baseline human hours

QA capacity released %
  = sum over activities of (
      activity time share
      x proportion eligible for AI
      x actual adoption and utilization
      x measured net task saving )

Net annual benefit
  = removable or avoided labour, services, tool and rework cost
    - AI licences and model consumption
    - integration and platform cost
    - evaluation, governance, support and training cost
```

A productivity gain is not called a saving unless Finance confirms how it will be captured.

## Assessment of commonly proposed planning ranges

These ranges circulate in AI-QE business cases. The assessment records whether each is defensible as a planning hypothesis and how to restate it.

| Working hypothesis | Assessment | Recommended restatement |
|---|---|---|
| 10-20% current QE or software-team productivity improvement "in some settings" | Consistent with Bain's 10-15% and the World Quality Report's self-reported 19%, but those are perception figures. Usable only as "what organizations report". | "Organizations report 10-20% perceived productivity gains; controlled studies range from negative to strongly positive depending on task and experience. We will measure ours." |
| 20-35% net effort reduction on selected repetitive activities during a pilot | Plausible for narrowly defined generation and triage tasks after review and correction time is deducted, but it is a pilot target, not an external benchmark; lab figures shrink to under 10% on complex tasks. "Net" must include review, correction, control effort and prompt preparation. | "Pilot target: 15-35% net reduction in active human effort on the two selected activities, measured against a three-week baseline. Below 10% is a stop signal." |
| 30-50% task-level improvement for selected testing, debugging or refactoring | Exists in vendor and lab studies; must never be applied to a budget. | Cite only as a task-level range from vendor and lab studies; state that code generation is a quarter to a third of cycle time. |
| 5-10% QA capacity released for an initial portfolio | Too aggressive for year one. Compounding activity share, eligibility, adoption and net saving yields about 3-5% in a realistic base case; 5-10% is the upside case or a year-two portfolio figure. | "Base case 3-5% of QA effort in year one on adopting squads; 5-10% is the upside case contingent on adoption above 60% and net task savings above 25%." |
| 3-7% first-year hard-dollar saving | Achievable only in the upside scenario and only where renewals fall within the year; base case is 0-2% net of AI and pilot cost. | "First-year hard-dollar impact is expected to be small (0-3%) and depends on contract timing; year two is when capture becomes material." |
| 8-15% of addressable QA spend at mature scale | Insufficiently defined (capacity or hard-dollar?). As hard-dollar it is aggressive; as capacity it is plausible in the upside after two to three years with broader autonomy. | "Mature capacity opportunity 8-15% of QA effort; mature hard-dollar opportunity 4-10% of addressable spend, both contingent on bank-specific proof." |

## Scenario assumptions

One blended eligible-activity block is used rather than twelve separate activities, to avoid false precision; a pilot baseline replaces the block with measured activity shares.

| Assumption | Downside | Base | Upside | Where the value comes from |
|---|---|---|---|---|
| Share of QA time in AI-eligible activities (design, automation, maintenance, triage, defect preparation, evidence) | 45% | 55% | 60% | Questionnaire top-three effort question and baseline time capture |
| Proportion of that work AI can address in the pilot use cases | 50% | 60% | 70% | Use-case scoping in the baseline phase |
| Adoption and utilization by squad members | 30% | 50% | 70% | Pilot telemetry; consultancy surveys report low redirection and adoption |
| Net task saving after review, correction and control effort | 10% | 20% | 30% | Pilot measurement |
| Capacity released (product of the four rows) | 0.7% | 3.3% | 8.8% | Calculated |
| Capacity released, rounded for planning | 0-2% | 3-5% | 8-10% | |
| Capture factor: share of released capacity that is variable cost, inside a renewal window and not absorbed by backlog | 25% | 50% | 70% | Finance questions and the benefits register |
| Gross hard-dollar saving (capacity x capture) | 0.2% | 1.7-2.5% | 5.6-7% | Calculated |
| AI licences, inference, integration, governance, support and training, year one, as share of addressable QA spend | 1.5% | 1.0% | 0.8% | Vendor list pricing plus pilot cost; fixed cost dilutes at scale |
| Quality-risk adjustment (cost of additional escaped defects, rework and review time) | 0.5% | 0.2% | 0% | Telemetry-study warnings; measured in the pilot |
| Net first-year hard-dollar impact | About -1.8% (net cost) | About 0.5-1.3% | About 4.8-6.2% | Calculated |
| Year-two run-rate hard-dollar impact (adoption and capture mature, pilot cost not repeated) | 0-1% | 3-5% | 7-10% | Judgement; requires renewal alignment |

## Illustrative waterfall per $10 million of addressable QA spend (base case)

| Step | Amount | Note |
|---|---|---|
| Addressable QA spend (labour plus external services) | $10,000,000 | Excludes tooling and environments |
| Capacity released at 4% | $400,000 equivalent | Effort, not cash |
| Less capacity absorbed by backlog or retained (50%) | -$200,000 | Cost avoidance if demand would otherwise have required hiring; otherwise productivity only |
| Gross hard-dollar saving through contractor, managed-service or hiring changes | $200,000 | Requires a renewal or scope change within the year |
| Less AI licences, inference and integration (about 0.7%) | -$70,000 | Seat licences for adopting squads, model consumption, CI integration |
| Less governance, evaluation, support and training (about 0.3%) | -$30,000 | Model-inventory entry, audit logging, enablement |
| Less quality-risk allowance (about 0.2%) | -$20,000 | Released if the quality floor holds |
| Net first-year hard-dollar impact | About $80,000 (0.8%) | Plus $200,000 of cost avoidance or redeployed capacity, reported separately |

The point of the waterfall is not the number; it is that every line except the first is a question the questionnaire or the baseline must answer. Shown to an executive as percentages with the assumptions visible, it demonstrates discipline. Shown as a dollar forecast, it is false precision.

## Converting questionnaire responses into the preliminary waterfall

Activity share comes from the top-three effort question and the interview's percentage split; if only the top-three is available, assign the eligible block the midpoint of the 45-60% range and say so. Eligibility comes from use-case scoping in the baseline phase and should not be estimated from a questionnaire. Adoption and net task saving start at the downside values until the pilot measures them. The capture factor is built from the Finance questions (variable share of spend, mechanisms available within 12 months, what happens to released capacity, recognition rule): if no mechanism exists within 12 months or capacity will be absorbed by backlog, first-year hard-dollar is reported as zero and the benefit is labelled cost avoidance. AI cost comes from the approved platform's list pricing and the pilot budget and is not netted against savings until measured.

## Accounting treatment by cost type

External contractors and offshore are the cleanest capture route; a saving is recognized when a renewal is reduced or a rate-card scope is cut, with timing governed by notice periods. Employee capacity released is redeployment or avoided hiring, never a first-year saving; report it as cost avoidance against an approved workforce plan. Managed services require SOW scope or volume renegotiation, and the provider is often adopting AI too, so ask for shared-benefit terms. An avoided requisition is a saving only if it existed in the approved budget. Licence consolidation savings are real but small; overlapping AI tools are a net cost until rationalized. Inference and tokens are variable cost that scales with adoption; set a monthly ceiling per squad and report actuals. Integration is one-time; amortize over the expected life or expense in the pilot year, but state which. Control work (model-inventory entries, logging review, access recertification) is recurring; include it. Training and enablement are front-loaded and are where adoption is won or lost. Hold a quality-risk provision until the quality floor is demonstrated over at least two releases.
