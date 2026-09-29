import geopandas as gpd
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.gridspec as gridspec
import matplotlib.patches as mpatches
import warnings
import json
import os

warnings.filterwarnings('ignore')

print("Loading Udupi GeoJSON datasets...")
buildings_path = 'public/data/buildings_udupi.geojson'
wards_path = 'public/data/udupi_wards.geojson'
roads_path = 'public/data/udupi_road_network.geojson'

buildings = gpd.read_file(buildings_path)
wards = gpd.read_file(wards_path)

try:
    roads = gpd.read_file(roads_path)
    # Clip roads strictly to ward boundary so outlier road lines don't inflate map extent
    roads = gpd.clip(roads, wards)
except Exception as e:
    print("Road load warning:", e)
    roads = None

# Clip buildings strictly to wards
buildings = gpd.clip(buildings, wards)
print(f"Total Udupi buildings within ward boundary: {len(buildings)}")

def classify_building(row):
    b = str(row.get('building', '')).lower()
    amenity = str(row.get('amenity', '')).lower()
    shop = str(row.get('shop', '')).lower()
    name = str(row.get('name', '')).lower()
    religion = str(row.get('religion', '')).lower()
    landuse = str(row.get('landuse', '')).lower()
    healthcare = str(row.get('healthcare', '')).lower()

    if b == 'nan': b = ''
    if amenity == 'nan': amenity = ''
    if shop == 'nan': shop = ''
    if name == 'nan': name = ''
    if religion == 'nan': religion = ''
    if landuse == 'nan': landuse = ''
    if healthcare == 'nan': healthcare = ''

    # Medical
    if any(x in b or x in amenity or x in healthcare or x in name for x in ['hospital', 'clinic', 'medical', 'doctors', 'health']):
        return 'Hospital/Medical'

    # Educational
    if any(x in b or x in amenity or x in name for x in ['school', 'university', 'college', 'kindergarten', 'education', 'sanskrit']):
        return 'Educational'

    # Religious
    if (religion in ['hindu', 'christian', 'muslim', 'jain', 'buddhist', 'sikh']) or any(x in b or x in amenity or x in name for x in ['temple', 'church', 'mosque', 'mutt', 'matha', 'worship', 'mandir']):
        return 'Religious'

    # Commercial/Retail
    if (shop != '' and shop != 'none') or any(x in b or x in amenity or x in landuse or x in name for x in ['commercial', 'retail', 'shop', 'supermarket', 'mall', 'plaza', 'cinema', 'hotel', 'lodge']):
        return 'Commercial/Retail'

    # Government / Office / Civic
    if any(x in b or x in amenity or x in name for x in ['office', 'court', 'townhall', 'police', 'post_office', 'public_building', 'bank', 'lic']):
        return 'Government/Office'

    # Industrial
    if any(x in b or x in landuse or x in name for x in ['industrial', 'warehouse', 'factory', 'manufacture']):
        return 'Industrial'

    # Apartments vs Residential House
    if any(x in b for x in ['apartments', 'apartment', 'flat', 'dormitory']):
        return 'Residential (Apartment)'

    # Default all generic buildings / houses to Residential (House)
    return 'Residential (House)'

buildings['building_type'] = buildings.apply(classify_building, axis=1)

# Color Scheme — VIBRANT ORANGE for Residential
building_colors = {
    'Residential (House)':      '#FF7A00', # Vibrant Bright Orange
    'Residential (Apartment)':  '#D93800', # Deep Red-Orange
    'Commercial/Retail':        '#0088FF', # Bright Sky Blue
    'Government/Office':        '#1E3A8A', # Deep Navy Blue
    'Educational':              '#EAB308', # Vivid Yellow
    'Religious':                '#9333EA', # Vivid Purple
    'Hospital/Medical':         '#EF4444', # Bright Red
    'Industrial':               '#334155', # Dark Slate
}

buildings['color'] = buildings['building_type'].map(lambda x: building_colors.get(x, '#FF7A00'))

# Calculate exact aspect ratio of Udupi ward boundary
minx, miny, maxx, maxy = wards.total_bounds
width = maxx - minx
height = maxy - miny
aspect = width / height

# Adjust figure dimensions so the map fills 100% of vertical and horizontal space!
fig_h = 14
fig_w = fig_h * aspect + 3.5

fig = plt.figure(figsize=(fig_w, fig_h), dpi=300, facecolor='#FFFFFF')
gs = gridspec.GridSpec(1, 2, width_ratios=[88, 12], wspace=0.005)

# MAP PANEL
ax_map = fig.add_subplot(gs[0])
ax_map.set_facecolor('#F8FAFC')

# Tight crop to exact ward boundary coordinates with minimal 0.5% padding
pad_x = width * 0.008
pad_y = height * 0.008
ax_map.set_xlim(minx - pad_x, maxx + pad_x)
ax_map.set_ylim(miny - pad_y, maxy + pad_y)

if roads is not None:
    roads.plot(ax=ax_map, color='#E2E8F0', linewidth=0.8, alpha=0.9, zorder=1)

wards.plot(ax=ax_map, color='#FFFFFF', edgecolor='#CBD5E1', linewidth=1.2, alpha=0.98, zorder=2)

for btype, color in building_colors.items():
    subset = buildings[buildings['building_type'] == btype]
    if len(subset) > 0:
        # Enlarge building footprints with vivid matching edge stroke
        subset.plot(ax=ax_map, color=color, edgecolor=color, linewidth=1.2, alpha=1.0, zorder=3)

wards.boundary.plot(ax=ax_map, color='#0F172A', linewidth=2.5, zorder=10)
ax_map.set_axis_off()

# LEGEND PANEL
ax_leg = fig.add_subplot(gs[1])
ax_leg.set_facecolor('#FFFFFF')
ax_leg.set_xlim(0, 1)
ax_leg.set_ylim(0, 1)
ax_leg.set_axis_off()

ax_leg.text(0.02, 0.96, 'Udupi City', fontsize=18, fontweight='bold', color='#0F172A', transform=ax_leg.transAxes, va='top')
ax_leg.text(0.02, 0.92, 'Building Type Map', fontsize=12, fontweight='semibold', color='#475569', transform=ax_leg.transAxes, va='top')
ax_leg.text(0.02, 0.89, f"Total: {len(buildings):,} buildings", fontsize=10, color='#64748B', transform=ax_leg.transAxes, va='top')
ax_leg.plot([0.02, 0.98], [0.87, 0.87], color='#E2E8F0', linewidth=1.2, transform=ax_leg.transAxes)

y = 0.83
for btype, color in building_colors.items():
    cnt = len(buildings[buildings['building_type'] == btype])
    pct = (cnt / len(buildings)) * 100
    
    rect = plt.Rectangle((0.02, y - 0.022), 0.12, 0.028, facecolor=color, edgecolor='#0F172A', linewidth=0.5, transform=ax_leg.transAxes)
    ax_leg.add_patch(rect)
    
    ax_leg.text(0.18, y, btype, fontsize=10, fontweight='bold', color='#0F172A', transform=ax_leg.transAxes, va='center')
    ax_leg.text(0.18, y - 0.024, f"{cnt:,} ({pct:.1f}%)", fontsize=8.5, color='#64748B', transform=ax_leg.transAxes, va='center')
    y -= 0.078

output_img = 'public/building_map_legend.png'
plt.savefig(output_img, dpi=300, bbox_inches='tight', pad_inches=0.01, facecolor='#FFFFFF')
plt.close()
print(f"Saved massive, zero-whitespace Udupi building map to {output_img}")
