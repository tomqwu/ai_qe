"""Read-only checks shared by release preflight and publication."""
import hashlib
import json
from pathlib import Path
from urllib.parse import quote


def validate_package(package):
    manifest = json.loads((package / 'manifest.json').read_text())
    for name, digest in manifest['assets'].items():
        assert Path(name).name == name, 'Invalid asset name'
        assert hashlib.sha256((package / 'assets' / name).read_bytes()).hexdigest() == digest, f'Changed asset: {name}'
    return manifest


def check_identity(manifest, sha, api):
    """Refuse conflicts before deploying; also run again before publishing."""
    assert len(sha) == 40 and all(c in '0123456789abcdef' for c in sha), 'Expected a commit SHA'
    tag = quote(manifest['tag'], safe='')
    ref = api.request('GET', f'{api.root}/git/ref/tags/{tag}')
    if ref:
        target = ref['object']
        seen = set()
        while target['type'] == 'tag':
            assert target['sha'] not in seen and len(seen) < 8, 'Invalid annotated tag chain'
            seen.add(target['sha'])
            target = api.request('GET', f'{api.root}/git/tags/{target["sha"]}')['object']
        assert target['type'] == 'commit' and target['sha'] == sha, 'This tag belongs to another commit; increment the site version'
    release = api.request('GET', f'{api.root}/releases/tags/{tag}')
    if release:
        assert release['target_commitish'] == sha, 'This version belongs to another commit; increment the site version'
        if not release['draft']:
            actual = {asset['name']: asset.get('digest') for asset in release['assets']}
            assert actual == {name: f'sha256:{digest}' for name, digest in manifest['assets'].items()}, 'Published release asset mismatch; do not overwrite a published edition'
    return release
