"""Validate the prepared package and remote edition before Pages deployment."""
import argparse
import os
from pathlib import Path
from publish_release import GitHub
from release_identity import check_identity, validate_package


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--package', type=Path, required=True)
    args = parser.parse_args()
    manifest = validate_package(args.package)
    api = GitHub(os.environ['GITHUB_REPOSITORY'], os.environ['GH_TOKEN'])
    check_identity(manifest, os.environ.get('RELEASE_COMMIT') or os.environ['GITHUB_SHA'], api)
    print(f'Preflight passed for {manifest["tag"]}: verified package and remote edition identity')
