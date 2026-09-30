import sys, re
sys.stdout.reconfigure(encoding='utf-8')

from docx import Document
from docx.oxml import parse_xml
from docx.oxml.ns import qn
from docx.oxml.text.paragraph import CT_P
from docx.oxml.table import CT_Tbl

ns_w = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
tmpl = Document(r'C:\Users\Kishan Shetty\Downloads\AstraSky-maing\template_clean.docx')

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

# Final section: 2 columns, continuous
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

def make_author_cell(name, dept, org, city, email):
    tc = parse_xml('<w:tc xmlns:w="%s"/>' % ns_w)
    lines = [(name, True, False), (dept, False, True), (org, False, True), (city, False, False), (email, False, False)]
    for idx_l, (txt, bld, ita) in enumerate(lines):
        cp = parse_xml('<w:p xmlns:w="%s"/>' % ns_w)
        cpPr = parse_xml('<w:pPr xmlns:w="%s"><w:jc w:val="center"/><w:spacing w:after="0" w:line="240" w:lineRule="auto"/></w:pPr>' % ns_w)
        cp.insert(0, cpPr)
        add_run(cp, txt, sz=10, bold=bld, italic=ita)
        tc.append(cp)
    return tc

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

def mk_flowchart():
    # Simple table-based flowchart, no borders
    tbl_xml = (
        '<w:tbl xmlns:w="%s"><w:tblPr>'
        '<w:tblW w:w="5000" w:type="pct"/>'
        '<w:jc w:val="center"/>'
        '<w:tblBorders>'
        '<w:top w:val="none" w:sz="0" w:space="0" w:color="auto"/>'
        '<w:left w:val="none" w:sz="0" w:space="0" w:color="auto"/>'
        '<w:bottom w:val="none" w:sz="0" w:space="0" w:color="auto"/>'
        '<w:right w:val="none" w:sz="0" w:space="0" w:color="auto"/>'
        '<w:insideH w:val="none" w:sz="0" w:space="0" w:color="auto"/>'
        '<w:insideV w:val="none" w:sz="0" w:space="0" w:color="auto"/>'
        '</w:tblBorders></w:tblPr></w:tbl>' % ns_w
    )
    tbl = parse_xml(tbl_xml)
    grid = parse_xml('<w:tblGrid xmlns:w="%s"><w:gridCol w:w="4000"/></w:tblGrid>' % ns_w)
    tbl.append(grid)
    
    nodes = ["Satellite Imagery (Sentinel-2)", "↓", "LULC Classification", "↓", "DBSCAN Dump Detection", "↓", "Waste Generation Model", "↓", "CVRPTW Route Optimization", "↓", "Carbon Impact Dashboard"]
    
    for idx, node in enumerate(nodes):
        tr = parse_xml('<w:tr xmlns:w="%s"/>' % ns_w)
        tc = parse_xml('<w:tc xmlns:w="%s"/>' % ns_w)
        if node != "↓":
            tc.append(parse_xml('<w:tcPr xmlns:w="%s"><w:shd w:val="clear" w:fill="F2F2F2"/></w:tcPr>' % ns_w))
            cp = parse_xml('<w:p xmlns:w="%s"><w:pPr><w:jc w:val="center"/></w:pPr></w:p>' % ns_w)
            add_run(cp, node, sz=9, bold=True)
            tc.append(cp)
        else:
            cp = parse_xml('<w:p xmlns:w="%s"><w:pPr><w:jc w:val="center"/></w:pPr></w:p>' % ns_w)
            add_run(cp, node, sz=12, bold=True)
            tc.append(cp)
        tr.append(tc)
        tbl.append(tr)
    return tbl


# ── SECTION 0: Title + Authors ───────────────────────────────

ins(mk_p('papertitle', 'AstraCity: A Ward-Level Digital Twin for Municipal Solid Waste Management Integrating Remote Sensing, IoT, and Route Optimization', align='center', sz=24, bold=True))
ins(mk_p('Normal'))

author_tbl = parse_xml(
    '<w:tbl xmlns:w="%s"><w:tblPr><w:tblW w:w="5000" w:type="pct"/><w:jc w:val="center"/>'
    '<w:tblBorders><w:top w:val="none" w:sz="0" w:space="0" w:color="auto"/><w:left w:val="none" w:sz="0" w:space="0" w:color="auto"/><w:bottom w:val="none" w:sz="0" w:space="0" w:color="auto"/><w:right w:val="none" w:sz="0" w:space="0" w:color="auto"/><w:insideH w:val="none" w:sz="0" w:space="0" w:color="auto"/><w:insideV w:val="none" w:sz="0" w:space="0" w:color="auto"/></w:tblBorders>'
    '</w:tblPr><w:tblGrid><w:gridCol w:w="2500"/><w:gridCol w:w="2500"/><w:gridCol w:w="2500"/><w:gridCol w:w="2500"/></w:tblGrid></w:tbl>' % ns_w
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

abs_p = mk_p('Abstract')
add_run(abs_p, 'Abstract—', sz=9, bold=True, italic=True)
add_run(abs_p, 'AstraCity is a digital twin system for the management of municipal solid waste (MSW), designed for the HSR Layout (Ward 174) in Bengaluru, India. Despite being a major IT hub, Bengaluru faces severe environmental challenges, including urban flooding and groundwater contamination exacerbated by illicit waste dumping. Existing administrative processes suffer from a lack of spatial intelligence, treating waste management as a static logistical operation rather than a dynamic geographic challenge. To address this, the proposed digital twin follows a five-stage analytical pipeline that integrates disparate municipal datasets into a cohesive analytical framework. By combining remote sensing for illegal dump detection, localized waste generation modeling, capacitated vehicle routing problem with time windows (CVRPTW), and IPCC-based greenhouse gas (GHG) estimations, AstraCity provides actionable, ward-level operational insights. Our core contribution lies in integrating all these modules into a unified ward-level digital twin. Preliminary results demonstrate a 75.5% reduction in collection fleet travel distance and significant potential for carbon credit generation, illustrating a pathway toward data-driven, sustainable urban governance.', sz=9, italic=True)
ins(abs_p)

kw_p = mk_p('Keywords')
add_run(kw_p, 'Keywords—', sz=9, bold=True, italic=True)
add_run(kw_p, 'Municipal Solid Waste Management (MSWM), Digital Twin, Remote Sensing, CVRPTW, Green IoT.', sz=9, italic=True)
ins(kw_p)

# Content blocks
content = [
    ('Heading1', '1. Introduction'),
    ('BodyText', 'Despite the significant volume of municipal solid waste (MSW) generated by urban municipalities across India, systemic inefficiencies persist in collection, monitoring, and disposal. The root cause of these logistical failures is the lack of spatial intelligence in administrative decision-making. As long as urban authorities treat waste collection as a tabular scheduling problem rather than a dynamic spatiotemporal challenge, illegal dumping and inefficient routing will continue to stress urban infrastructure.'),
    ('BodyText', 'To solve this problem, AstraCity introduces a continuously queryable digital twin of Ward 174 (HSR Layout) in Bengaluru. HSR Layout was selected as the pilot area due to its mix of high-density residential fabric, commercial corridors, and persistent solid waste management challenges.'),
    ('BodyText', 'The fundamental novelty of this research is integrating disparate spatial, flow, and impact modules into a cohesive ward-level digital twin. Specifically, the framework provides four integrated capabilities:'),
    ('bulletlist', '• Spatial surveillance through illegal dump risk screening derived from Sentinel-2 Land Use/Land Cover (LULC) classifications.'),
    ('bulletlist', '• Flow modeling at the building level through localized waste generation models and probabilistic scenarios.'),
    ('bulletlist', '• Emission-aware routing using Capacitated Vehicle Routing Problem with Time Windows (CVRPTW) optimized for constrained urban road networks.'),
    ('bulletlist', '• Impact assessment via IPCC tier-1 methane models to quantify the economic potential of carbon mitigation.'),
    
    ('Heading1', '2. Related Work'),
    ('Heading2', '2.1 Emission-Capacitated Vehicle Routing'),
    ('BodyText', 'Typical formulations for the Capacitated Vehicle Routing Problem (CVRP) focus heavily on minimizing distance or travel time. A more modern perspective employs emission-weighted objective functions, recognizing that shorter routes in congested, narrow urban corridors may result in higher overall emissions due to idling. For instance, Trifa et al. [15] demonstrated that introducing time-of-day speed variation significantly changes the feasibility envelope of CVRPTW.'),
    ('Heading2', '2.2 IoT-Enabled Smart Waste Systems'),
    ('BodyText', 'Fill-level sensor networks on bins and Dry Waste Collection Centers (DWCCs) minimize unnecessary collection trips by sending dynamic signals to routing algorithms. Catania and Ventura [16] highlight that IoT-aware architectures can drastically improve collection efficiency. However, most existing solutions operate in isolation, focusing exclusively on either routing or sensing without linking to broader environmental consequences like methane emissions or spatial land use changes. Our approach differentiates itself by providing a unified digital twin architecture.'),

    ('Heading1', '3. System Architecture'),
    ('Heading2', '3.1 Digital Twin Definition'),
    ('BodyText', 'AstraCity is defined as a spatiotemporal virtual replica of Ward 174 that models the physical, infrastructural, and logistical dynamics of the ward\'s municipal solid waste ecosystem.'),
    ('Heading2', '3.2 Physical Entities Mirrored'),
    ('TABLE', [
        ['Entity Layer', 'Components'],
        ['Built Environment', '9,471 building footprints (residential, apartment, commercial)'],
        ['Road Network', '2,027 classified segments (width, type, vehicle access)'],
        ['Waste Infrastructure', '6 DWCCs, 1 BMU (Kudlu Gate), Dumpyard (Yelahanka)'],
        ['Land Parcels', 'Open land polygons extracted from LULC classification'],
        ['Ward Boundary', 'Ward 174 administrative polygon']
    ]),
    ('Heading2', '3.3 Analytical Pipeline'),
    ('BodyText', 'The proposed digital twin follows a five-stage analytical pipeline linking spatial inputs to environmental outputs. The modular flow is structured as follows:'),
    ('FLOWCHART', ''),
    ('Heading2', '3.4 State Variables'),
    ('BodyText', 'The system distinguishes between static layers, which are updated periodically (building footprints, road segments, DWCC locations, land-cover classes), and dynamic layers, which vary across daily simulation scenarios (waste generation per grid cell, vehicle route assignments, and fleet fuel consumption).'),

    ('Heading1', '4. Methodology'),
    ('Heading2', '4.1 Study Area and Data Sources'),
    ('BodyText', 'HSR Layout is a major township in the southeast of Bengaluru, bounded by Outer Ring Road (ORR) corridors, covering an area of 7.0 km². The study utilized 18 open-access datasets, primarily Sentinel-2 Level-2A imagery provided by ESA Copernicus, alongside building footprints and road network topologies.'),
    ('Heading2', '4.2 Land Use and Dump Risk Detection'),
    ('BodyText', 'LULC classification was performed by processing Sentinel-2 Level-2A imagery in QGIS using Maximum Likelihood Classification (MLC). Classification accuracy was validated via stratified random sampling (≥50 points per class), ensuring an overall accuracy >85% and a Kappa index >0.80. The key spatial output feeding into subsequent modules is the "Open Land" classification, which represents areas with high vulnerability to illegal dumping. To mitigate false positives, a brightness threshold derived from the Modified Bare Soil Index (MBI) was applied to filter out highly reflective built-up structures. Subsequently, the DBSCAN algorithm clustered the remaining open land pixels to identify discrete, high-risk illegal dumping sites.'),
    ('Heading2', '4.3 Waste Generation Modelling (Flow Layer)'),
    ('BodyText', 'The ward was divided into 59 functional grid cells. Baseline waste generation was calculated using population estimates derived from building footprint dimensions and standard per-capita generation rates.'),
    ('equation', 'Waste = (0.45 × P) + (2.8 × C) × multipliers'),
    ('BodyText', 'A set of 54 pre-computation scenarios (encompassing growth levels, festival states, and weather conditions) was designed to stress-test the digital twin.'),
    ('TABLE', [
        ['Scenario', 'Tonnes/day', 'Change'],
        ['Reference (No Festival/Normal)', '14.08', '—'],
        ['Heavy Rainfall', '16.19', '+15%'],
        ['Ganesh Chaturthi', '18.02', '+28%'],
        ['Compound Worst Case', '21.86', '+55%']
    ]),
    ('Heading2', '4.4 Route Optimization (CVRPTW Layer)'),
    ('BodyText', 'The daily collection logistics were formulated as a Capacitated Vehicle Routing Problem with Time Windows (CVRPTW). The constraints mandate that all service must occur within a designated morning window (06:00–10:00), routes originate and terminate at the local DWCC depot, and no vehicle can exceed its maximum payload.'),
    ('TABLE', [
        ['What kind of vehicle?', 'How many vehicles?', 'How much capacity?', 'Minimum road width?'],
        ['Auto-tipper', '12', '500 kg', '≥ 2 m'],
        ['Large compactor', '2', '10,000 kg', '≥ 6 m'],
        ['Small compactor', '2', '5,000 kg', '≥ 4 m'],
        ['Push cart', '8', '200 kg', 'Any'],
        ['Liquid tanker', '1', '5,000 L', '≥ 9 m']
    ]),
    ('BodyText', 'A critical constraint in this methodology is the road width limitation. Ward 174\'s network consists of 41.4% medium lanes (2-4 m) and 27.6% narrow alleys (<2 m), explicitly restricting the deployment of heavy compactors in specific zones. The routing logic was implemented using a client-side TypeScript adaptation of the Clarke–Wright Savings heuristic.'),
    ('Heading2', '4.5 Methane and Economic Assessment (Impact Layer)'),
    ('BodyText', 'Methane emissions from the collected organic waste were calculated using the IPCC Tier-1 First Order Decay (FOD) method:'),
    ('equation', 'CH₄ (tonnes/year) = MSW_organic × DOCf × MCF × (16/12) × (1 − OX)'),

    ('Heading1', '5. Results'),
    ('Heading2', '5.1 LULC Classification'),
    ('BodyText', 'The satellite imagery classification mapped the distribution of spatial types across the ward.'),
    ('TABLE', [
        ['Class', 'Area (km²)', 'Percentage', 'Description'],
        ['Built-up', '11.85', '64.1%', 'High-density residential/commercial'],
        ['Vegetation', '3.26', '17.6%', 'Parks, avenue trees, private gardens'],
        ['Open Land', '2.83', '15.3%', 'Surveillance priority'],
        ['Water Bodies', '0.56', '3.0%', 'Agara Lake, HSR Layout Lake']
    ]),
    ('Heading2', '5.2 Dump Risk Detection'),
    ('BodyText', 'Four potential illegal dump sites were identified using the DBSCAN algorithm applied to the Open Land raster layer. Two high-priority sites (147 m² and 264 m²) present immediate environmental hazards due to their proximity to local drainage networks.'),
    ('Heading2', '5.3 Route Optimization'),
    ('BodyText', 'The digital twin\'s route optimization significantly outperformed the baseline, unoptimized operational patterns.'),
    ('TABLE', [
        ['Metric', 'Pre-Optimization', 'Post-Optimization', 'Improvement'],
        ['Daily fleet distance', '132.44 km', '32.41 km', '75.5% reduction'],
        ['Daily fuel cost', '₹2,072', '₹507', '₹1,565 saved/day'],
        ['Network coverage', '—', '95.3%', '+15.3 pp'],
        ['Average time', '4.5 hrs/vehicle', '3 hrs/vehicle', '33% reduction']
    ]),
    ('Heading2', '5.4 Environmental and Economic Impact'),
    ('BodyText', 'The impact layer quantified the potential environmental benefits. Averting 927 tonnes/year of CH₄ emissions equates to 25,959 tonnes/year of CO₂e mitigation.'),
    ('TABLE', [
        ['Benefit Stream', 'Annual Value', 'Share'],
        ['Carbon credit revenue (₹2,000/t CO₂e, CCTS 2023)', '₹5.19 crores', '89.6%'],
        ['Fuel savings (₹20/km × 100.03 km/day × 365)', '₹0.07 crores', '1.2%'],
        ['Avoided dump cleanup (30 sites × ₹52,000)', '₹0.16 crores', '2.8%'],
        ['Labour savings (1.5 hrs × 25 vehicles × ₹180/hr × 365)', '₹0.25 crores', '4.3%'],
        ['Compost sales (digestate at ₹1,500/tonne)', '₹0.12 crores', '2.1%'],
        ['Total (Ward 174)', '₹5.79 crores', '100%']
    ]),

    ('Heading1', '6. Discussion'),
    ('Heading2', '6.1 Advantages of a Digital Twin Approach'),
    ('BodyText', 'This research demonstrates the value of integrating disparate municipal datasets into a cohesive analytical framework. Instead of analyzing satellite imagery, demographic data, and vehicle routing in silos, the digital twin architecture ensures that a change in one layer (e.g., severe rainfall increasing waste saturation) dynamically updates dependencies across the entire system.'),
    ('Heading2', '6.2 Road Width as a Design Constraint'),
    ('BodyText', 'The structural lack of wider road segments in Ward 174—rendering 17.4% of the network inaccessible to conventional heavy trucks—highlights the necessity of a heterogeneous fleet. The digital twin successfully maps auto-tippers to narrow alleys while reserving compactors for main arterial roads, preventing operational bottlenecks.'),
    ('Heading2', '6.3 Future Work: IoT Integration and Emission Routing'),
    ('BodyText', 'Future iterations of AstraCity should incorporate real-time IoT integration and emission-weighted routing objectives. Deploying fill-level sensors at DWCCs and GPS loggers on fleet vehicles would replace theoretical generation models with ground-truth empirical data. Furthermore, transitioning from a distance-minimizing algorithm to an emission-minimizing algorithm—which explicitly penalizes idling in high-density corridors—would further reduce the overall carbon footprint of municipal operations.'),
    ('Heading2', '6.4 Limitations'),
    ('BodyText', 'This proof-of-concept relies heavily on simulated generation rates and remote sensing proxies. No physical validation campaigns were conducted to ground-truth the illegal dump sites identified by the DBSCAN algorithm.'),

    ('Heading1', '7. Conclusion'),
    ('BodyText', 'AstraCity presents a functional proof-of-concept for a municipal solid waste management digital twin that transitions civic administration from a reactive, tabular approach to a proactive, spatial paradigm. The primary contribution of this research is integrating diverse modules—remote sensing, localized waste generation modeling, and CVRPTW route optimization—into a unified, ward-level digital twin framework. This holistic integration enabled a simulated 75.5% reduction in fleet travel distance while providing quantifiable estimates of carbon mitigation potential. Ultimately, digital twins like AstraCity offer scalable, data-driven pathways toward sustainable and resilient urban governance.'),

    ('Heading5', 'References'),
    ('references', '[1] Ministry of Environment, Forest and Climate Change, "Solid Waste Management Rules, 2016," Government of India.'),
    ('references', '[2] CPCB, "Annual Report on Solid Waste Management 2021-22," Ministry of Environment, Forest and Climate Change.'),
    ('references', '[3] M. Sharholy et al., "Municipal solid waste management in Indian cities – A review," Waste Management, vol. 28, 2008.'),
    ('references', '[4] P. Toth and D. Vigo, Vehicle Routing: Problems, Methods, and Applications, 2nd ed. SIAM, 2014.'),
    ('references', '[5] G. Clarke and J. W. Wright, "Scheduling of vehicles from a central depot to a number of delivery points," Operations Research, 1964.'),
    ('references', '[6] IPCC, "2006 Guidelines for National Greenhouse Gas Inventories," Vol. 5, Ch. 3, 2006.'),
    ('references', '[7] Bureau of Energy Efficiency (BEE), "Carbon Credit Trading Scheme (CCTS) 2023," Energy Conservation Act, 2001.'),
    ('references', '[8] IPCC, "Fifth Assessment Report (AR5)," 2014.'),
    ('references', '[9] BBMP, "Chemical Analysis of Municipal Solid Waste," 2013.'),
    ('references', '[10] BBMP, "Solid Waste Management Bye-laws and Fee/Penalty Schedules," 2020.'),
    ('references', '[11] Government of Karnataka, "Pay Scales for Regularised Pourakarmikas," 2025.'),
    ('references', '[12] PPAC, "Retail Selling Price of High-Speed Diesel," Ministry of Petroleum and Natural Gas.'),
    ('references', '[13] Ministry of Chemicals and Fertilizers, "Policy on Promotion of City Compost (MDA)," Government of India, 2016.'),
    ('references', '[14] M. Rabbani, H. Farrokhi-Asl, and B. Asgarian, "Solving a bi-objective location routing problem," Journal of Industrial Engineering International, 2017.'),
    ('references', '[15] S. Trifa, M. Jemaâ, and M. Tagina, "Time-dependent capacitated solid waste collection vehicle routing problem," IGI Global, 2018.'),
    ('references', '[16] S. Catania and D. Ventura, "An IoT-aware architecture for smart waste management," IEEE Internet of Things Journal, 2019.'),
    ('references', '[17] V. Anagnostopoulos et al., "Effective methods for smart waste collection: IoT-VRP real-world application," IEEE, 2015.')
]

for style, text in content:
    if style == 'TABLE':
        tbl = mk_table(text)
        if tbl is not None:
            ins(tbl)
            ins(mk_p('Normal')) # padding below table
    elif style == 'FLOWCHART':
        ins(mk_flowchart())
        ins(mk_p('Normal'))
    elif style == 'equation':
        ins(mk_p(style, text, align='center', sz=10, italic=True))
    else:
        # Check alignment logic
        align = None
        if style == 'BodyText': align = 'both'
        ins(mk_p(style, text, align=align))

# ── Save ──────────────────────────────────────────────────────
output = r'C:\Users\Kishan Shetty\Downloads\AstraSky-maing\AstraCity_Conference_Final.docx'
tmpl.save(output)
print('Done! Saved to', output)
