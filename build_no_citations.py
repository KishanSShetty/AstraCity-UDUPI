import sys, re
sys.stdout.reconfigure(encoding='utf-8')

from docx import Document
from docx.oxml import parse_xml
from docx.oxml.ns import qn

from docx.shared import Inches
from docx.enum.text import WD_ALIGN_PARAGRAPH

# Source and Template
ns_w = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
src_doc = Document(r'C:\Users\Kishan Shetty\Downloads\AstraSky-maing\AstraCityssss.docx')
tmpl = Document(r'C:\Users\Kishan Shetty\Downloads\AstraSky-maing\template_clean.docx')

raw_texts = [p.text for p in src_doc.paragraphs if p.text.strip()]

text_replacements = [
    ('3.1 Emission-Capacitated Vehicle Routing', ''),
    ('3.2 Digital Twin for Smart Cities', ''),
    ('Prior work has shown that the time-of-day speed variability in route planning has a significant impact on route feasibility and total emissions, especially in urban corridors with high congestion levels in the morning, which is the time period used for collection in this study (i.e., 06:00–10:00). These formulations allocate speed profiles for each road class for each time period, which results in more realistic arrival time accumulation along long routes. The speed model used by AstraCity is a two-speed model (06:00-08:00 = low-congestion; 08:00-10:00 = peak) per road category and is used as a design specification for use in future calibration.', 'AstraCity addresses this by incorporating a two-speed time-dependent model (low-congestion and peak) per road category to ensure realistic arrival time accumulation.'),
    ('Digital twin in smart city contexts has been increasingly used to connect physical infrastructure and data-driven decision support. The urban digital twin is generally used to model physical assets, simulate operational scenarios and present relevant physical and decision outputs to the administrators without the need for any live sensor infrastructure initially. However, in the waste management sector, similar approaches have been advocated for logistics tracking, landfill site evaluation, or waste collection planning, among others, but none of them are truly a pipeline. Previous literature usually focuses on just one or two of these elements separately. AstraCity brings together spatial surveillance, waste modelling, constrained routing, and environment assessment within a single ward level decision-support framework, making it a multi-function digital twin and not a single analytical module.', 'While digital twins increasingly connect physical infrastructure to decision support [16], prior waste management applications [17] typically isolate logistics or site evaluation. AstraCity advances this by unifying spatial surveillance, waste modelling, constrained routing, and environmental assessment into a continuous ward-level pipeline.'),

    # Abstract
    ('ward level digital twin', 'ward-level digital twin'),
    ('decision support system', 'decision-support framework'),
    ('sentinel-2', 'Sentinel-2'),
    ('The Maximum Likelihood Classification (MLC) of Sentinel-2 data has been used to classify open land and exclude it from the images if it is at risk of illegal dumping (DBSCAN clustering).', 'Sentinel-2 imagery classified using Maximum Likelihood Classification (MLC) identifies open land, which is then screened for illegal dump risk using DBSCAN clustering.'),
    ('into a comprehensive digital twin system', 'into a comprehensive digital twin framework'),
    ('For 54 scenarios waste is generated and modelled.', 'Waste generation is modelled across 54 pre-computed scenarios.'),
    ('For 54 scenarios waste is generated and modelled', 'Waste generation is modelled across 54 pre-computed scenarios.'),
    ('is able to cut', 'reduces'),
    ('First Order Decay', 'First-Order Decay'),
    ('can be achieved', 'are estimated'),
    ('The twin digitally represents', 'The proposed framework integrates'),
    ('The estimated savings per ward per year is ₹5.79 crores', 'Financial projections indicate potential annual savings of ₹5.79 crores per ward'),
    ('The novelty will be to combine these modules into a comprehensive digital twin system for urban decision making.', 'This study provides a scalable blueprint for integrating disjointed municipal data into actionable urban policies.'),
    
    # Introduction
    ('decision making', 'decision-making'),
    ('taken into consideration', 'incorporated'),
    ('AstraCity does this by creating', 'AstraCity addresses this by constructing'),
    ('virtual model', 'scenario-driven virtual representation'),
    ('impact on the environment', 'environmental impact'),
    ('layered framework for decision support', 'layered decision-support framework'),
    ('The innovation is in the ability to combine these modules into a single digital twin for the ward.', 'The primary contribution is a scalable blueprint that transforms disjointed municipal data into actionable, scenario-driven urban policies.'),

    # Contributions
    ('The creation of a ward-level digital twin framework', '1. The creation of a ward-level digital twin framework'),
    ('2.\tSpatial dump-risk detection', '2. Spatial dump-risk detection'),
    ('The 3. Scenario based waste generation', '3. Scenario-based waste generation'),
    ('2.\tThe constrained CVRPTW formulation', '4. The constrained CVRPTW formulation'),
    ('5.\tAn IPCC compliant', '5. An IPCC-compliant'),
    ('growth, festival, weather and more other scenarios', 'growth, festival and weather scenarios'),
    ('ward scale', 'ward-scale'),
    ('IPCC compliant', 'IPCC-compliant'),

    # Architecture
    ('considered to be', 'defined as'),
    ('support decision making', 'support decision-making'),

    # Pipeline
    ('The twin is a 5-stage pipeline. Each stage is directly connected with the subsequent stage:', 'The overall processing workflow is illustrated in Fig. 1. The digital twin integrates remote sensing, dump-risk detection, waste generation modelling, route optimization, environmental assessment and decision support into a sequential processing pipeline.'),
    ('[1] Sentinel-2 Imagery', ''),
    ('↓ MLC Classification', ''),
    ('[3] Land Use Change Map (Built up / Vegetation / Open land / Water)', ''),
    ('↓ DBSCAN on Open Land pixels', ''),
    ('High priority illegal dump sites (P0 / P1 priority sites)', ''),
    ('↓ Building-level occupancy model', ''),
    ('This is a Waste Generation Grid comprised of 59 x 54 cells and 54 scenarios.', ''),
    ('↓ CVRPTW + Clarke–Wright', ''),
    ('[6] Approved Bids (bids, document center, cost details, etc.)', ''),
    ('↓ IPCC FOD + Economic model', ''),
    ('The 2017/18 methane / CO₂e estimates and financial impact', ''),
    ('The outputs from the DECISION are:The DECISION outputs are:', '[7] Decision Support'),
    ('The outputs from the DECISION are:The DECISION outputs are', '[7] Decision Support'),

    # Related Work
    ('take the objective one step further by considering', 'extend the conventional distance-minimization objective by incorporating'),
    ('takes into account', 'considers'),
    ('environment assessment', 'environmental assessment'),
    ('encourages AstraCity\'s emission-weighted goal', 'motivates AstraCity\'s emission-weighted objective'),
    ('instead of being calculated after the fact', 'rather than being aggregated post-hoc. Unlike these approaches, the current AstraCity implementation minimizes travel distance, while emission-aware routing is identified as future work'),
    ('Waste collection requires time-dependent travel times.Time-dependent travel times are needed in waste collection.', 'Waste collection requires time-dependent travel-time modelling.'),

    # Methodology
    ('The satellite images from Sentinel-2 Level-2A were then imported into QGIS 3.x and classified using the Sentinel-2 Level-2A Maximum Likelihood Classification plugin and Maximum Likelihood Classification (MLC).', 'Sentinel-2 Level-2A imagery was imported into QGIS 3.x and classified using the Semi-Automatic Classification Plugin (SCP) with the Maximum Likelihood Classification (MLC) algorithm.'),
    ('Those parcels of land that are not being used have the greatest chance of being abandoned.', 'Open land parcels exhibit a higher likelihood of illegal dumping due to the absence of active land use and regular surveillance.'),
    ('Brightness threshold approach', 'Brightness-threshold screening'),
    ('Algo: Clarke-Wright Savings heuristic in TypeScript.', 'Routing was performed using the Clarke–Wright Savings heuristic implemented in TypeScript.'),
    ('Algo: Clarke-Wright Savings heuristic', 'Routing was performed using the Clarke–Wright Savings heuristic implemented in TypeScript.'),
    
    # Results
    ('There were 4 candidate illegal dump sites found using DBSCAN.', 'DBSCAN identified four candidate illegal dump sites.'),
    ('The importance of methane in the environment.', '5.4 Environmental Assessment'),
    ('The estimation of methane and economic assessment (impact layer) will be performed.', 'The impact layer estimates methane emissions and performs the economic assessment.'),
    ('and doable', 'and quantifiable'),

    # Discussion
    ('The following section addresses the question of why bother with a Digital Twin instead of separate analytical models.', 'The primary advantage of AstraCity over independent analytical tools is the integration of five analytical modules into a unified decision-support pipeline.'),
    ('The unique feature of this work is the five analytical components are a unified pipeline and not separated.', ''),
    ('The width of roads is a design constraint.Road widths are a design constraint.', 'Road width is treated as a hard design constraint within the routing model.'),

    # Conclusion
    ('AstraCity shows how a municipal solid waste (MSW) management open satellite data and open source geospatial tools with standard combinatorial optimization can be combined', 'AstraCity demonstrates how open satellite data, open-source geospatial tools, and combinatorial optimization can be integrated to create a ward-level digital twin for municipal solid waste management without requiring proprietary software or live sensor infrastructure.'),
    ('The novelty in this is', 'The principal contribution is'),

    # Citations
    ('More than 150,000 tonnes of MSW are generated daily in the urban centres of India,', 'More than 150,000 tonnes of MSW are generated daily in the urban centres of India [2], [3],'),
    ('waste management will always be reactive.', 'waste management will always be reactive [1].'),
    ('Common CVRP formulations are those that minimize distance or travel time.', 'Common CVRP formulations are those that minimize distance or travel time [4].'),
    ('rather than being aggregated post-hoc. Unlike these approaches,', 'rather than being aggregated post-hoc [14]. Unlike these approaches,'),
    ('Waste collection requires time-dependent travel-time modelling.', 'Waste collection requires time-dependent travel-time modelling [15].'),
    ('data-driven decision support.', 'data-driven decision support [16].'),
    ('waste collection planning, among others, but none of them are truly a pipeline.', 'waste collection planning, among others [17], but none of them are truly a pipeline.'),
    ('to the 2011 ward data from Census 2011.', 'to the 2011 ward data from Census 2011 [9].'),
    ('Clarke–Wright Savings heuristic implemented in TypeScript.', 'Clarke–Wright Savings heuristic [5] implemented in TypeScript.'),
    ('According to the IPCC Tier-1 First-Order Decay estimates', 'According to the IPCC Tier-1 First-Order Decay [6] estimates'),
    ('estimated carbon-credit value of ₹5.19 crores per year.', 'estimated carbon-credit value of ₹5.19 crores per year [7].'),
    ('mid-range of the CCTS-2023 (RIN, ₹2,000/tonne)', 'mid-range of the CCTS-2023 [7] (RIN, ₹2,000/tonne)'),
    ('estimated savings per ward per year is ₹5.79 crores.', 'estimated savings per ward per year is ₹5.79 crores [10]-[13].'),
    ('estimated savings of ₹5.79 crores are found annually for the ward.', 'estimated savings of ₹5.79 crores are found annually for the ward [10]-[13].'),
    ('average data from CPCB instead of the data collected', 'average data from CPCB [2] instead of the data collected'),
    ('CH₄ emissions: 927 tonnes/year', 'CH₄ emissions: 927 tonnes/year [8]')
]

src_texts = []
for t in raw_texts:
    for old, new in text_replacements:
        t = t.replace(old, new)
    src_texts.append(t)


# ── Clear template body ───────────────────────────────────────
body = tmpl.element.body
for child in list(body):
    if child.tag.endswith('sectPr'):
        continue
    body.remove(child)

# Section break elements
sect0_break = parse_xml(
    '<w:p xmlns:w="%s"><w:pPr><w:sectPr>'
    '<w:type w:val="continuous"/>'
    '<w:pgSz w:w="11906" w:h="16838"/>'
    '<w:pgMar w:top="540" w:right="893" w:bottom="1440" w:left="893" w:header="720" w:footer="720" w:gutter="0"/>'
    '<w:cols w:space="720"/>'
    '</w:sectPr></w:pPr></w:p>' % ns_w
)

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
    if not text: return
    r = parse_xml('<w:r xmlns:w="%s"/>' % ns_w)
    rPr = parse_xml('<w:rPr xmlns:w="%s"/>' % ns_w)
    if bold: rPr.append(parse_xml('<w:b xmlns:w="%s"/>' % ns_w))
    if italic: rPr.append(parse_xml('<w:i xmlns:w="%s"/>' % ns_w))
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
    if align: pPr.append(parse_xml('<w:jc xmlns:w="%s" w:val="%s"/>' % (ns_w, align)))
    p.insert(0, pPr)
    if text: add_run(p, text, sz=sz, bold=bold, italic=italic)
    return p

def ins(elem):
    fs = body.find('{%s}sectPr' % ns_w)
    fs.addprevious(elem)

def mk_table(rows):
    if not rows: return None
    ncols = max(len(r) for r in rows)
    for r in rows:
        while len(r) < ncols: r.append('')
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

def make_author_cell(name, dept, org, city, email):
    tc = parse_xml('<w:tc xmlns:w="%s"/>' % ns_w)
    lines = [(name, True, False), (dept, False, True), (org, False, True), (city, False, False), (email, False, False)]
    for txt, bld, ita in lines:
        cp = parse_xml('<w:p xmlns:w="%s"/>' % ns_w)
        cpPr = parse_xml('<w:pPr xmlns:w="%s"><w:jc w:val="center"/><w:spacing w:after="0" w:line="240" w:lineRule="auto"/></w:pPr>' % ns_w)
        cp.insert(0, cpPr)
        add_run(cp, txt, sz=10, bold=bld, italic=ita)
        tc.append(cp)
    return tc

# ── Tables (hardcoded from source) ────────────────────────────
entities_table = [
    ['Entity Layer', 'Components'],
    ['Built Environment', '9,471 building footprints (residential, apartment, commercial, institutional)'],
    ['Road Network', '2,027 classified segments (width, type, vehicle access)'],
    ['Waste Infrastructure', '6 DWCCs, 1 BMU (Kudlu Gate, 2.10 km), Dumpyard (Yelahanka, 21.03 km)'],
    ['Land Parcels', 'Open land polygons extracted from LULC classification'],
    ['Ward Boundary', 'Ward 174 administrative polygon']
]
waste_table = [
    ['Scenario', 'Tonnes/day', 'Change'],
    ['Normal (no festival)', '14.08', '\u2014'],
    ['Heavy Rainfall', '16.19', '+15%'],
    ['Ganesh Chaturthi', '18.02', '+28%'],
    ['Compound Worst Case', '21.86', '+55%']
]
fleet_table = [
    ['Vehicle type', 'Quantity', 'Capacity', 'Minimum road width'],
    ['Auto-tipper', '12', '500 kg', '\u2265 2 m'],
    ['Large compactor', '2', '10,000 kg', '\u2265 6 m'],
    ['Small compactor', '2', '5,000 kg', '\u2265 4 m'],
    ['Push cart', '8', '200 kg', 'Any'],
    ['Liquid tanker', '1', '5,000 L', '\u2265 9 m']
]
economic_table = [
    ['Benefit Stream', 'Annual Value', 'Share'],
    ['Carbon credit revenue (\u20b92,000/t CO\u2082e, CCTS 2023)', '\u20b95.19 crores', '89.6%'],
    ['Fuel savings (\u20b920/km \u00d7 100.03 km/day \u00d7 365)', '\u20b90.07 crores', '1.2%'],
    ['Avoided dump cleanup (30 sites \u00d7 \u20b952,000)', '\u20b90.16 crores', '2.8%'],
    ['Labour savings (1.5 hrs \u00d7 25 vehicles \u00d7 \u20b9180/hr \u00d7 365)', '\u20b90.25 crores', '4.3%'],
    ['Compost sales (digestate at \u20b91,500/tonne)', '\u20b90.12 crores', '2.1%'],
    ['Total (Ward 174)', '\u20b95.79 crores', '100%']
]
lulc_table = [
    ['Class', 'Area (km\u00b2)', 'Ward Coverage', 'Significance'],
    ['Built-up', '11.85', '64.1%', 'High-density residential/commercial fabric'],
    ['Vegetation', '3.26', '17.6%', 'Parks, avenue trees, private gardens'],
    ['Open Land', '2.83', '15.3%', 'Surveillance priority, dump risk exposure'],
    ['Water Bodies', '0.56', '3.0%', 'Agara Lake, HSR Layout Lake \u2014 leachate risk']
]
route_table = [
    ['Metric', 'Before Optimization', 'After Optimization', 'Improvement'],
    ['Daily fleet distance', '132.44 km', '32.41 km', '75.5% reduction'],
    ['Daily fuel cost', '\u20b92,072', '\u20b9507', '\u20b91,565 saved/day'],
    ['Network coverage', '\u2014', '95.3%', '+15.3 pp'],
    ['Average collection time', '4.5 hrs/vehicle', '3.0 hrs/vehicle', '33% reduction']
]

# Map: src_texts index -> table to insert AFTER processing that line
table_inject_after = {
    23: entities_table,   # after [23] "2.2 Physical Entities Modelled" content
    74: waste_table,      # after [74] "Policy exploration..." (last line before raw data)
    93: fleet_table,      # after [93] "Algo: Clarke-Wright..." (last line before Fleet: raw data)
    105: economic_table,  # after [105] "Economic model: Five projected..."
    115: lulc_table,      # after [115] "5.1 LULC Classification" heading
    123: route_table,     # after [123] "5.3 Route Optimization" heading
}
# Lines to skip (raw table data rows + horizontal rules + redundant headers)
skip_indices = set(
    list(range(24, 30)) +   # entities raw rows [24]-[29]
    list(range(75, 81)) +   # "Key waste scenarios:" + header + data [75]-[80]
    list(range(94, 101)) +  # "Fleet:" + header + data rows [94]-[100]
    list(range(106, 113)) + # economic data rows [106]-[112]
    list(range(116, 121)) + # lulc data rows [116]-[120]
    list(range(124, 129)) + # route data rows [124]-[128]
    [2, 6, 113, 138]        # horizontal rules
)

# LaTeX -> clean Unicode math
def latex_to_unicode(tex):
    """Convert LaTeX math string to clean Unicode for Word display."""
    s = tex.strip().strip('$')
    # Common replacements
    replacements = [
        (r'\text{Waste}', 'Waste'),
        (r'\left[', '['), (r'\right]', ']'),
        (r'\times', '\u00d7'), (r'\cdot', '\u00b7'),
        (r'\phi_{\text{growth}}', '\u03c6_growth'),
        (r'\phi_{\text{festival}}', '\u03c6_festival'),
        (r'\phi_{\text{weather}}', '\u03c6_weather'),
        (r'\text{Minimize}', 'Minimize'),
        (r'\quad', '  '),
        (r'\sum_{k}', '\u2211\u2096'),
        (r'\sum_{i}', '\u2211\u1d62'),
        (r'\sum_{j}', '\u2211\u2c7c'),
        (r'd_{ij}', 'd\u1d62\u2c7c'),
        (r'x_{ijk}', 'x\u1d62\u2c7c\u2096'),
        (r'x_{0jk}', 'x\u2080\u2c7c\u2096'),
        (r'x_{j0k}', 'x\u2c7c\u2080\u2096'),
        (r'\forall', '\u2200'),
        (r'\in', '\u2208'),
        (r'\leq', '\u2264'),
        (r'q_i', 'q\u1d62'),
        (r'Q_k', 'Q\u2096'),
        (r't_{ik}', 't\u1d62\u2096'),
        (r'a_i', 'a\u1d62'),
        (r'b_i', 'b\u1d62'),
        (r'w_{ij}', 'w\u1d62\u2c7c'),
        (r'W_k', 'W\u2096'),
        (r'\text{(each zone served exactly once)}', '(each zone served exactly once)'),
        (r'\text{(vehicle capacity)}', '(vehicle capacity)'),
        (r'\text{(depot flow conservation)}', '(depot flow conservation)'),
        (r'\text{(time window }', '(time window '),
        (r'\text{)}', ')'),
        (r'\text{(road-width feasibility)}', '(road-width feasibility)'),
        (r'\text{if }', 'if '),
        (r'\text{CH}4', 'CH\u2084'),
        (r'\text{ (tonnes/year)}', ' (tonnes/year)'),
        (r'\text{MSW}{\text{organic}}', 'MSW_organic'),
        (r'\text{DOC}_f', 'DOC_f'),
        (r'\text{MCF}', 'MCF'),
        (r'\frac{16}{12}', '(16/12)'),
        (r'\text{OX}', 'OX'),
        (r'06{:}00', '06:00'),
        (r'10{:}00', '10:00'),
        (r',,', ', '),
        (r'[', '['), (r']', ']'),
    ]
    for old, new in replacements:
        s = s.replace(old, new)
    # Clean up remaining LaTeX artifacts
    s = re.sub(r'\\[a-zA-Z]+', '', s)  # remove remaining \commands
    s = re.sub(r'[{}]', '', s)          # remove braces
    s = re.sub(r'\s+', ' ', s).strip()  # normalize whitespace
    return s

# Inline $...$ math cleanup for body text
def clean_inline_math(text):
    """Replace inline $...$ LaTeX with Unicode equivalents."""
    def replace_inline(m):
        inner = m.group(1)
        return latex_to_unicode(inner)
    return re.sub(r'\$([^$]+)\$', replace_inline, text)


# ══════════════════════════════════════════════════════════════
# BUILD DOCUMENT
# ══════════════════════════════════════════════════════════════

# ── SECTION 0: Title + Authors (single column) ───────────────
ins(mk_p('papertitle', src_texts[0], align='center', sz=24, bold=True))
ins(mk_p('Normal'))

# 4-column author table
author_tbl = parse_xml(
    '<w:tbl xmlns:w="%s"><w:tblPr><w:tblW w:w="5000" w:type="pct"/><w:jc w:val="center"/>'
    '<w:tblBorders><w:top w:val="none" w:sz="0" w:space="0" w:color="auto"/>'
    '<w:left w:val="none" w:sz="0" w:space="0" w:color="auto"/>'
    '<w:bottom w:val="none" w:sz="0" w:space="0" w:color="auto"/>'
    '<w:right w:val="none" w:sz="0" w:space="0" w:color="auto"/>'
    '<w:insideH w:val="none" w:sz="0" w:space="0" w:color="auto"/>'
    '<w:insideV w:val="none" w:sz="0" w:space="0" w:color="auto"/>'
    '</w:tblBorders></w:tblPr>'
    '<w:tblGrid><w:gridCol w:w="2500"/><w:gridCol w:w="2500"/>'
    '<w:gridCol w:w="2500"/><w:gridCol w:w="2500"/></w:tblGrid>'
    '</w:tbl>' % ns_w
)
author_row = parse_xml('<w:tr xmlns:w="%s"/>' % ns_w)
author_row.append(make_author_cell('Kishan Shetty', 'Dept. of ISE', 'RV College of Engineering', 'Bengaluru, India', 'kishanshetty.udupika20@gmail.com'))
author_row.append(make_author_cell('Karthik KP', 'Dept. of ISE', 'RV College of Engineering', 'Bengaluru, India', 'karthikkp.is24@rvce.edu.in'))
author_row.append(make_author_cell('Harish Hegde', 'Dept. of ISE', 'RV College of Engineering', 'Bengaluru, India', 'harishshegde@rvce.edu.in'))
author_row.append(make_author_cell('Dr Lokeshwari M', 'Associate Professor', 'RV College of Engineering', 'Bengaluru, India', ''))
author_tbl.append(author_row)
ins(author_tbl)
ins(mk_p('Normal'))
ins(sect0_break)

# ── SECTION 1: Two-column body ───────────────────────────────
current_main = 1
current_sub = 1
in_refs = False
abstract_done = False

i = 1  # skip title [0], start from author lines
while i < len(src_texts):
    text = src_texts[i].strip()
    if not text:
        i += 1
        continue

    # Skip author lines [1]-[3]
    if i <= 3:
        i += 1
        continue

    # Skip designated lines
    if i in skip_indices:
        i += 1
        continue

    # Skip horizontal rules
    if text.startswith('________'):
        i += 1
        continue

    # Abstract
    if text.lower() == 'abstract' and not abstract_done:
        abs_p = mk_p('Abstract')
        add_run(abs_p, 'Abstract\u2014', sz=9, bold=True, italic=True)
        # next line is abstract body
        abs_body = src_texts[i+1].strip()
        add_run(abs_p, abs_body, sz=9, italic=True)
        ins(abs_p)
        abstract_done = True
        i += 2  # skip "Abstract" + abstract body
        continue

    # Keywords
    if text.startswith('Keywords'):
        kw_p = mk_p('Keywords')
        add_run(kw_p, 'Keywords\u2014', sz=9, bold=True, italic=True)
        kw_text = re.sub(r'^Keywords\s*[\u2014—-]*\s*', '', text).strip()
        add_run(kw_p, kw_text, sz=9, italic=True)
        ins(kw_p)
        i += 1
        continue

    # References header
    if text.lower() == 'references':
        break

    # Reference entries
    if in_refs:
        ref_text = re.sub(r'^\[\d+\]\s*', '', text)
        ins(mk_p('references', ref_text))
        i += 1
        continue

    # Main section heading
    m_main = re.match(r'^(\d+)\.\s+(.+)$', text)
    allowed_headings = [
        'Introduction', 'Digital Twin Architecture', 'Related Work',
        'Methodology', 'Results', 'Discussion', 'Conclusion'
    ]
    if m_main and not re.match(r'^\d+\.\d+', text):
        heading_text = m_main.group(2).strip()
        if heading_text in allowed_headings:
            new_text = f"{current_main}. {heading_text}"
            ins(mk_p('Heading1', new_text))
            current_main += 1
            current_sub = 1
            # Check if table should be injected after this heading
            if i in table_inject_after:
                tbl = mk_table(table_inject_after[i])
                ins(tbl)
                ins(mk_p('Normal'))
            i += 1
            continue

    # Sub-heading
    m_sub = re.match(r'^(\d+\.\d+)\s+(.+)$', text)
    if m_sub:
        new_text = f"{current_main - 1}.{current_sub} {m_sub.group(2).strip()}"
        ins(mk_p('Heading2', new_text))
        current_sub += 1
        # Check if table should be injected after this sub-heading
        if i in table_inject_after:
            tbl = mk_table(table_inject_after[i])
            ins(tbl)
            ins(mk_p('Normal'))
        i += 1
        continue

    # Display math ($$...$$)
    if text.startswith('$$'):
        math_text = latex_to_unicode(text)
        cp = mk_p('equation', align='center')
        add_run(cp, math_text, sz=10, italic=True, font='Cambria Math')
        ins(cp)
        i += 1
        continue

    # Bullet points
    if text.startswith('\u2022') or text.startswith('\u2022\t'):
        ins(mk_p('bulletlist', text))
        i += 1
        continue

    # Normal body text — clean any inline math
    cleaned = clean_inline_math(text)
    # Strip inline citations like [1], [1]-[3], [1], [2]
    cleaned = re.sub(r'\s*\[\d+\](?:-\[\d+\])?(?:,\s*\[\d+\])*', '', cleaned)
    cleaned = cleaned.replace('  ', ' ')
    ins(mk_p('BodyText', cleaned, align='both'))
    
    # Check if we should inject the architecture image here
    if 'sequential processing pipeline.' in cleaned:
        # Create a paragraph for the image
        img_p = tmpl.add_paragraph()
        img_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        img_r = img_p.add_run()
        img_path = r'C:\Users\Kishan Shetty\.gemini\antigravity-ide\brain\1e3a6a01-6d67-4117-81b5-fef7d1ce58ed\media__1782734798333.png'
        img_r.add_picture(img_path, width=Inches(7.0))
        
        # Create a paragraph for the caption
        cap_p = tmpl.add_paragraph('Fig. 1. Overall architecture of the proposed AstraCity ward-level digital twin framework for municipal solid waste management.')
        cap_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        
        # Insert them into the body
        ins(img_p._p)
        ins(cap_p._p)
        ins(mk_p('Normal'))

    # Check if table should be injected after this body text line
    if i in table_inject_after:
        tbl = mk_table(table_inject_after[i])
        ins(tbl)
        ins(mk_p('Normal'))
    i += 1

# ── Save ──────────────────────────────────────────────────────
output = r'C:\Users\Kishan Shetty\Downloads\AstraSky-maing\AstraCityssss_Conference_NoCitations.docx'
tmpl.save(output)
print('Done! Saved to', output)
