---
title: Plan the discovery
permalink: /discovery/
nav_order: 1.9
has_toc: false
description: Turn an AI-assisted QA conversation into a specific workflow, baseline, platform assessment and measurable pilot.
---

<p class="eyebrow">The next conversation</p>

# Start with one workflow.<br>Agree what better means.

For a team of 50–100 offshore QA staff, begin with the work: handoffs, wait time, repeated execution and rework. Then test whether AI assistance and shared platform services can improve that workflow under the current delivery conditions.

<div class="discovery-grid"><section class="discovery-card"><h2>01 / Understand the work</h2><p>“Walk me through your last payment release. Where did the team spend time doing, waiting and redoing?”</p><ul><li>Which tasks consume manual effort across requirements, test design, data, environments, automation, execution, triage and evidence?</li><li>Which handoffs across offshore teams and product owners create delays?</li><li>Which recurring payment failure or customer journey should we trace first?</li></ul><a href="{{ '/case-studies/fintech/' | relative_url }}#workflow">Use the fintech workflow as a prompt →</a></section><section class="discovery-card"><h2>02 / Assess the foundation</h2><p>“What can teams reuse today, and what do they rebuild for each application?”</p><ul><li>For example: Azure Boards, GitHub Actions, Playwright, REST Assured, Pact and Appium. Which are already approved and maintained?</li><li>Are APIs testable, environments repeatable and test data available on demand?</li><li>How mature are CI/CD, cloud provisioning, web/mobile testing, observability and framework ownership?</li></ul><a href="{{ '/case-studies/fintech/' | relative_url }}#maturity">Compare the maturity assumptions →</a></section><section class="discovery-card"><h2>03 / Choose a bounded pilot</h2><p>“Which workflow is frequent enough to measure and stable enough to improve?”</p><ul><li>Consider API-test drafting, failure triage or automation maintenance within an existing stack.</li><li>Identify the input, AI-assisted task, usable output, human reviewer and platform owner.</li><li>Measure current effort, waiting, review and rework before proposing a target.</li></ul><a href="{{ '/docs/method/phased-pilot/' | relative_url }}">Open the pilot method →</a></section><section class="discovery-card"><h2>04 / Agree the evidence</h2><p>“What would convince both delivery leaders and the sponsor to continue?”</p><ul><li>Define net effort, cycle time, defect detection and release-quality measures.</li><li>Separate released capacity from cash savings; name how any value would be used.</li><li>Agree the baseline sample, decision owner, review date and stop conditions.</li></ul><a href="{{ '/docs/economics/savings-model/' | relative_url }}">Inspect the value model →</a></section></div>

## Leave with a concrete next step

Record the candidate application and workflow, a delivery owner and platform owner, the baseline evidence to collect, and the decision the pilot must support. The existing tools and maturity assessment should determine the implementation path.

<div class="hero-actions"><a class="btn btn-primary" href="{{ '/assets/pdf/ai-qe-discovery-questionnaire-v' | append: site.data.release.questionnaire_edition | append: '.pdf' | relative_url }}">Download the questionnaire ↓</a><a class="text-link" href="{{ '/docs/method/interview-and-data-request/' | relative_url }}">Interview &amp; evidence checklist →</a></div>

The stack names are examples for discovery. The fintech case is an authored scenario, not a deployed customer solution.
