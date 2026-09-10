# Publication checks

`qa-groups.json` owns the browser inventory. Run `make models`, `make build`, `make site`, and `make browser GROUP=playback` (or `flows`, `site`, `models`, `architecture`). `make check` runs all stages.

`publication_scope.py` separates validation from deployment intent; `preflight_release.py` verifies an immutable edition before deployment. `export_decks.cjs` exports full and guided sequences. `narration-review.cjs` binds reviewed meaning to recordings and captions. Do not bootstrap reviews to bypass a changed explanation. See `maintainers/narration.md`.
