"""Publish a prepared release from GitHub Actions after a successful deployment."""
import argparse
import json
import mimetypes
import os
from pathlib import Path
from urllib.error import HTTPError
from urllib.parse import quote
from urllib.request import Request, urlopen
from release_identity import check_identity, validate_package


class GitHub:
    def __init__(self, repository, token):
        assert repository == 'tomqwu/ai_qe', 'Unexpected release repository'
        self.root = f'https://api.github.com/repos/{repository}'
        self.token = token

    def request(self, method, url, body=None, content_type='application/json'):
        assert url.startswith((self.root + '/', 'https://uploads.github.com/repos/tomqwu/ai_qe/')), 'Unexpected API host or repository'
        if body is not None and not isinstance(body, bytes):
            body = json.dumps(body).encode()
        request = Request(url, data=body, method=method, headers={
            'Authorization': f'Bearer {self.token}', 'Accept': 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2026-03-10', 'Content-Type': content_type})
        try:
            with urlopen(request, timeout=120) as response:
                data = response.read()
                return json.loads(data) if data else None
        except HTTPError as error:
            if method == 'GET' and error.code == 404:
                return None
            raise RuntimeError(f'GitHub {method} failed with HTTP {error.code}') from None


def publish(package, sha, api):
    manifest = validate_package(package)
    files = manifest['assets']
    release = check_identity(manifest, sha, api)
    if release:
        if not release['draft']:
            print(f'Already published and verified: {release["html_url"]}')
            return release
    else:
        release = api.request('POST', f'{api.root}/releases', {
            'tag_name': manifest['tag'], 'target_commitish': sha, 'name': manifest['title'],
            'body': (package / 'notes.md').read_text(), 'draft': True, 'prerelease': False})
    # A resumed draft may contain a partial upload. Never replace published assets.
    for asset in release.get('assets', []):
        api.request('DELETE', f'{api.root}/releases/assets/{asset["id"]}')
    upload_url = release['upload_url'].split('{', 1)[0]
    for name, digest in files.items():
        payload = (package / 'assets' / name).read_bytes()
        asset = api.request('POST', f'{upload_url}?name={quote(name)}', payload,
                            mimetypes.guess_type(name)[0] or 'application/octet-stream')
        assert asset['state'] == 'uploaded' and asset['size'] == len(payload), f'Incomplete upload: {name}'
        assert asset.get('digest') == f'sha256:{digest}', f'Upload checksum mismatch: {name}'
    # Publish only after every upload is complete and its server digest matches.
    result = api.request('PATCH', f'{api.root}/releases/{release["id"]}', {'draft': False, 'make_latest': 'true'})
    assert not result['draft'], 'Release remains a draft'
    print(f'Published {len(files)} verified assets: {result["html_url"]}')
    return result


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--package', type=Path, required=True)
    args = parser.parse_args()
    assert os.environ.get('GITHUB_ACTIONS') == 'true', 'Release publishing runs inside GitHub Actions'
    publish(args.package, os.environ['GITHUB_SHA'], GitHub(os.environ['GITHUB_REPOSITORY'], os.environ['GH_TOKEN']))
