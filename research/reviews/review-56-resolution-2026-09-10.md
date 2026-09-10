# Accepted review scope for v1.24.0

The user approved implementing the recommendations assessed from [PR #56](https://github.com/tomqwu/ai_qe/pull/56). [Issue #57](https://github.com/tomqwu/ai_qe/issues/57) tracks completion; it stays open until deployment and hosted verification.

## Implemented

- Presentation frames use the same dimensions on flow and non-flow slides. Present mode reduces chrome; idle narration does not reserve a panel. Playback reveals an aligned panel with a 12px gap. Body and footer type have minimum sizes, cover text has an explicit paint layer, and the initial slide stack is hidden during initialization.
- `_data/briefing_routes.json` owns four focused routes and full navigation sequences with a closing decision. Existing slide IDs and all 116 slides remain available. Exported full and guided PDFs follow the same order. Banking strategy leads with payment quality and end-to-end contribution before economics.
- Discovery now states the proposed assessment, responsible roles, funding basis and evidence for authorizing a bounded pilot. A shared timing explanation separates engagement phases, measurement protocol and the API teaching example. Measurement values still come from `pilot_gates.json`; example phases come from `visual_story.json`.
- The architecture reference maps responsibilities to existing systems, incremental adapters and owners. It does not require every client to build a new platform stack.
- The homepage uses links to full-size decks. The presentation room and case preview use consistent banking deck names; linked outlines reflect real slide headings. Audience filters and embedded deck selection agree across reloads. Dictionary and Downloads remain visible in the desktop rail.
- Audio sources are assigned on Play, not during browsing. Guide configuration and recording metadata load together while the document is active. Initialization is cancelled when leaving the page and resumes after an interrupted browser-history restoration; no deferred second fetch is started from the departing document. Optional Auto-next, the two-second pause, manual takeover, captions and synchronized visual clocks remain intact.
- FlakyGuard evidence uses separate denominators for 47.6% of reproducible flaky tests and 51.8% of generated fixes accepted. The capacity example explains 78 gross hours, 66 after operations, 33 usable hours and 15 packs to recover setup, without conflating this example with portfolio cash value.
- PDF author metadata, restrained media credits and per-recording provenance are provided on existing surfaces. Recordings with no matching local receipt retain an explicit unknown subscription tier. Duration totals are recomputed from the recorded clips.
- Unused Mermaid loading is removed. The published site includes only the ten current PDFs; historical editions remain in immutable GitHub releases. The visible version and latest-change line remain.
- Release intent is separate from validation. Review-only PR #56 classifies as no publication; public deployment requires an edition change. Existing immutable-tag checks still protect releases. Local and CI browser groups share `tools/qa-groups.json`; deployment waits for every group. README is concise and procedures live in CONTRIBUTING and maintainers.

## Deliberate adjustments and deferred suggestions

Keep the user-selected name **Our Banking Client** with a concise illustrative banking scenario disclosure. Do not rename the client again or remove material evidence limits. Do not hide weak economics, convert capacity to cash, or relabel unknown results as observed. The three timing scopes have different meanings and should not be forced into one duration.

Keep the full technical material, all existing pages and the optional 3D demonstration. No new credits page, mandatory film, rewritten regulatory pitch or vendor ranking is required for this release. The FlakyGuard exact figures already existed in the detailed evidence page; the summary needed repair. Mermaid was version-pinned, but unused. Some design tokens already existed.

Do not infer a licence breach from missing receipts. Preserve the unrelated local questionnaire replacement. Do not rewrite Git history to remove historical assets. A digest-addressed media distribution system, automatic PDF generation in CI, broad content consolidation, an auto-hiding presentation toolbar and a full accessibility audit remain separate changes, rather than acceptance conditions for this issue.

## Verification and narration review

The 57 changed narration destinations have explicit retention decisions in `assets/data/narration-review.json`. Most changes replace the scenario disclosure; the six substantive lead/title/closing annotations restate the retained explanations. Audio, scripts, captions and cue hashes are unchanged. Stable IDs keep the reordered routes connected to the correct recording.

The validation gates include model and publication tests, 116 recordings with measured captions, 167 semantic destinations, 166 full/guided PDF pages and all five browser groups in Chromium/WebKit. Targeted new checks cover initial layout shift, minimum label size, at least 85% laptop-height use in idle Present mode, no MP3 request before Play, route closures, audience reload behavior and visible utilities. Full narration tests cover panel bounds, real audio ending, pause/seek/rate/replay, manual takeover and cross-page focus. These checks supplement rendered PDF and browser review; they are not a claim of exhaustive accessibility or live client testing.

Deployment and issue closure evidence are recorded in the GitHub issue after the new edition is live.
