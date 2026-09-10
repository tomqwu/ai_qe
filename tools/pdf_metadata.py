"""Apply explicit publication attribution to the exported PDF."""
import sys
from pathlib import Path
from pypdf import PdfReader, PdfWriter
p=Path(sys.argv[1]); reader=PdfReader(p); writer=PdfWriter(clone_from=reader)
writer.add_metadata({'/Author':'Tom Wu','/Creator':'AI × QE publication workflow','/Subject':'Research-backed quality engineering briefing; illustrative scenario and AI-generated illustrations'})
temporary=p.with_suffix('.tmp.pdf')
with temporary.open('wb') as output: writer.write(output)
temporary.replace(p)
