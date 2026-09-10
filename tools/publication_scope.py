"""Classify publication intent separately from ordinary repository validation."""
import argparse
import json
import os
import re
import subprocess

# These paths cannot change the rendered publication. Docs are deliberately public.
INTERNAL = ('research/', 'tools/', '.github/', 'maintainers/')
INTERNAL_FILES = {'README.md', 'CONTRIBUTING.md', 'Makefile', '.gitignore', '.gitattributes', 'package.json', 'package-lock.json', 'Gemfile', 'Gemfile.lock'}

def classify(paths, old_version, version):
    public = any(not p.startswith(INTERNAL) and p not in INTERNAL_FILES for p in paths)
    return {'edition_changed': old_version != version, 'public_changed': public}

def git(*args):
    return subprocess.check_output(['git', *args], text=True).strip()

def version(ref):
    return re.search(r'^version: "([^"]+)"', git('show', f'{ref}:_data/release.yml'), re.M)[1]

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--base', required=True)
    parser.add_argument('--head', default='HEAD')
    parser.add_argument('--deploy', action='store_true')
    args = parser.parse_args()
    result = classify(git('diff', '--name-only', args.base, args.head).splitlines(), version(args.base), version(args.head))
    if args.deploy and result['public_changed'] and not result['edition_changed']:
        raise SystemExit('Published content changed without a new site edition; update _data/release.yml before deployment.')
    result['publish'] = result['edition_changed']
    if os.environ.get('GITHUB_OUTPUT'):
        with open(os.environ['GITHUB_OUTPUT'], 'a') as output:
            for key, value in result.items(): output.write(f'{key}={str(value).lower()}\n')
    print(json.dumps(result))
