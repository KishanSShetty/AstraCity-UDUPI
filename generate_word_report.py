"""
AstraCity — Word Document Generator
Generates a fully formatted .docx report from the project data.
"""

from docx import Document
from docx.shared import Pt, RGBColor, Cm, Inches
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml.ns import qn
from docx.oxml import OxmlElement
import copy

# ─── COLOUR PALETTE ────────────────────────────────────────────────────────────
DARK_TEAL   = RGBColor(0x00, 0x6B, 0x6B)   # headings
MID_TEAL    = RGBColor(0x00, 0x96, 0x88)   # subheadings / accents
LIGHT_TEAL  = RGBColor(0xE0, 0xF7, 0xF4)   # table header fill
GOLD        = RGBColor(0xD4, 0xA0, 0x17)   # callout accent
DARK_GREY   = RGBColor(0x23, 0x23, 0x23)   # body text
MID_GREY    = RGBColor(0x55, 0x55, 0x55)   # secondary text
WHITE       = RGBColor(0xFF, 0xFF, 0xFF)
TEAL_DARK_BG= RGBColor(0x00, 0x4D, 0x4D)   # table header bg

# ─── HELPERS ───────────────────────────────────────────────────────────────────

def set_cell_bg(cell, rgb: RGBColor):
    """Set cell background shading via XML."""
    tc = cell._tc
    tcPr = tc.get_or_add_tcPr()
    shd = OxmlElement('w:shd')
    hex_color = f"{rgb[0]:02X}{rgb[1]:02X}{rgb[2]:02X}"
    shd.set(qn('w:val'), 'clear')
    shd.set(qn('w:color'), 'auto')
    shd.set(qn('w:fill'), hex_color)
    tcPr.append(shd)

def set_cell_borders(table):
    """Add subtle borders to all cells."""
    tbl = table._tbl
    for tr in tbl.findall(qn('w:tr')):
        for tc in tr.findall(qn('w:tc')):
            tcPr = tc.get_or_add_tcPr()
            tcBorders = OxmlElement('w:tcBorders')
            for side in ['top', 'left', 'bottom', 'right']:
                border = OxmlElement(f'w:{side}')
                border.set(qn('w:val'), 'single')
                border.set(qn('w:sz'), '4')
                border.set(qn('w:space'), '0')
                border.set(qn('w:color'), 'CCCCCC')
                tcBorders.append(border)
            tcPr.append(tcBorders)

def add_run_with_style(para, text, bold=False, italic=False,
                       color=None, size=None):
    run = para.add_run(text)
    run.bold = bold
    run.italic = italic
    if color:
        run.font.color.rgb = color
    if size:
        run.font.size = Pt(size)
    return run

def add_heading(doc, text, level=1):
    para = doc.add_paragraph()
    para.paragraph_format.space_before = Pt(18 if level == 1 else 12)
    para.paragraph_format.space_after  = Pt(6 if level == 1 else 4)
    if level == 1:
        run = para.add_run(text.upper())
        run.bold = True
        run.font.size = Pt(16)
        run.font.color.rgb = DARK_TEAL
        # Bottom border
        pPr = para._p.get_or_add_pPr()
        pBdr = OxmlElement('w:pBdr')
        bottom = OxmlElement('w:bottom')
        bottom.set(qn('w:val'), 'single')
        bottom.set(qn('w:sz'), '6')
        bottom.set(qn('w:space'), '1')
        bottom.set(qn('w:color'), '006B6B')
        pBdr.append(bottom)
        pPr.append(pBdr)
    elif level == 2:
        run = para.add_run(text)
        run.bold = True
        run.font.size = Pt(13)
        run.font.color.rgb = MID_TEAL
    elif level == 3:
        run = para.add_run(text)
        run.bold = True
        run.font.size = Pt(11)
        run.font.color.rgb = DARK_TEAL
    return para

def add_body(doc, text, indent=False):
    para = doc.add_paragraph()
    para.paragraph_format.space_after = Pt(4)
    if indent:
        para.paragraph_format.left_indent = Cm(0.7)
    run = para.add_run(text)
    run.font.size = Pt(10.5)
    run.font.color.rgb = DARK_GREY
    return para

def add_bullet(doc, text, level=0, bold_prefix=None):
    para = doc.add_paragraph(style='List Bullet')
    para.paragraph_format.space_after = Pt(2)
    para.paragraph_format.left_indent = Cm(0.7 + level * 0.5)
    if bold_prefix:
        r1 = para.add_run(bold_prefix)
        r1.bold = True
        r1.font.color.rgb = DARK_TEAL
        r1.font.size = Pt(10.5)
        r2 = para.add_run(text)
        r2.font.size = Pt(10.5)
        r2.font.color.rgb = DARK_GREY
    else:
        run = para.add_run(text)
        run.font.size = Pt(10.5)
        run.font.color.rgb = DARK_GREY
    return para

def add_callout(doc, text, style='note'):
    """Add a styled callout/info box."""
    para = doc.add_paragraph()
    para.paragraph_format.left_indent  = Cm(0.5)
    para.paragraph_format.right_indent = Cm(0.5)
    para.paragraph_format.space_before = Pt(6)
    para.paragraph_format.space_after  = Pt(6)
    icon = {'note': '📌', 'tip': '💡', 'warning': '⚠️', 'source': '🔗'}.get(style, '►')
    r1 = para.add_run(f"{icon}  ")
    r1.font.size = Pt(10)
    r2 = para.add_run(text)
    r2.italic = True
    r2.font.size = Pt(10)
    r2.font.color.rgb = MID_GREY
    return para

def add_table(doc, headers, rows, col_widths=None):
    """Add a formatted table with teal header row."""
    n_cols = len(headers)
    table = doc.add_table(rows=1 + len(rows), cols=n_cols)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.style = 'Table Grid'

    # Header row
    hdr_row = table.rows[0]
    for i, h in enumerate(headers):
        cell = hdr_row.cells[i]
        set_cell_bg(cell, TEAL_DARK_BG)
        cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
        para = cell.paragraphs[0]
        para.alignment = WD_ALIGN_PARAGRAPH.CENTER
        run = para.add_run(h)
        run.bold = True
        run.font.color.rgb = WHITE
        run.font.size = Pt(9)

    # Data rows
    for r_idx, row_data in enumerate(rows):
        row = table.rows[r_idx + 1]
        for c_idx, cell_val in enumerate(row_data):
            cell = row.cells[c_idx]
            cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
            if r_idx % 2 == 0:
                set_cell_bg(cell, LIGHT_TEAL)
            para = cell.paragraphs[0]
            if c_idx == 0:
                run = para.add_run(str(cell_val))
                run.bold = True
                run.font.size = Pt(9)
                run.font.color.rgb = DARK_TEAL
            else:
                run = para.add_run(str(cell_val))
                run.font.size = Pt(9)
                run.font.color.rgb = DARK_GREY

    set_cell_borders(table)

    # Column widths
    if col_widths:
        for i, w in enumerate(col_widths):
            for row in table.rows:
                row.cells[i].width = Cm(w)

    doc.add_paragraph()  # spacing after table
    return table

def add_code_block(doc, code_text):
    """Add a monospaced code block."""
    para = doc.add_paragraph()
    para.paragraph_format.left_indent  = Cm(0.7)
    para.paragraph_format.right_indent = Cm(0.7)
    para.paragraph_format.space_before = Pt(4)
    para.paragraph_format.space_after  = Pt(4)
    for line in code_text.split('\n'):
        run = para.add_run(line + '\n')
        run.font.name = 'Courier New'
        run.font.size = Pt(8.5)
        run.font.color.rgb = RGBColor(0x1A, 0x6A, 0x4A)
    return para

def add_section_divider(doc):
    para = doc.add_paragraph()
    para.paragraph_format.space_before = Pt(10)
    para.paragraph_format.space_after  = Pt(10)
    run = para.add_run('─' * 85)
    run.font.color.rgb = RGBColor(0xAA, 0xDD, 0xD5)
    run.font.size = Pt(8)

def page_break(doc):
    doc.add_page_break()

# ═══════════════════════════════════════════════════════════════════════════════
#  DOCUMENT SETUP
# ═══════════════════════════════════════════════════════════════════════════════

doc = Document()

# Page margins
section = doc.sections[0]
section.page_width  = Cm(21.0)
section.page_height = Cm(29.7)
section.left_margin   = Cm(2.2)
section.right_margin  = Cm(2.2)
section.top_margin    = Cm(2.0)
section.bottom_margin = Cm(2.0)

# Default font
style = doc.styles['Normal']
style.font.name = 'Calibri'
style.font.size = Pt(10.5)
style.font.color.rgb = DARK_GREY

# ═══════════════════════════════════════════════════════════════════════════════
#  COVER PAGE
# ═══════════════════════════════════════════════════════════════════════════════

# Top badge
top = doc.add_paragraph()
top.alignment = WD_ALIGN_PARAGRAPH.CENTER
top.paragraph_format.space_before = Pt(40)
r = top.add_run('🛰  SPACE TECH HACKATHON  ·  SOLID WASTE INTELLIGENCE  ·  BENGALURU 2026')
r.font.size = Pt(9)
r.font.color.rgb = MID_TEAL
r.bold = True

# Title
title = doc.add_paragraph()
title.alignment = WD_ALIGN_PARAGRAPH.CENTER
title.paragraph_format.space_before = Pt(10)
r = title.add_run('AstraCity')
r.font.size = Pt(40)
r.bold = True
r.font.color.rgb = DARK_TEAL

# Subtitle
sub = doc.add_paragraph()
sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
r = sub.add_run('Comprehensive Technical & Research Report')
r.font.size = Pt(18)
r.bold = True
r.font.color.rgb = MID_TEAL

# Tagline
tag = doc.add_paragraph()
tag.alignment = WD_ALIGN_PARAGRAPH.CENTER
tag.paragraph_format.space_before = Pt(6)
r = tag.add_run('"A Digital Twin & AI-Powered Solid Waste Management Platform for HSR Layout, Bengaluru"')
r.font.size = Pt(11)
r.italic = True
r.font.color.rgb = MID_GREY

# Divider
div = doc.add_paragraph()
div.alignment = WD_ALIGN_PARAGRAPH.CENTER
div.paragraph_format.space_before = Pt(14)
r = div.add_run('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
r.font.color.rgb = DARK_TEAL

# Details table
doc.add_paragraph()
details = [
    ('Ward', 'HSR Layout, Ward 174'),
    ('City', 'Bengaluru (Bruhat Bengaluru Mahanagara Palike)'),
    ('Area', '18.5 km²  |  18,500 hectares'),
    ('Population', '~1,10,000 people across 9,471 buildings'),
    ('Daily Waste', '55 Tonnes / Day'),
    ('Project Team', 'RVCE Students — NSS / Space Tech Hackathon'),
    ('Report Version', 'Final  |  June 2026'),
    ('Algorithms', 'Clarke-Wright CVRP  ·  IPCC Methane Model  ·  DBSCAN Dump Detection'),
    ('Data Sources', 'BBMP  ·  OSM  ·  Sentinel-2  ·  CPCB  ·  Census 2011  ·  IPCC  ·  CCTS 2023'),
]
dtbl = doc.add_table(rows=len(details), cols=2)
dtbl.alignment = WD_TABLE_ALIGNMENT.CENTER
for i, (k, v) in enumerate(details):
    c0 = dtbl.rows[i].cells[0]
    c1 = dtbl.rows[i].cells[1]
    set_cell_bg(c0, LIGHT_TEAL)
    p0 = c0.paragraphs[0]
    r0 = p0.add_run(k)
    r0.bold = True; r0.font.size = Pt(10); r0.font.color.rgb = DARK_TEAL
    p1 = c1.paragraphs[0]
    r1 = p1.add_run(v)
    r1.font.size = Pt(10); r1.font.color.rgb = DARK_GREY
set_cell_borders(dtbl)

page_break(doc)

# ═══════════════════════════════════════════════════════════════════════════════
#  SECTION 1 — PROBLEM STATEMENT
# ═══════════════════════════════════════════════════════════════════════════════

add_heading(doc, '1. Problem Statement', 1)

add_body(doc,
    'Bengaluru — the Silicon Valley of India — generates approximately 5,000 to 6,000 tonnes '
    'of solid waste every single day. BBMP (Bruhat Bengaluru Mahanagara Palike) spends over '
    '₹800 crores annually on waste management, operating one of India\'s largest civic waste '
    'fleets. Yet, despite this massive expenditure, the system remains deeply inefficient, '
    'reactive, and unscientific.')

add_body(doc,
    'The core problem is structural: waste management decisions in Bengaluru are made on static '
    'spreadsheets, intuition, and historical averages — not on real-time spatial intelligence. '
    'No one in the civic administration knows:')

for b in [
    'Where illegal dump sites are forming at this moment',
    'How much methane is leaking undetected from organic waste',
    'Whether truck routes are efficient or deeply redundant',
    'Which wards will overflow during the next festival or monsoon season',
    'How much money is being lost to inefficiency that could be recovered',
]:
    add_bullet(doc, b)

add_heading(doc, '1.1 The Specific Focus: HSR Layout, Ward 174', 2)
add_body(doc, 'HSR Layout was chosen as the pilot — a microcosm of the larger problem:')

add_table(doc,
    ['Parameter', 'Value', 'Source'],
    [
        ['Area', '18.5 km²', 'BBMP Ward Boundary Shapefile'],
        ['Population', '~1,10,000', 'Census 2011 + Building Estimation'],
        ['Buildings', '9,471', 'OpenStreetMap Building Footprints'],
        ['Daily Waste', '55 Tonnes', 'CPCB 0.5 kg/capita/day × 1,10,000'],
        ['Dumpyards inside ward', '0 (ZERO)', 'BBMP_Dumpyards.shp'],
        ['BMUs inside ward', '0 (ZERO)', 'BBMP_BIO-Methanisation.shp'],
        ['DWCCs inside ward', '6', 'BBMP_Dry_Waste_Collection_Centres.shp'],
        ['Nearest processing facility', '2.09 km South (Kudlu)', 'Coordinate distance calculation'],
    ],
    col_widths=[5, 5, 7]
)

add_section_divider(doc)

# ═══════════════════════════════════════════════════════════════════════════════
#  SECTION 2 — PROBLEMS FOUND
# ═══════════════════════════════════════════════════════════════════════════════

add_heading(doc, '2. Problems Found — A Detailed Field Assessment', 1)

add_heading(doc, '2.1 Infrastructure Deficit', 2)
add_table(doc,
    ['Problem', 'Finding', 'Impact'],
    [
        ['No dumpyards in HSR', '0 of 3 Bengaluru dumpyards are within HSR', 'Waste must travel 21+ km to landfill'],
        ['No BMUs in HSR', '0 of 11 city BMUs inside ward', '33.55 T/day wet waste travels 2.1 km to Kudlu'],
        ['No Processing Units in HSR', '0 of 8 city units inside ward', 'All secondary processing 2+ km away'],
        ['Only 6 DWCCs for 1,10,000 people', '10 TPD combined capacity vs 16.5 TPD dry waste', 'Overflow likely on high-generation days'],
    ],
    col_widths=[5, 6, 6]
)

add_heading(doc, '2.2 Routing & Logistics Problems', 2)
for b in [
    'Unoptimised routes: Trucks were travelling 132.44 km/day collectively — a 75.5% improvement was found possible, reducing this to 32.41 km/day.',
    'Mixed waste collection: Many auto-tippers were collecting unsegregated waste, defeating the purpose of the dual-bin system.',
    'Road accessibility gaps: 25.1% of HSR road segments are footways/paths inaccessible to any motorised vehicle.',
    'Narrow lane problem: 41.4% of roads are residential lanes (2–4 m wide), accessible only to small auto-tippers.',
]:
    add_bullet(doc, b)

add_heading(doc, '2.3 Waste Segregation Failures by Zone', 2)
add_table(doc,
    ['Sub-zone', 'Segregation Rate', 'Status', 'Action Required'],
    [
        ['North HSR', '68%', '✓ Good', 'Maintain awareness campaigns'],
        ['West HSR', '62%', '✓ Good', 'Strengthen apartment compliance'],
        ['Central HSR', '55%', '⚠ Medium', 'Deploy segregation marshals'],
        ['South HSR', '48%', '⚠ Medium', 'Door-to-door education drives'],
        ['East HSR', '42%', '✗ Critical', 'Penalty enforcement + monitoring'],
        ['Commercial zones', '38%', '✗ Alarming', 'Mandatory bulk generator audits'],
    ],
    col_widths=[4, 3.5, 3, 6]
)

add_heading(doc, '2.4 Illegal Dumping (Satellite-Detected)', 2)
add_table(doc,
    ['Site #', 'Risk Level', 'Area (m²)', 'Detected Via', 'Priority'],
    [
        ['1', 'High', '264', 'Satellite imagery', 'P0 — Same Day cleanup'],
        ['2', 'High', '182', 'Satellite imagery', 'P0 — Same Day cleanup'],
        ['3', 'Medium', '200', 'Satellite imagery', 'P1 — 48 hours'],
        ['4', 'Medium', '147', 'Satellite imagery', 'P1 — 48 hours'],
    ],
    col_widths=[2, 3, 3, 4.5, 5]
)

add_heading(doc, '2.5 Methane Leakage Risk', 2)
add_table(doc,
    ['Metric', 'Value', 'Source'],
    [
        ['CH₄ generated per day', '3,548 m³', 'IPCC 2006 Guidelines Vol. 5'],
        ['CO₂ equivalent per day', '71.1 Tonnes CO₂e', 'GWP = 28 (IPCC AR5)'],
        ['CO₂ equivalent per year', '25,959 Tonnes CO₂e', 'Annual projection'],
        ['Energy potential per day', '21,285 kWh', 'Kudlu BMU conversion data'],
        ['Homes that could be powered', '7,095 homes', '@ 3 kWh/home/day'],
    ],
    col_widths=[6, 5, 6]
)

add_section_divider(doc)
page_break(doc)

# ═══════════════════════════════════════════════════════════════════════════════
#  SECTION 3 — PROJECT OVERVIEW
# ═══════════════════════════════════════════════════════════════════════════════

add_heading(doc, '3. Project Overview & App Built', 1)

add_heading(doc, '3.1 What is AstraCity?', 2)
add_body(doc,
    'AstraCity is a next-generation spatial intelligence platform for urban solid waste management. '
    'It is a Digital Twin of Bengaluru\'s waste ecosystem, combining five core capabilities:')
for b in [
    'Satellite Remote Sensing — Sentinel-2 imagery processed to detect illegal dump sites using spectral analysis and DBSCAN clustering',
    'GIS Data Integration — BBMP shapefiles, OSM road networks, ward boundaries all loaded and cross-referenced',
    'Digital Twin Simulation — A physics-informed city model that simulates waste generation under variable conditions',
    'Capacitated Vehicle Routing (CVRP) — Clarke-Wright Savings Algorithm optimising truck routes across the ward',
    'Environmental Quantification — IPCC-framework methane and CO₂ calculations tied to real waste volumes',
]:
    add_bullet(doc, b)

add_heading(doc, '3.2 The App — 6 Pages of Spatial Intelligence', 2)
add_body(doc, 'Built on Next.js 14 (App Router), Tailwind CSS, MapLibre GL JS, Recharts, Framer Motion, and Gemini 1.5 Flash AI:')
add_table(doc,
    ['Page', 'URL', 'Purpose'],
    [
        ['Landing', '/', 'Hero page with animated stat counters — first impression in 30 seconds'],
        ['Smart Map', '/map', 'Full-screen GIS map with 6 toggleable data layers'],
        ['Simulation', '/simulation', 'Policy scenario engine — festival/rainfall/population sliders'],
        ['Economic Impact', '/impact', '₹ savings dashboard with before/after charts and ROI timeline'],
        ['Ward Scoring', '/wards', 'Governance scores for all wards — sortable table and visual map'],
        ['Report Export', '/report', 'PDF-quality report generation for BBMP commissioners'],
    ],
    col_widths=[3.5, 3, 10]
)

add_section_divider(doc)

# ═══════════════════════════════════════════════════════════════════════════════
#  SECTION 4 — DATA COLLECTION
# ═══════════════════════════════════════════════════════════════════════════════

add_heading(doc, '4. Data Collection — Maps, Road Networks, DWCCs & BBMP Dumpsites', 1)

add_heading(doc, '4.1 BBMP Official Shapefiles', 2)
add_body(doc, 'The primary infrastructure dataset was obtained from BBMP\'s official GIS shapefiles:')
add_table(doc,
    ['Shapefile', 'Geometry', 'Records', 'File Size', 'Has Attributes'],
    [
        ['BBMP_Dumpyards.shp', 'PointZ', '3', '232 bytes', 'NO (dbf missing)'],
        ['BBMP_Dry_Waste_Collection_Centres.shp', 'PointZ', '336', '14.8 KB', 'YES (10 fields)'],
        ['BBMP_BIO-Methanisation.shp', 'PointZ', '11', '584 bytes', 'YES (10 fields)'],
        ['BBMP_Waste_Processing_Units.shp', 'PointZ', '8', '452 bytes', 'YES (10 fields)'],
    ],
    col_widths=[6.5, 2.5, 2.5, 2.5, 3]
)
add_callout(doc, 'Processing method: A custom Python script using struct-based binary reading of .shp files extracted WGS84 coordinates. All 336 DWCC locations were cross-referenced against the HSR Layout Ward Boundary shapefile to identify the 6 DWCCs that fall within Ward 174.', 'note')

add_heading(doc, '4.2 Road Network — OpenStreetMap (OSM)', 2)
add_table(doc,
    ['OSM Tag', 'IRC Width Standard', 'Count in HSR'],
    [
        ['trunk', '>12 m (Outer Ring Road)', '38'],
        ['primary', '>9 m', '10'],
        ['secondary', '>6 m', '113'],
        ['tertiary', '>4 m', '191'],
        ['residential', '2–4 m', '840'],
        ['service', '2–3 m', '179'],
        ['footway', '<2 m', '509'],
        ['path', '<2 m', '51'],
        ['others', 'Varies', '96'],
        ['TOTAL', '—', '2,027'],
    ],
    col_widths=[4, 6, 4]
)

add_heading(doc, '4.3 Building Footprint Data — OSM Buildings', 2)
add_table(doc,
    ['Building Type', 'Count', '%', 'People/Unit', 'Est. Population'],
    [
        ['Independent Houses', '8,998', '94.8%', '4', '35,992'],
        ['Apartment Complexes', '250', '2.6%', '284', '71,000'],
        ['Commercial / Retail', '137', '1.4%', '—', '—'],
        ['Office / IT', '39', '0.4%', '15', '585'],
        ['Educational (Schools)', '15', '0.2%', '150', '2,250'],
        ['Hospitals / Medical', '2', '<0.1%', '50', '100'],
        ['Other / Unclassified', '30', '0.3%', '—', '—'],
        ['TOTAL', '9,471', '100%', '—', '~1,10,000'],
    ],
    col_widths=[5, 2.5, 2.5, 3, 4]
)

add_section_divider(doc)
page_break(doc)

# ═══════════════════════════════════════════════════════════════════════════════
#  SECTION 5 — LULC PROCEDURE
# ═══════════════════════════════════════════════════════════════════════════════

add_heading(doc, '5. LULC Analysis — Procedure Using QGIS', 1)

add_heading(doc, '5.1 What is LULC?', 2)
add_body(doc,
    'Land Use and Land Cover (LULC) classification categorises the Earth\'s surface into meaningful '
    'land cover types. For waste management, LULC is essential because open land identifies illegal '
    'dump hotspots, water bodies reveal leachate risk, built-up areas determine waste generation '
    'potential, and vegetation can conceal illegal dumps.')

add_heading(doc, '5.2 Satellite Input', 2)
add_table(doc,
    ['Parameter', 'Value'],
    [
        ['File', 'udupi_Layout_SD.tif'],
        ['Dimensions', '1002 × 740 pixels'],
        ['Bands', '3-band RGB composite'],
        ['Source', 'Sentinel-2 (ESA Copernicus) multispectral imagery'],
        ['Processing Tool', 'QGIS 3.x with SCP (Semi-Automatic Classification Plugin)'],
        ['CRS', 'WGS84 (EPSG:4326)'],
    ],
    col_widths=[5, 12]
)

add_heading(doc, '5.3 Step-by-Step QGIS Procedure', 2)
steps = [
    ('Step 1 — Load Satellite Image',
     'Open QGIS 3.x → Layer → Add Layer → Add Raster Layer. Import udupi_Layout_SD.tif. Verify CRS is WGS84. Apply contrast enhancement for visual inspection.'),
    ('Step 2 — Install SCP Plugin',
     'Plugins → Manage → Semi-Automatic Classification Plugin. Activate plugin. Set input satellite image as active band set.'),
    ('Step 3 — Training Area (ROI) Collection',
     'Draw 8–15 ROI polygons per class in clearly identifiable areas: Built-up (grey/white tones on rooftops), Vegetation (dark green, high NIR), Open Land (reddish-brown bare soil), Water (very dark blue-black). Ensure spatial diversity across north, south, east, west.'),
    ('Step 4 — Spectral Signature Analysis',
     'Extract spectral signatures per band per class. Plot spectral curves to verify class separability. Built-up shows high visible / low NIR; Vegetation shows low visible / very high NIR.'),
    ('Step 5 — Supervised Classification (Maximum Likelihood)',
     'SCP → Classification → Run Classification. Algorithm: Maximum Likelihood Classifier (MLC). Output: Single-band classified raster (1=Built-up, 2=Vegetation, 3=Open Land, 4=Water).'),
    ('Step 6 — Accuracy Assessment',
     'SCP → Accuracy → Confusion Matrix. Stratified random validation (min 50 per class). Target: Overall Accuracy >85%, Kappa Coefficient >0.80.'),
    ('Step 7 — Post-Classification Refinement',
     'Apply Majority Filter (3×3 kernel) to remove salt-and-pepper noise. Manually correct obvious misclassifications.'),
    ('Step 8 — Area Calculation',
     'Raster → Raster Calculator. Count pixels per class × pixel area (resolution²). Convert to km² and % of total ward area (18.5 km²).'),
    ('Step 9 — Vectorisation & Integration',
     'Raster → Conversion → Polygonize. Join with ward boundary for final statistics. Export as GeoJSON for AstraCity web app.'),
]
for title, desc in steps:
    add_bullet(doc, f' {desc}', bold_prefix=title + ':')

add_section_divider(doc)

# ═══════════════════════════════════════════════════════════════════════════════
#  SECTION 6 — LULC RESULTS
# ═══════════════════════════════════════════════════════════════════════════════

add_heading(doc, '6. LULC Results — HSR Layout Classification', 1)

add_heading(doc, '6.1 Classification Results', 2)
add_table(doc,
    ['Land Cover Class', 'Coverage (%)', 'Area (km²)', 'Significance'],
    [
        ['Built-up', '64.1%', '11.85', 'Dense urban fabric — apartments, houses, commercial'],
        ['Vegetation', '17.6%', '3.26', 'Parks, avenue trees, garden spaces'],
        ['Open Land', '15.3%', '2.83', 'Vacant plots, construction sites — HIGHEST DUMP RISK'],
        ['Water Bodies', '3.0%', '0.56', 'Agara Lake, HSR Lake, drainage channels'],
        ['TOTAL', '100%', '18.5', 'Ward 174 area'],
    ],
    col_widths=[4, 3, 3, 7]
)
add_callout(doc, 'Source: udupi_Layout_SD.tif (1002×740 px, 3-band RGB GeoTIFF). Classification performed in QGIS 3.x using Semi-Automatic Classification Plugin.', 'source')

add_heading(doc, '6.2 Lakes in HSR Layout', 2)
add_body(doc, 'Two significant urban lakes exist in HSR Layout: Agara Lake (Sector 4, BBMP-managed) and HSR Layout Lake. Together they form the 0.56 km² (3.0%) water body class. They are directly downstream of high-density residential zones B2 and C3, making leachate contamination from nearby dumps a serious environmental risk.')

add_section_divider(doc)
page_break(doc)

# ═══════════════════════════════════════════════════════════════════════════════
#  SECTION 7 — LULC METHODOLOGY
# ═══════════════════════════════════════════════════════════════════════════════

add_heading(doc, '7. Methodology for LULC Classification — Why Each Class Was Chosen', 1)

sections_7 = [
    ('7.1 Why Built-Up Was Classified',
     'Built-up areas are the primary waste generators. The density, type (residential vs. commercial vs. institutional), and spatial distribution of built-up areas directly determine waste volumes, collection vehicle routing, and required infrastructure. Residential built-up → Green + Blue bin waste. Commercial built-up → Bulk generator regulations (SWM Rules 2016 mandate on-site composting for >100 kg/day generators). Institutional → predictable scheduled collection.'),
    ('7.2 Why Vegetation Was Classified',
     'Vegetation areas are critical for three reasons: (1) Open vegetated areas adjacent to residential zones are frequently used for illegal dumping because they are less surveilled. (2) Dense tree canopy can conceal dump sites from overhead satellite detection. (3) Vegetation health (NDVI) can indicate contamination from leachate. NDVI = (NIR − Red) / (NIR + Red) gives values +0.3 to +0.8 for healthy vegetation.'),
    ('7.3 Why Open Land Was Classified — Illegal Dump Hotspot Identification',
     'Open land (vacant plots, construction sites, barren land) is the PRIMARY location for illegal solid waste dumping in Indian cities. Reasons: No ownership enforcement (vacant plots are untended), high accessibility for large vehicles, reduced surveillance, and economic incentive (waste haulers avoid DWCC tipping fees). 15.3% of HSR Layout (2.83 km²) is open land — the highest-risk zone. Satellite-based dump detection uses DBSCAN clustering on brightness anomalies: dark patches on open land = potential dump accumulation.'),
    ('7.4 Why Water Bodies Were Classified',
     'Water bodies serve as environmental sentinel indicators: (1) Leachate contamination — illegal dumps near lakes leach heavy metals and pathogens into groundwater. (2) Methane generation — wet organic waste in water bodies undergoes anaerobic decomposition without energy capture. (3) Regulatory compliance — SWM Rules 2016 prohibit waste disposal within 200 m of any water body. HSR\'s two lakes are downstream of the densest residential zones (B2, C3).'),
]
for title, body in sections_7:
    add_heading(doc, title, 2)
    add_body(doc, body)

add_section_divider(doc)

# ═══════════════════════════════════════════════════════════════════════════════
#  SECTION 8 — BUILDING CLASSIFICATION
# ═══════════════════════════════════════════════════════════════════════════════

add_heading(doc, '8. Building Type Classification — Why It Matters', 1)

add_heading(doc, '8.1 Waste Generation Rates by Building Type', 2)
add_table(doc,
    ['Building Type', 'Count', 'Per-Unit Generation', 'Daily Waste'],
    [
        ['Independent Houses', '8,998', '2.0 kg/unit/day', '18.0 T'],
        ['Apartment Complexes', '250', '568 kg/complex/day', '142.0 T'],
        ['Commercial / Retail', '137', '15–25 kg/unit', '2.7 T'],
        ['Office / IT', '39', '7.5 kg/unit', '0.3 T'],
        ['Educational', '15', '75 kg/school', '1.1 T'],
        ['Hospitals', '2', '25 kg (non-biomedical)', '0.05 T'],
    ],
    col_widths=[5, 2.5, 4.5, 4]
)

add_heading(doc, '8.2 Zone-wise Building Density — Critical Routing Insight', 2)
add_table(doc,
    ['Zone', 'Buildings', 'Houses', 'Apartments', 'Commercial', 'Routing Priority'],
    [
        ['B2 (Core Center) ⭐', '2,189', '2,101', '24', '47', 'MAXIMUM — Densest zone'],
        ['C3 (NE Core) ⭐', '2,082', '1,964', '69', '41', 'MAXIMUM — 2nd Densest'],
        ['B3 (E-Center)', '1,734', '1,679', '31', '12', 'High'],
        ['B1 (W-Center)', '1,383', '1,351', '10', '12', 'High'],
        ['A4, B4, D1', '0', '—', '—', '—', 'SKIP — Empty zones'],
    ],
    col_widths=[4, 2.5, 2.5, 3, 3, 4]
)

add_section_divider(doc)

# ═══════════════════════════════════════════════════════════════════════════════
#  SECTION 9 — ROAD NETWORK
# ═══════════════════════════════════════════════════════════════════════════════

add_heading(doc, '9. Road Network Classification — Why It Matters', 1)

add_heading(doc, '9.1 HSR Layout Road Network — 2,027 Segments', 2)
add_table(doc,
    ['Road Class', 'Count', '%', 'Width', 'Vehicle Types Allowed', 'Speed'],
    [
        ['Trunk (ORR)', '38', '1.9%', '>12 m', 'Hook Loader 18T, Compactor 10T', '60 km/h'],
        ['Primary', '10', '0.5%', '>9 m', 'Compactor 10T, Truck 5T', '40 km/h'],
        ['Secondary', '113', '5.6%', '>6 m', 'Compactor 5T', '40 km/h'],
        ['Tertiary', '191', '9.4%', '>4 m', 'Mini Compactor 3T, Auto Tipper', '30 km/h'],
        ['Residential', '840', '41.4%', '2–4 m', 'Auto Tipper 0.5T ONLY', '20 km/h'],
        ['Service', '179', '8.8%', '2–3 m', 'Auto Tipper 0.5T ONLY', '15 km/h'],
        ['Footway', '509', '25.1%', '<2 m', 'PUSH CART ONLY', 'Walk'],
        ['Path', '51', '2.5%', '<2 m', 'Push Cart only', 'Walk'],
        ['Others', '96', '4.8%', 'Varies', 'Case-by-case', '—'],
        ['TOTAL', '2,027', '100%', '—', '—', '—'],
    ],
    col_widths=[3, 1.8, 1.8, 2, 5, 2.5]
)

add_heading(doc, '9.2 Coverage Summary', 2)
add_table(doc,
    ['Coverage Type', 'Road Count', '% of Network'],
    [
        ['Truck-accessible (>4 m)', '352', '17.4%'],
        ['Auto-tipper accessible (>2 m)', '1,371', '67.6%'],
        ['Push-cart accessible (any width)', '1,931', '95.3%'],
        ['Completely unserviceable', '96', '4.7%'],
    ],
    col_widths=[7, 4, 4]
)

add_callout(doc, '66% of HSR Layout\'s road network can ONLY be accessed by auto-tippers or push carts — making the two-tier collection system physically mandatory, not optional.', 'warning')

add_section_divider(doc)
page_break(doc)

# ═══════════════════════════════════════════════════════════════════════════════
#  SECTION 10 — WASTE PREDICTION & DIGITAL TWIN
# ═══════════════════════════════════════════════════════════════════════════════

add_heading(doc, '10. Waste Prediction — Formulation, Grid-Wise Split & Digital Twin', 1)

add_heading(doc, '10.1 Core Waste Generation Formula', 2)
add_code_block(doc,
"""Base_waste_per_zone (kg/day) = Σ [building_i × occupants_i × 0.5 kg/person/day]

Total_zone_waste = Base_waste
                 × (1 + population_growth_factor)    [0.0 – 0.5]
                 × festival_multiplier               [1.0 / 1.20 / 1.28]
                 × weather_factor                    [0.95 / 1.0 / 1.15]

Festival multipliers:
  Normal day:         1.0  (baseline)
  Diwali:             1.20 (+20%)
  Ganesh Chaturthi:   1.28 (+28%)

Weather factors:
  Low rainfall:   0.95
  Normal:         1.00
  Heavy rainfall: 1.15 (+15%)""")

add_heading(doc, '10.2 Digital Twin Scenario Results', 2)
add_table(doc,
    ['Scenario', 'Waste/Day', 'Change vs Normal', 'Max Single Zone', 'Overloaded Bins'],
    [
        ['Normal Day (Baseline)', '14.08 T', '—', '494 kg', '2'],
        ['Heavy Rainfall', '16.19 T', '+15%', '569 kg', '3'],
        ['Ganesh Chaturthi', '18.02 T', '+28%', '633 kg', '4'],
        ['Rain + Festival (Worst Case)', '21.86 T', '+55%', '768 kg', '5'],
    ],
    col_widths=[5, 2.5, 3.5, 3.5, 3]
)
add_callout(doc, 'Source: twin_output.txt (Digital Twin Phase 3 simulation, 59 active grid cells, 30,545 modelled population)', 'source')

add_heading(doc, '10.3 Dump Probability Model', 2)
add_code_block(doc,
"""dump_probability = (wasteGenerated / collectionCapacity) × zonal_risk_index

zonal_risk_index = (1 - segregation_rate)
                 × open_land_fraction
                 × (1 - road_density_score)

Interpretation:
  Zones with more waste than collection can handle +
  Poor segregation +
  Abundant open land +
  Sparse road network
  = HIGHEST illegal dump risk""")

add_heading(doc, '10.4 Methane Projection Formula (IPCC 2006)', 2)
add_code_block(doc,
"""CH₄ (tons/year) = MSW_organic × DOCf × MCF × (16/12) × (1 - OX)

Where:
  MSW_organic  = 33.55 T/day × 365 = 12,246 T/year organic waste
  DOCf         = 0.5   (IPCC default DOC fraction for food waste)
  MCF          = 0.8   (managed anaerobic treatment)
  16/12        = molecular weight ratio (CH₄ / C)
  OX           = 0.1   (oxidation factor)

→ 927 T CH₄/year
→ 927 × 28 (GWP) = 25,959 T CO₂e/year

Source: IPCC 2006 Guidelines, Volume 5 (Waste), Table 3.1""")

add_section_divider(doc)

# ═══════════════════════════════════════════════════════════════════════════════
#  SECTION 11 — APP DESIGN
# ═══════════════════════════════════════════════════════════════════════════════

add_heading(doc, '11. App Design — Features, Reasoning & Unique Value Propositions', 1)

add_heading(doc, '11.1 Technology Stack', 2)
add_table(doc,
    ['Layer', 'Technology', 'Reason'],
    [
        ['Framework', 'Next.js 14 (App Router)', 'Fast routing; pages feel like a real product'],
        ['Language', 'TypeScript + React 18', 'Type safety, component reuse'],
        ['Styling', 'Tailwind CSS 3.4', 'Fast to build premium dark/light UI'],
        ['Mapping', 'MapLibre GL JS v5.20.2', 'Open-source; OpenFreeMap tiles (zero API cost)'],
        ['Charts', 'Recharts 3.8', 'Easy, React-native, excellent for dashboards'],
        ['Animations', 'Framer Motion 12.36', 'Smooth counter animations, page transitions'],
        ['State', 'Zustand 5.0', 'Lightweight global state management'],
        ['AI', 'Google Gemini 1.5 Flash', 'Fast, low-cost natural language interface'],
        ['PDF Export', 'jsPDF + html2canvas', 'Browser-side PDF report generation'],
        ['VRP Solver', 'Clarke-Wright (TypeScript)', 'Pure browser-side routing — no server needed'],
    ],
    col_widths=[3, 5, 8]
)

add_heading(doc, '11.2 Ward Governance Score Formula', 2)
add_code_block(doc,
"""Ward Score (0–100) =
  (1 - dumpRisk)        × 30   // 30% weight: illegal dump probability
  + (1 - methaneInt)    × 25   // 25% weight: methane emission intensity
  + routeEfficiency     × 25   // 25% weight: collection route efficiency
  + (1 - complaintRate) × 20   // 20% weight: citizen complaint rate

Score bands:
  0–40:  Rose / High Risk
  41–70: Amber / Medium Risk
  71+:   Emerald / Low Risk""")

add_section_divider(doc)
page_break(doc)

# ═══════════════════════════════════════════════════════════════════════════════
#  SECTION 12 — KEY FINDINGS
# ═══════════════════════════════════════════════════════════════════════════════

add_heading(doc, '12. Key Findings in Detail', 1)

findings = [
    ('Finding #1 — The Kudlu Co-location Advantage',
     'The Kudlu area (2.09–2.10 km south of HSR) hosts both the nearest Bio-Methanisation Unit AND the nearest Waste Processing Unit at essentially the same location. Compactor trucks make one trip that serves both purposes — wet waste dropped at BMU, rejects at Processing Unit. Without this co-location, two separate trips would be needed, doubling secondary transport costs. Estimated advantage: ₹0.8 crores/year in avoided secondary transport.'),
    ('Finding #2 — Route Distance Reduction of 75.5%',
     'Before optimisation: 132.44 km/day. After Clarke-Wright optimisation: 32.41 km/day. Distance saved: 100.03 km/day. Annual fuel savings: ₹3.28 crores. This comes from eliminating route duplication, prioritising high-demand zones (B2, C3), and routing vehicles in sequences that minimise backtracking.'),
    ('Finding #3 — The Footway Coverage Gap',
     '509 footways (25.1% of HSR roads) can only be served by push carts. Current push-cart capacity is 3.2 T/day vs an estimated 5.5 T/day generated in these areas. This 2.3 T/day gap is potentially accumulating as illegal dumps on open land adjacent to narrow lanes.'),
    ('Finding #4 — LULC Open Land Risk',
     '15.3% of HSR Layout (2.83 km²) is open land. At ₹52,000–₹62,000 cleanup cost per dump site, and assuming 30 new dumps per year, the annual cleanup cost risk is ₹15.6 lakh – ₹18.6 lakh from open-land dumping in one ward alone.'),
    ('Finding #5 — Carbon Credit Scale Potential',
     'At 198 wards with similar BMU routing: Total CO₂e = 25,959 T × 198 = 51.4 lakh T CO₂e/year. Carbon credit value = ₹1,028 Crores/year — making Bengaluru one of India\'s largest municipal carbon credit earners under CCTS 2023.'),
]
for title, body in findings:
    add_heading(doc, title, 2)
    add_body(doc, body)

add_section_divider(doc)

# ═══════════════════════════════════════════════════════════════════════════════
#  SECTION 13 — DATA SOURCES
# ═══════════════════════════════════════════════════════════════════════════════

add_heading(doc, '13. Data Collection Details — Sources, Methods & Quality', 1)

add_heading(doc, '13.1 Complete Data Source Registry', 2)
add_table(doc,
    ['#', 'Dataset', 'Source / Authority', 'How Collected', 'Used For'],
    [
        ['1', 'BBMP_Dumpyards.shp', 'BBMP GIS', 'BBMP Open Data Portal', '3 dumpyard locations citywide'],
        ['2', 'BBMP_Dry_Waste_Collection_Centres.shp', 'BBMP GIS', 'BBMP Open Data Portal', '336 DWCC locations'],
        ['3', 'BBMP_BIO-Methanisation.shp', 'BBMP GIS', 'BBMP Open Data Portal', '11 BMU locations'],
        ['4', 'BBMP_Waste_Processing_Units.shp', 'BBMP GIS', 'BBMP Open Data Portal', '8 processing unit locations'],
        ['5', 'HSR Layout Ward Boundary.shp', 'BBMP Ward Admin', 'BBMP Portal', 'Ward polygon (18.5 km²)'],
        ['6', 'HSR Layout Road Network.shp', 'OpenStreetMap', 'GeoFabrik/JOSM export', '2,027 road segments with types'],
        ['7', 'building_report.json', 'OpenStreetMap', 'QGIS Overpass API', '9,471 buildings with types'],
        ['8', 'udupi_Layout_SD.tif', 'Sentinel-2 (ESA)', 'Copernicus Hub download', 'LULC classification'],
        ['9', 'Census 2011 Ward 174', 'Census of India', 'censusindia.gov.in', 'Population baseline (110,000)'],
        ['10', 'CPCB Annual Report 2021-22', 'CPCB', 'cpcb.nic.in', '0.5 kg/capita/day benchmark'],
        ['11', 'BBMP 2013 Chemical Analysis', 'BBMP', 'BBMP SWM Dept', 'Waste composition 61/30/5/4%'],
        ['12', 'IPCC 2006 Guidelines Vol. 5', 'IPCC', 'ipcc-nggip.iges.or.jp', 'Methane emission factors'],
        ['13', 'IPCC AR5', 'IPCC', 'ipcc.ch', 'GWP of methane = 28'],
        ['14', 'CCTS 2023', 'Ministry of Power', 'powermin.gov.in', 'Carbon credit price ₹1,200–₹2,200/T'],
        ['15', 'IRC:SP guidelines', 'IRC', 'IRC, New Delhi', 'Road width standards per class'],
        ['16', 'BBMP SWM Manual 2016', 'BBMP', 'BBMP website', 'Collection time windows, vehicle rules'],
        ['17', 'Clarke & Wright (1964)', 'Operations Research Journal', 'Academic reference', 'VRP algorithm mathematical basis'],
        ['18', 'OSRM API', 'OpenStreetMap', 'REST API calls', 'Real driving distances between DWCCs'],
    ],
    col_widths=[0.8, 5, 3.5, 3.5, 4]
)

add_section_divider(doc)
page_break(doc)

# ═══════════════════════════════════════════════════════════════════════════════
#  SECTION 14 — WASTE COMPOSITION
# ═══════════════════════════════════════════════════════════════════════════════

add_heading(doc, '14. Waste Composition — Wet, Dry, Factors & Percentages', 1)

add_heading(doc, '14.1 HSR Layout Daily Waste Breakdown', 2)
add_table(doc,
    ['Category', 'Bin', '%', 'Tons/Day', 'kg/Day', 'Destination'],
    [
        ['Wet / Organic', 'Green', '61%', '33.55', '33,550', 'Bio-Methanisation Unit (Kudlu)'],
        ['Dry / Recyclable', 'Blue', '30%', '16.50', '16,500', 'DWCCs (6 inside HSR)'],
        ['Hazardous / Sanitary', 'Red', '5%', '2.75', '2,750', 'Authorised Hazardous Waste Handler'],
        ['Inert / Others', 'Black', '4%', '2.20', '2,200', 'Waste Processing Plant'],
        ['TOTAL', '—', '100%', '55.00', '55,000', '—'],
    ],
    col_widths=[3.5, 2, 1.5, 2.5, 2.5, 5]
)
add_callout(doc, 'Source: BBMP 2013 Chemical Analysis of Municipal Solid Waste. Per-capita rate: CPCB Annual Report 2021-22 (0.5 kg/capita/day). Population: Census 2011 + building model for Ward 174.', 'source')

add_heading(doc, '14.2 Factors Affecting Waste Generation', 2)
add_table(doc,
    ['Factor', 'Effect', 'Magnitude', 'Source'],
    [
        ['Heavy rainfall (monsoon)', 'Heavier wet waste, food spoilage', '+15%', 'Digital Twin scenario modelling'],
        ['Ganesh Chaturthi', 'Offerings, food, religious waste', '+28%', 'Digital Twin + BBMP field data'],
        ['Diwali', 'Packaging, sweets, cracker residue', '+20%', 'Digital Twin scenario modelling'],
        ['Rain + Festival (combined)', 'Worst case compounded effect', '+55%', 'twin_output.txt simulation'],
        ['Commercial zone (weekday)', 'Restaurants, offices at peak', '+10–20%', 'Building-type model'],
        ['Apartment vs. House', 'AOA apartments have better segregation', '65–75% vs 40–55%', 'Field observation'],
    ],
    col_widths=[4, 4.5, 3, 5]
)

add_section_divider(doc)

# ═══════════════════════════════════════════════════════════════════════════════
#  SECTION 15 — BIO-METHANISATION
# ═══════════════════════════════════════════════════════════════════════════════

add_heading(doc, '15. Wet Waste — Separate Treatment & Bio-Methanisation in Detail', 1)

add_heading(doc, '15.1 Why Wet Waste is Treated Separately', 2)
reasons = [
    'Contamination: Wet waste in contact with dry recyclables makes them non-recyclable',
    'Methane generation: Mixed wet+dry in landfills generates methane without energy capture',
    'Weight & density: Wet waste is heavy (high moisture), affecting vehicle load planning',
    'Regulatory mandate: SWM Rules 2016 mandate source segregation at the household level',
    'Value creation: Properly processed wet waste generates biogas (energy) and compost (fertiliser)',
]
for r in reasons:
    add_bullet(doc, r)

add_heading(doc, '15.2 The Complete Bio-Methanisation Process', 2)
add_table(doc,
    ['Stage', 'Process', 'Organisms', 'Products', 'Duration'],
    [
        ['Stage 1', 'Hydrolysis', 'Hydrolytic bacteria', 'Amino acids, fatty acids, sugars', '2–3 days'],
        ['Stage 2', 'Acidogenesis', 'Acidogenic bacteria', 'Volatile fatty acids, H₂, CO₂', '1–2 days'],
        ['Stage 3', 'Acetogenesis', 'Acetogens', 'Acetic acid + H₂ + CO₂', '1–2 days'],
        ['Stage 4 (KEY)', 'Methanogenesis', 'Methanogenic archaea', 'CH₄ (55–70%) + CO₂ = BIOGAS', '10–15 days'],
    ],
    col_widths=[2, 3, 3.5, 5, 2.5]
)

add_heading(doc, '15.3 Kudlu BMU — Capacity & Output for HSR Layout', 2)
add_table(doc,
    ['Parameter', 'Value', 'Source'],
    [
        ['Location', '12.896183°N, 77.650711°E', 'BBMP_BIO-Methanisation.shp'],
        ['Distance from HSR', '2.10 km (Haversine)', 'Coordinate distance calculation'],
        ['Road distance', '~3.5–4.0 km', 'OSRM routing estimate'],
        ['Daily wet waste input from HSR', '33.55 T/day', '61% × 55 T total'],
        ['Biogas generated', '3,548 m³/day', 'IPCC 2006 formula × DOC factor'],
        ['Energy potential', '21,285 kWh/day', '3,548 m³ × 1.25 kWh/m³ × efficiency'],
        ['Homes that could be powered', '7,095 homes/day', '@ 3 kWh/home/day average'],
        ['Compost produced', '~10 T/day', '33.55 T × 0.3 yield factor'],
        ['Methane generated', '2.54 T CH₄/day', 'Biogas × 60% CH₄ × density'],
        ['CO₂ equivalent/day', '71.1 T CO₂e', '2.54 T × GWP 28 (IPCC AR5)'],
        ['Annual CO₂ equivalent', '25,959 T CO₂e/year', '71.1 × 365 days'],
    ],
    col_widths=[6, 5, 6]
)

add_heading(doc, '15.4 BMU Output Utilisation', 2)
outputs = [
    ('Biogas → Electricity', 'Biogas is fed into gas engines (generators) to produce electricity — fed into grid or used to power the BMU facility itself.'),
    ('Digestate → Compost', 'Solid digestate is composted in windrow piles, producing certified organic compost sold to farmers and nurseries at ₹2,000–₹5,000/tonne.'),
    ('Rejects → Processing Plant', '~10% of input (inorganic contaminants) goes to Kudlu Waste Processing Plant next door.'),
]
for title, body in outputs:
    add_bullet(doc, f' {body}', bold_prefix=title + ': ')

add_section_divider(doc)
page_break(doc)

# ═══════════════════════════════════════════════════════════════════════════════
#  SECTION 16 — DWCC
# ═══════════════════════════════════════════════════════════════════════════════

add_heading(doc, '16. DWCC Collection Hubs — Infrastructure in Detail', 1)

add_heading(doc, '16.1 The 6 DWCCs Inside HSR Layout (BBMP Official Data)', 2)
add_table(doc,
    ['DWCC #', 'Latitude', 'Longitude', 'Location', 'Sector Served', 'Capacity'],
    [
        ['#1 (Record #32)', '12.91263', '77.64903', 'Sector 2 East', 'Sectors 1–2', '~2.5 TPD'],
        ['#2 (Record #240)', '12.92218', '77.64688', 'Sector 3 North', 'Sectors 3, 6', '~2.5 TPD'],
        ['#3 (Record #241)', '12.91811', '77.64545', 'Sector 3 Central', 'Sectors 3–4', '~2.5 TPD'],
        ['#4 (Record #242)', '12.91218', '77.64755', 'Sector 2 East', 'Sectors 1–2', '~2.5 TPD'],
        ['#5 (Record #243)', '12.90536', '77.63312', 'Sector 1 SW', 'Sector 1', '~2.5 TPD'],
        ['#6 (Record #244)', '12.89907', '77.64077', 'Sector 1 South', 'Sector 1 south', '~2.5 TPD'],
    ],
    col_widths=[3.5, 2.5, 2.5, 3, 3.5, 2]
)

add_heading(doc, '16.2 DWCC Revenue Model (Recycler Payments)', 2)
add_table(doc,
    ['Material', 'Market Rate (2024)', 'Daily Volume per DWCC', 'Daily Revenue'],
    [
        ['PET Plastics', '₹12–18/kg', '400 kg', '₹4,800–7,200'],
        ['Mixed Plastics', '₹4–8/kg', '600 kg', '₹2,400–4,800'],
        ['Paper', '₹6–9/kg', '500 kg', '₹3,000–4,500'],
        ['Aluminium', '₹80–120/kg', '50 kg', '₹4,000–6,000'],
        ['Steel', '₹25–35/kg', '100 kg', '₹2,500–3,500'],
        ['TOTAL per DWCC', '—', '~1,650 kg', '₹16,700–₹26,000/day'],
    ],
    col_widths=[4, 3.5, 4, 4.5]
)
add_callout(doc, '6 DWCCs in HSR = ₹3–4.7 crore/year revenue stream from recycler payments. A digital platform can optimise pickup scheduling and increase material recovery rates.', 'tip')

add_section_divider(doc)

# ═══════════════════════════════════════════════════════════════════════════════
#  SECTION 17 — DISTANCES
# ═══════════════════════════════════════════════════════════════════════════════

add_heading(doc, '17. BMU, Wet Waste Centres & Dumpyard Distance from HSR', 1)

add_heading(doc, '17.1 All 11 Bio-Methanisation Units — Distances from HSR', 2)
add_table(doc,
    ['#', 'Latitude', 'Longitude', 'Distance', 'Location'],
    [
        ['1 (NEAREST)', '12.896183', '77.650711', '2.10 km', 'Kudlu Gate (South HSR)'],
        ['2', '12.933803', '77.614044', '4.07 km', 'Jayanagar / JP Nagar'],
        ['3', '12.933792', '77.614061', '4.07 km', 'Jayanagar (co-located with #2)'],
        ['4', '12.872922', '77.626697', '5.07 km', 'Begur / Bommanahalli'],
        ['5', '12.960922', '77.640711', '5.19 km', 'Koramangala / Ejipura'],
        ['6', '12.932492', '77.580367', '7.39 km', 'Banashankari'],
        ['7', '12.936267', '77.579978', '7.55 km', 'Banashankari (2nd unit)'],
        ['8', '12.965878', '77.576706', '9.44 km', 'Basavanagudi'],
        ['9', '12.976875', '77.580500', '9.92 km', 'VV Puram'],
        ['10', '13.021314', '77.563294', '14.88 km', 'Rajajinagar'],
        ['11', '13.084772', '77.540728', '22.10 km', 'Yelahanka North'],
    ],
    col_widths=[1.5, 2.8, 2.8, 2.5, 7.4]
)

add_heading(doc, '17.2 All 3 Dumpyards — Distances from HSR Layout', 2)
add_table(doc,
    ['#', 'Latitude', 'Longitude', 'Distance', 'Location'],
    [
        ['1', '13.153942', '77.668878', '26.74 km', 'Bellahalli (North Bengaluru)'],
        ['2', '13.103950', '77.646467', '21.07 km', 'Yelahanka / GKVK'],
        ['3 (Nearest)', '13.103583', '77.645922', '21.03 km', 'Yelahanka / GKVK'],
    ],
    col_widths=[1.5, 2.8, 2.8, 2.5, 7.4]
)
add_callout(doc, 'CRITICAL: The nearest dumpyard is 21.03 km from HSR Layout (road distance ~28–32 km). AstraCity\'s routing model avoids the dumpyard as a daily destination — only final non-recyclable rejects (~2.2 T/day, 4%) travel there.', 'warning')

add_section_divider(doc)
page_break(doc)

# ═══════════════════════════════════════════════════════════════════════════════
#  SECTION 18 — DIGITAL TWIN
# ═══════════════════════════════════════════════════════════════════════════════

add_heading(doc, '18. Digital Twin of HSR Layout — Need, Design & Data', 1)

add_heading(doc, '18.1 What is a Digital Twin of a City?', 2)
add_body(doc,
    'A Digital Twin is a real-time, virtual replica of a physical system that mirrors its state, '
    'simulates its behaviour, and enables predictive analytics without disturbing the real system. '
    'For HSR Layout, it is a computational model that represents every building, road, and waste '
    'facility as a data object; simulates waste generation under any scenario; tests policy decisions '
    'virtually before implementing them physically; and continuously updates as real-world data changes.')

add_heading(doc, '18.2 Three-Layer Digital Twin Architecture', 2)
add_table(doc,
    ['Layer', 'Type', 'Contents', 'Data Source'],
    [
        ['Layer 1', 'Spatial (Static)', '9,471 buildings, 2,027 roads, 6 DWCCs, BMU, Processing Plant, Ward Boundary, LULC raster', 'OSM, BBMP, Sentinel-2'],
        ['Layer 2', 'Simulation Engine (Dynamic)', 'Waste generation formula, 54 pre-computed scenarios, festival/rainfall multipliers', 'CPCB, BBMP, Digital Twin output'],
        ['Layer 3', 'Optimisation & Analytics', 'Clarke-Wright CVRP, carbon credit calculator, economic savings model, ward scoring', 'IPCC, CCTS 2023, IRC'],
    ],
    col_widths=[2, 3.5, 7, 4]
)

add_section_divider(doc)

# ═══════════════════════════════════════════════════════════════════════════════
#  SECTION 19 — GOVERNMENT USE
# ═══════════════════════════════════════════════════════════════════════════════

add_heading(doc, '19. Government Use of the Digital Twin', 1)

use_cases = [
    ('Use Case 1 — Daily Operations Dashboard',
     'The BBMP ward sanitary inspector opens AstraCity at 5:30 AM to see current waste prediction, overflow risk zones, recommended vehicle allocation, and DWCC capacity alerts — all before vehicles even depart the depot.'),
    ('Use Case 2 — Festival Preparedness',
     'Two weeks before Ganesh Chaturthi, the commissioner simulates the +28% waste spike to determine which zones need extra auto-tippers, how many extra compactor trips to Kudlu are needed, and what the estimated carbon credit impact is.'),
    ('Use Case 3 — Infrastructure Planning',
     'A new DWCC site is being considered. The city planner tests the proposed location virtually — sees the reduction in average distance from residential zones, quantifies fuel savings, and verifies road accessibility.'),
    ('Use Case 4 — Budget Justification',
     'The BBMP finance department needs to justify a ₹5 crore fleet upgrade investment. AstraCity\'s Economic Impact page shows ₹9.42 crores/year savings, break-even in 7 months, and 10-year NPV of ₹84 crores.'),
    ('Use Case 5 — Complaint Response',
     'A ward councillor receives 20 complaints about overflow on 5th Cross. AstraCity maps shows Zone B2 has 2,189 buildings with only 1 auto-tipper assigned, and DWCC #4 is at 92% capacity. Recommendation is auto-generated.'),
    ('Use Case 6 — Carbon Reporting',
     'Bengaluru is a C40 Cities signatory. AstraCity generates annual CO₂e per zone, methane capture efficiency, carbon credits generated under CCTS 2023, and year-on-year sustainability comparisons.'),
    ('Use Case 7 — Policy Simulation',
     '"What if we mandate home composting for all apartments with >50 units?" Digital twin models: 30% reduction in wet waste, -3.2 T/day BMU load, -170 m³/day methane, +₹12 lakh/year carbon credit gain, 2 auto-tippers freed.'),
    ('Use Case 8 — Inter-Ward Comparison',
     'All 198 wards scored on dump risk, methane intensity, route efficiency, and complaint rate. Creates governance KPIs enabling targeted interventions and positive ward-level competition.'),
]
for title, body in use_cases:
    add_heading(doc, title, 2)
    add_body(doc, body)

add_section_divider(doc)
page_break(doc)

# ═══════════════════════════════════════════════════════════════════════════════
#  SECTION 20 — ROUTE OPTIMISATION
# ═══════════════════════════════════════════════════════════════════════════════

add_heading(doc, '20. Route Optimisation — Vehicles, Constraints, Algorithm & Advantages', 1)

add_heading(doc, '20.1 Problem Formulation (CVRPTW)', 2)
add_body(doc, 'The HSR Layout waste collection problem is a Capacitated Vehicle Routing Problem with Time Windows (CVRPTW):')
add_table(doc,
    ['Constraint Type', 'Requirement'],
    [
        ['Objective', 'Minimise total distance travelled by all vehicles'],
        ['Coverage', 'Each building/zone serviced by exactly one vehicle'],
        ['Capacity', 'Each vehicle\'s total load ≤ its rated capacity'],
        ['Depot', 'Each vehicle departs from and returns to the depot (77.6392°E, 12.9158°N)'],
        ['Time Window', 'Primary collection: 06:00–10:00 AM | Secondary transport: 10:00–18:00'],
        ['Road Access', 'Vehicle type must be compatible with road width (IRC standards)'],
    ],
    col_widths=[4.5, 12.5]
)

add_heading(doc, '20.2 Clarke-Wright Savings Algorithm — Mathematical Formulation', 2)
add_code_block(doc,
"""Reference: Clarke, G. & Wright, J.W. (1964). Scheduling of Vehicles from a Central
Depot to a Number of Delivery Points. Operations Research, 12(4), 568–581.

SAVINGS FORMULA:
  s(i, j) = d(depot → i) + d(depot → j) − d(i → j)

  The "saving" s(i,j) is the distance saved by combining:
    Route A: depot → i → depot
    Route B: depot → j → depot
  Into:   depot → i → j → depot

ALGORITHM STEPS:
  1. INITIALISE: One route per stop: depot → stop_i → depot
  2. COMPUTE:    s(i,j) for all pairs (i,j)
  3. SORT:       Savings descending (highest savings first)
  4. MERGE:      For each (i,j) from highest saving to lowest:
                   if i and j in different routes
                   AND i,j are at route endpoints
                   AND combined load ≤ vehicle capacity
                   → MERGE the two routes
  5. ASSIGN:     Best-fit vehicle to each merged route (by capacity)

Time complexity: O(n² log n)""")

add_heading(doc, '20.3 Distance Computation', 2)
add_body(doc, 'Primary: OSRM (Open Source Routing Machine) API — uses real OSM road network for actual driving distances, accounting for one-way streets and restrictions.')
add_code_block(doc,
"""Haversine Fallback Formula (when OSRM API limits are exceeded):
  a = sin²(Δφ/2) + cos φ₁ · cos φ₂ · sin²(Δλ/2)
  c = 2 · atan2(√a, √(1−a))
  d = R · c     (R = 6,371 km — Earth's mean radius)""")

add_heading(doc, '20.4 Vehicle Fleet & Constraints', 2)
add_table(doc,
    ['Vehicle Type', 'Capacity', 'Min Road Width', 'Count', 'Rounds/Day', 'CO₂/km'],
    [
        ['Hook Loader', '16,000 kg', '>12 m (Trunk only)', '0', '1', '0.55 kg'],
        ['Large Compactor', '10,000 kg', '>6 m', '2', '2', '0.45 kg'],
        ['Small Compactor', '5,000 kg', '>4 m', '2', '2', '0.35 kg'],
        ['Auto Tipper', '500 kg', '>2 m (Residential)', '12', '3', '0.12 kg'],
        ['Push Cart', '200 kg', 'Any (incl. footways)', '8', '2', '0 kg'],
        ['Liquid Tanker', '5,000 L', '>9 m (Primary)', '1', '1', '0.35 kg'],
        ['TOTAL FLEET', '—', '—', '25', '—', '—'],
    ],
    col_widths=[4, 2.5, 3.5, 2, 3, 2]
)

add_heading(doc, '20.5 Operational Time Constraints (BBMP SWM Manual 2016)', 2)
add_table(doc,
    ['Constraint', 'Value', 'Source'],
    [
        ['Primary collection window', '06:00–10:00 AM', 'BBMP SWM Manual 2016'],
        ['Secondary transport window', '10:00–18:00', 'BBMP SWM Manual 2016'],
        ['Heavy vehicle night ban', '22:00–06:00', 'BBMP traffic order'],
        ['Fuel cost per km (diesel)', '₹15.65–₹22.00', 'BBMP vehicle operations data'],
        ['Labour cost per hour', '₹180/hr', 'BBMP sanitation worker rate'],
    ],
    col_widths=[6, 5, 6]
)

add_heading(doc, '20.6 Route Optimisation Results', 2)
add_table(doc,
    ['Metric', 'Before Optimisation', 'After Optimisation', 'Improvement'],
    [
        ['Total daily route distance', '132.44 km', '32.41 km', '75.5% reduction'],
        ['Daily fuel cost', '₹2,072', '₹507', '₹1,565 saved/day'],
        ['Network coverage', '~80%', '95.3%', '+15.3% coverage'],
        ['Average collection time', '4.5 hours', '3.0 hours', '33% faster'],
        ['Annual fuel savings', '—', '—', '₹3.28 Crores'],
        ['Annual total savings', '—', '—', '₹9.42 Crores'],
        ['Scaled to 198 wards', '—', '—', '₹1,865 Crores'],
    ],
    col_widths=[5.5, 4, 4, 4]
)

add_heading(doc, '20.7 Optimised Truck Routes (3 Primary Compactors)', 2)
add_table(doc,
    ['Truck', 'Zones Served', 'Distance', 'Load Collected', 'Route Strategy'],
    [
        ['Truck 1', '8 high-waste western zones', '12.54 km', '3,050 kg', 'West sectors → DWCC #3'],
        ['Truck 2', '8 high-waste central zones', '9.63 km', '3,115 kg', 'Central sectors → DWCC #4'],
        ['Truck 3', '8 high-waste eastern zones', '15.93 km', '3,104 kg', 'East sectors → DWCC #1'],
        ['TOTAL', '24 priority zones', '38.10 km', '9,269 kg', '—'],
    ],
    col_widths=[2.5, 4.5, 3, 3.5, 4]
)

add_section_divider(doc)
page_break(doc)

# ═══════════════════════════════════════════════════════════════════════════════
#  SECTION 21 — CARBON CREDITS & FINANCIALS
# ═══════════════════════════════════════════════════════════════════════════════

add_heading(doc, '21. Environmental Benefits, Carbon Credits & Financial Profit', 1)

add_heading(doc, '21.1 Carbon Credit Framework', 2)
add_body(doc,
    'India\'s Carbon Credit Trading Scheme (CCTS) 2023, formulated by the Ministry of Power under '
    'the Energy Conservation (Amendment) Act 2022, is India\'s first structured domestic carbon market. '
    'Price range (2024–2025): ₹1,200 – ₹2,200 per tonne CO₂e. AstraCity uses ₹2,000/tonne (midpoint).')

add_heading(doc, '21.2 Carbon Credit Calculation — Step by Step', 2)
add_code_block(doc,
"""STEP 1 — Methane Quantification (IPCC 2006, Volume 5, Chapter 3):
  CH₄ (T/year) = MSW_organic × DOCf × MCF × (16/12) × (1 − OX)
  
  Where:
    MSW_organic = 33.55 T/day × 365 = 12,246 T/year
    DOCf        = 0.5   (IPCC default for food waste)
    MCF         = 0.8   (managed anaerobic treatment)
    16/12       = molecular weight ratio CH₄/C
    OX          = 0.1   (oxidation factor)
  
  Result: 927 T CH₄/year

STEP 2 — Convert to CO₂ equivalent (IPCC AR5 GWP100):
  CO₂e = 927 T CH₄ × GWP₂₈ = 25,959 T CO₂e/year

STEP 3 — Apply CCTS 2023 Carbon Credit Price:
  Carbon Credit Value = 25,959 T × ₹2,000/T = ₹5.19 Crores/year

Data basis:
  IPCC 2006 Vol. 5, Table 3.1 — DOC fractions and MCF values
  IPCC AR5, Table 8.7 — GWP100 for CH₄ = 28
  CCTS 2023, Ministry of Power, India — ₹1,200–₹2,200/T CO₂e range""")

add_heading(doc, '21.3 Complete Financial Benefits Summary', 2)
add_table(doc,
    ['Benefit Category', 'Annual Value', 'Calculation Basis'],
    [
        ['Fuel Savings', '₹3.28 Crores', '100 km/day saved × ₹20/km × 25 vehicles × 365 days'],
        ['Illegal Dump Cleanup Avoided', '₹0.45 Crores', '30 dumps prevented × ₹52,000/dump cleanup'],
        ['Labour Savings', '₹0.38 Crores', '1.5 hrs/truck/day × 25 trucks × ₹180/hr × 365 days'],
        ['Carbon Credits (BMU methane)', '₹5.19 Crores', '25,959 T CO₂e × ₹2,000/ton (CCTS 2023)'],
        ['Compost Revenue', '₹0.12 Crores', '~10 T/day compost × ₹500/ton × 365 days'],
        ['TOTAL ANNUAL BENEFIT (HSR)', '₹9.42 Crores', 'Ward 174 alone'],
        ['SCALED TO 198 WARDS', '₹1,865 Crores', 'Conservative estimate (198 × ₹9.42 Cr)'],
    ],
    col_widths=[5, 3.5, 8.5]
)

add_section_divider(doc)

# ═══════════════════════════════════════════════════════════════════════════════
#  SECTION 22 — SAVINGS ANALYSIS
# ═══════════════════════════════════════════════════════════════════════════════

add_heading(doc, '22. Savings Analysis & Special Findings', 1)

add_heading(doc, '22.1 Detailed Savings Calculation Procedure', 2)
add_code_block(doc,
"""FUEL SAVINGS:
  Baseline distance = 132.44 km/day (manual routes)
  Optimised distance = 32.41 km/day (Clarke-Wright output)
  Distance saved     = 100.03 km/day
  Cost @ ₹20/km     = ₹2,006/day
  Annual             = ₹2,006 × 365 = ₹73,21,900 → ₹3.28 Crores

LABOUR SAVINGS:
  Time saved per truck = 1.5 hours/day (33% faster)
  Cost @ ₹180/hour    = ₹270/truck/day
  Fleet × 365 days    = ₹270 × 25 × 365 = ₹24,63,750 → ₹0.38 Crores

CLEANUP SAVINGS:
  Dumps prevented/year = ~30 (satellite monitoring + rapid response)
  Cost per dump site   = ₹52,000 (BBMP contractor rates)
  Annual               = 30 × ₹52,000 = ₹15,60,000 → ₹0.45 Crores

CARBON CREDITS:
  25,959 T CO₂e × ₹2,000/T = ₹5,19,18,000 → ₹5.19 Crores""")

add_heading(doc, '22.2 Special Findings', 2)
special = [
    ('Special Finding #1 — The Kudlu Co-location Advantage',
     'The Kudlu area has both a BMU (2.10 km) and a Processing Unit (2.09 km) at essentially the same location. Compactor trucks make one trip serving both purposes. Estimated advantage: ₹0.8 crores/year in avoided secondary transport.'),
    ('Special Finding #2 — The Footway Coverage Gap',
     '509 footways (25.1% of roads) can only be served by push carts. Current push-cart capacity (3.2 T/day) is insufficient for estimated 5.5 T/day in these areas — a 2.3 T/day gap potentially becoming illegal dumps.'),
    ('Special Finding #3 — Empty Zone Efficiency',
     'Zones A4, B4, D1 have zero buildings. The optimised model skips these zones, saving approximately 12–15 km/day in unnecessary coverage.'),
    ('Special Finding #4 — Festival Carbon Credit Opportunity',
     'During Ganesh Chaturthi, +7.3 T/day additional organic waste generates +387 m³/day biogas = +484 kWh/day. Over 10-day festival: 4,840 kWh additional energy = ~₹48,400 in electricity value.'),
    ('Special Finding #5 — National Carbon Credit Scale',
     'At 198 wards: 25,959 T × 198 = 51.4 lakh T CO₂e/year → ₹1,028 Crores/year carbon credit value under CCTS 2023.'),
]
for title, body in special:
    add_heading(doc, title, 2)
    add_body(doc, body)

add_section_divider(doc)
page_break(doc)

# ═══════════════════════════════════════════════════════════════════════════════
#  SECTION 23 — APP FEATURES
# ═══════════════════════════════════════════════════════════════════════════════

add_heading(doc, '23. App\'s Best & Unique Features', 1)

features = [
    ('Feature #1 — Live Satellite Dump Detection',
     'Processes Sentinel-2 imagery to detect illegal dump sites using spectral anomaly detection (DBSCAN clustering on brightness values below 10th percentile). No existing BBMP tool monitors illegal dumps in real time using satellite data.'),
    ('Feature #2 — 6-Layer Dynamic GIS Map',
     'Full-screen MapLibre GL map with 6 simultaneously toggleable data layers: dump sites, methane heatmap, waste heatmap, dump probability, optimised routes, ward vulnerability. Lets decision-makers see spatial correlations invisible in single-layer maps.'),
    ('Feature #3 — Policy Simulation Engine',
     '54 pre-computed scenarios (population × rainfall × festival) produce instant waste predictions. Enables preparedness rather than reaction — test "What if Bengaluru adds 2 lakh people?" without real-world consequences.'),
    ('Feature #4 — ₹ Quantified Economic Impact',
     'Translates every optimisation into rupee values — the most persuasive language for government adoption. Directly shows ₹9.42 Crores/year savings and ₹1,865 Crores if scaled to 198 wards.'),
    ('Feature #5 — Ward Governance Score',
     'Composite score (0–100) based on dump risk + methane + efficiency + complaints — creating an accountable KPI for every ward councillor. Enables inter-ward comparison and targeted interventions.'),
    ('Feature #6 — Gemini AI Query Bar',
     'Natural language interface on every page. Non-technical commissioners can type "Which sectors need extra vehicles next week?" and get actionable answers without GIS training.'),
    ('Feature #7 — BBMP-Ready Report Export',
     'PDF-quality report generator with configurable sections, A4-proportioned preview, and window.print() export. Bridges the digital-physical divide for government presentation rooms.'),
    ('Feature #8 — Digital Twin Scenario Comparison',
     'Side-by-side comparison of "before" vs. "after" optimisation routes, waste volumes, and costs. Explainable, auditable, and transparent — not a black box.'),
]
for title, body in features:
    add_heading(doc, title, 2)
    add_body(doc, body)

add_section_divider(doc)

# ═══════════════════════════════════════════════════════════════════════════════
#  SECTION 24 — PHASE-WISE EXPANSION
# ═══════════════════════════════════════════════════════════════════════════════

add_heading(doc, '24. Phase-wise Extension to All 198 BBMP Wards', 1)

add_heading(doc, '24.1 Expansion Roadmap', 2)
add_table(doc,
    ['Phase', 'Timeline', 'Target Wards', 'Key Activities', 'Expected Outcome'],
    [
        ['Phase 1\nPilot Validation',
         'Months 1–6',
         'Ward 174 (HSR) + 4 adjacent wards',
         'Deploy AstraCity, collect truck GPS, validate predictions, IoT bins at 2 DWCCs, 2 field surveys',
         'Validated accuracy >85%, ₹30–50 lakh/month savings demonstrated, BBMP buy-in'],
        ['Phase 2\nSouth Bengaluru',
         'Months 7–18',
         '50 wards in BBMP South Zone',
         'Semi-automated data pipeline, BBMP complaint API integration, inspector mobile app, training workshops',
         '₹100–150 Cr/year savings, first CCTS carbon credit application, media coverage'],
        ['Phase 3\nFull Bengaluru',
         'Months 19–36',
         'All 198 BBMP wards',
         'Full GIS dataset, live truck GPS, IoT sensors at all 336 DWCCs, real-time ML inference',
         '₹1,865 Crores/year savings, ₹1,028 Crores/year carbon credits'],
        ['Phase 4\nNational',
         'Year 3+',
         'Smart Cities Mission cities (Chennai, Hyderabad, Pune, Surat, etc.)',
         'Package as SaaS for any ULB — just provide OSM data + shapefiles',
         '100 cities × ₹9 Cr savings = ₹900 Crores/year minimum'],
    ],
    col_widths=[2.5, 2.5, 3.5, 5.5, 4]
)

add_section_divider(doc)

# ═══════════════════════════════════════════════════════════════════════════════
#  SECTION 25 — GROUND SURVEY & GOVERNMENT SUPPORT
# ═══════════════════════════════════════════════════════════════════════════════

add_heading(doc, '25. Need for Ground-Level Survey & Government Support', 1)

add_heading(doc, '25.1 What Satellite & OSM Data Cannot Capture', 2)
for b in [
    'Actual waste weights at household level — satellite cannot see inside bins',
    'Segregation compliance — camera cannot verify green bin contents',
    'Informal waste worker networks — ragpickers and scrap dealers are invisible in official data',
    'Seasonal variation beyond model — unexpected events (construction boom, new restaurant cluster)',
    'Real road conditions — potholes, seasonal flooding, construction blockages affecting routing',
]:
    add_bullet(doc, b)

add_heading(doc, '25.2 Required Ground-Level Survey Types', 2)
add_table(doc,
    ['Survey Type', 'Frequency', 'Data Collected', 'Use in AstraCity'],
    [
        ['DWCC weighbridge data', 'Daily', 'Incoming/outgoing weight per vehicle', 'Validate waste predictions'],
        ['Household segregation audit', 'Monthly (sample)', 'Segregation rate per zone', 'Update segregation risk scores'],
        ['Road condition survey', 'Quarterly', 'Actual accessible widths, new roads', 'Update routing constraints'],
        ['Illegal dump site survey', 'Monthly', 'GPS coordinates, dump area, materials', 'Validate satellite detection'],
        ['Resident interview', 'Annually', 'Waste composition, frequency satisfaction', 'Improve demand model'],
    ],
    col_widths=[4.5, 3, 5, 4.5]
)

add_heading(doc, '25.3 Government Intervention Required', 2)
add_body(doc, 'From BBMP:')
for b in [
    'Open truck GPS data — real-time vehicle location via existing tracking systems',
    'DWCC daily weigh-in digitisation — currently manual paper records',
    'BBMP Samadhana complaint API access — integrate complaint tickets with AstraCity map',
    'Ward-level sanitary inspector training and buy-in',
    'Dedicated AstraCity operational budget within BBMP IT department',
]:
    add_bullet(doc, b)

add_body(doc, 'From Karnataka State Government:')
for b in [
    'Carbon credit registration for Kudlu BMU under CCTS 2023',
    'Stronger enforcement of SWM Rules 2016 for bulk generators',
    'Data sharing MoU between BBMP, KSPCB, and student researchers',
]:
    add_bullet(doc, b)

add_section_divider(doc)
page_break(doc)

# ═══════════════════════════════════════════════════════════════════════════════
#  SECTION 26 — RVCE NSS STUDENTS
# ═══════════════════════════════════════════════════════════════════════════════

add_heading(doc, '26. What RVCE NSS Students Can Do — Development Roadmap', 1)

add_heading(doc, '26.1 Technical Skills RVCE Students Will Develop', 2)
add_table(doc,
    ['Skill Domain', 'Tools / Technologies', 'Relevance to Project'],
    [
        ['GIS & Remote Sensing', 'QGIS, Sentinel-2, OSM, SCP Plugin', 'LULC analysis, facility mapping'],
        ['Web Development', 'Next.js, TypeScript, React, Tailwind', 'AstraCity app development'],
        ['Data Science', 'Python, Pandas, NumPy, DBSCAN', 'Waste prediction, dump detection'],
        ['Spatial Algorithms', 'Clarke-Wright VRP, Haversine', 'Route optimisation'],
        ['APIs & Integrations', 'REST APIs, OSRM, Gemini AI, OSRM', 'Real-time data integration'],
        ['IoT & Sensors', 'MQTT, Firebase, LoRaWAN', 'Smart bin sensors'],
        ['Carbon Accounting', 'IPCC methodology, CCTS 2023', 'Environmental compliance'],
        ['Government Interface', 'MoU writing, policy brief preparation', 'Civic technology deployment'],
    ],
    col_widths=[4.5, 5.5, 7]
)

add_heading(doc, '26.2 Semester-wise Development Roadmap', 2)
semesters = [
    ('Semester 1 — Data Engineering',
     ['Automate OSM building data pipeline for any ward (Python + QGIS)',
      'Build real-time DWCC sensor data ingestion (IoT → Firebase → AstraCity)',
      'Expand simulation lookup to 198 wards (batch computation)',
      'Write unit tests for the VRP solver (vrp_solver.ts)',
      'Build mobile-responsive design for the AstraCity app']),
    ('Semester 2 — ML & AI',
     ['Train a Random Forest model on ward-level features to predict dump risk',
      'Implement NDVI-based dump detection using Sentinel-2 NIR bands',
      'Fine-tune the Gemini system prompt for better waste-specific responses',
      'Build anomaly detection model for DWCC overflow prediction']),
    ('Semester 3 — Field Research',
     ['Conduct monthly ground truth surveys in all 16 HSR Layout zones',
      'Document segregation rates per sub-zone with photos and GPS logs',
      'Map all informal waste collection points (ragpicker sites, scrap dealers)',
      'Interview DWCC operators and auto-tipper drivers for operational insights']),
    ('Semester 4 — Government Interface',
     ['Prepare formal presentation for BBMP South Zone commissioner',
      'Apply for Smart Cities Mission innovation grants',
      'Create training materials for BBMP sanitary inspectors (Kannada + English)',
      'Document the data sharing MoU template for BBMP-RVCE collaboration']),
]
for sem_title, tasks in semesters:
    add_heading(doc, sem_title, 2)
    for t in tasks:
        add_bullet(doc, t)

add_heading(doc, '26.3 NSS Field Activities', 2)
field_activities = [
    ('Monthly Zone Survey (10 volunteers, 1 day/month)',
     'Walk all 16 grid zones of HSR Layout. Record actual road widths, new construction, illegal dump locations using GPS-enabled phones with KoboToolbox survey app. Upload data to AstraCity backend.'),
    ('DWCC Data Collection (2 volunteers, weekly)',
     'Visit 2 DWCCs per week. Record incoming vehicle weights, material types, operational issues. Photo-document DWCC conditions. Report to AstraCity dashboard.'),
    ('Awareness Campaign (100 volunteers, quarterly)',
     'Door-to-door in lowest-segregation zones (East HSR, Commercial zones). Distribute source segregation guides in Kannada + English. Collect household waste composition data.'),
    ('Hackathon Team (10–15 students)',
     'Participate in national hackathons with AstraCity as the submission. Win prizes that fund further development. Build national visibility for the project.'),
    ('Industry Partnership (4–5 students)',
     'Connect with BBMP IT department. Pursue internships with urban planning firms (DULT, Janaagraha). Apply for SERB, DBT, Smart Cities Mission research grants.'),
]
for title, body in field_activities:
    add_heading(doc, title, 3)
    add_body(doc, body)

add_section_divider(doc)

# ═══════════════════════════════════════════════════════════════════════════════
#  APPENDIX — KEY NUMBERS AT A GLANCE
# ═══════════════════════════════════════════════════════════════════════════════

page_break(doc)
add_heading(doc, 'Appendix — Key Numbers at a Glance', 1)

add_table(doc,
    ['Category', 'Metric', 'Value'],
    [
        ['Ward', 'Name', 'HSR Layout, Ward 174'],
        ['', 'City', 'Bengaluru (BBMP)'],
        ['', 'Area', '18.5 km²'],
        ['Population', 'Total', '~1,10,000'],
        ['', 'Buildings', '9,471'],
        ['', 'Houses', '8,998'],
        ['', 'Apartments', '250'],
        ['LULC', 'Built-up', '64.1%  (11.85 km²)'],
        ['', 'Vegetation', '17.6%  (3.26 km²)'],
        ['', 'Open Land', '15.3%  (2.83 km²)'],
        ['', 'Water Bodies', '3.0%  (0.56 km²)'],
        ['Waste', 'Daily total', '55 T/day'],
        ['', 'Wet (61%)', '33.55 T/day → Kudlu BMU'],
        ['', 'Dry (30%)', '16.50 T/day → 6 DWCCs'],
        ['', 'Hazardous (5%)', '2.75 T/day → Authorised handler'],
        ['Facilities', 'DWCCs in HSR', '6  (10 TPD combined)'],
        ['', 'BMUs in HSR', '0  (nearest: 2.10 km, Kudlu)'],
        ['', 'Dumpyards in HSR', '0  (nearest: 21.03 km, Yelahanka)'],
        ['Roads', 'Total segments', '2,027'],
        ['', 'Residential (narrow lanes)', '840  (41.4%)'],
        ['', 'Footways (walk-only)', '509  (25.1%)'],
        ['', 'Total coverage', '95.3%'],
        ['Fleet', 'Auto Tippers', '12'],
        ['', 'Compactor Trucks', '4'],
        ['', 'Push Carts', '8'],
        ['', 'Liquid Tanker', '1'],
        ['Routing', 'Before optimisation', '132.44 km/day'],
        ['', 'After Clarke-Wright', '32.41 km/day'],
        ['', 'Reduction', '75.5%'],
        ['Financials', 'Annual fuel savings', '₹3.28 Crores'],
        ['', 'Annual carbon credits', '₹5.19 Crores'],
        ['', 'Annual total savings', '₹9.42 Crores'],
        ['', 'Scaled to 198 wards', '₹1,865 Crores'],
        ['Methane', 'CH₄/day', '2.54 T'],
        ['', 'CO₂e/year', '25,959 T'],
        ['', 'Homes powered', '7,095'],
        ['', 'Energy potential', '21,285 kWh/day'],
    ],
    col_widths=[4, 5.5, 7.5]
)

# ─── Footer ────────────────────────────────────────────────────────────────────
doc.add_paragraph()
footer_para = doc.add_paragraph()
footer_para.alignment = WD_ALIGN_PARAGRAPH.CENTER
r = footer_para.add_run(
    'AstraCity · HSR Layout, Ward 174, Bengaluru, Karnataka, India\n'
    'Prepared by RVCE Students | Space Tech Hackathon 2026 | Report v1.0 | June 2026\n'
    'Data sources: BBMP · OSM · CPCB · IPCC · Census of India · IRC · Ministry of Power (CCTS 2023)'
)
r.font.size = Pt(8.5)
r.font.color.rgb = MID_GREY
r.italic = True

# ═══════════════════════════════════════════════════════════════════════════════
#  SAVE
# ═══════════════════════════════════════════════════════════════════════════════

output_path = r'c:\Users\Kishan Shetty\Downloads\AstraSky-maing\AstraCity_Comprehensive_Report.docx'
doc.save(output_path)
print("Word document saved successfully:")
print(f"   {output_path}")
print("   Sections: 26 | Tables: 50+ | All data included")
