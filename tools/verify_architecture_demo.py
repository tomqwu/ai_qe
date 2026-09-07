"""Validate the authored 3D graph and the reproducible scene/film delivery assets."""
import json,struct,hashlib
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
data=json.loads((ROOT/'assets/data/architecture-demo.json').read_text())
ids={n['id'] for n in data['nodes']};assert len(ids)==11
groups={g['id'] for g in data['groups']};assert len(groups)==4
assert all(n['group'] in groups and n['technicalTitle'] for n in data['nodes'])
routes={r['id'] for r in data['routes']};assert len(routes)==12
for route in routes:assert all(n in ids for n in route.split(':'))
for scenario in data['scenarios']:
 for step in scenario['steps']:
  assert step['node'] in ids and set(step['routes'])<=routes
  assert step['duration']>=7 and step['artifact'] and step['flow']
blob=(ROOT/'assets/models/assurance-platform.glb').read_bytes();magic,version,length=struct.unpack_from('<4sII',blob)
assert magic==b'glTF' and version==2 and length==len(blob)
chunk=struct.unpack_from('<I',blob,12)[0];model=json.loads(blob[20:20+chunk]);assert {n.get('extras',{}).get('nodeId') for n in model['nodes'] if n.get('extras',{}).get('nodeId')}==ids
assert 'Blender' in model['asset']['generator']
manifest=json.loads((ROOT/'assets/data/architecture-film.json').read_text())
assert (manifest['width'],manifest['height'],manifest['fps'],manifest['duration'],manifest['frames'])==(1920,1080,24,49,1176)
for name,digest in {**manifest['inputs'],**manifest['outputs']}.items():assert hashlib.sha256((ROOT/name).read_bytes()).hexdigest()==digest,f'3D film input or output changed: {name}'
assert sum(s['duration'] for s in data['scenarios'][0]['steps'])==manifest['duration']
assert (ROOT/'assets/video/assurance-architecture.vtt').read_text().startswith('WEBVTT')
assert (ROOT/'assets/video/assurance-architecture.vtt').read_text().count(' --> ')==7
print('Passed: 11 Blender modules, 12 directed routes, four scenario graphs and matching 1080p film/source assets')
