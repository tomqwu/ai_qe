"""Verify publication sequencing and refusal to overwrite a released edition."""
import hashlib
import json
from pathlib import Path
import tempfile
import unittest
import zipfile
from publish_release import publish
from prepare_release import prepare, ROOT
from release_identity import check_identity, validate_package

SHA = 'a' * 40


class FakeGitHub:
    root = 'https://api.github.com/repos/tomqwu/ai_qe'

    def __init__(self, existing=None, corrupt=False, tag=None, annotation=None):
        self.existing, self.corrupt, self.calls = existing, corrupt, []
        self.tag, self.annotation = tag, annotation

    def request(self, method, url, body=None, content_type=None):
        self.calls.append((method, url, body))
        if method == 'GET':
            if '/git/ref/' in url: return self.tag
            if '/git/tags/' in url: return self.annotation
            return self.existing
        if method == 'POST' and url.endswith('/releases'):
            return {'id': 1, 'draft': True, 'upload_url': 'https://uploads.github.com/repos/tomqwu/ai_qe/releases/1/assets{?name,label}', 'assets': []}
        if method == 'POST':
            return {'state': 'uploaded', 'size': len(body), 'digest': 'sha256:' + ('bad' if self.corrupt else hashlib.sha256(body).hexdigest())}
        if method == 'PATCH':
            return {'draft': False, 'html_url': 'https://github.com/tomqwu/ai_qe/releases/tag/v1.8.0'}


class PublicationTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.package = Path(self.tmp.name)
        (self.package / 'assets').mkdir()
        data = b'verified publication'
        (self.package / 'assets/test.pdf').write_bytes(data)
        self.digest = hashlib.sha256(data).hexdigest()
        (self.package / 'manifest.json').write_text(json.dumps({'tag': 'v1.8.0', 'title': 'AI x QE', 'assets': {'test.pdf': self.digest}}))
        (self.package / 'notes.md').write_text('Reviewable release notes')

    def tearDown(self):
        self.tmp.cleanup()

    def test_publishes_only_after_verified_upload(self):
        api = FakeGitHub()
        publish(self.package, SHA, api)
        self.assertEqual([call[0] for call in api.calls], ['GET', 'GET', 'POST', 'POST', 'PATCH'])
        self.assertTrue(api.calls[2][2]['draft'])
        self.assertEqual(api.calls[2][2]['target_commitish'], SHA)

    def test_failed_upload_stays_draft(self):
        api = FakeGitHub(corrupt=True)
        with self.assertRaisesRegex(AssertionError, 'checksum mismatch'):
            publish(self.package, SHA, api)
        self.assertNotIn('PATCH', [call[0] for call in api.calls])

    def test_existing_version_cannot_move_to_new_commit(self):
        api = FakeGitHub({'target_commitish': 'b' * 40, 'draft': False})
        with self.assertRaisesRegex(AssertionError, 'another commit'):
            publish(self.package, SHA, api)
        self.assertEqual([call[0] for call in api.calls], ['GET', 'GET'])

    def test_matching_published_release_is_read_only(self):
        api = FakeGitHub({'target_commitish': SHA, 'draft': False, 'html_url': 'release', 'assets': [{'name': 'test.pdf', 'digest': f'sha256:{self.digest}'}]})
        publish(self.package, SHA, api)
        self.assertEqual([call[0] for call in api.calls], ['GET', 'GET'])

    def test_resumes_only_a_matching_draft(self):
        api = FakeGitHub({'target_commitish': SHA, 'draft': True, 'id': 1, 'upload_url': 'https://uploads.github.com/repos/tomqwu/ai_qe/releases/1/assets{?name,label}', 'assets': [{'id': 2}]})
        publish(self.package, SHA, api)
        self.assertEqual([call[0] for call in api.calls], ['GET', 'GET', 'DELETE', 'POST', 'PATCH'])

    def test_tag_only_conflict_stops_before_any_mutation(self):
        api = FakeGitHub(tag={'object': {'type': 'commit', 'sha': 'b' * 40}})
        with self.assertRaisesRegex(AssertionError, 'tag belongs to another commit'):
            publish(self.package, SHA, api)
        self.assertEqual([call[0] for call in api.calls], ['GET'])

    def test_annotated_tag_is_checked_against_its_commit(self):
        manifest = validate_package(self.package)
        api = FakeGitHub(tag={'object': {'type': 'tag', 'sha': 'c' * 40}},
                         annotation={'object': {'type': 'commit', 'sha': SHA}})
        self.assertIsNone(check_identity(manifest, SHA, api))
        self.assertEqual([call[0] for call in api.calls], ['GET', 'GET', 'GET'])
        api.annotation['object']['sha'] = 'b' * 40
        with self.assertRaisesRegex(AssertionError, 'another commit'):
            check_identity(manifest, SHA, api)

    def test_preflight_rejects_changed_published_asset(self):
        api = FakeGitHub({'target_commitish': SHA, 'draft': False, 'assets': []})
        with self.assertRaisesRegex(AssertionError, 'asset mismatch'):
            check_identity(validate_package(self.package), SHA, api)
        self.assertTrue(all(call[0] == 'GET' for call in api.calls))

    def test_changed_local_asset_never_contacts_github(self):
        (self.package / 'assets/test.pdf').write_bytes(b'changed')
        api = FakeGitHub()
        with self.assertRaisesRegex(AssertionError, 'Changed asset'):
            publish(self.package, SHA, api)
        self.assertEqual(api.calls, [])

    def test_current_package_contains_only_current_editions(self):
        with tempfile.TemporaryDirectory() as tmp:
            folder = Path(tmp)
            manifest = prepare(folder)
            self.assertEqual(len(manifest['assets']), 16)
            self.assertEqual(len(list((folder / 'assets').glob('*.pdf'))), 6)
            for name, digest in manifest['assets'].items():
                self.assertEqual(hashlib.sha256((folder / 'assets' / name).read_bytes()).hexdigest(), digest)
                self.assertNotIn('appsec', name)
            self.assertEqual(len((folder / 'assets/SHA256SUMS.txt').read_text().splitlines()), 15)
            bundle = next((folder / 'assets').glob('ai-qe-narration-*.zip'))
            with zipfile.ZipFile(bundle) as archive:
                guides = json.loads(archive.read('narration-guides.json'))
                self.assertEqual(set(guides['demo']), {'generate', 'evaluate', 'deny', 'hold'})
                self.assertEqual(sum(len(guide['story']) for guide in guides['demo'].values()), 24)
                flows = json.loads(archive.read('narration-flows.json'))
                self.assertEqual(flows, json.loads((ROOT / 'assets/data/narration-flows.json').read_text()))
                self.assertEqual(len(archive.namelist()), len(set(archive.namelist())), 'Shared recordings must not duplicate ZIP paths')
                narration = json.loads(archive.read('narration.json'))
                scripts = json.loads((ROOT / 'assets/data/narration-scripts.json').read_text())['decks']
                expected_media = set()
                for audience, slides in scripts.items():
                    self.assertEqual(set(narration['decks'][audience]['slides']), set(slides))
                    for slide in slides:
                        entry = narration['decks'][audience]['slides'][slide]
                        expected_media.update(entry[field].lstrip('/') for field in ('audio','captions'))
                        self.assertEqual(archive.read(f'transcripts/{audience}/{slide}.txt').decode().strip(), entry['transcript'])
                        self.assertEqual(hashlib.sha256(archive.read(entry['audio'].lstrip('/'))).hexdigest(), entry['sha256'])
                self.assertEqual({name for name in archive.namelist() if name.endswith(('.mp3','.vtt'))}, expected_media)
                self.assertEqual(sum(name.startswith('transcripts/') for name in archive.namelist()), sum(map(len,scripts.values())))


if __name__ == '__main__':
    unittest.main()
