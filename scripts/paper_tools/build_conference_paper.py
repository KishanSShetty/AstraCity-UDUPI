"""
Convert AstraCityss.docx content into conference-template-a4.docx format.
Every word EXACTLY from source. Proper 2-column IEEE layout with tables.
"""
import sys, re
sys.stdout.reconfigure(encoding='utf-8')

from docx import Document
from docx.oxml import parse_xml
from docx.oxml.ns import qn
from docx.oxml.text.paragraph import CT_P
from docx.oxml.table import CT_Tbl

ns_w = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'

src = Document(r'C:\Users\Kishan Shetty\Downloads\AstraSky-maing\AstraCityss.docx')
tmpl = Document(r'C:\Users\Kishan Shetty\Downloads\AstraSky-maing\template_clean.docx')

# ── Read source text exactly ──────────────────────────────────
src_texts = []
for elem in src.element.body:
    if isinstance(elem, CT_P):
        text = ''.join(t.text for t in elem.findall('.//{%s}t' % ns_w) if t.text)
        src_texts.append(text)

# ── Clear template, keep section structure ────────────────────
body = tmpl.element.body
for child in list(body):
    body.remove(child)

# Section 0 break: single column for title+authors — CONTINUOUS so same page
sect0_break = parse_xml(
    '<w:p xmlns:w="%s"><w:pPr><w:sectPr>'
    '<w:type w:val="continuous"/>'
    '<w:pgSz w:w="11906" w:h="16838"/>'
    '<w:pgMar w:top="540" w:right="893" w:bottom="1440" w:left="893" w:header="720" w:footer="720" w:gutter="0"/>'
    '<w:cols w:space="720"/>'
    '</w:sectPr></w:pPr></w:p>' % ns_w
)

# Final section: 2 columns
final_sect = parse_xml(
    '<w:sectPr xmlns:w="%s">'
    '<w:type w:val="continuous"/>'
    '<w:pgSz w:w="11906" w:h="16838"/>'
    '<w:pgMar w:top="1080" w:right="893" w:bottom="1440" w:left="893" w:header="720" w:footer="720" w:gutter="0"/>'
    '<w:cols w:num="2" w:space="360" w:equalWidth="1"/>'
    '</w:sectPr>' % ns_w
)
body.append(final_sect)

# ── Helpers ───────────────────────────────────────────────────
def add_run(p, text, sz=10, bold=False, italic=False, font='Times New Roman'):
    r = parse_xml('<w:r xmlns:w="%s"/>' % ns_w)
    rPr = parse_xml('<w:rPr xmlns:w="%s"/>' % ns_w)
    if bold:
        rPr.append(parse_xml('<w:b xmlns:w="%s"/>' % ns_w))
    if italic:
        rPr.append(parse_xml('<w:i xmlns:w="%s"/>' % ns_w))
    rPr.append(parse_xml('<w:sz xmlns:w="%s" w:val="%d"/>' % (ns_w, sz*2)))
    rPr.append(parse_xml('<w:szCs xmlns:w="%s" w:val="%d"/>' % (ns_w, sz*2)))
    rPr.append(parse_xml('<w:rFonts xmlns:w="%s" w:ascii="%s" w:hAnsi="%s"/>' % (ns_w, font, font)))
    r.insert(0, rPr)
    te = parse_xml('<w:t xmlns:w="%s" xml:space="preserve"/>' % ns_w)
    te.text = text
    r.append(te)
    p.append(r)

def mk_p(style, text='', align=None, sz=10, bold=False, italic=False):
    p = parse_xml('<w:p xmlns:w="%s"/>' % ns_w)
    pPr = parse_xml('<w:pPr xmlns:w="%s"/>' % ns_w)
    pPr.append(parse_xml('<w:pStyle xmlns:w="%s" w:val="%s"/>' % (ns_w, style)))
    if align:
        pPr.append(parse_xml('<w:jc xmlns:w="%s" w:val="%s"/>' % (ns_w, align)))
    p.insert(0, pPr)
    if text:
        add_run(p, text, sz=sz, bold=bold, italic=italic)
    return p

def ins(elem):
    fs = body.find('{%s}sectPr' % ns_w)
    fs.addprevious(elem)

def mk_table(rows):
    """rows is a list of lists of strings."""
    if not rows:
        return None
    ncols = max(len(r) for r in rows)
    for r in rows:
        while len(r) < ncols:
            r.append('')
    
    tbl_xml = (
        '<w:tbl xmlns:w="%s"><w:tblPr>'
        '<w:tblW w:w="5000" w:type="pct"/>'
        '<w:jc w:val="center"/>'
        '<w:tblBorders>'
        '<w:top w:val="single" w:sz="4" w:space="0" w:color="000000"/>'
        '<w:left w:val="single" w:sz="4" w:space="0" w:color="000000"/>'
        '<w:bottom w:val="single" w:sz="4" w:space="0" w:color="000000"/>'
        '<w:right w:val="single" w:sz="4" w:space="0" w:color="000000"/>'
        '<w:insideH w:val="single" w:sz="4" w:space="0" w:color="000000"/>'
        '<w:insideV w:val="single" w:sz="4" w:space="0" w:color="000000"/>'
        '</w:tblBorders></w:tblPr></w:tbl>' % ns_w
    )
    tbl = parse_xml(tbl_xml)
    grid = parse_xml('<w:tblGrid xmlns:w="%s"/>' % ns_w)
    cw = 9000 // ncols
    for _ in range(ncols):
        grid.append(parse_xml('<w:gridCol xmlns:w="%s" w:w="%d"/>' % (ns_w, cw)))
    tbl.append(grid)
    
    for ri, row in enumerate(rows):
        tr = parse_xml('<w:tr xmlns:w="%s"/>' % ns_w)
        for ci, cell in enumerate(row):
            tc = parse_xml('<w:tc xmlns:w="%s"/>' % ns_w)
            if ri == 0:
                tcPr = parse_xml('<w:tcPr xmlns:w="%s"><w:shd w:val="clear" w:fill="D9E2F3"/></w:tcPr>' % ns_w)
                tc.append(tcPr)
            cp = parse_xml('<w:p xmlns:w="%s"/>' % ns_w)
            add_run(cp, cell, sz=8, bold=(ri==0))
            tc.append(cp)
            tr.append(tc)
        tbl.append(tr)
    return tbl

# ══════════════════════════════════════════════════════════════
# BUILD DOCUMENT
# ══════════════════════════════════════════════════════════════

# ── SECTION 0: Title + Authors (single column, centered) ─────

# Title (index 0)
ins(mk_p('papertitle', src_texts[0], align='center', sz=24, bold=True))

# Empty line after title
ins(mk_p('Normal'))

# ── Author table: 4 authors side-by-side in a borderless table ──
def make_author_cell(name, dept, org, city, email):
    """Create a table cell with author info stacked, all centered."""
    tc = parse_xml('<w:tc xmlns:w="%s"/>' % ns_w)
    # No borders on individual cells
    lines = [
        (name, True, False),      # name bold
        (dept, False, True),       # dept italic
        (org, False, True),        # org italic 
        (city, False, False),      # city
        (email, False, False),     # email
    ]
    for idx_l, (txt, bld, ita) in enumerate(lines):
        cp = parse_xml('<w:p xmlns:w="%s"/>' % ns_w)
        cpPr = parse_xml('<w:pPr xmlns:w="%s"><w:jc w:val="center"/><w:spacing w:after="0" w:line="240" w:lineRule="auto"/></w:pPr>' % ns_w)
        cp.insert(0, cpPr)
        add_run(cp, txt, sz=10, bold=bld, italic=ita)
        tc.append(cp)
    return tc

author_tbl = parse_xml(
    '<w:tbl xmlns:w="%s">'
    '<w:tblPr>'
    '<w:tblW w:w="5000" w:type="pct"/>'
    '<w:jc w:val="center"/>'
    '<w:tblBorders>'
    '<w:top w:val="none" w:sz="0" w:space="0" w:color="auto"/>'
    '<w:left w:val="none" w:sz="0" w:space="0" w:color="auto"/>'
    '<w:bottom w:val="none" w:sz="0" w:space="0" w:color="auto"/>'
    '<w:right w:val="none" w:sz="0" w:space="0" w:color="auto"/>'
    '<w:insideH w:val="none" w:sz="0" w:space="0" w:color="auto"/>'
    '<w:insideV w:val="none" w:sz="0" w:space="0" w:color="auto"/>'
    '</w:tblBorders>'
    '</w:tblPr>'
    '<w:tblGrid>'
    '<w:gridCol w:w="2500"/>'
    '<w:gridCol w:w="2500"/>'
    '<w:gridCol w:w="2500"/>'
    '<w:gridCol w:w="2500"/>'
    '</w:tblGrid>'
    '</w:tbl>' % ns_w
)

author_row = parse_xml('<w:tr xmlns:w="%s"/>' % ns_w)

# Author 1: Kishan Shetty
author_row.append(make_author_cell(
    'Kishan Shetty',
    'Dept. of ISE',
    'RV College of Engineering',
    'Bengaluru, India',
    'kishanshetty.udupika20@gmail.com'
))

# Author 2: Karthik KP
author_row.append(make_author_cell(
    'Karthik KP',
    'Dept. of ISE',
    'RV College of Engineering',
    'Bengaluru, India',
    'karthikkp.is24@rvce.edu.in'
))

# Author 3: Harish Hegde
author_row.append(make_author_cell(
    'Harish Hegde',
    'Dept. of ISE',
    'RV College of Engineering',
    'Bengaluru, India',
    'harishshegde@rvce.edu.in'
))

# Author 4: Dr Lokeshwari M (last)
author_row.append(make_author_cell(
    'Dr Lokeshwari M',
    'Associate Professor',
    'RV College of Engineering',
    'Bengaluru, India',
    ''
))

author_tbl.append(author_row)
ins(author_tbl)

# Empty line
ins(mk_p('Normal'))

# Section break (continuous — stays on same page, transitions to 2-col)
ins(sect0_break)

# ── SECTION 1: Two-column body ───────────────────────────────

# Now handle the known table data by manually splitting the concatenated text
# These are the exact words from the source, just properly split into columns

# Table: Physical Entities Mirrored (source indices 22-27)
entities_table = [
    ['Entity Layer', 'Components'],
    ['Built Environment', '9,471 building footprints (residential, apartment, commercial, institutional)'],
    ['Road Network', '2,027 classified segments (width, type, vehicle access)'],
    ['Waste Infrastructure', '6 DWCCs, 1 BMU (Kudlu Gate, 2.10 km), Dumyard (Yelahanka, 21.03 km)'],
    ['Land Parcels', 'Open land polygons extracted from LULC classification'],
    ['Ward Boundary', 'Ward 174 administrative polygon'],
]

# Table: Key waste scenarios (source indices 74-78)
waste_table = [
    ['Scenario', 'Tonnes/day', 'Change'],
    ['Reference (No Festival/Normal)', '14.08', '\u2014'],
    ['Heavy Rainfall', '16.19', '+15%'],
    ['Ganesh Chaturthi', '18.02', '+28%'],
    ['Compound Worst Case', '21.86', '+55%'],
]

# Table: Fleet (source indices 93-98)
fleet_table = [
    ['What kind of vehicle?', 'How many vehicles?', 'How much capacity in vehicles?', 'What is the minimum road width?'],
    ['Auto-tipper', '12', '500 kg', '\u2265 2 m'],
    ['Large compactor', '2', '10,000 kg', '\u2265 6 m'],
    ['Small compactor', '2', '5,000 kg', '\u2265 4 m'],
    ['Push cart', '8', '200 kg', 'Any'],
    ['Liquid tanker', '1', '5,000 L', '\u2265 9 m'],
]

# Table: Economic model (source indices 110-116)
economic_table = [
    ['Benefit Stream', 'Annual Value', 'Share'],
    ['Carbon credit revenue (\u20b92,000/t CO\u2082e, CCTS 2023)', '\u20b95.19 crores', '89.6%'],
    ['Fuel savings (\u20b920/km \u00d7 100.03 km/day \u00d7 365)', '\u20b90.07 crores', '1.2%'],
    ['Avoided dump cleanup (30 sites \u00d7 \u20b952,000)', '\u20b90.16 crores', '2.8%'],
    ['Labour savings (1.5 hrs \u00d7 25 vehicles \u00d7 \u20b9180/hr \u00d7 365)', '\u20b90.25 crores', '4.3%'],
    ['Compost sales (digestate at \u20b91,500/tonne)', '\u20b90.12 crores', '2.1%'],
    ['Total (Ward 174)', '\u20b95.79 crores', '100%'],
]

# Table: LULC results (source indices 121-124)
lulc_table = [
    ['Class', 'Area (km\u00b2)', 'Percentage', 'Description'],
    ['Built-up', '11.85', '64.1%', 'High-density residential/commercial fabric'],
    ['Vegetation', '3.26', '17.6%', 'Parks, avenue trees, private gardens'],
    ['Open Land', '2.83', '15.3%', 'Surveillance priority'],
    ['Water Bodies', '0.56', '3.0%', 'Agara Lake, HSR Layout Lake \u2014 leachate risk'],
]

# Table: Route optimization (source indices 128-132)
route_table = [
    ['Metric', 'Pre-Optimization', 'Post-Optimization', 'Improvement'],
    ['Daily fleet distance', '132.44 km', '32.41 km', '75.5% reduction'],
    ['Daily fuel cost', '\u20b92,072', '\u20b9507', '\u20b91,565 saved/day'],
    ['Network coverage', '\u2014', '95.3%', '+15.3 pp'],
    ['Average collection time', '4.5 hours per vehicle', '3 hours per vehicle', '33% reduction'],
]

# Indices to skip (will be rendered as tables instead)
table_indices = set()
# Entities: 22-27
for x in range(22, 28): table_indices.add(x)
# Waste scenarios: 74-78
for x in range(74, 79): table_indices.add(x)
# Fleet: 93-98
for x in range(93, 99): table_indices.add(x)
# Economic: 110-116
for x in range(110, 117): table_indices.add(x)
# LULC: 121-124
for x in range(121, 125): table_indices.add(x)
# Route: 128-132
for x in range(128, 133): table_indices.add(x)

# Table insertion points (insert table BEFORE the first index)
table_insertions = {
    22: entities_table,
    74: waste_table,
    93: fleet_table,
    110: economic_table,
    121: lulc_table,
    128: route_table,
}

current_main = 1
current_sub = 1

i = 3  # Skip title(0), authors(1), empty(2)
while i < len(src_texts):
    text = src_texts[i]
    
    # Skip empty and horizontal rules
    if not text.strip() or text.strip() == '________________________________________':
        i += 1
        continue
    
    # Skip table-data indices (they'll be rendered as proper tables)
    if i in table_indices:
        # Insert table at the first index of each table group
        if i in table_insertions:
            tbl = mk_table(table_insertions[i])
            if tbl is not None:
                ins(tbl)
                ins(mk_p('Normal'))  # spacing after table
        i += 1
        continue
    
    # ABSTRACT heading
    if text == 'Abstract':
        i += 1
        abs_p = mk_p('Abstract')
        add_run(abs_p, 'Abstract\u2014', sz=9, bold=True, italic=True)
        add_run(abs_p, src_texts[i], sz=9, italic=True)
        ins(abs_p)
        i += 1
        # Next line is also abstract continuation
        if i < len(src_texts) and src_texts[i].startswith('Despite being a tourism hub'):
            abs_p2 = mk_p('Abstract')
            add_run(abs_p2, src_texts[i], sz=9, italic=True)
            ins(abs_p2)
            i += 1
        continue
    
    # References heading
    if text == 'References':
        ins(mk_p('Heading5', 'References'))
        i += 1
        continue
    
    # Main section heading: "1. Introduction", "2. Digital Twin Architecture", etc.
    m_main = re.match(r'^(\d+)\.\s+(.+)$', text)
    allowed_headings = [
        'Introduction', 'Digital Twin Architecture', 'Related Work', 
        'Methodology', 'Results', 'Discussion', 'Conclusion'
    ]
    is_allowed = False
    if m_main and not re.match(r'^\d+\.\d+', text):
        heading_text = m_main.group(2).strip()
        if heading_text in allowed_headings:
            is_allowed = True
            
    if is_allowed:
        new_text = f"{current_main}. {heading_text}"
        ins(mk_p('Heading1', new_text))
        current_main += 1
        current_sub = 1
        i += 1
        continue
    
    # Sub-heading: "2.1 Definition", "3.1 Study Area", etc.
    m_sub = re.match(r'^(\d+\.\d+)\s+(.+)$', text)
    if m_sub:
        new_text = f"{current_main - 1}.{current_sub} {m_sub.group(2).strip()}"
        ins(mk_p('Heading2', new_text))
        current_sub += 1
        i += 1
        continue
    
    # Reference entries [1], [2], etc.
    if re.match(r'^\[\d+\]', text):
        ins(mk_p('references', text, sz=8))
        i += 1
        continue
    
    # Bullet points
    if text.startswith('\u2022') or text.startswith('•'):
        ins(mk_p('bulletlist', text, sz=10))
        i += 1
        continue
    
    # Equations (centered)
    if text.startswith('Waste = ') or text.startswith('CH\u2084 (tonnes/year)') or text.startswith('Minimize:') or text.startswith('MSW_organic ='):
        ins(mk_p('equation', text, align='center', sz=10, italic=True))
        i += 1
        continue
    
    # Everything else: Body Text, justified
    ins(mk_p('BodyText', text, align='both', sz=10))
    i += 1

# ── Save ──────────────────────────────────────────────────────
output = r'C:\Users\Kishan Shetty\Downloads\AstraSky-maing\AstraCity_Conference_Final.docx'
tmpl.save(output)
print('Done! Saved to', output)
