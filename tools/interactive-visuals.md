# Interactive visuals

The homepage workbench and two audience slides share native HTML controls, SVG rendering (`assets/js/explorers.js`) and one arithmetic module (`assets/js/qe-model.js`). They use no external chart service, analytics or network requests. The architecture is a proposed pilot walkthrough, not a running AI integration.

## Chart contracts

- **Annual value bridge:** Waterfall answering how released capacity becomes captured benefit. Units are $ thousands per $10M annual addressable QA spend. Capacity equivalent is an effort valuation, not cash. Deduct uncaptured capacity, AI/pilot cost and the quality allowance; the final total starts at zero. Start/end bars are navy, deductions amber, and signed labels retain meaning without color. The numeric table supplies a no-JavaScript and print fallback; it updates with current assumptions.
- **Adoption sensitivity:** Line answering how net annual benefit changes with adoption. The 101 points from 0–100% are calculated scenarios, not observations or a time series. All other current inputs stay fixed. Horizontal axis is adoption of eligible tasks (%); vertical values are $ thousands per $10M. The zero line and current point are explicit. Every input and cost remains editable on the homepage. The compact EVP slide exposes three operational inputs and presets; its other assumptions remain visible below the chart.
- **Evidence lens:** Three dot/interval rows showing the same quantity: change in task completion time with AI (%), with negative values faster. METR's July 2025 RCT and February 2026 follow-up report +19% [2, 39], −18% [−38, 9] and −4% [−15, 9]. These are different cohorts/tool periods, not a pooled trend. Reported confidence intervals cross zero for both follow-up groups. Selection and time-measurement caveats stay next to the plot. Primary source links are embedded. No confidence level is added beyond the source wording.

Scenario inputs reproduce the existing savings-model assumptions at full precision. For example, base capacity is 3.30%, captured benefit 1.65%, total cost 1.20%, net benefit 0.45% ($45k per $10M). These differ from rounded illustrative figures elsewhere in the narrative; they are not measured bank results. Net task saving must already include preparation, review, correction and control effort.

## Verification

Run `node --test tools/qe-model.test.cjs` for scenario economics, zero-benefit conditions and waterfall reconciliation. CI also builds Jekyll and checks links, search and the questionnaire. Browser checks should exercise all tabs, presets, sliders, use cases and the held-for-correction state; verify keyboard controls do not change the current slide. Inspect desktop and narrow iframe rendering, chart labels, source links and accessible control names.

With JavaScript disabled, the architecture nodes, base economics table and evidence estimates remain readable. With print enabled, the value table reflects the current assumptions. Browser controls and graphs use the same math; there is no separate hardcoded result path after initialization.
