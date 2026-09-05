---
title: Evidence and economics
parent: Industry research
nav_order: 2
permalink: /docs/industry/evidence/
---
# Evidence and economics

External results are useful for selecting hypotheses. A local comparison is needed to establish the value of a particular workflow.

<div class="evidence-strips">
<div><strong>Forecast</strong><p>Estimates a future state. Useful for strategic scenarios; cannot establish current productivity.</p></div>
<div><strong>Survey</strong><p>Describes reported experience or associations. Useful for adoption barriers; selection and measurement bias remain.</p></div>
<div><strong>Experiment</strong><p>Can isolate an effect within its design. Transfer still depends on tasks, people, tools and the environment.</p></div>
<div><strong>Case study</strong><p>Shows implementation mechanics and local outcomes. Usually lacks a comparable untreated group.</p></div>
<div><strong>Product docs</strong><p>Describe available functions and integration contracts. Do not establish comparative effectiveness.</p></div>
</div>

## Apparently conflicting results can both be valid

The field experiments reported by Cui and colleagues found a pooled increase in completed tasks. METR's early-2025 trial found experienced developers took longer on familiar repositories. The studies differ in task setting, participant experience, tool configuration and outcome definition. Pooling those percentages would create a metric that neither study measured. {% include industry/cite.html ids="E01,E03" %}

{% include explorers/evidence.html %}

The 2026 METR update does not provide a clean before/after series: recruitment selection and time measurement changed. Treat its estimates with the uncertainty and limitations visible in the chart. {% include industry/cite.html ids="E02" %}

## Industrial QE cases show the importance of filtering

Meta's test-generation work combines candidate generation with checks before developer review. Its mutation-guided work tests whether a candidate detects a relevant modeled fault. Google's AutoDiagnose illustrates contextual failure diagnosis; Uber's flaky-test work illustrates how repair depends on understanding the execution context. These are useful engineering patterns rather than universal business-case inputs. {% include industry/cite.html ids="E04,E05,E06,E07" %}

{% include industry/test-pipeline.html %}

A test that merely builds and passes can still preserve a defect or weaken an assertion. Review test meaning, fault detection and the independence of the expected result.

## The value model must include the work around generation

Measure **net effort per eligible task**, including context preparation, generation, review, correction, repeated execution and control administration. Pair it with escaped defects, false dismissals, rework and elapsed delivery time. Keep active human effort separate from agent runtime and queue time.

Released capacity becomes recognized value through an explicit mechanism: additional delivery, reduced external spend, avoided hiring or another Finance-approved route. An improvement in task throughput is not the same unit as a reduction in labor cost.

{% include explorers/value.html %}

The simulator is an authored scenario model. Its defaults are assumptions, not industry benchmarks. See the [full savings model]({{ '/docs/economics/savings-model/' | relative_url }}) and [pilot measurement design]({{ '/docs/method/phased-pilot/' | relative_url }}) for definitions and decision gates.

## What the current evidence does not settle

There is no general bank-wide QE savings rate in this review. Evidence remains limited on sustained escaped-defect reduction, long-term test maintainability, simultaneous-agent human effort, rare operational failures and the economics of assurance itself. Those are explicit measurement questions for the pilot and subsequent production validation.
