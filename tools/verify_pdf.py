"""Check the shipped questionnaire's ranges, fields and generator reproducibility."""
import math
import os
import re
import subprocess
import sys
import tempfile
from pathlib import Path

from pypdf import PdfReader, PdfWriter

root = Path(__file__).resolve().parents[1]
edition = re.search(r'questionnaire_edition: "([^\"]+)"', (root / "_data/release.yml").read_text())[1]
source = root / f"assets/pdf/ai-qe-discovery-questionnaire-v{edition}.pdf"
reader = PdfReader(source)
fields = reader.get_fields()


def field_schema(pdf):
    # Compare semantic values rather than PDF object numbers or timestamps.
    return {
        name: {key: str(field.indirect_reference.get_object().get(key))
               for key in ("/FT", "/Ff", "/Opt", "/MaxLen", "/V", "/DV")}
        for name, field in pdf.get_fields().items()
    }


def interval(label):
    numbers = [float(n) for n in re.findall(r"\d+(?:\.\d+)?", label)]
    if not numbers:
        return None
    if label.lower().startswith(("less than", "under")):
        return 0, numbers[0], True, False
    if label.startswith("Up to"):
        return 0, numbers[0], True, True
    if label.startswith(("Over", "More than")):
        return numbers[0], numbers[1] if len(numbers) == 2 else math.inf, False, True
    assert len(numbers) == 2, f"Unrecognized numeric range: {label}"
    return *numbers, True, True


for question in (6, 8, 11, 13, 14, 25, 26):
    options = fields[f"Q{question:02d}_Selection"]["/Opt"]
    ranges = [span for label in options if (span := interval(label))]
    assert ranges[0][0] == 0 and ranges[-1][1] == math.inf, (question, ranges)
    for left, right in zip(ranges, ranges[1:]):
        assert left[1] == right[0], f"Q{question}: gap between {left} and {right}"
        assert left[3] != right[2], f"Q{question}: missing or overlapping boundary"

for question in (34, 35, 36):
    field = fields[f"Q{question}_Text"].indirect_reference.get_object()
    assert field["/MaxLen"] == 1000, f"Q{question}: narrative limit regressed"
    assert field["/Ff"] & 4096, f"Q{question}: not multiline"

root_ids = {field.idnum for field in reader.trailer["/Root"]["/AcroForm"]["/Fields"]}
widgets = 0
for page in reader.pages:
    for ref in page.get("/Annots", []):
        widget = ref.get_object()
        assert ref.idnum in root_ids or widget.get("/Parent").idnum in root_ids
        assert widget.get("/AP", {}).get("/N") is not None, "Missing field appearance"
        x0, y0, x1, y1 = widget["/Rect"]
        assert 0 <= x0 < x1 <= page.mediabox.width
        assert 0 <= y0 < y1 <= page.mediabox.height
        widgets += 1

with tempfile.TemporaryDirectory() as temp:
    regenerated = Path(temp) / "questionnaire.pdf"
    env = {**os.environ, "ORG_NAME": "", "PREPARED_BY": ""}
    subprocess.run([sys.executable, str(root / "tools/questionnaire_form.py"), str(regenerated)],
                   check=True, env=env, capture_output=True)
    fresh = PdfReader(regenerated)
    assert [p.extract_text() for p in fresh.pages] == [p.extract_text() for p in reader.pages], "PDF text is stale"
    assert field_schema(fresh) == field_schema(reader), "PDF fields are stale"

    # Exercise a real save/reopen with narrative content longer than the old limit.
    answer = "The pilot should measure review effort, accuracy and escaped defects. " * 5
    assert 100 < len(answer) < 1000
    writer = PdfWriter()
    writer.clone_document_from_reader(reader)
    writer.update_page_form_field_values(None, {"Q34_Text": answer}, auto_regenerate=False)
    completed = Path(temp) / "completed.pdf"
    writer.write(completed)
    saved = PdfReader(completed)
    assert saved.get_fields()["Q34_Text"]["/V"] == answer
    for page in saved.pages:
        for ref in page.get("/Annots", []):
            widget = ref.get_object()
            if widget.get("/T") == "Q34_Text":
                assert widget["/V"] == answer
                assert widget["/AP"]["/N"].get_object().get_data()

print(f"Passed: {len(reader.pages)} PDF pages, {len(fields)} fields, {widgets} widgets; ranges and save/reopen")
