---
title: Strategic choices
parent: Industry research
nav_order: 7
permalink: /docs/industry/strategic-choices/
---
# Choose a shared assurance capability

The strategic recommendation is to make approved expectations, independent evaluations and release evidence reusable across teams. Assistants can remain local experiences; the institution owns how quality is demonstrated. This is an authored strategy informed by the research, not a Gartner or McKinsey recommendation for this bank. {% include industry/cite.html ids="G01,D01,A01" %}

{% include diagrams/figure.html name="strategy-choices" label="Strategic choices for AI and quality engineering" %}

| Choice | Benefit sought | Trade-off | Condition for use |
|---|---|---|---|
| Isolated assistants | Fast task-level experimentation | Repeated integration and inconsistent evidence | A bounded task with an accountable reviewer |
| Shared assurance services | Portable evaluation, policy and evidence | Common services need product ownership, support and change control | Multiple teams share a demonstrated requirement |
| Bounded agents | Delegated multi-step work | More consequential failures and recovery obligations | Authority can be constrained and denial/recovery can be independently exercised |

## One worked financial-services workflow

{% include diagrams/figure.html name="bank-workflow" label="Payment API current hypothesis and proposed target" %}

The example changes a payment API rule: negative amounts must be rejected. The **current-state row is a discovery hypothesis**, not an assertion about any bank. Validate it through interviews and workflow traces. The target connects an approved domain contract to generated candidate tests, independent mutation checks, human review and existing change controls. It claims no observed efficiency gain. {% include industry/cite.html ids="E04,E05,D02" %}

The payments owner owns the negative-amount rule and failure consequences. QE owns test validity. The platform team owns identity integration, runner isolation and evidence availability. Domain QA owns failure classification, retest evidence and the review of quarantined tests. The release owner accepts residual risk and recovery responsibilities. A common platform cannot take over these domain decisions.

## Sequence by dependency

1. Establish a testable contract, baseline and review responsibility for one workflow.
2. Standardize artifacts, identities and evidence where at least two teams need the same service; fund its support owner.
3. Reuse evaluation infrastructure while keeping domain datasets and acceptance with the domain.
4. Expand delegated actions only after the denied-action and recovery cases pass; monitor the service after approval.

The strategic scorecard combines quality, delivery flow, adoption, net human effort, attributable cost and control exceptions. It must not reward artifact volume while ignoring rework. Cash capture remains a separate Finance decision. The [pilot workshop]({{ '/docs/method/executive-presentation/' | relative_url }}) provides an implementation discussion when required; the EVP presentation is the strategic narrative.
