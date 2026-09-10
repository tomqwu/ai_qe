.PHONY: check models build site browser export
PYTHON ?= python3
check: models build site browser
models:
	npm test
	node --test tools/readiness-model.test.cjs tools/narration-review.test.cjs
	$(PYTHON) -m unittest discover -s tools -p 'test_*.py'
	$(PYTHON) tools/validate_narration.py --require-complete
	$(PYTHON) tools/validate_contracts.py
	node tools/build_architecture_demo.cjs --check
	$(PYTHON) tools/verify_architecture_demo.py
build:
	bundle exec jekyll build
	$(PYTHON) tools/finalize_site.py _site
site:
	QE_PYTHON=$(PYTHON) node tools/qa.cjs site
browser:
	node tools/qa.cjs browser $(GROUP)
export:
	node tools/export_decks.cjs
	node tools/export_decks.cjs --fintech
