# AI × QE

A research-backed presentation site about modernizing quality engineering and adding AI assistance around reliable testing.

[Start with the banking executive story](https://tomqwu.github.io/ai_qe/briefings/fintech-evp/?route=client) · [Choose another audience](https://tomqwu.github.io/ai_qe/briefings/) · [Sources](https://tomqwu.github.io/ai_qe/docs/industry/library/)

The four decks cover banking strategy, banking implementation, industry strategy and AI assurance architecture. Focused routes end on a decision discussion; full decks retain the supporting material. Both have matching PDF downloads. Recorded narration, English captions and diagram flow share one clock.

Our Banking Client is an illustrative payment-testing scenario. Planning inputs and proposed outcomes are not observed client results. Modernization gains, AI contribution, capacity and cash are measured separately.

## Local validation

Install the locked Ruby and npm dependencies, Python packages in `tools/requirements.txt`, ffmpeg, and Playwright Chromium/WebKit. Run `make check` with a local `/ai_qe/` preview; see [CONTRIBUTING.md](CONTRIBUTING.md) for setup and media checks. Browser suites use `tools/qa-groups.json` locally and in CI.

## Publication records

- `_data/release.yml`: visible version, editions and latest change.
- `_data/briefing_routes.json`: guided and full sequence with stable slide IDs.
- `_data/briefing_room.json`: audience titles and linked outlines.
- `assets/data/narration*.json`: recordings, captions, reviewed content and provenance.
- `_data/engagement.json`: decision brief and timing scope.

Public content changes require a new edition before deployment. Ordinary review, tooling and maintainer changes still run validation without publishing a release. CI checks both browser engines before deploying the prepared publication; GitHub releases remain immutable.

Prepared by Tom Wu. Illustrations and English voice are synthetic; evidence citations identify their original publishers.
