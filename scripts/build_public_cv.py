"""Render a one-page public CV using facts exported from the portfolio data."""
import json
from pathlib import Path
from xml.sax.saxutils import escape

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, KeepTogether
from pypdf import PdfReader

root = Path(__file__).resolve().parent.parent
facts = json.loads((root / 'tmp/pdfs/public-cv.json').read_text(encoding='utf-8'))
output = root / 'output/pdf/akash-sankar-academic-cv.pdf'
ink, muted, accent = '#172033', '#4b5563', '#4931a6'
styles = {
    'name': ParagraphStyle('name', fontName='Helvetica-Bold', fontSize=21, leading=25, textColor=colors.HexColor(ink)),
    'contact': ParagraphStyle('contact', fontName='Helvetica', fontSize=9, leading=14, textColor=colors.HexColor(muted)),
    'section': ParagraphStyle('section', fontName='Helvetica-Bold', fontSize=9.5, leading=13, spaceBefore=12, spaceAfter=6, textColor=colors.HexColor(accent)),
    'body': ParagraphStyle('body', fontName='Helvetica', fontSize=9.5, leading=13.5, textColor=colors.HexColor(ink), alignment=TA_LEFT),
    'meta': ParagraphStyle('meta', fontName='Helvetica', fontSize=8.5, leading=12, textColor=colors.HexColor(muted)),
}

def clean(value):
    return escape(str(value).replace('\u2013', '-').replace('\u2014', '-').replace('\u2019', "'").replace('\u201c', '"').replace('\u201d', '"'))

def p(value, style='body'):
    return Paragraph(value, styles[style])

story = [p(clean(facts['name']), 'name'),
         p('M.Sc. Physics | Astrophysics research', 'contact'),
         p(f"<link href='mailto:{facts['email']}' color='{accent}'>{facts['email']}</link>", 'contact'),
         Spacer(1, 7),
         p(f"Generated from the portfolio, not the original CV. Request the original <link href='mailto:{facts['email']}?subject=Original%20CV%20request' color='{accent}'>by email</link>.", 'meta'),
         Spacer(1, 9),
         p('Research interests: dark matter, cosmology, galaxy dynamics, radio astronomy instrumentation, and scientific data analysis.')]

def section(title):
    story.append(p(title.upper(), 'section'))

def entry(title, metadata, body=None):
    parts = [p(f'<b>{clean(title)}</b>'), p(clean(metadata), 'meta')]
    if body:
        parts.append(p(clean(body)))
    parts.append(Spacer(1, 5))
    story.append(KeepTogether(parts))

section('Education')
for item in facts['education']:
    entry(f"{item['degree']} - {item['institution']}", f"{item['period']} | {item['university']} | {item['grade']}")

section('Selected research and application development')
for slug in ['exoplanet-explorer', 'dark-matter-rotation-curves', 'astrophysics-literature-review']:
    item = next(project for project in facts['projects'] if project['slug'] == slug)
    summary = item['summary']
    entry(item['title'], f"{item['period']} | {item['contribution']['role']}", f"{summary['contribution']} {summary['outcome']}")

section('Research and instrumentation experience')
for item in facts['experience']:
    entry(f"{item['title']} - {item['subtitle']}", item['period'], item['shortDesc'])

section('Conference presentation')
conference = next(item for item in facts['conferences'] if item['id'] == 'asi-44')
entry('Exoplanets and the Search for Alien Life', f"{conference['role']} | {conference['name']} | {conference['venue']} | {conference['period']}")

section('Technical skills and languages')
programming = next(category for category in facts['skillCategories'] if category['id'] == 'programming')
story.append(p('<b>Tools:</b> ' + clean('; '.join(item['name'] + ' (' + item['desc'] + ')' for item in programming['skills'] if item['name'] in ['Python', 'SQL', 'Advanced Excel']))))
languages = next(category for category in facts['skillCategories'] if category['id'] == 'languages')
story.append(p('<b>Languages:</b> ' + clean('; '.join(item['name'] + ' - ' + item['desc'] for item in languages['skills']))))
story.append(p('<b>Memberships:</b> ' + clean('; '.join(item['name'] for item in facts['memberships']))))

def footer(canvas, doc):
    canvas.setStrokeColor(colors.HexColor('#d9dce5'))
    canvas.line(42, 34, A4[0] - 42, 34)
    canvas.setFont('Helvetica', 8)
    canvas.setFillColor(colors.HexColor(muted))
    canvas.drawString(42, 22, f"Generated portfolio CV | Updated {facts['updated']}")
    canvas.drawRightString(A4[0] - 42, 22, '1')

doc = SimpleDocTemplate(str(output), pagesize=A4, rightMargin=42, leftMargin=42, topMargin=35, bottomMargin=46,
                        title='Akash Sankar Vigneshwaran - Generated Portfolio CV', author=facts['name'])
doc.build(story, onFirstPage=footer, onLaterPages=footer)
reader = PdfReader(output)
if len(reader.pages) != 1:
    raise RuntimeError(f'Public CV should be one page; generated {len(reader.pages)} pages')
text = reader.pages[0].extract_text()
for required in [facts['name'], facts['email'], '8.35', 'B2', 'May 2026', 'not the original CV']:
    if required not in text:
        raise RuntimeError(f'Missing expected public CV fact: {required}')
print(f'Verified one-page academic CV: {output}')
