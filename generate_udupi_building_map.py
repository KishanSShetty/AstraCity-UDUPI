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
except Exception as e:
    print("Road load warning:", e)
    roads = None

print(f"Total Udupi buildings loaded: {len(buildings)}")

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

# Compute tight bounding box of Udupi wards to remove empty outer margins!
bounds = wards.total_bounds  # [minx, miny, maxx, maxy]
minx, miny, maxx, maxy = bounds
pad_x = (maxx - minx) * 0.015
pad_y = (maxy - miny) * 0.015

# Generate high resolution map with enlarged, tightly focused map view
fig = plt.figure(figsize=(20, 14), dpi=300, facecolor='#FFFFFF')
gs = gridspec.GridSpec(1, 2, width_ratios=[82, 18], wspace=0.01)

# MAP PANEL
ax_map = fig.add_subplot(gs[0])
ax_map.set_facecolor('#F8FAFC')

# Tight crop to remove all outer whitespace!
ax_map.set_xlim(minx - pad_x, maxx + pad_x)
ax_map.set_ylim(miny - pad_y, maxy + pad_y)

if roads is not None:
    roads.plot(ax=ax_map, color='#E2E8F0', linewidth=0.7, alpha=0.9, zorder=1)

wards.plot(ax=ax_map, color='#FFFFFF', edgecolor='#CBD5E1', linewidth=1.0, alpha=0.95, zorder=2)

for btype, color in building_colors.items():
    subset = buildings[buildings['building_type'] == btype]
    if len(subset) > 0:
        # Enlarge building footprint display with bright matching stroke
        subset.plot(ax=ax_map, color=color, edgecolor=color, linewidth=0.8, alpha=1.0, zorder=3)

wards.boundary.plot(ax=ax_map, color='#0F172A', linewidth=2.0, zorder=10)
ax_map.set_axis_off()

# LEGEND PANEL
ax_leg = fig.add_subplot(gs[1])
ax_leg.set_facecolor('#FFFFFF')
ax_leg.set_xlim(0, 1)
ax_leg.set_ylim(0, 1)
ax_leg.set_axis_off()

ax_leg.text(0.05, 0.95, 'Udupi City', fontsize=18, fontweight='bold', color='#0F172A', transform=ax_leg.transAxes, va='top')
ax_leg.text(0.05, 0.91, 'Building Type Map', fontsize=12, fontweight='semibold', color='#475569', transform=ax_leg.transAxes, va='top')
ax_leg.text(0.05, 0.88, f"Total: {len(buildings):,} buildings", fontsize=10, color='#64748B', transform=ax_leg.transAxes, va='top')
ax_leg.plot([0.05, 0.95], [0.86, 0.86], color='#E2E8F0', linewidth=1.2, transform=ax_leg.transAxes)

y = 0.82
for btype, color in building_colors.items():
    cnt = len(buildings[buildings['building_type'] == btype])
    pct = (cnt / len(buildings)) * 100
    
    rect = plt.Rectangle((0.05, y - 0.022), 0.07, 0.028, facecolor=color, edgecolor='#0F172A', linewidth=0.5, transform=ax_leg.transAxes)
    ax_leg.add_patch(rect)
    
    ax_leg.text(0.16, y, btype, fontsize=10.5, fontweight='bold', color='#0F172A', transform=ax_leg.transAxes, va='center')
    ax_leg.text(0.16, y - 0.024, f"{cnt:,} ({pct:.1f}%)", fontsize=9, color='#64748B', transform=ax_leg.transAxes, va='center')
    y -= 0.078

ax_leg.text(0.05, 0.05, 'Derived from OpenStreetMap GIS data', fontsize=8, color='#94A3B8', style='italic', transform=ax_leg.transAxes)

output_img = 'public/building_map_legend.png'
plt.savefig(output_img, dpi=300, bbox_inches='tight', pad_inches=0.05, facecolor='#FFFFFF')
plt.close()
print(f"Saved tightly cropped & enlarged Udupi building map to {output_img}")
