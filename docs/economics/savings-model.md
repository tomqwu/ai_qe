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

## Adoption assumptions affect the economics

Validate the [platform prerequisites for the selected workflow]({{ '/platform-readiness/' | relative_url }}) before treating any scenario as achievable. Infrastructure, service virtualization, test data, integration, coaching and support can add setup effort, recurring cost and wait time. Attribute ordinary automation improvements separately from AI assistance. Unknown dependencies are an estimation gap, not evidence of zero cost or readiness.

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
| 20-35% net effort reduction on selected repetitive activities during a pilot | Plausible for narrowly defined generation and triage tasks after review and correction time is deducted, but it is a pilot target, not an external benchmark; lab figures shrink to under 10% on complex tasks. "Net" must include review, correction, control effort and prompt preparation. | "Economic-route pilot target: 15-35% net reduction in active human effort on the selected activities. Below 10% is a stop signal with adequate evidence. Other primary outcomes use the approved outcome charter." |
| 30-50% task-level improvement for selected testing, debugging or refactoring | Exists in vendor and lab studies; must never be applied to a budget. | Cite only as a task-level range from vendor and lab studies; state that code generation is a quarter to a third of cycle time. |
| 5-10% QA capacity released for an initial portfolio | Not established by the cited evidence. The illustrative exact base is 3.3%; different measured inputs can produce higher, lower or negative results. | "Illustrative exact base capacity is 3.3%; replace every input with measured activity, eligibility, adoption and net effort." |
| 3-7% first-year hard-dollar saving | Not an evidence-backed forecast. The illustrative base yields 0.45%; capture depends on Finance-approved changes and timing. | "No first- or second-year cash forecast is established. Test an explicit capture mechanism and its contract timing." |
| 8-15% of addressable QA spend at mature scale | Insufficiently defined (capacity or hard-dollar?). Neither a mature capacity percentage nor a cash percentage is established for the client. | "No mature savings range is established. Build explicit sensitivity scenarios from stated inputs, then replace them with client observations." |

## Canonical scenario assumptions

{% include scenario-table.html %}

Inputs are illustrative hypotheses, not benchmarks or bank forecasts. The simulator and this table use `_data/scenarios.json` and the same calculation. The results above are exact products, with display rounding only. A planning range is a separate sensitivity analysis; it must not replace the base calculation.

## Illustrative waterfall per $10 million (base)

{% assign base = site.data.scenario_results.base %}

| Step | Amount | Meaning |
|---|---:|---|
| Capacity released at {{ base.capacity | times: 100 | round: 2 }}% | ${{ base.capacity | times: 10000000 | round: 0 }} | Effort equivalent |
| Retained or redeployed capacity | −${{ base.uncaptured | times: 10000000 | round: 0 }} | Not captured in the budget |
| Gross captured benefit | ${{ base.captured | times: 10000000 | round: 0 }} | Requires a Finance-approved mechanism |
| AI and pilot cost | −$100000 | Illustrative 1% of spend |
| Quality allowance | −$20000 | Illustrative 0.2%; excludes review time already in task saving |
| Net economic / captured impact | ${{ base.net | times: 10000000 | round: 0 }} | {{ base.net | times: 100 | round: 2 }}% of spend |

## When review makes a task slower

Negative net task saving represents extra human effort after prompt preparation, review, correction and controls. Released capacity is then zero; the extra effort is valued at the same blended labour rate. The capture factor applies **only to positive released capacity**. The review-slowdown scenario adds 3.3% effort ($330,000 equivalent) and $120,000 of AI/pilot costs and quality allowance: −$450,000 economic impact. Its cash impact before any additional staffing is −$120,000. Extra effort consumes capacity; it becomes additional cash cost only when approved staffing or services spend changes. Do not count review twice in the quality allowance.

```text
signed task impact = share × eligibility × adoption × net task saving
released capacity = max(0, signed task impact)
extra effort = max(0, −signed task impact)
captured benefit = released capacity × capture factor
cash impact before extra staffing = captured benefit − AI/pilot cost − quality allowance
economic impact = cash impact before extra staffing − extra effort equivalent
```

## Converting questionnaire responses into the preliminary waterfall

Activity share comes from a measured time-capture baseline or the interview's explicitly supplied percentage split. A top-three ranking identifies where to investigate; it supplies no percentage. Keep activity share unknown when only a ranking exists, and report the client estimate as **not yet estimable**. Never substitute the midpoint of an illustrative range for a missing client input. Eligibility comes from use-case scoping in the baseline phase and should not be estimated from a questionnaire. Keep adoption and net task saving unknown until measured. A preliminary sensitivity scenario may use explicitly supplied estimates, with each input labeled as a scenario assumption rather than a questionnaire-derived observation. The capture factor is built from the Finance questions (variable share of spend, mechanisms available within 12 months, what happens to released capacity, recognition rule): if no mechanism exists within 12 months or capacity will be absorbed by backlog, gross captured hard-dollar savings are zero. Report released capacity separately as productivity; label it cost avoidance only against an approved spending plan that would otherwise be needed. Net first-year hard-dollar impact still deducts AI and pilot costs plus the quality-risk allowance. Use explicitly labelled cost estimates from approved-platform pricing and the pilot budget in preliminary scenarios, then replace estimates with actuals as they become available. With zero capture and the base-case 1.0% AI/pilot cost plus 0.2% quality allowance, net impact is -1.2% of addressable spend (-$120,000 per $10 million), not zero. If costs are unknown, net impact is not yet estimable; do not report zero or a positive net return.

### Worked conversion examples

| Available information | Treatment | Result |
| --- | --- | --- |
| Top three categories: execution, test design and triage; no time allocation | Activity share stays unknown. Request a percentage split or time capture. | Client capacity and savings: **not yet estimable** |
| Measured selected-activity share 40%, eligibility 50%, adoption 60%, net task saving 20% | Multiply quantities with the same scoped denominator: 0.40 × 0.50 × 0.60 × 0.20. | 2.4% modeled capacity equivalent; cash remains unknown until capture and costs are established |
| The same numerical inputs supplied only as planning assumptions | Label the calculation a sensitivity scenario and retain the input sources/status. | Illustrative 2.4%, not a measured client estimate |

These are worked method examples, not banking observations. Changing the activity ranking alone cannot change a percentage because the ranking does not contain one.

## Accounting treatment by cost type

External contractors and offshore are the cleanest capture route; a saving is recognized when a renewal is reduced or a rate-card scope is cut, with timing governed by notice periods. Employee capacity released is redeployment or avoided hiring, never a first-year saving; report it as cost avoidance against an approved workforce plan. Managed services require SOW scope or volume renegotiation, and the provider is often adopting AI too, so ask for shared-benefit terms. An avoided requisition is a saving only if it existed in the approved budget. Licence consolidation savings are real but small; overlapping AI tools are a net cost until rationalized. Inference and tokens are variable cost that scales with adoption; set a monthly ceiling per squad and report actuals. Integration is one-time; amortize over the expected life or expense in the pilot year, but state which. Control work (model-inventory entries, logging review, access recertification) is recurring; include it. Training and enablement are front-loaded and are where adoption is won or lost. Hold a quality-risk provision until the quality floor is demonstrated over at least two releases.
