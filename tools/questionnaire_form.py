"""Build the role-routed, fillable AI-QE executive discovery questionnaire (v3) with reportlab AcroForm.

Usage: python tools/questionnaire_form.py [output.pdf]
Set ORG_NAME / PREPARED_BY environment variables to brand the header and footer; defaults are neutral.
"""
import os, sys
import re
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor, white, black
from reportlab.lib.utils import simpleSplit

NAVY = HexColor('#1C3A5E')
CYAN = HexColor('#0E7490')
GREY = HexColor('#5B6770')
LINE = HexColor('#C9D3DD')
LIGHT = HexColor('#EEF3F8')
FIELD_BG = HexColor('#FFFFFF')
FIELD_BORDER = HexColor('#8FA3B8')

W, H = letter
ML, MR, MT, MB = 40, 40, 58, 46
TEXT_W = W - ML - MR

ORG = os.environ.get('ORG_NAME', '').strip()
PREPARED_BY = os.environ.get('PREPARED_BY', '').strip()
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(__file__), '..', 'assets', 'pdf', 'ai-qe-discovery-questionnaire-v3.pdf')
HEADER_L = (ORG + ' ' if ORG else '') + 'AI-Enabled Quality Engineering'
HEADER_R = 'Executive discovery questionnaire (v3)'
FOOTER = (('Prepared by ' + PREPARED_BY + '  |  ') if PREPARED_BY else '') + 'Save the completed PDF before closing'


def slug(s):
    s = re.sub(r'[^A-Za-z0-9]+', '_', s).strip('_')
    return s[:60]


class Form:
    def __init__(self, path):
        self.c = canvas.Canvas(path, pagesize=letter)
        self.c.setTitle((ORG + ' ' if ORG else '') + 'AI-Enabled Quality Engineering - Executive Discovery Questionnaire v3')
        self.c.setAuthor(PREPARED_BY or 'AI-QE research base')
        self.form = self.c.acroForm
        self.page = 0
        self.section_title = None
        self.y = H - MT
        self._new_page(first=True)
        self.qn = 0

    # ---------- page chrome ----------
    def _chrome(self):
        c = self.c
        c.setFillColor(NAVY)
        c.rect(0, H - 26, W, 26, stroke=0, fill=1)
        c.setFillColor(white)
        c.setFont('Helvetica-Bold', 7.5)
        c.drawString(ML, H - 17, HEADER_L)
        c.setFont('Helvetica', 7.5)
        c.drawRightString(W - MR, H - 17, HEADER_R)
        c.setFillColor(GREY)
        c.setFont('Helvetica', 7)
        c.drawString(ML, 24, FOOTER)
        c.drawRightString(W - MR, 24, f'Page {self.page}')
        c.setStrokeColor(LINE)
        c.setLineWidth(0.5)
        c.line(ML, 34, W - MR, 34)

    def _new_page(self, first=False):
        if not first:
            self.c.showPage()
        self.page += 1
        self._chrome()
        self.y = H - MT
        if not first and self.section_title:
            self.section_bar(self.section_title, 'Continued', continued=True)

    def need(self, h):
        if self.y - h < MB:
            self._new_page()

    # ---------- primitives ----------
    def text(self, s, size=8.5, font='Helvetica', color=black, gap=3, indent=0, width=None, leading=None):
        width = width or (TEXT_W - indent)
        leading = leading or size * 1.3
        lines = simpleSplit(s, font, size, width)
        self.need(len(lines) * leading + gap)
        self.c.setFont(font, size)
        self.c.setFillColor(color)
        for ln in lines:
            self.c.drawString(ML + indent, self.y - size, ln)
            self.y -= leading
        self.y -= gap

    def rich(self, parts, size=8.5, gap=3, width=None):
        """parts: list of (text, bold) written as one wrapped paragraph."""
        # simple approach: split into words with style, wrap manually
        words = []
        for t, b in parts:
            for w_ in t.split(' '):
                if w_:
                    words.append((w_, b))
        lines, cur, curw = [], [], 0
        width = width or TEXT_W
        for w_, b in words:
            f = 'Helvetica-Bold' if b else 'Helvetica'
            ww = self.c.stringWidth(w_ + ' ', f, size)
            if curw + ww > width and cur:
                lines.append(cur); cur, curw = [], 0
            cur.append((w_, b)); curw += ww
        if cur:
            lines.append(cur)
        leading = size * 1.3
        self.need(len(lines) * leading + gap)
        for ln in lines:
            x = ML
            for w_, b in ln:
                f = 'Helvetica-Bold' if b else 'Helvetica'
                self.c.setFont(f, size); self.c.setFillColor(black)
                self.c.drawString(x, self.y - size, w_)
                x += self.c.stringWidth(w_ + ' ', f, size)
            self.y -= leading
        self.y -= gap

    def rule(self, gap=6):
        self.need(gap + 2)
        self.c.setStrokeColor(LINE); self.c.setLineWidth(0.5)
        self.c.line(ML, self.y - 2, W - MR, self.y - 2)
        self.y -= gap + 2

    def section_bar(self, title, subtitle=None, continued=False):
        if not continued:
            self.section_title = None
            subtitle_height = len(simpleSplit(subtitle or '', 'Helvetica', 7.5, TEXT_W)) * 9.75
            # Keep the section heading with the first question's reserved space.
            self.need(160 + subtitle_height)
            self.section_title = title
        self.y -= 4
        self.c.setFillColor(NAVY)
        self.c.roundRect(ML, self.y - 20, TEXT_W, 20, 3, stroke=0, fill=1)
        self.c.setFillColor(white); self.c.setFont('Helvetica-Bold', 10)
        self.c.drawString(ML + 10, self.y - 14, title)
        self.y -= 26
        if subtitle:
            self.text(subtitle, size=7.5, color=GREY, gap=4)

    def question(self, title, hint=None):
        self.qn += 1
        self.need(120)
        self.rich([(f'{self.qn}. ', True), (title, True)], size=9, gap=1)
        if hint:
            self.text(hint, size=7.5, font='Helvetica-Oblique', color=GREY, gap=4)
        return self.qn

    # ---------- widgets ----------
    def checkboxes(self, qn, options, cols=2, prefix=None, size=9):
        prefix = prefix or f'Q{qn:02d}'
        colw = TEXT_W / cols
        labelw = colw - 22
        rows = (len(options) + cols - 1) // cols
        total = 0
        for r in range(rows):
            wr = [simpleSplit(o, 'Helvetica', 8.5, labelw) for o in options[r * cols:(r + 1) * cols]]
            total += max(len(w) for w in wr) * 11 + 5
        if total < 230:
            self.need(total + 4)
        # row-major so that a page break only ever splits between rows
        for r in range(rows):
            row_opts = options[r * cols:(r + 1) * cols]
            wrapped = [simpleSplit(o, 'Helvetica', 8.5, labelw) for o in row_opts]
            rh = max(len(w) for w in wrapped) * 11 + 5
            self.need(rh)
            for ci, o in enumerate(row_opts):
                idx = r * cols + ci + 1
                x = ML + ci * colw
                self.form.checkbox(name=f'{prefix}_{idx:02d}_{slug(o)}', tooltip=o,
                                   x=x, y=self.y - size - 1, size=size, buttonStyle='check',
                                   borderColor=FIELD_BORDER, fillColor=FIELD_BG, textColor=NAVY,
                                   borderWidth=0.8, forceBorder=True)
                self.c.setFont('Helvetica', 8.5); self.c.setFillColor(black)
                yy = self.y - 8.5
                for ln in wrapped[ci]:
                    self.c.drawString(x + 15, yy, ln); yy -= 11
            self.y -= rh
        self.y -= 4

    def dual_checkboxes(self, qn, options, col_titles=('In use', 'Evaluating'), prefix=None):
        """One row per option with two checkbox columns."""
        prefix = prefix or f'Q{qn:02d}'
        labelw = TEXT_W - 150
        cx1 = ML + labelw + 25
        cx2 = cx1 + 70
        self.need(16)
        self.c.setFont('Helvetica-Bold', 7.5); self.c.setFillColor(GREY)
        self.c.drawCentredString(cx1 + 4.5, self.y - 8, col_titles[0])
        self.c.drawCentredString(cx2 + 4.5, self.y - 8, col_titles[1])
        self.y -= 13
        for i, o in enumerate(options, 1):
            lines = simpleSplit(o, 'Helvetica', 8.5, labelw)
            rh = len(lines) * 11 + 4
            self.need(rh)
            if i % 2 == 0:
                self.c.setFillColor(LIGHT); self.c.rect(ML, self.y - rh + 2, TEXT_W, rh, stroke=0, fill=1)
            self.c.setFont('Helvetica', 8.5); self.c.setFillColor(black)
            yy = self.y - 8.5
            for ln in lines:
                self.c.drawString(ML + 4, yy, ln); yy -= 11
            for cx, tag in ((cx1, 'InUse'), (cx2, 'Evaluating')):
                self.form.checkbox(name=f'{prefix}_{i:02d}_{tag}_{slug(o)}', tooltip=f'{o} - {tag}',
                                   x=cx, y=self.y - 10, size=9, buttonStyle='check',
                                   borderColor=FIELD_BORDER, fillColor=FIELD_BG, textColor=NAVY,
                                   borderWidth=0.8, forceBorder=True)
            self.y -= rh
        self.y -= 4

    def dropdown(self, qn, options, name=None, width=None, label=None):
        name = name or f'Q{qn:02d}_Selection'
        width = width or TEXT_W
        self.need(24)
        if label:
            self.c.setFont('Helvetica-Bold', 7.5); self.c.setFillColor(GREY)
            self.c.drawString(ML, self.y - 8, label); self.y -= 11
        self.form.choice(name=name, tooltip=label or name, value='Select one...', options=['Select one...'] + options,
                         x=ML, y=self.y - 16, width=width, height=16, fontName='Helvetica', fontSize=8.5,
                         borderColor=FIELD_BORDER, fillColor=FIELD_BG, textColor=black, borderWidth=0.8,
                         forceBorder=True)
        self.y -= 22

    def textfield(self, name, label=None, height=16, width=None, x=None, advance=True, tooltip=None):
        width = width or TEXT_W
        x = x if x is not None else ML
        if label:
            self.need(height + 14)
            self.c.setFont('Helvetica-Bold', 7.5); self.c.setFillColor(GREY)
            self.c.drawString(x, self.y - 8, label); self.y -= 11
        else:
            self.need(height + 4)
        self.form.textfield(name=name, tooltip=tooltip or label or name, x=x, y=self.y - height, width=width, height=height,
                            fontName='Helvetica', fontSize=8.5, borderColor=FIELD_BORDER, fillColor=FIELD_BG,
                            textColor=black, borderWidth=0.8, forceBorder=True,
                            fieldFlags='multiline' if height > 20 else '',
                            maxlen=1000 if height > 20 else 250)
        if advance:
            self.y -= height + 6

    def two_textfields(self, n1, l1, n2, l2):
        half = (TEXT_W - 12) / 2
        self.need(30)
        y0 = self.y
        self.textfield(n1, l1, width=half, x=ML, advance=False)
        self.y = y0
        self.textfield(n2, l2, width=half, x=ML + half + 12, advance=True)

    def table_text(self, qn, rows, col_title=('Role / capability', 'Approx. number'), field_w=150, prefix=None):
        prefix = prefix or f'Q{qn:02d}'
        self.need(20)
        lw = TEXT_W - field_w - 10
        self.c.setFillColor(LIGHT); self.c.rect(ML, self.y - 14, TEXT_W, 14, stroke=0, fill=1)
        self.c.setFont('Helvetica-Bold', 7.5); self.c.setFillColor(black)
        self.c.drawString(ML + 4, self.y - 10, col_title[0]); self.c.drawString(ML + lw + 14, self.y - 10, col_title[1])
        self.y -= 16
        for i, r in enumerate(rows, 1):
            self.need(22)
            self.c.setFont('Helvetica', 8.5); self.c.setFillColor(black)
            self.c.drawString(ML + 4, self.y - 12, r)
            self.form.textfield(name=f'{prefix}_{i:02d}_{slug(r)}', tooltip=r, x=ML + lw + 10, y=self.y - 17, width=field_w, height=16,
                                fontName='Helvetica', fontSize=8.5, borderColor=FIELD_BORDER, fillColor=FIELD_BG,
                                textColor=black, borderWidth=0.8, forceBorder=True)
            self.c.setStrokeColor(LINE); self.c.setLineWidth(0.4)
            self.c.line(ML, self.y - 20, W - MR, self.y - 20)
            self.y -= 22
        self.y -= 4

    def grid_radio(self, qn, rows, cols, prefix=None):
        prefix = prefix or f'Q{qn:02d}'
        colw = 92
        lw = TEXT_W - colw * len(cols)
        self.need(30)
        self.c.setFillColor(LIGHT); self.c.rect(ML, self.y - 24, TEXT_W, 24, stroke=0, fill=1)
        self.c.setFont('Helvetica-Bold', 7.5); self.c.setFillColor(black)
        self.c.drawString(ML + 4, self.y - 15, 'Measure')
        for j, col in enumerate(cols):
            cx = ML + lw + j * colw + colw / 2
            lines = simpleSplit(col, 'Helvetica-Bold', 7.5, colw - 6)
            yy = self.y - 10 if len(lines) > 1 else self.y - 15
            for ln in lines:
                self.c.drawCentredString(cx, yy, ln); yy -= 9
        self.y -= 26
        for i, r in enumerate(rows, 1):
            lines = simpleSplit(r, 'Helvetica', 8.5, lw - 8)
            rh = max(len(lines) * 11 + 6, 18)
            self.need(rh)
            if i % 2 == 0:
                self.c.setFillColor(LIGHT); self.c.rect(ML, self.y - rh + 2, TEXT_W, rh, stroke=0, fill=1)
            self.c.setFont('Helvetica', 8.5); self.c.setFillColor(black)
            yy = self.y - 9
            for ln in lines:
                self.c.drawString(ML + 4, yy, ln); yy -= 11
            for j, col in enumerate(cols):
                cx = ML + lw + j * colw + colw / 2 - 5
                self.form.radio(name=f'{prefix}_{i:02d}_{slug(r)}', value=slug(col), tooltip=f'{r}: {col}',
                                x=cx, y=self.y - rh / 2 - 4, size=10, buttonStyle='check', shape='square',
                                borderColor=FIELD_BORDER, fillColor=FIELD_BG, textColor=NAVY, borderWidth=0.8,
                                forceBorder=True, selected=False)
            self.y -= rh
        self.y -= 4

    def finish(self):
        self.c.save()


# ======================================================================
f = Form(OUT)

# ---------- Title block ----------
f.c.setFillColor(NAVY); f.c.setFont('Helvetica-Bold', 18)
f.c.drawString(ML, f.y - 18, 'AI-Enabled Quality Engineering'); f.y -= 24
f.c.setFillColor(black); f.c.setFont('Helvetica-Bold', 10)
f.c.drawString(ML, f.y - 10, 'Executive discovery questionnaire - role-routed, multiple-selection version (v3)'); f.y -= 18
f.rich([('Purpose: ', True), ('tailor the EVP presentation, select relevant industry research, identify practical QA opportunities, and define a conservative phased pilot. Approximate ranges are sufficient; no customer data, source code, detailed rate cards, or formal financial commitments are required.', False)], size=8.5, gap=6)

# How to complete box
box_lines = [
    ('How to complete (allow 15-25 minutes; answer the sections you own)', True),
    ('Answer only the sections for your role and leave the others blank:', False),
    ('   Executive sponsor, Finance, procurement: Sections 1, 5B and 6.', False),
    ('   Engineering, delivery or QE leader: Sections 2, 3, 4, 5A and 6.', False),
    ('   QA platform or DevOps leader: Sections 2, 3, 4, 5A and 6.', False),
    ('Square boxes allow multiple selections; respect the limit shown. Dropdown fields take one answer; in the grid question (Q17) tick one box per row. Click fields to enter text, then save the PDF normally.', False),
]
bh = 0
for t, b in box_lines:
    bh += len(simpleSplit(t, 'Helvetica-Bold' if b else 'Helvetica', 8, TEXT_W - 20)) * 10.5
bh += 14
f.need(bh)
f.c.setFillColor(LIGHT); f.c.setStrokeColor(LINE)
f.c.roundRect(ML, f.y - bh, TEXT_W, bh, 3, stroke=1, fill=1)
yy = f.y - 8
for t, b in box_lines:
    fnt = 'Helvetica-Bold' if b else 'Helvetica'
    f.c.setFont(fnt, 8); f.c.setFillColor(NAVY if b else black)
    for ln in simpleSplit(t, fnt, 8, TEXT_W - 20):
        f.c.drawString(ML + 10, yy - 7, ln); yy -= 10.5
f.y -= bh + 8

# Respondent information
f.text('Respondent information', size=9.5, font='Helvetica-Bold', gap=2)
f.dropdown(0, ['Executive sponsor or business/technology leader', 'Engineering, delivery or QE leader', 'QA platform or DevOps leader', 'Finance, procurement or vendor management', 'Other'], name='R00_Role', label='Your role in this discussion (routes the questionnaire)')
f.two_textfields('R01_Name', 'Name', 'R02_Title', 'Title / role')
f.two_textfields('R03_Function', 'Function / business area', 'R04_Date', 'Date')

# ---------- Section 1 ----------
f.section_bar('1. Executive objectives and spending concerns', 'Executive sponsor and Finance route. Establish what the EVP expects the conversation to solve and how success should be described.')
q = f.question('What are the primary objectives for exploring AI in quality engineering?', 'Select up to three.')
f.checkboxes(q, ['Reduce manual testing effort', 'Shorten regression and release cycles', 'Improve automation coverage and maintainability', 'Reduce escaped production defects', 'Improve audit and release evidence', 'Increase delivery capacity without increasing team size', 'Improve developer productivity'])
f.rule()
q = f.question('If a pilot proved one thing, which ONE outcome would justify continuing?', 'Select one. This defines what "success" will mean for the executive sponsor.')
f.dropdown(q, ['Hard-dollar cost reduction (contractor, managed-service, licence or infrastructure spend)', 'Cost avoidance (deferred hiring or renewals as demand grows)', 'Additional delivery capacity from the same team', 'Faster time to market', 'Improved software quality', 'More reliable delivery and recovery', 'Improved regulatory and audit evidence', 'Not sure yet'])
f.rule()
q = f.question('Which outcomes must NOT deteriorate for a pilot to count as a success?', 'Select all that apply. These become the quality and delivery floors.')
f.checkboxes(q, ['Escaped defects or production incidents', 'Release stability or change-failure rate', 'Payment correctness and critical defect resolution', 'Privacy and sensitive-data handling', 'Audit and release evidence', 'Engineer adoption and morale'])
f.rule()
q = f.question('What are the greatest concerns with current or previous AI initiatives?', 'Select up to three.')
f.checkboxes(q, ['Unclear or unproven business value', 'Excessive consulting or implementation cost', 'High licensing, token, or model-consumption cost', 'Too many overlapping tools or platforms', 'Low user adoption or weak workflow fit', 'Security, privacy, or data-residency risk', 'Difficulty moving beyond pilots', 'Weak governance, controls, or accountability', 'Productivity gains that do not become budget savings', 'Quality regressions from AI-generated artifacts', 'Regulatory or audit scrutiny of AI use', 'Previous AI pilots that did not deliver'])

# ---------- Section 2 ----------
f.section_bar('2. Delivery scope and QA operating model', 'Engineering, delivery and QE route. Approximate ranges are sufficient; detailed rate cards and organization charts are not required.')
q = f.question('Approximately how many delivery teams or applications are in the potential scope?', 'Select one range.')
f.dropdown(q, ['1-5', '6-20', '21-50', 'More than 50', 'Scope not yet defined'])
f.textfield(f'Q{q:02d}_Target_area', 'Target business area, portfolio, or application type (optional):')
f.rule()
q = f.question('Roughly what share of in-scope applications are modern cloud or API-based systems with automated build and deployment pipelines?', 'Select one range.')
f.dropdown(q, ['Less than 20%', '20-40%', 'Over 40% to 60%', 'Over 60% to 80%', 'More than 80%', 'Unknown'])
f.rule()
q = f.question('For a typical delivery squad, provide the approximate number of resources by role.', 'Enter approximate numbers for a typical or median squad; ranges are acceptable (for example 6 / 2 / 1 / 1 / shared).')
f.table_text(q, ['Developers', 'Manual QA analysts', 'Automation engineers / SDETs / QEs', 'Business analysts and product owners', 'Test-data, environment and platform engineers'])
f.rule()
q = f.question('Approximately what percentage of QA headcount is external, offshore, or delivered through a managed service?', 'Select one range (by headcount, not spend).')
f.dropdown(q, ['Less than 10%', '10-25%', 'Over 25% to 50%', 'Over 50% to 75%', 'More than 75%', 'Unknown'])
f.rule()
q = f.question('Which descriptions apply to the current quality-engineering operating model?', 'Select all that apply.')
f.checkboxes(q, ['Centralized QA organization', 'QA / QE embedded in delivery squads', 'Managed-service model', 'Hybrid centralized and embedded model', 'Dedicated automation / SDET capability', 'Business-led UAT outside the QA organization', 'Model varies significantly by business unit', 'Operating model is being redesigned'])
f.rule()
q = f.question('Where does the QA organization spend the most human effort?', 'Select your top THREE.')
f.checkboxes(q, ['Requirements review and acceptance-criteria refinement', 'Test planning, scenario design, and test-case creation', 'Building automated tests', 'Maintaining or repairing automated tests', 'Preparing test data', 'Preparing or troubleshooting test environments', 'Manual functional test execution', 'Regression execution', 'Failed-test triage and root-cause investigation', 'Defect creation, routing, retesting, and closure', 'UAT coordination and support', 'Quality reporting, traceability, and release evidence'])

# ---------- Section 3 ----------
f.section_bar('3. Testing maturity and workflow', 'Engineering, delivery and QE route. Identify where human effort, wait time, rework, and quality risk are concentrated today.')
q = f.question('Roughly what share of regression test cases execute automatically without human intervention?', 'Select one range.')
f.dropdown(q, ['Less than 20%', '20-40%', 'Over 40% to 60%', 'Over 60% to 80%', 'More than 80%', 'Varies significantly by application', 'Unknown'])
f.rule()
q = f.question('Which test types are consistently automated within CI/CD?', 'Select all that apply.')
f.checkboxes(q, ['Unit', 'Component', 'API', 'Contract', 'Integration', 'UI / end-to-end', 'Regression', 'Performance', 'Accessibility', 'Data quality', 'Few or none', 'Varies significantly by application'], cols=3)
f.rule()
q = f.question('What is the typical elapsed regression-testing duration for a major release?', 'Select one range, measured in calendar days.')
f.dropdown(q, ['Up to 1 calendar day', 'Over 1 to 3 calendar days', 'Over 3 to 5 calendar days', 'Over 5 to 10 calendar days', 'Over 10 to 14 calendar days', 'More than 14 calendar days', 'Varies significantly by application', 'Unknown'])
f.rule()
q = f.question('Approximately how many active human hours does a full regression cycle require?', 'Select one range. Count hands-on time across all people, not elapsed time.')
f.dropdown(q, ['Less than 8 hours', '8-40 hours', 'Over 40 to 120 hours', 'Over 120 to 400 hours', 'More than 400 hours', 'Unknown'])
f.rule()
q = f.question('Which issues most frequently delay testing or releases?', 'Select up to three.')
f.checkboxes(q, ['Incomplete or changing requirements', 'Insufficient unit or component testing', 'Manual test-case creation', 'Manual regression execution', 'Unstable automation or flaky tests', 'Test-data availability', 'Test-environment availability or instability', 'Downstream-system dependencies', 'Legacy or mainframe integration', 'Defect triage and ownership', 'Long waits for defect fixes and retesting', 'UAT, release evidence, or approval requirements'])
f.rule()
q = f.question('Which quality checks are mandatory release gates?', 'Select all that apply.')
f.checkboxes(q, ['Unit-test pass rate and/or code coverage', 'API, integration, or regression pass rate', 'Critical and high-priority defect thresholds', 'Performance or resilience thresholds', 'Accessibility compliance', 'UAT or business approval', 'Production-readiness / change approval', 'Traceability, audit, or control evidence'])

# ---------- Section 4 ----------
f.section_bar('4. Metrics, toolchain, and AI readiness', 'Engineering, QE and platform routes. These responses determine whether an EVP-level savings hypothesis can be evidence-based.')
q = f.question('For each baseline measure, indicate whether it is tracked and trusted, tracked but unreliable, or not tracked.', 'Select one per row. Leave a row blank if you do not know.')
f.grid_radio(q, ['QA effort hours by activity, release, or application', 'Regression duration and execution volume', 'Automation coverage and maintenance effort', 'Flaky-test or rerun rate', 'Defect volume, severity, reopen rate, and escaped defects', 'Change-failure, rollback, or production-incident rate', 'Mean time to triage and remediate defects', 'Release frequency and lead time for change', 'QA labour, contractor, managed-service, or tool spend', 'Test-environment availability and test-data lead time'], ['Tracked and trusted', 'Tracked but unreliable', 'Not tracked'])
f.rule()
q = f.question('Which enterprise AI platform is approved for engineering pilots, and which coding or testing assistants are approved for engineers today?', 'Select one platform; list assistants if known.')
f.dropdown(q, ['Azure OpenAI', 'AWS Bedrock', 'Google Vertex AI', 'Internal or private model platform', 'More than one of the above', 'None approved yet', 'Unknown'], label='Approved enterprise AI platform')
f.textfield(f'Q{q:02d}_Assistants', 'Approved coding or testing assistants (for example GitHub Copilot, test-tool AI features):')
f.rule()
q = f.question('Identify the primary tools currently used.', 'Optional. Product names are helpful but not required.')
f.table_text(q, ['Requirements / work management', 'Source control and CI/CD', 'Test management and automation', 'Observability / logs / traces', 'Test data, environments and device/browser coverage'], col_title=('Capability', 'Current platform or tool'), field_w=230)
f.rule()
q = f.question('Which AI-assisted QA capabilities are already in use or being evaluated?', 'Tick "In use" and/or "Evaluating" for each row that applies.')
f.dual_checkboxes(q, ['Requirements, acceptance criteria, or test-scenario generation', 'Unit, API, or UI test generation', 'Test automation maintenance or self-healing', 'Regression-test selection or prioritization', 'Synthetic test-data generation', 'Failed-test triage or root-cause analysis', 'Defect creation, classification, or routing', 'Release-quality summaries or evidence preparation', 'None / only informal experimentation'])

# ---------- Section 5A ----------
f.section_bar('5A. Shared QA platform and AI controls', 'Engineering and platform routes. Identify reusable QA services, ownership and the action limits of a first pilot.')
q = f.question('Which shared QA platform gaps most limit reuse across teams?', 'Select up to three.')
f.checkboxes(q, ['Requirements and test-context connectors', 'Reusable automation frameworks and templates', 'Synthetic test data and fixture services', 'On-demand test environments and dependency stubs', 'Web, mobile and API runner orchestration', 'Shared test results, evidence and traceability', 'Failure-triage and test-maintenance workflow', 'Platform ownership, support and adoption'])
f.rule()
q = f.question('What is the HIGHEST level of AI action acceptable during an initial pilot?', 'Select one. Each level includes the levels above it.')
f.dropdown(q, ['Level 1 - Provide recommendations and explanations only', 'Level 2 - Generate test cases, scripts, reports, or evidence for human review', 'Level 3 - Execute tests in authorized non-production environments', 'Level 4 - Create defects or work items automatically', 'Level 5 - Create test-maintenance pull requests with human approval before merge', 'Level 6 - Validate fixes and trigger targeted retesting', 'No AI action until an AI use policy is established'])
f.rule()
q = f.question('Which AI controls are NOT yet in place for AI tooling and would need to be addressed before a pilot?', 'Select all that apply. Leave blank if all are in place.')
f.checkboxes(q, ['Source-code and intellectual-property confidentiality', 'Customer-data privacy and sensitive-data handling', 'Data residency and retention', 'Approved-model and vendor enforcement', 'Role-based access and segregation of duties for AI identities', 'Audit logging and traceability of prompts, outputs, and approvals', 'Human approval for production-impacting actions', 'Explainability and supporting evidence', 'Model, prompt, and generated-artifact versioning', 'License, token, and model-consumption cost controls', 'Vendor portability and ability to disable AI safely', 'Model inventory and risk rating (OSFI E-23 readiness)'])

# ---------- Section 5B ----------
f.section_bar('5B. Economics and financial capture', 'Executive sponsor and Finance route. A productivity gain becomes a saving only when Finance can name the budget line that changes.')
q = f.question('Which forms of spending or capacity could realistically be reduced, avoided, or redeployed within the next 12 months?', 'Select all that apply.')
f.checkboxes(q, ['Contractor renewals falling due in the next 12 months', 'Managed-service scope or unit volumes', 'Planned QA hiring', 'Overtime or surge capacity', 'Testing-tool licenses', 'Test infrastructure or execution cost', 'Defect rework and production-incident effort', 'Capacity redeployed to additional delivery work', 'No capture mechanism has yet been identified', 'Not my decision'])
f.rule()
q = f.question('Approximately what is the annual addressable QA and testing spend in scope (internal labour plus external services and tooling)?', 'Select one range. Prefer not to say is acceptable.')
f.dropdown(q, ['Less than $5M', '$5M-$15M', 'Over $15M to $40M', 'Over $40M to $100M', 'More than $100M', 'Prefer not to say', 'Unknown'])
f.rule()
q = f.question('Roughly what share of that spend is variable (contractors, offshore, managed services) rather than employees?', 'Select one range.')
f.dropdown(q, ['Less than 20%', '20-40%', 'Over 40% to 60%', 'More than 60%', 'Unknown'])
f.rule()
q = f.question('If QA capacity were released, what would most likely happen to it?', 'Select one.')
f.dropdown(q, ['Absorbed by existing backlog and demand growth', 'Redeployed to other quality or engineering work', 'Reduced through contractor or managed-service changes', 'Not decided', 'Unknown'])
f.rule()
q = f.question('What is the minimum evidence Finance would accept to recognize a saving?', 'Select one.')
f.dropdown(q, ['Measured reduction in contractor or managed-service invoices', 'Approved reduction in a budget line', 'Avoided hiring or renewal documented against the approved plan', 'Measured effort reduction alone is sufficient', 'Not defined yet'])

# ---------- Section 6 ----------
f.section_bar('6. Pilot direction and executive input', 'All routes. A conservative pilot should be limited, measurable, and subject to an explicit go/no-go decision.')
q = f.question('Which application types could be suitable for an initial pilot?', 'Select all that apply.')
f.checkboxes(q, ['Modern API or microservices application', 'Internal web application', 'Customer-facing web application', 'Mobile application', 'Legacy or mainframe-integrated application', 'Data or analytics application', 'Packaged platform', 'More than one application type for comparison', 'Candidate not yet selected'])
f.rule()
q = f.question('Which use cases could be suitable for a limited pilot?', 'Select up to three.')
f.checkboxes(q, ['Requirement analysis and test-scenario generation', 'Executable API or component-test generation', 'UI automation generation or maintenance', 'Change-impact analysis and regression-test selection', 'Failed-test triage and root-cause analysis', 'Flaky-test detection and automation repair', 'Synthetic test-data generation', 'Release evidence and readiness summaries'])
f.rule()
q = f.question('What minimum net reduction in targeted human effort would justify a second phase?', 'Select one. "Net" deducts review, correction, and control effort.')
f.dropdown(q, ['At least 10%', 'At least 20%', 'At least 30%', 'Effort reduction alone is not sufficient; a financial or quality outcome is required', 'Not sure'])
f.rule()
q = f.question('Beyond the effort threshold, which outcomes would justify further investment?', 'Select up to two.')
f.checkboxes(q, ['Material reduction in regression duration', 'Material reduction in failure-triage time', 'Material reduction in automation-maintenance effort', 'No deterioration in escaped defects or change-failure rate', 'Shorter test-data and environment wait times', 'Demonstrated contractor reduction or hiring avoidance', 'Credible payback within 12-18 months'])
f.rule()
q = f.question('What conditions should stop or prevent expansion of the pilot?', 'Select all that apply.')
f.checkboxes(q, ['Insufficient measurable savings', 'High implementation or integration cost', 'High ongoing license or model-consumption cost', 'Poor accuracy or excessive human rework', 'Security, privacy, residency, or audit concerns', 'Inability to integrate with the existing toolchain', 'Quality or release-stability deterioration', 'Low adoption or workflow abandonment', 'No credible mechanism to capture the value financially'])
f.rule()
q = f.question('What is the single most expensive or frustrating part of the current QA workflow?', 'Optional. Up to 1,000 characters; scroll within the field to read longer answers.')
f.textfield(f'Q{q:02d}_Text', height=96)
q = f.question('What question would the EVP most want the presentation to answer?', 'Optional. Up to 1,000 characters; scroll within the field to read longer answers.')
f.textfield(f'Q{q:02d}_Text', height=96)
q = f.question('Is there a representative application, team, or recent release that should be used as an illustrative case, and who is the delivery lead we may contact?', 'Optional. Up to 1,000 characters; scroll within the field to read longer answers.')
f.textfield(f'Q{q:02d}_Text', height=96)

f.need(40)
f.y -= 4
f.c.setFillColor(LIGHT); f.c.roundRect(ML, f.y - 30, TEXT_W, 30, 3, stroke=0, fill=1)
f.c.setFont('Helvetica', 8); f.c.setFillColor(NAVY)
for i, ln in enumerate(simpleSplit('Thank you. Responses will be used to prepare a focused executive presentation, an initial savings hypothesis with explicit assumptions, and a conservative phased pilot with a defined cost ceiling and go/no-go decision.', 'Helvetica', 8, TEXT_W - 20)):
    f.c.drawString(ML + 10, f.y - 12 - i * 10.5, ln)
f.y -= 36

f.finish()
print('wrote', OUT, 'pages', f.page, 'questions', f.qn)
