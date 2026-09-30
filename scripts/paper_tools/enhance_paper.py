"""
Enhance Paper.docx:
  - Apply proper heading styles (Heading 1, 2, 3) to section titles
  - Add professional tables summarizing key data from the text
  - Improve overall document formatting (fonts, spacing, borders)
  
  CRITICAL: No text is changed — only formatting and table insertions.
"""

import copy
from docx import Document
from docx.shared import Inches, Pt, Cm, RGBColor, Emu
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.enum.section import WD_ORIENT
from docx.oxml.ns import qn, nsdecls
from docx.oxml import parse_xml
import re

doc = Document('Paper.docx')

# ──────────────────────────────────────────────────────────
# 1.  SECTION / PAGE SETUP
# ──────────────────────────────────────────────────────────
for section in doc.sections:
    section.top_margin = Cm(2.54)
    section.bottom_margin = Cm(2.54)
    section.left_margin = Cm(2.54)
    section.right_margin = Cm(2.54)

# ──────────────────────────────────────────────────────────
# 2.  APPLY HEADING STYLES  (text untouched)
# ──────────────────────────────────────────────────────────

# Map paragraph index → desired style
heading_map = {
    0:  'Title',        # Abstract (title)
    2:  'Heading 1',    # 1. Introduction
    3:  'Heading 2',    # 1.1 ...
    6:  'Heading 2',    # 1.2 ...
    9:  'Heading 2',    # 1.3 ...
    11: 'Heading 1',    # 2. Literature Review
    12: 'Heading 2',    # 2.1 ...
    14: 'Heading 2',    # 2.2 ...
    16: 'Heading 2',    # 2.3 ...
    18: 'Heading 2',    # 2.4 CVRP
    20: 'Heading 2',    # 2.5 ...
    22: 'Heading 1',    # 3. Study Area
    23: 'Heading 2',    # 3.1 ...
    25: 'Heading 2',    # 3.2 ...
    31: 'Heading 1',    # 4. Methodology
    32: 'Heading 2',    # 4.1 ...
    43: 'Heading 2',    # 4.2 ...
    46: 'Heading 2',    # 4.3 ...
    49: 'Heading 2',    # 4.4 ...
    53: 'Heading 2',    # 4.5 ...
    57: 'Heading 2',    # 4.7/4.8 ...
    59: 'Heading 1',    # 5. Results
    60: 'Heading 2',    # 5.1 ...
    62: 'Heading 2',    # 5.2 ...
    64: 'Heading 2',    # 5.3 ...
    66: 'Heading 2',    # 5.4 ...
    68: 'Heading 2',    # 5.5 ...
    70: 'Heading 2',    # 5.6 ...
    72: 'Heading 2',    # 5.7 ...
    74: 'Heading 1',    # 6. Discussion
    75: 'Heading 2',    # 6.1 ...
    77: 'Heading 2',    # 6.2 ...
    79: 'Heading 2',    # 6.3 ...
    81: 'Heading 2',    # 6.4 ...
    83: 'Heading 2',    # 6.5 ...
    85: 'Heading 1',    # 7. AstraCity Platform
    86: 'Heading 2',    # 7.1 ...
    88: 'Heading 2',    # 7.2 ...
    90: 'Heading 1',    # 8. Proposed Extension
    92: 'Heading 1',    # 9. Conclusion
}

for idx, style_name in heading_map.items():
    doc.paragraphs[idx].style = doc.styles[style_name]

# ──────────────────────────────────────────────────────────
# 3.  BODY TEXT FORMATTING  (text untouched)
# ──────────────────────────────────────────────────────────
for i, para in enumerate(doc.paragraphs):
    if para.style.name == 'Normal' and para.text.strip():
        pf = para.paragraph_format
        pf.space_after = Pt(6)
        pf.space_before = Pt(3)
        pf.line_spacing = 1.15
        # Justify body text
        pf.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        for run in para.runs:
            run.font.name = 'Times New Roman'
            run.font.size = Pt(12)

# ──────────────────────────────────────────────────────────
# 4.  HEADING STYLE DEFINITIONS
# ──────────────────────────────────────────────────────────
# Heading 1
h1 = doc.styles['Heading 1']
h1.font.name = 'Times New Roman'
h1.font.size = Pt(16)
h1.font.bold = True
h1.font.color.rgb = RGBColor(0x1A, 0x23, 0x7E)  # Deep navy
h1.paragraph_format.space_before = Pt(24)
h1.paragraph_format.space_after = Pt(12)
h1.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.LEFT

# Heading 2
h2 = doc.styles['Heading 2']
h2.font.name = 'Times New Roman'
h2.font.size = Pt(13)
h2.font.bold = True
h2.font.italic = True
h2.font.color.rgb = RGBColor(0x2C, 0x3E, 0x8C)  # Slightly lighter navy
h2.paragraph_format.space_before = Pt(18)
h2.paragraph_format.space_after = Pt(8)
h2.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.LEFT

# Title
title_style = doc.styles['Title']
title_style.font.name = 'Times New Roman'
title_style.font.size = Pt(18)
title_style.font.bold = True
title_style.font.color.rgb = RGBColor(0x0D, 0x14, 0x5A)
title_style.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.CENTER
title_style.paragraph_format.space_after = Pt(18)


# ──────────────────────────────────────────────────────────
# HELPER – create a beautifully-formatted table
# ──────────────────────────────────────────────────────────
HEADER_BG   = '1A237E'   # Deep navy
HEADER_FG   = 'FFFFFF'   # White text
ALT_ROW_BG  = 'E8EAF6'   # Lavender tint
BORDER_CLR  = '3949AB'   # Mid-blue

def set_cell_border(cell, **kwargs):
    """Set cell border. Provide kwargs like top, bottom, start, end with dict of val, sz, color."""
    tc = cell._tc
    tcPr = tc.get_or_add_tcPr()
    tcBorders = parse_xml(f'<w:tcBorders {nsdecls("w")}>'
                          '</w:tcBorders>')
    for edge, attrs in kwargs.items():
        tag = edge if edge in ('top', 'bottom', 'start', 'end') else edge
        element = parse_xml(
            f'<w:{tag} {nsdecls("w")} w:val="{attrs.get("val", "single")}" '
            f'w:sz="{attrs.get("sz", "4")}" w:space="0" '
            f'w:color="{attrs.get("color", BORDER_CLR)}"/>'
        )
        tcBorders.append(element)
    tcPr.append(tcBorders)


def set_cell_shading(cell, color_hex):
    shading = parse_xml(
        f'<w:shd {nsdecls("w")} w:fill="{color_hex}" w:val="clear"/>'
    )
    cell._tc.get_or_add_tcPr().append(shading)


def make_table(doc, headers, rows, caption, insert_after_para_idx,
               col_widths=None, bold_first_col=False):
    """Insert a captioned, styled table AFTER the given paragraph index."""
    body = doc.element.body
    ref_para = doc.paragraphs[insert_after_para_idx]._element

    # ── Caption paragraph ──
    caption_p = parse_xml(
        f'<w:p {nsdecls("w")}>'
        f'  <w:pPr>'
        f'    <w:jc w:val="center"/>'
        f'    <w:spacing w:before="240" w:after="120"/>'
        f'  </w:pPr>'
        f'  <w:r>'
        f'    <w:rPr><w:b/><w:i/><w:sz w:val="22"/>'
        f'      <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>'
        f'      <w:color w:val="1A237E"/>'
        f'    </w:rPr>'
        f'    <w:t xml:space="preserve">{caption}</w:t>'
        f'  </w:r>'
        f'</w:p>'
    )
    ref_para.addnext(caption_p)

    # ── Build the table ──
    n_cols = len(headers)
    n_rows = len(rows) + 1  # +1 for header
    tbl = doc.add_table(rows=n_rows, cols=n_cols)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl.autofit = True

    # Header row
    for j, hdr in enumerate(headers):
        cell = tbl.cell(0, j)
        cell.text = ''
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        run = p.add_run(hdr)
        run.bold = True
        run.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
        run.font.name = 'Times New Roman'
        run.font.size = Pt(10)
        set_cell_shading(cell, HEADER_BG)
        border_args = dict(
            top=dict(val='single', sz='6', color=BORDER_CLR),
            bottom=dict(val='single', sz='6', color=BORDER_CLR),
            start=dict(val='single', sz='4', color=BORDER_CLR),
            end=dict(val='single', sz='4', color=BORDER_CLR),
        )
        set_cell_border(cell, **border_args)

    # Data rows
    for i, row_data in enumerate(rows):
        for j, val in enumerate(row_data):
            cell = tbl.cell(i + 1, j)
            cell.text = ''
            p = cell.paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER if j > 0 else WD_ALIGN_PARAGRAPH.LEFT
            run = p.add_run(str(val))
            run.font.name = 'Times New Roman'
            run.font.size = Pt(10)
            if bold_first_col and j == 0:
                run.bold = True
            # Alternate row shading
            if i % 2 == 0:
                set_cell_shading(cell, ALT_ROW_BG)
            border_args = dict(
                top=dict(val='single', sz='4', color=BORDER_CLR),
                bottom=dict(val='single', sz='4', color=BORDER_CLR),
                start=dict(val='single', sz='4', color=BORDER_CLR),
                end=dict(val='single', sz='4', color=BORDER_CLR),
            )
            set_cell_border(cell, **border_args)

    # Column widths
    if col_widths:
        for i_row in range(n_rows):
            for j, w in enumerate(col_widths):
                tbl.cell(i_row, j).width = Cm(w)

    # Move table element to right after caption
    tbl_element = tbl._tbl
    body = doc.element.body
    body.remove(tbl_element)
    caption_p.addnext(tbl_element)

    return tbl


# ──────────────────────────────────────────────────────────
# 5.  INSERT TABLES  (data extracted from existing text)
# ──────────────────────────────────────────────────────────

# ── TABLE 1: LULC Classification Results (after para 61, section 5.1) ──
make_table(
    doc,
    headers=['LULC Class', 'Area (km²)', 'Ward Coverage (%)', 'Key Features'],
    rows=[
        ['Built-up',     '11.85', '64.1%', 'Houses, apartments, commercial buildings'],
        ['Vegetation',   '3.26',  '17.6%', 'Parks, avenue trees, private gardens'],
        ['Open Land',    '2.83',  '15.3%', 'Vacant plots, construction sites'],
        ['Water Bodies',  '0.56',  '3.0%',  'Agara Lake, HSR Layout Lake, drainage'],
    ],
    caption='Table 1: LULC Classification Results for HSR Layout (Ward 174)',
    insert_after_para_idx=61,
    col_widths=[3.5, 2.5, 3, 6],
    bold_first_col=True,
)

# ── TABLE 2: Road Network Classification (after para 65, section 5.3) ──
# Note: para indices shift after each table insertion.  After Table 1
# we inserted 2 elements (caption + table), but paragraph indices
# are re-read from doc.paragraphs which still work with element order.
# However, we use the *original* indices and the helper inserts after
# the paragraph *element*, so later inserts just need correct original idx.

make_table(
    doc,
    headers=['Road Category', 'Width', 'Segments', 'Share (%)', 'Suitable Vehicle'],
    rows=[
        ['Wide roads',   '≥ 4 m',  '352',   '17.4%', 'Conventional truck'],
        ['Medium roads', '2–4 m',  '1,019', '50.3%', 'Auto-tipper'],
        ['Footways',     '< 2 m',  '560',   '27.6%', 'Push cart only'],
        ['Unserviceable','—',      '96',    '4.7%',  'None (inaccessible)'],
    ],
    caption='Table 2: Road Network Classification — HSR Layout',
    insert_after_para_idx=65,
    col_widths=[3, 2, 2, 2, 4],
    bold_first_col=True,
)

# ── TABLE 3: Waste Generation Scenarios (after para 67, section 5.4) ──
make_table(
    doc,
    headers=['Scenario', 'Condition', 'Waste (tonnes/day)', 'Change (%)'],
    rows=[
        ['Baseline',            'Normal weather, no festival',       '14.08', '—'],
        ['Heavy Rainfall',      'Heavy rain, no festival',           '16.19', '+15%'],
        ['Festival (Ganesh C.)', 'Normal weather, Ganesh Chaturthi', '18.02', '+28%'],
        ['Worst Case (Compound)','Heavy rain + festival surge',      '21.86', '+55%'],
    ],
    caption='Table 3: Waste Generation Scenarios — HSR Layout Ward',
    insert_after_para_idx=67,
    col_widths=[3.5, 4.5, 3, 2.5],
    bold_first_col=True,
)

# ── TABLE 4: Route Optimisation Outcomes (after para 69, section 5.5) ──
make_table(
    doc,
    headers=['Metric', 'Pre-Optimisation', 'Post-Optimisation', 'Improvement'],
    rows=[
        ['Daily fleet distance',     '132.44 km',    '32.41 km',     '75.5% reduction'],
        ['Daily fuel cost',          '₹2,072',       '₹507',         '₹1,565 saved/day'],
        ['Network coverage',         '—',            '95.3%',        '+15.3%'],
        ['Avg. collection time',     '4.5 hrs/vc/day','3 hrs/vc/day','33% reduction'],
    ],
    caption='Table 4: Route Optimisation Performance — Clarke-Wright Heuristic',
    insert_after_para_idx=69,
    col_widths=[3.5, 3.5, 3.5, 3.5],
    bold_first_col=True,
)

# ── TABLE 5: Compactor Route Assignments (after para 69 too, but we put
#    it after the previous table by referencing the same para) ──
make_table(
    doc,
    headers=['Route', 'Assigned Zones', 'Distance (km)', 'Load (kg)', 'Coverage Area'],
    rows=[
        ['Truck 1', '8 zones', '12.54', '3,050', 'Western HSR'],
        ['Truck 2', '8 zones', '9.63',  '3,115', 'Central HSR'],
        ['Truck 3', '8 zones', '15.93', '3,104', 'Eastern HSR'],
    ],
    caption='Table 5: Compactor Route Assignments',
    insert_after_para_idx=69,
    col_widths=[2, 2.5, 3, 2.5, 3.5],
    bold_first_col=True,
)

# ── TABLE 6: Fleet Composition (after para 52, section 4.4) ──
make_table(
    doc,
    headers=['Vehicle Type', 'Quantity', 'Capacity', 'Min. Road Width'],
    rows=[
        ['Auto-tipper',      '12', '500 kg',   '≥ 2 m'],
        ['Large compactor',   '2', '10,000 kg', '≥ 6 m'],
        ['Small compactor',   '2', '5,000 kg',  '≥ 4 m'],
        ['Push cart',          '8', '200 kg',    'Any width'],
        ['Liquid tanker',      '1', '5,000 L',   '≥ 9 m'],
    ],
    caption='Table 6: Fleet Composition — HSR Layout Collection Vehicles',
    insert_after_para_idx=52,
    col_widths=[4, 2.5, 3, 3.5],
    bold_first_col=True,
)

# ── TABLE 7: Financial Impact Summary (after para 73, section 5.7) ──
make_table(
    doc,
    headers=['Benefit Stream', 'Annual Value (₹ Crores)', 'Share (%)'],
    rows=[
        ['Carbon credit revenue',   '5.19', '55.1%'],
        ['Fuel savings',            '3.28', '34.8%'],
        ['Avoided dump cleanup',    '0.45', '4.8%'],
        ['Labour-hour savings',     '0.38', '4.0%'],
        ['Compost sales income',    '0.12', '1.3%'],
        ['Total (HSR Layout)',      '9.42', '100%'],
    ],
    caption='Table 7: Aggregate Annual Financial Impact — HSR Layout',
    insert_after_para_idx=73,
    col_widths=[5, 4, 3],
    bold_first_col=True,
)

# ── TABLE 8: Methane / Carbon Credit Data (after para 71, section 5.6) ──
make_table(
    doc,
    headers=['Parameter', 'Value', 'Unit'],
    rows=[
        ['Methane emissions',           '927',      'tonnes CH₄/year'],
        ['CO₂-equivalent',              '25,959',   'tonnes CO₂e/year'],
        ['Carbon-credit value',         '5.19',     '₹ crores/year'],
        ['Carbon price (CCTS 2023)',    '2,000',    '₹/tonne CO₂e'],
        ['Biogas energy potential',     '21,285',   'kWh/day'],
        ['Energy per household',        '3.035',    'kWh/hhd/day'],
        ['Households powered',          '7,095',    'households'],
    ],
    caption='Table 8: Methane Emissions and Carbon-Credit Potential',
    insert_after_para_idx=71,
    col_widths=[5, 3, 4],
    bold_first_col=True,
)

# ── TABLE 9: Study Area Key Statistics (after para 24, section 3.1) ──
make_table(
    doc,
    headers=['Parameter', 'Value'],
    rows=[
        ['Ward Number',               '174 (HSR Layout)'],
        ['Ward Area',                  '18.5 km²'],
        ['Estimated Population',       '~1,10,000'],
        ['Total Building Footprints',  '9,471'],
        ['Independent Houses',         '8,998 (94.8%)'],
        ['Apartment Complexes',        '250'],
        ['Commercial Buildings',       '137'],
        ['IT Offices',                 '39'],
        ['Educational Institutions',   '15'],
        ['Daily Waste Generation',     '55 tonnes/day'],
        ['DWCCs in Ward',              '6'],
        ['Nearest BMU',                'Kudlu Gate (2.10 km)'],
        ['Nearest Dumpyard',           'Yelahanka (21.03 km)'],
    ],
    caption='Table 9: Key Statistics — HSR Layout (Ward 174)',
    insert_after_para_idx=24,
    col_widths=[6, 6],
    bold_first_col=True,
)

# ── TABLE 10: Technology Stack (after para 87, section 7.1) ──
make_table(
    doc,
    headers=['Component', 'Technology', 'Version / Details'],
    rows=[
        ['Framework',        'Next.js (App Router)',   '14'],
        ['Language',         'TypeScript + React',     'React 18'],
        ['Styling',          'Tailwind CSS',           'v3.4'],
        ['Mapping',          'MapLibre GL JS',         'v5.20.2'],
        ['Map Tiles',        'OpenFreeMap',            'Free API'],
        ['Charts',           'Recharts',               '3.8'],
        ['Animations',       'Framer Motion',          '12.36'],
        ['State Management', 'Zustand',                '5.0'],
        ['AI / NLP',         'Google Gemini 1.5 Flash', '—'],
        ['PDF Generation',   'jsPDF + html2canvas',    'Browser-side'],
    ],
    caption='Table 10: AstraCity Platform — Technology Stack',
    insert_after_para_idx=87,
    col_widths=[3.5, 4.5, 3.5],
    bold_first_col=True,
)

# ── TABLE 11: Implementation Roadmap (after para 91, section 8) ──
make_table(
    doc,
    headers=['Phase', 'Timeline', 'Scope', 'Key Deliverables'],
    rows=[
        ['Phase 1', 'Months 1–6',   'HSR + 2 DWCCs',     'Pilot validation, IoT bin sensors, >85% prediction accuracy'],
        ['Phase 2', 'Months 7–18',  '50 wards (South Zone)', 'BBMP complaint API, mobile app, sanitary inspector training'],
        ['Phase 3', 'Months 19–36', '198 wards (all Bengaluru)', 'GPS truck tracking, IoT at all 336 DWCCs'],
        ['Phase 4', 'Year 3+',      'National (SaaS)',    'Multi-city rollout via Smart Cities Mission'],
    ],
    caption='Table 11: Proposed Extension Roadmap — Phased Deployment',
    insert_after_para_idx=91,
    col_widths=[2, 2.5, 4, 5],
    bold_first_col=True,
)

# ── TABLE 12: Illegal Dump Sites Detected (after para 45, section 4.2) ──
make_table(
    doc,
    headers=['Site', 'Area (m²)', 'Risk Level', 'Priority', 'Response Time'],
    rows=[
        ['Site 1', '147–264', 'High',   'P0', 'Same-day cleanup'],
        ['Site 2', '147–264', 'High',   'P0', 'Same-day cleanup'],
        ['Site 3', '147–264', 'Medium', 'P1', '48-hour response'],
        ['Site 4', '147–264', 'Medium', 'P1', '48-hour response'],
    ],
    caption='Table 12: Detected Potential Illegal Dump Sites — DBSCAN Clustering',
    insert_after_para_idx=45,
    col_widths=[2, 2.5, 2.5, 2, 3.5],
    bold_first_col=True,
)

# ── TABLE 13: Segregation Rate by Sub-Zone (after para 80, section 6.3) ──
make_table(
    doc,
    headers=['Sub-Zone', 'Segregation Rate (%)', 'Status', 'Recommended Action'],
    rows=[
        ['Northern HSR',    '68%', 'Best performing',  'Awareness campaigns'],
        ['East HSR',        '42%', 'Critical',         'Monitoring + penalty enforcement'],
        ['Commercial areas','38%', 'Below average',    'Mandatory audits for bulk generators'],
    ],
    caption='Table 13: Waste Segregation Disparities by Sub-Zone',
    insert_after_para_idx=80,
    col_widths=[3, 3, 3, 5],
    bold_first_col=True,
)

# ── TABLE 14: Waste Composition (after para 30, section 3.2) ──
make_table(
    doc,
    headers=['Waste Category', 'Composition (%)', 'Typical Examples'],
    rows=[
        ['Wet / Organic',        '61%', 'Food waste, kitchen scraps, garden waste'],
        ['Dry / Recyclable',     '30%', 'Paper, plastic, glass, metals'],
        ['Hazardous / Sanitary',  '5%', 'Medical waste, sanitary napkins, diapers'],
        ['Inert',                 '4%', 'Construction debris, soil, ceramics'],
    ],
    caption='Table 14: Waste Composition — HSR Layout Ward',
    insert_after_para_idx=30,
    col_widths=[4, 3, 6],
    bold_first_col=True,
)


# ──────────────────────────────────────────────────────────
# 6.  EQUATION FORMATTING (para 55 — the IPCC formula)
# ──────────────────────────────────────────────────────────
for i, para in enumerate(doc.paragraphs):
    if para.text.strip().startswith('CH₄ (tonnes/year)'):
        para.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.CENTER
        para.paragraph_format.space_before = Pt(12)
        para.paragraph_format.space_after = Pt(12)
        for run in para.runs:
            run.font.name = 'Cambria Math'
            run.font.size = Pt(12)
            run.bold = True
            run.font.color.rgb = RGBColor(0x1A, 0x23, 0x7E)
        break

# ──────────────────────────────────────────────────────────
# 7.  SAVE ENHANCED DOCUMENT
# ──────────────────────────────────────────────────────────
output_path = 'Paper_Enhanced.docx'
doc.save(output_path)
print(f'[OK] Enhanced document saved to: {output_path}')
print(f'   - 14 professional tables added')
print(f'   - Heading styles applied (H1, H2)')
print(f'   - Body text formatted (Times New Roman 12pt, justified)')
print(f'   - NO text content was changed')
