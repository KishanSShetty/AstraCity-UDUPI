#!/usr/bin/env python3
"""
Generate AstraCity 10-slide PowerPoint presentation.
Theme: Deep teal / forest green + amber accent on dark/light backgrounds.
All figures taken exactly from the Audit report.
"""

from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.chart import XL_CHART_TYPE, XL_LABEL_POSITION, XL_LEGEND_POSITION
from pptx.chart.data import CategoryChartData
import os

# ── Colour Palette ──────────────────────────────────────────────────
TEAL_DARK   = RGBColor(0x0A, 0x2E, 0x36)   # deep teal / navy-ish
TEAL_MED    = RGBColor(0x13, 0x4E, 0x5E)   # medium teal
TEAL_LIGHT  = RGBColor(0x1A, 0x6B, 0x7A)   # lighter teal
FOREST      = RGBColor(0x1B, 0x5E, 0x20)   # forest green
AMBER       = RGBColor(0xFF, 0xB3, 0x00)   # amber accent
AMBER_LIGHT = RGBColor(0xFF, 0xD5, 0x4F)   # lighter amber
WHITE       = RGBColor(0xFF, 0xFF, 0xFF)
OFF_WHITE   = RGBColor(0xF5, 0xF5, 0xF0)
LIGHT_BG    = RGBColor(0xF0, 0xF4, 0xF4)   # very light teal-grey
BLACK       = RGBColor(0x1A, 0x1A, 0x1A)
GREY_TEXT   = RGBColor(0x4A, 0x4A, 0x4A)
GREY_LIGHT  = RGBColor(0x9E, 0x9E, 0x9E)
RED_ACCENT  = RGBColor(0xE5, 0x39, 0x35)
GREEN_ACC   = RGBColor(0x2E, 0x7D, 0x32)
CHART_COLORS = [TEAL_DARK, TEAL_MED, TEAL_LIGHT, AMBER, FOREST, RGBColor(0x00,0x96,0x88)]

SLD_W = Inches(13.333)  # 16:9
SLD_H = Inches(7.5)

prs = Presentation()
prs.slide_width  = SLD_W
prs.slide_height = SLD_H


# ── Helper functions ────────────────────────────────────────────────

def set_slide_bg(slide, color):
    bg = slide.background
    fill = bg.fill
    fill.solid()
    fill.fore_color.rgb = color

def set_slide_gradient_bg(slide, color1, color2):
    """Set a gradient background on a slide."""
    bg = slide.background
    fill = bg.fill
    fill.gradient()
    fill.gradient_stops[0].color.rgb = color1
    fill.gradient_stops[0].position = 0.0
    fill.gradient_stops[1].color.rgb = color2
    fill.gradient_stops[1].position = 1.0

def add_textbox(slide, left, top, width, height, text, font_size=14,
                color=BLACK, bold=False, alignment=PP_ALIGN.LEFT,
                font_name='Calibri', line_spacing=1.15):
    txBox = slide.shapes.add_textbox(left, top, width, height)
    tf = txBox.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = text
    p.font.size = Pt(font_size)
    p.font.color.rgb = color
    p.font.bold = bold
    p.font.name = font_name
    p.alignment = alignment
    p.space_after = Pt(2)
    if line_spacing != 1.15:
        p.line_spacing = Pt(font_size * line_spacing)
    return txBox

def add_multiline_textbox(slide, left, top, width, height, lines,
                          font_size=14, color=BLACK, bold=False,
                          alignment=PP_ALIGN.LEFT, font_name='Calibri',
                          line_spacing=1.15, bullet=False):
    """lines = list of (text, font_size, color, bold) or just str"""
    txBox = slide.shapes.add_textbox(left, top, width, height)
    tf = txBox.text_frame
    tf.word_wrap = True
    for i, line in enumerate(lines):
        if isinstance(line, tuple):
            txt, fs, clr, bld = line
        else:
            txt, fs, clr, bld = line, font_size, color, bold
        if i == 0:
            p = tf.paragraphs[0]
        else:
            p = tf.add_paragraph()
        if bullet:
            p.text = txt
        else:
            p.text = txt
        p.font.size = Pt(fs)
        p.font.color.rgb = clr
        p.font.bold = bld
        p.font.name = font_name
        p.alignment = alignment
        p.space_after = Pt(3)
    return txBox

def add_table(slide, left, top, width, height, rows, cols,
              header_bg=TEAL_DARK, header_fg=WHITE, body_bg=WHITE,
              body_fg=BLACK, col_widths=None, font_size=11):
    """Add a styled table to a slide. rows = list of lists."""
    shape = slide.shapes.add_table(len(rows), cols, left, top, width, height)
    table = shape.table
    if col_widths:
        for i, w in enumerate(col_widths):
            table.columns[i].width = w
    for r_idx, row in enumerate(rows):
        for c_idx, cell_text in enumerate(row):
            cell = table.cell(r_idx, c_idx)
            cell.text = str(cell_text)
            for paragraph in cell.text_frame.paragraphs:
                paragraph.font.size = Pt(font_size)
                paragraph.font.name = 'Calibri'
                if r_idx == 0:
                    paragraph.font.bold = True
                    paragraph.font.color.rgb = header_fg
                    paragraph.alignment = PP_ALIGN.CENTER
                else:
                    paragraph.font.color.rgb = body_fg
                    # Right-align numeric columns (heuristic)
                    paragraph.alignment = PP_ALIGN.LEFT
            # Cell fill
            cell_fill = cell.fill
            cell_fill.solid()
            if r_idx == 0:
                cell_fill.fore_color.rgb = header_bg
            else:
                if r_idx % 2 == 0:
                    cell_fill.fore_color.rgb = RGBColor(0xE8, 0xF0, 0xF0)
                else:
                    cell_fill.fore_color.rgb = body_bg
            cell.vertical_anchor = MSO_ANCHOR.MIDDLE
    return shape

def add_rect(slide, left, top, width, height, fill_color, border_color=None):
    shape = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, left, top, width, height)
    shape.fill.solid()
    shape.fill.fore_color.rgb = fill_color
    if border_color:
        shape.line.fill.solid()
        shape.line.fill.fore_color.rgb = border_color
        shape.line.width = Pt(1)
    else:
        shape.line.fill.background()
    return shape

def add_rounded_rect(slide, left, top, width, height, fill_color, border_color=None):
    shape = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
    shape.fill.solid()
    shape.fill.fore_color.rgb = fill_color
    if border_color:
        shape.line.fill.solid()
        shape.line.fill.fore_color.rgb = border_color
        shape.line.width = Pt(1)
    else:
        shape.line.fill.background()
    return shape

def add_stat_card(slide, left, top, width, height, number, label,
                  num_color=AMBER, label_color=WHITE, bg_color=TEAL_MED):
    """Big stat callout card."""
    card = add_rounded_rect(slide, left, top, width, height, bg_color)
    # Number
    add_textbox(slide, left + Inches(0.15), top + Inches(0.15),
                width - Inches(0.3), Inches(0.7), number,
                font_size=28, color=num_color, bold=True,
                alignment=PP_ALIGN.CENTER)
    # Label
    add_textbox(slide, left + Inches(0.15), top + Inches(0.7),
                width - Inches(0.3), Inches(0.5), label,
                font_size=11, color=label_color, bold=False,
                alignment=PP_ALIGN.CENTER)

def add_slide_number(slide, num):
    """Slide number in bottom-right."""
    add_textbox(slide, Inches(12.3), Inches(7.05), Inches(0.8), Inches(0.3),
                str(num), font_size=10, color=GREY_LIGHT,
                alignment=PP_ALIGN.RIGHT)

def add_section_title(slide, title, subtitle=None, dark_bg=False):
    """Standard content slide title bar."""
    title_color = TEAL_DARK if not dark_bg else WHITE
    # Amber accent line
    add_rect(slide, Inches(0.5), Inches(0.35), Inches(0.08), Inches(0.5), AMBER)
    add_textbox(slide, Inches(0.75), Inches(0.25), Inches(10), Inches(0.6),
                title, font_size=36, color=title_color, bold=True)
    if subtitle:
        add_textbox(slide, Inches(0.75), Inches(0.85), Inches(10), Inches(0.4),
                    subtitle, font_size=14, color=GREY_TEXT if not dark_bg else RGBColor(0xB0,0xC4,0xC4))

def add_bar_chart(slide, left, top, width, height, categories, values,
                  series_names=None, chart_title=None, colors=None):
    """Add a bar chart."""
    chart_data = CategoryChartData()
    chart_data.categories = categories
    if series_names and isinstance(values[0], (list, tuple)):
        for name, vals in zip(series_names, values):
            chart_data.add_series(name, vals)
    else:
        chart_data.add_series(series_names[0] if series_names else 'Value', values)
    
    chart_frame = slide.shapes.add_chart(
        XL_CHART_TYPE.COLUMN_CLUSTERED, left, top, width, height, chart_data
    )
    chart = chart_frame.chart
    chart.has_legend = bool(series_names and len(series_names) > 1)
    if chart.has_legend:
        chart.legend.position = XL_LEGEND_POSITION.BOTTOM
        chart.legend.include_in_layout = False
        chart.legend.font.size = Pt(10)
    
    if chart_title:
        chart.has_title = True
        chart.chart_title.text_frame.paragraphs[0].text = chart_title
        chart.chart_title.text_frame.paragraphs[0].font.size = Pt(13)
        chart.chart_title.text_frame.paragraphs[0].font.bold = True
        chart.chart_title.text_frame.paragraphs[0].font.color.rgb = TEAL_DARK
    else:
        chart.has_title = False
    
    plot = chart.plots[0]
    plot.gap_width = 100
    
    if colors:
        for i, series in enumerate(plot.series):
            series.format.fill.solid()
            series.format.fill.fore_color.rgb = colors[i % len(colors)]
    else:
        for i, series in enumerate(plot.series):
            series.format.fill.solid()
            series.format.fill.fore_color.rgb = CHART_COLORS[i % len(CHART_COLORS)]
    
    # Data labels
    plot.has_data_labels = True
    data_labels = plot.data_labels
    data_labels.font.size = Pt(9)
    data_labels.font.color.rgb = TEAL_DARK
    data_labels.number_format = '#,##0.##'
    data_labels.show_value = True
    
    return chart_frame

# ═══════════════════════════════════════════════════════════════
# SLIDE 1 – Title Slide (Dark teal/navy background)
# ═══════════════════════════════════════════════════════════════
slide1 = prs.slides.add_slide(prs.slide_layouts[6])  # blank
set_slide_gradient_bg(slide1, TEAL_DARK, RGBColor(0x07, 0x1E, 0x26))

# Decorative amber line at top
add_rect(slide1, Inches(0), Inches(0), SLD_W, Inches(0.06), AMBER)

# Decorative bottom accent
add_rect(slide1, Inches(0), Inches(7.15), SLD_W, Inches(0.06), AMBER)

# Main title
add_textbox(slide1, Inches(1.5), Inches(1.0), Inches(10.3), Inches(0.8),
            "Audit: AstraCity", font_size=44, color=AMBER, bold=True,
            alignment=PP_ALIGN.CENTER, font_name='Calibri')

# Subtitle  
add_multiline_textbox(slide1, Inches(1.2), Inches(1.9), Inches(10.9), Inches(1.6), [
    ('Comprehensive Technical & Research Report of Audit done in HSR Layout', 18, OFF_WHITE, False),
    ('on SWM using Spacetech', 18, OFF_WHITE, False),
    ('', 8, OFF_WHITE, False),
    ('"A Digital Twin & AI-Powered Solid Waste Management Platform', 16, RGBColor(0xB0, 0xD0, 0xD0), False),
    ('for HSR Layout, Bengaluru"', 16, RGBColor(0xB0, 0xD0, 0xD0), False),
], alignment=PP_ALIGN.CENTER)

# Amber divider
add_rect(slide1, Inches(4.5), Inches(3.7), Inches(4.3), Inches(0.04), AMBER)

# Ward info  
add_textbox(slide1, Inches(1.5), Inches(3.95), Inches(10.3), Inches(0.35),
            "Ward: HSR Layout, Ward 174  |  City: Bengaluru (BBMP)  |  Report Version: Final, June 2026",
            font_size=14, color=RGBColor(0x8A, 0xB4, 0xB4), alignment=PP_ALIGN.CENTER)

# Team info
add_multiline_textbox(slide1, Inches(1.5), Inches(4.5), Inches(10.3), Inches(1.2), [
    ('Project Team: RVCE Students — NSS', 14, WHITE, True),
    ('Prepared by: Kishan Shetty (1RV24IS058)  |  Guide: Dr. M Lokeshwari', 13, RGBColor(0xB0, 0xC4, 0xC4), False),
], alignment=PP_ALIGN.CENTER)

# Algorithms badge area
algo_y = Inches(5.6)
algo_labels = ['Clarke-Wright CVRP', 'IPCC Methane Model', 'DBSCAN Dump Detection']
start_x = Inches(2.8)
for i, algo in enumerate(algo_labels):
    card = add_rounded_rect(slide1, start_x + Inches(i * 2.7), algo_y,
                            Inches(2.4), Inches(0.45), TEAL_MED, AMBER)
    add_textbox(slide1, start_x + Inches(i * 2.7) + Inches(0.1), algo_y + Inches(0.05),
                Inches(2.2), Inches(0.35), algo,
                font_size=11, color=AMBER_LIGHT, bold=True, alignment=PP_ALIGN.CENTER)

# NSS AEC label
add_textbox(slide1, Inches(1.5), Inches(6.3), Inches(10.3), Inches(0.35),
            "NSS AEC (HS237LA) — Semester Exam Submission — RV College of Engineering",
            font_size=12, color=GREY_LIGHT, alignment=PP_ALIGN.CENTER)

add_slide_number(slide1, 1)


# ═══════════════════════════════════════════════════════════════
# SLIDE 2 – Problem Statement (Light background)
# ═══════════════════════════════════════════════════════════════
slide2 = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_bg(slide2, LIGHT_BG)
add_section_title(slide2, "Problem Statement")

# Left: problem description
add_multiline_textbox(slide2, Inches(0.6), Inches(1.3), Inches(6.5), Inches(2.0), [
    ('Bengaluru generates ~5,000–6,000 tonnes of solid waste every day', 14, BLACK, True),
    ('', 6, BLACK, False),
    ('BBMP spends over ₹800 crores/year on waste management yet remains', 13, GREY_TEXT, False),
    ('reactive and unscientific.', 13, GREY_TEXT, False),
    ('', 8, BLACK, False),
    ('Civic administration currently cannot answer:', 13, TEAL_DARK, True),
    ('• Where illegal dumps are forming', 12, GREY_TEXT, False),
    ('• How much methane is leaking', 12, GREY_TEXT, False),
    ('• Whether routes are efficient', 12, GREY_TEXT, False),
    ('• Which wards will overflow next festival/monsoon', 12, GREY_TEXT, False),
    ('• How much money is recoverable', 12, GREY_TEXT, False),
])

# Right: HSR Layout pilot profile table
table_data = [
    ['Parameter', 'Value'],
    ['Area', '18.5 km²'],
    ['Population', '~1,10,000'],
    ['Buildings', '9,471'],
    ['Daily Waste', '55 Tonnes (CPCB 0.5 kg/capita/day)'],
    ['Dumpyards inside ward', '0'],
    ['BMUs inside ward', '0'],
    ['DWCCs inside ward', '6'],
    ['Nearest processing facility', '2.09 km South (Kudlu)'],
]
add_textbox(slide2, Inches(7.5), Inches(1.15), Inches(5.3), Inches(0.35),
            "HSR Layout Pilot Profile", font_size=16, color=TEAL_DARK, bold=True)
add_table(slide2, Inches(7.5), Inches(1.55), Inches(5.3), Inches(4.5),
          table_data, 2, col_widths=[Inches(2.5), Inches(2.8)], font_size=11)

add_slide_number(slide2, 2)


# ═══════════════════════════════════════════════════════════════
# SLIDE 3 – Infrastructure & Logistics Problems
# ═══════════════════════════════════════════════════════════════
slide3 = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_bg(slide3, LIGHT_BG)
add_section_title(slide3, "Infrastructure & Logistics Problems")

# Infrastructure deficit table
infra_data = [
    ['Problem', 'Finding', 'Impact'],
    ['No dumpyards in HSR', '0 of 3 Bengaluru dumpyards inside ward', 'Waste travels 21+ km to landfill'],
    ['No BMUs in HSR', '0 of 11 city BMUs inside ward', '33.55 T/day wet waste travels 2.1 km to Kudlu'],
    ['No Processing Units', '0 of 8 city units inside ward', 'Secondary processing 2+ km away'],
    ['Only 6 DWCCs', '10 TPD combined capacity vs 16.5 TPD dry waste', 'Overflow likely on high-generation days'],
]
add_table(slide3, Inches(0.5), Inches(1.3), Inches(12.3), Inches(2.8),
          infra_data, 3, col_widths=[Inches(2.5), Inches(4.9), Inches(4.9)], font_size=11)

# Routing & logistics findings — stat cards
add_textbox(slide3, Inches(0.5), Inches(4.3), Inches(5), Inches(0.35),
            "Routing & Logistics Findings", font_size=16, color=TEAL_DARK, bold=True)

# Three stat cards
add_stat_card(slide3, Inches(0.5), Inches(4.8), Inches(3.8), Inches(1.8),
              "132.44 → 32.41 km/day", "Route Distance (75.5% reduction)",
              num_color=AMBER, bg_color=TEAL_DARK)

add_stat_card(slide3, Inches(4.7), Inches(4.8), Inches(3.8), Inches(1.8),
              "25.1%", "Road segments are footways/paths\ninaccessible to motorised vehicles",
              num_color=RED_ACCENT, bg_color=TEAL_MED)

add_stat_card(slide3, Inches(8.9), Inches(4.8), Inches(3.8), Inches(1.8),
              "41.4%", "Narrow residential lanes (2–4 m)\naccessible only to small auto-tippers",
              num_color=AMBER_LIGHT, bg_color=TEAL_MED)

add_slide_number(slide3, 3)


# ═══════════════════════════════════════════════════════════════
# SLIDE 4 – Segregation Failures & Illegal Dumping
# ═══════════════════════════════════════════════════════════════
slide4 = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_bg(slide4, LIGHT_BG)
add_section_title(slide4, "Segregation Failures & Illegal Dumping")

# Left: Segregation rate table
add_textbox(slide4, Inches(0.5), Inches(1.15), Inches(5.5), Inches(0.35),
            "Segregation Rate by Zone", font_size=16, color=TEAL_DARK, bold=True)

seg_data = [
    ['Sub-zone', 'Rate', 'Status'],
    ['North HSR', '68%', 'Good'],
    ['West HSR', '62%', 'Good'],
    ['Central HSR', '55%', 'Medium'],
    ['South HSR', '48%', 'Medium'],
    ['East HSR', '42%', 'Critical'],
    ['Commercial zones', '38%', 'Alarming'],
]
add_table(slide4, Inches(0.5), Inches(1.55), Inches(5.5), Inches(3.5),
          seg_data, 3, col_widths=[Inches(2.0), Inches(1.5), Inches(2.0)], font_size=12)

# Segregation bar chart
seg_zones = ['North', 'West', 'Central', 'South', 'East', 'Commercial']
seg_rates = [68, 62, 55, 48, 42, 38]
add_bar_chart(slide4, Inches(0.5), Inches(5.2), Inches(5.5), Inches(2.0),
              seg_zones, seg_rates, series_names=['Segregation Rate %'],
              chart_title='Segregation Rate (%)',
              colors=[GREEN_ACC, GREEN_ACC, AMBER, AMBER, RED_ACCENT, RED_ACCENT])

# Right: Illegal dumping table
add_textbox(slide4, Inches(6.5), Inches(1.15), Inches(6.3), Inches(0.35),
            "Satellite-Detected Illegal Dump Sites", font_size=16, color=TEAL_DARK, bold=True)

dump_data = [
    ['Site', 'Risk', 'Area (m²)', 'Priority'],
    ['1', 'High', '264', 'P0 – Same-day cleanup'],
    ['2', 'High', '182', 'P0 – Same-day cleanup'],
    ['3', 'Medium', '200', 'P1 – 48 hours'],
    ['4', 'Medium', '147', 'P1 – 48 hours'],
]
add_table(slide4, Inches(6.5), Inches(1.55), Inches(6.3), Inches(2.8),
          dump_data, 4, col_widths=[Inches(0.8), Inches(1.2), Inches(1.3), Inches(3.0)], font_size=12)

# Risk indicators (visual)
add_stat_card(slide4, Inches(6.5), Inches(4.8), Inches(3.0), Inches(1.4),
              "793 m²", "Total Illegal Dump Area Detected",
              num_color=RED_ACCENT, bg_color=TEAL_DARK)

add_stat_card(slide4, Inches(9.8), Inches(4.8), Inches(3.0), Inches(1.4),
              "4 Sites", "DBSCAN Cluster Detection",
              num_color=AMBER, bg_color=TEAL_MED)

add_slide_number(slide4, 4)


# ═══════════════════════════════════════════════════════════════
# SLIDE 5 – LULC Classification & Base Infrastructure Data
# ═══════════════════════════════════════════════════════════════
slide5 = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_bg(slide5, LIGHT_BG)
add_section_title(slide5, "LULC Classification & Base Infrastructure Data",
                  "QGIS · Semi-Automatic Classification Plugin · Sentinel-2 · OSM")

# LULC table (top-left)
add_textbox(slide5, Inches(0.5), Inches(1.2), Inches(4.5), Inches(0.3),
            "Land Use / Land Cover (LULC)", font_size=14, color=TEAL_DARK, bold=True)
lulc_data = [
    ['Class', 'Area (km²)', '%'],
    ['Built-up', '11.85', '64.1%'],
    ['Vegetation', '3.26', '17.6%'],
    ['Open Land', '2.83', '15.3% (highest dump risk)'],
    ['Water Bodies', '0.56', '3.0%'],
]
add_table(slide5, Inches(0.5), Inches(1.55), Inches(4.5), Inches(2.5),
          lulc_data, 3, col_widths=[Inches(1.5), Inches(1.2), Inches(1.8)], font_size=11)

# LULC Pie chart
lulc_chart_data = CategoryChartData()
lulc_chart_data.categories = ['Built-up', 'Vegetation', 'Open Land', 'Water Bodies']
lulc_chart_data.add_series('Area', [64.1, 17.6, 15.3, 3.0])
lulc_chart_frame = slide5.shapes.add_chart(
    XL_CHART_TYPE.PIE, Inches(0.5), Inches(4.2), Inches(4.5), Inches(3.0), lulc_chart_data
)
lulc_chart = lulc_chart_frame.chart
lulc_chart.has_title = False
lulc_chart.has_legend = True
lulc_chart.legend.position = XL_LEGEND_POSITION.BOTTOM
lulc_chart.legend.font.size = Pt(9)
plot_lulc = lulc_chart.plots[0]
plot_lulc.has_data_labels = True
plot_lulc.data_labels.font.size = Pt(9)
plot_lulc.data_labels.show_percentage = True
plot_lulc.data_labels.show_value = False
# Pie colors
pie_colors = [TEAL_DARK, FOREST, AMBER, RGBColor(0x42, 0xA5, 0xF5)]
for i, point in enumerate(plot_lulc.series[0].points):
    point.format.fill.solid()
    point.format.fill.fore_color.rgb = pie_colors[i]

# Road network (top-right)
add_textbox(slide5, Inches(5.3), Inches(1.2), Inches(7.5), Inches(0.3),
            "Road Network (2,027 segments)", font_size=14, color=TEAL_DARK, bold=True)
road_data = [
    ['Type', 'Count', '%'],
    ['Residential', '840', '41.4%'],
    ['Footway', '509', '25.1%'],
    ['Tertiary', '191', '9.4%'],
    ['Service', '179', '8.8%'],
    ['Secondary', '113', '5.6%'],
    ['Others', '96', '4.8%'],
    ['Trunk/ORR', '38', '1.9%'],
    ['Path', '51', '2.5%'],
    ['Primary', '10', '0.5%'],
]
add_table(slide5, Inches(5.3), Inches(1.55), Inches(3.5), Inches(4.2),
          road_data, 3, col_widths=[Inches(1.3), Inches(1.0), Inches(1.2)], font_size=10)

# Building footprints (right)
add_textbox(slide5, Inches(9.1), Inches(1.2), Inches(4.0), Inches(0.3),
            "Buildings (9,471 total)", font_size=14, color=TEAL_DARK, bold=True)
building_data = [
    ['Type', 'Count', '%'],
    ['Independent Houses', '8,998', '94.8%'],
    ['Apartments', '250', '2.6%'],
    ['Commercial/Retail', '137', '1.4%'],
    ['Office/IT', '39', '0.4%'],
    ['Schools', '15', '0.2%'],
    ['Hospitals', '2', '—'],
]
add_table(slide5, Inches(9.1), Inches(1.55), Inches(3.8), Inches(3.5),
          building_data, 3, col_widths=[Inches(1.6), Inches(1.0), Inches(1.2)], font_size=10)

add_slide_number(slide5, 5)


# ═══════════════════════════════════════════════════════════════
# SLIDE 6 – Digital Twin & Waste Generation Model
# ═══════════════════════════════════════════════════════════════
slide6 = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_bg(slide6, LIGHT_BG)
add_section_title(slide6, "Digital Twin & Waste Generation Model")

# Three-layer architecture diagram (using shapes)
layers = [
    ("Layer 1: Spatial / Static", "9,471 buildings · 2,027 roads · 6 DWCCs · LULC raster", TEAL_DARK),
    ("Layer 2: Simulation Engine / Dynamic", "Waste formula · 54 pre-computed scenarios", TEAL_MED),
    ("Layer 3: Optimisation & Analytics", "Clarke-Wright CVRP · Carbon credit calculator · Ward scoring", FOREST),
]

add_textbox(slide6, Inches(0.5), Inches(1.2), Inches(6), Inches(0.3),
            "Three-Layer Digital Twin Architecture", font_size=14, color=TEAL_DARK, bold=True)

for i, (title, desc, bg) in enumerate(layers):
    y_pos = Inches(1.6) + Inches(i * 1.2)
    card = add_rounded_rect(slide6, Inches(0.5), y_pos, Inches(5.8), Inches(1.0), bg)
    add_textbox(slide6, Inches(0.7), y_pos + Inches(0.08),
                Inches(5.4), Inches(0.4), title,
                font_size=14, color=AMBER, bold=True)
    add_textbox(slide6, Inches(0.7), y_pos + Inches(0.5),
                Inches(5.4), Inches(0.4), desc,
                font_size=11, color=WHITE)
    # Arrow between layers
    if i < 2:
        arrow_y = y_pos + Inches(1.0)
        add_textbox(slide6, Inches(3.0), arrow_y, Inches(0.6), Inches(0.25),
                    "▼", font_size=16, color=AMBER, bold=True, alignment=PP_ALIGN.CENTER)

# Right: Bar chart for scenario results
add_textbox(slide6, Inches(6.8), Inches(1.2), Inches(6), Inches(0.3),
            "Digital Twin Scenario Results", font_size=14, color=TEAL_DARK, bold=True)

scenarios = ['Normal Day', 'Heavy Rainfall', 'Ganesh\nChaturthi', 'Rain + Festival\n(Worst Case)']
waste_values = [14.08, 16.19, 18.02, 21.86]
overloaded_bins = [2, 3, 4, 5]

add_bar_chart(slide6, Inches(6.8), Inches(1.55), Inches(5.8), Inches(3.0),
              scenarios, waste_values, series_names=['Waste (T/day)'],
              chart_title='Waste Generation per Day (Tonnes)',
              colors=[TEAL_LIGHT, TEAL_MED, AMBER, RED_ACCENT])

# Scenario detail table
scenario_tbl = [
    ['Scenario', 'Waste/Day', 'Change', 'Overloaded Bins'],
    ['Normal Day', '14.08 T', '—', '2'],
    ['Heavy Rainfall', '16.19 T', '+15%', '3'],
    ['Ganesh Chaturthi', '18.02 T', '+28%', '4'],
    ['Rain + Festival (Worst)', '21.86 T', '+55%', '5'],
]
add_table(slide6, Inches(6.8), Inches(4.8), Inches(5.8), Inches(2.5),
          scenario_tbl, 4, col_widths=[Inches(2.0), Inches(1.2), Inches(1.1), Inches(1.5)], font_size=11)

add_slide_number(slide6, 6)


# ═══════════════════════════════════════════════════════════════
# SLIDE 7 – Route Optimization (CVRPTW)
# ═══════════════════════════════════════════════════════════════
slide7 = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_bg(slide7, LIGHT_BG)
add_section_title(slide7, "Route Optimization (CVRPTW)",
                  "Clarke-Wright Savings Algorithm · Capacitated Vehicle Routing Problem with Time Windows")

# Vehicle fleet table (left)
add_textbox(slide7, Inches(0.5), Inches(1.3), Inches(5.8), Inches(0.3),
            "Vehicle Fleet", font_size=14, color=TEAL_DARK, bold=True)
fleet_data = [
    ['Vehicle', 'Capacity', 'Min Road Width', 'Count'],
    ['Large Compactor', '10,000 kg', '>6 m', '2'],
    ['Small Compactor', '5,000 kg', '>4 m', '2'],
    ['Auto Tipper', '500 kg', '>2 m', '12'],
    ['Push Cart', '200 kg', 'Any', '8'],
    ['Liquid Tanker', '5,000 L', '>9 m', '1'],
    ['Total Fleet', '—', '—', '25'],
]
add_table(slide7, Inches(0.5), Inches(1.7), Inches(5.8), Inches(3.5),
          fleet_data, 4, col_widths=[Inches(1.6), Inches(1.3), Inches(1.5), Inches(1.4)], font_size=11)

# Route optimization results table (right)
add_textbox(slide7, Inches(6.8), Inches(1.3), Inches(6), Inches(0.3),
            "Route Optimisation Results", font_size=14, color=TEAL_DARK, bold=True)
route_data = [
    ['Metric', 'Before', 'After', 'Improvement'],
    ['Total daily route distance', '132.44 km', '32.41 km', '75.5% reduction'],
    ['Daily fuel cost', '₹2,072', '₹507', '₹1,565 saved/day'],
    ['Network coverage', '~80%', '95.3%', '+15.3%'],
    ['Average collection time', '4.5 hrs', '3.0 hrs', '33% faster'],
]
add_table(slide7, Inches(6.8), Inches(1.7), Inches(6.0), Inches(2.8),
          route_data, 4, col_widths=[Inches(2.0), Inches(1.2), Inches(1.2), Inches(1.6)], font_size=11)

# Before/after bar chart
add_bar_chart(slide7, Inches(6.8), Inches(4.6), Inches(6.0), Inches(2.6),
              ['Route Distance\n(km)', 'Fuel Cost\n(₹ x100)', 'Collection Time\n(hrs x10)'],
              [[132.44, 20.72, 45], [32.41, 5.07, 30]],
              series_names=['Before', 'After'],
              chart_title='Before vs After Optimization',
              colors=[RGBColor(0xCC, 0x33, 0x33), GREEN_ACC])

# Primary routes info
add_textbox(slide7, Inches(0.5), Inches(5.4), Inches(5.8), Inches(0.3),
            "3 Primary Compactor Routes", font_size=14, color=TEAL_DARK, bold=True)
routes_info = [
    ('Truck 1 (West): 12.54 km, 3,050 kg', 12, GREY_TEXT, False),
    ('Truck 2 (Central): 9.63 km, 3,115 kg', 12, GREY_TEXT, False),
    ('Truck 3 (East): 15.93 km, 3,104 kg', 12, GREY_TEXT, False),
]
add_multiline_textbox(slide7, Inches(0.5), Inches(5.8), Inches(5.8), Inches(1.2), routes_info)

add_slide_number(slide7, 7)


# ═══════════════════════════════════════════════════════════════
# SLIDE 8 – Environmental Impact & Bio-Methanisation
# ═══════════════════════════════════════════════════════════════
slide8 = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_bg(slide8, LIGHT_BG)
add_section_title(slide8, "Environmental Impact & Bio-Methanisation",
                  "IPCC Methane Model · Bio-methanisation Process")

# Big stat callout cards
add_stat_card(slide8, Inches(0.5), Inches(1.4), Inches(2.9), Inches(1.5),
              "3,548 m³/day", "CH₄ Generated",
              num_color=AMBER, bg_color=TEAL_DARK)

add_stat_card(slide8, Inches(3.7), Inches(1.4), Inches(2.9), Inches(1.5),
              "71.1 T/day", "CO₂e Emissions\n→ 25,959 T/year",
              num_color=RED_ACCENT, bg_color=TEAL_DARK)

add_stat_card(slide8, Inches(6.9), Inches(1.4), Inches(2.9), Inches(1.5),
              "21,285 kWh/day", "Energy Potential",
              num_color=AMBER_LIGHT, bg_color=TEAL_MED)

add_stat_card(slide8, Inches(10.1), Inches(1.4), Inches(2.9), Inches(1.5),
              "7,095 Homes", "Could Be Powered",
              num_color=GREEN_ACC, bg_color=TEAL_MED)

# Kudlu BMU info (left)
add_textbox(slide8, Inches(0.5), Inches(3.3), Inches(6), Inches(0.3),
            "Kudlu BMU — Key Facts", font_size=14, color=TEAL_DARK, bold=True)
kudlu_info = [
    ('Distance from HSR: 2.10 km', 13, GREY_TEXT, False),
    ('Receives: 33.55 T/day wet waste', 13, GREY_TEXT, False),
    ('Produces: ~10 T/day compost', 13, GREY_TEXT, False),
]
add_multiline_textbox(slide8, Inches(0.5), Inches(3.7), Inches(5.5), Inches(1.2), kudlu_info)

# Bio-methanisation process diagram (shaped boxes with arrows)
add_textbox(slide8, Inches(0.5), Inches(5.0), Inches(12), Inches(0.3),
            "Bio-Methanisation Process (10–15 days → 55–70% CH₄ biogas)", font_size=14, color=TEAL_DARK, bold=True)

stages = ['Hydrolysis', 'Acidogenesis', 'Acetogenesis', 'Methanogenesis']
stage_colors = [TEAL_LIGHT, TEAL_MED, FOREST, TEAL_DARK]
for i, (stage, clr) in enumerate(zip(stages, stage_colors)):
    x = Inches(0.5) + Inches(i * 3.2)
    card = add_rounded_rect(slide8, x, Inches(5.5), Inches(2.6), Inches(0.8), clr)
    add_textbox(slide8, x + Inches(0.1), Inches(5.55),
                Inches(2.4), Inches(0.7), stage,
                font_size=14, color=WHITE, bold=True, alignment=PP_ALIGN.CENTER)
    if i < 3:
        add_textbox(slide8, x + Inches(2.6), Inches(5.6),
                    Inches(0.6), Inches(0.6), "→",
                    font_size=22, color=AMBER, bold=True, alignment=PP_ALIGN.CENTER)

# Output label
add_rounded_rect(slide8, Inches(9.5), Inches(6.5), Inches(3.3), Inches(0.6), AMBER)
add_textbox(slide8, Inches(9.5), Inches(6.52), Inches(3.3), Inches(0.55),
            "Output: 55–70% CH₄ Biogas", font_size=13, color=TEAL_DARK, bold=True,
            alignment=PP_ALIGN.CENTER)

add_slide_number(slide8, 8)


# ═══════════════════════════════════════════════════════════════
# SLIDE 9 – Economic Impact & Key Findings
# ═══════════════════════════════════════════════════════════════
slide9 = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_bg(slide9, LIGHT_BG)
add_section_title(slide9, "Economic Impact & Key Findings")

# Financial benefits table
add_textbox(slide9, Inches(0.5), Inches(1.15), Inches(8), Inches(0.35),
            "Complete Financial Benefits Summary", font_size=16, color=TEAL_DARK, bold=True)

fin_data = [
    ['Benefit Category', 'Annual Value', 'Basis'],
    ['Fuel Savings', '₹3.28 Cr', '100 km/day saved × ₹20/km × 25 vehicles × 365'],
    ['Illegal Dump Cleanup Avoided', '₹0.45 Cr', '30 dumps prevented × ₹52,000'],
    ['Labour Savings', '₹0.38 Cr', '1.5 hrs × 25 trucks × ₹180/hr × 365'],
    ['Carbon Credits (CCTS 2023)', '₹5.19 Cr', '25,959 T CO₂e × ₹2,000/tonne'],
    ['Compost Revenue', '₹0.12 Cr', '~10 T/day × ₹500/ton × 365'],
    ['TOTAL ANNUAL BENEFIT (HSR)', '₹9.42 Cr', 'Ward 174 alone'],
    ['Scaled to 198 wards', '₹1,865 Cr', 'Conservative estimate'],
]
add_table(slide9, Inches(0.5), Inches(1.55), Inches(12.3), Inches(4.0),
          fin_data, 3, col_widths=[Inches(3.0), Inches(2.0), Inches(7.3)], font_size=12)

# Highlight the total row — we'll color it specially
# (The table helper already handles alternating; the total is row 6)

# Key findings
add_textbox(slide9, Inches(0.5), Inches(5.8), Inches(4), Inches(0.3),
            "Key Findings", font_size=16, color=TEAL_DARK, bold=True)

findings = [
    ('① Kudlu co-location of BMU + Processing Unit saves ₹0.8 cr/yr in transport', 12, GREY_TEXT, False),
    ('② 509 footways (25.1%) create a 2.3 T/day push-cart capacity gap', 12, GREY_TEXT, False),
    ('③ At 198 wards, carbon credits scale to ₹1,028 crores/year', 12, GREY_TEXT, False),
]
add_multiline_textbox(slide9, Inches(0.5), Inches(6.2), Inches(8), Inches(1.2), findings)

# Big total callout
add_stat_card(slide9, Inches(9.5), Inches(5.7), Inches(3.3), Inches(1.5),
              "₹9.42 Cr/year", "Total Annual Benefit\nWard 174 alone",
              num_color=AMBER, bg_color=TEAL_DARK)

add_slide_number(slide9, 9)


# ═══════════════════════════════════════════════════════════════
# SLIDE 10 – App, Roadmap & Conclusion
# ═══════════════════════════════════════════════════════════════
slide10 = prs.slides.add_slide(prs.slide_layouts[6])
set_slide_bg(slide10, LIGHT_BG)
add_section_title(slide10, "App, Roadmap & Conclusion")

# AstraCity app tech stack
add_textbox(slide10, Inches(0.5), Inches(1.2), Inches(6), Inches(0.3),
            "AstraCity App — Technology Stack", font_size=14, color=TEAL_DARK, bold=True)
tech_items = [
    'Next.js 14 · TypeScript/React · Tailwind CSS',
    'MapLibre GL JS · Recharts · Gemini 1.5 Flash AI',
    '6 Pages: Landing · Smart Map · Simulation',
    '         Economic Impact · Ward Scoring · Report Export',
]
add_multiline_textbox(slide10, Inches(0.5), Inches(1.6), Inches(5.5), Inches(1.5), [
    (t, 12, GREY_TEXT, False) for t in tech_items
])

# Phase-wise expansion roadmap (horizontal flow)
add_textbox(slide10, Inches(0.5), Inches(3.1), Inches(12), Inches(0.3),
            "Phase-wise Expansion Roadmap", font_size=14, color=TEAL_DARK, bold=True)

phases = [
    ("Phase 1: Pilot", "Months 1–6", "Ward 174 + 4\nadjacent wards", TEAL_LIGHT),
    ("Phase 2: South BLR", "Months 7–18", "50 wards\n₹100–150 Cr/yr", TEAL_MED),
    ("Phase 3: Full BLR", "Months 19–36", "All 198 wards\n₹1,865 Cr/yr savings", FOREST),
    ("Phase 4: National", "Year 3+", "Smart Cities Mission\n₹900 Cr/yr minimum", TEAL_DARK),
]

for i, (title, timeline, details, bg) in enumerate(phases):
    x = Inches(0.5) + Inches(i * 3.2)
    card = add_rounded_rect(slide10, x, Inches(3.5), Inches(2.8), Inches(1.8), bg)
    add_textbox(slide10, x + Inches(0.1), Inches(3.55),
                Inches(2.6), Inches(0.4), title,
                font_size=13, color=AMBER, bold=True, alignment=PP_ALIGN.CENTER)
    add_textbox(slide10, x + Inches(0.1), Inches(3.95),
                Inches(2.6), Inches(0.3), timeline,
                font_size=11, color=AMBER_LIGHT, bold=False, alignment=PP_ALIGN.CENTER)
    add_textbox(slide10, x + Inches(0.1), Inches(4.3),
                Inches(2.6), Inches(0.7), details,
                font_size=10, color=WHITE, bold=False, alignment=PP_ALIGN.CENTER)
    # Arrow
    if i < 3:
        add_textbox(slide10, x + Inches(2.8), Inches(4.0),
                    Inches(0.4), Inches(0.5), "→",
                    font_size=20, color=AMBER, bold=True, alignment=PP_ALIGN.CENTER)

# Conclusion
add_rounded_rect(slide10, Inches(0.5), Inches(5.6), Inches(12.3), Inches(1.5), TEAL_DARK)
add_textbox(slide10, Inches(0.7), Inches(5.65), Inches(1.5), Inches(0.35),
            "Conclusion", font_size=16, color=AMBER, bold=True)
add_multiline_textbox(slide10, Inches(0.7), Inches(6.0), Inches(11.9), Inches(1.0), [
    ('AstraCity demonstrates a replicable, open-data digital twin for municipal solid waste management,', 13, WHITE, False),
    ('delivering a 75.5% routing efficiency gain and ₹9.42 crores/year in quantified savings for one ward alone.', 13, AMBER_LIGHT, True),
])

add_slide_number(slide10, 10)


# ═══════════════════════════════════════════════════════════════
# Save the presentation
# ═══════════════════════════════════════════════════════════════
output_path = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                           'AstraCity_Audit_Presentation.pptx')
prs.save(output_path)
print(f"[OK] Presentation saved to: {output_path}")
print(f"   Slides: {len(prs.slides)}")
