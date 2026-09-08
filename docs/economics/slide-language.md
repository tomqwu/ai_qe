---
title: Slide language
parent: Economics
nav_order: 2
description: Exact wording that can be used on an executive slide about AI-QE savings, wording to avoid, and statements that should never be made.
---

# Slide language
{: .no_toc }

These are wording notes for the pilot business case. The **visual audience briefings** cover the broader strategy and architecture: [Executive strategic vision]({{ '/briefings/evp/' | relative_url }}#slide-2) · [Technical platform architecture]({{ '/briefings/technical/' | relative_url }}#slide-2).

## Use

- "Working hypothesis, to be tested on the bank's own data."
- "Proposed pilot gate: at least 15% net saving on one use case, subject to quality floors and sufficient evidence. Use the full decision protocol for the 10-15% band and uncertainty."
- "Capacity released is not a saving until Finance confirms how it is captured."
- "External evidence supports task-level gains and warns of quality degradation without discipline."
- "Every phase has a cost ceiling and a stop rule."
- "Organizations report 10-20% perceived gains; METR found experienced developers were slower in early 2025, while its later follow-up is inconclusive."
- "Humans approve every code change and every production-impacting action in the pilot."

## Avoid

- "AI will replace N QA resources" or any squad-level headcount arithmetic.
- "Industry benchmarks show 30-50% productivity gains."
- "Gartner says" (or any analyst) without an accessible citation that can be shown.
- "ROI of X%" before a pilot has measured anything.
- "Savings of $X million" derived from questionnaire ranges.
- "Autonomous testing" or "self-healing" without describing the human approval step.
- "Low risk" without naming the floors and stop rules that make it so.

## Statements that should not be made

That AI will allow a squad to move from N QA staff to one or two quality engineers. That industry benchmarks show 30-50% productivity improvement for QA. That a paywalled source states a figure that cannot be shown. That a first-year saving of any dollar amount is expected before Finance has confirmed the capture mechanism. That existing tools are inadequate before a pilot has tested them. That productivity gains equal savings.

## The one-paragraph executive message

> AI can probably reduce repetitive QA effort, but nobody, including the vendors, can say by how much. The credible external evidence supports task-level gains and warns that unmanaged adoption degrades stability. The proposal is a capped, phased programme on one or two applications that measures net effort on the bank's own data, keeps humans in control of every code change and release decision, maps its controls to what the regulator published in 2026, and only counts a saving when Finance can name the budget line. Each phase has a ceiling and a stop rule. The decision today is whether to fund the first two phases, not whether to transform QA.

Use the [canonical pilot decision protocol]({{ "/docs/method/phased-pilot/" | relative_url }}#decision-protocol-and-exact-boundaries) and [exact scenario table]({{ "/docs/economics/savings-model/" | relative_url }}#canonical-scenario-assumptions) when preparing slides.
