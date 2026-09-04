"""Check built HTML links, assets, anchors and search data without network access."""
import json
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urljoin, urlsplit


class Page(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.ids = set()
        self.links = []
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if "id" in attrs:
            self.ids.add(attrs["id"])
        attr = "href" if tag in {"a", "link"} else "src"
        if tag in {"a", "link", "script", "img", "iframe"} and attrs.get(attr):
            self.links.append(attrs[attr])


root = Path(sys.argv[1] if len(sys.argv) > 1 else "_site").resolve()
base = "https://tomqwu.github.io/ai_qe/"
pages = {p: Page(p.read_text()) for p in root.rglob("*.html")}
assert root / "index.html" in pages, "Missing homepage"
errors = []
checked = 0
for source, page in pages.items():
    url = urljoin(base, source.relative_to(root).as_posix())
    for href in page.links:
        dest = urlsplit(urljoin(url, href))
        if dest.scheme not in {"http", "https"} or dest.netloc != urlsplit(base).netloc:
            continue
        if not dest.path.startswith("/ai_qe/"):
            errors.append(f"{source}: link escapes project base URL: {href}")
            continue
        target = (root / unquote(dest.path.removeprefix("/ai_qe/"))).resolve()
        if not target.is_relative_to(root):
            errors.append(f"{source}: link escapes build directory: {href}")
            continue
        if target.is_dir():
            target /= "index.html"
        checked += 1
        if not target.is_file():
            errors.append(f"{source.relative_to(root)}: missing target: {href}")
        elif dest.fragment and target in pages and unquote(dest.fragment) not in pages[target].ids:
            errors.append(f"{source.relative_to(root)}: missing anchor: {href}")

search = json.loads((root / "assets/js/search-data.json").read_text())
assert search, "Search index is empty"
for entry in search.values():
    dest = urlsplit(entry["url"])
    target = root / unquote(dest.path.removeprefix("/ai_qe/"))
    if target.is_dir():
        target /= "index.html"
    if target not in pages or (dest.fragment and unquote(dest.fragment) not in pages[target].ids):
        errors.append(f"Broken search result: {entry['url']}")
assert not errors, "\n".join(errors)
print(f"Passed: {len(pages)} HTML pages, {checked} internal references, {len(search)} search entries")
