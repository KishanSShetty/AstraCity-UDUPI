"""Generate LULC map image from udupi_lulc.geojson and water bodies from OSM data."""
import geopandas as gpd
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import numpy as np
import json
import warnings

warnings.filterwarnings('ignore')

# ── 1. Generate LULC Map ──
print("[1/2] Generating LULC map...")
lulc = gpd.read_file('public/data/udupi_lulc.geojson')
wards = gpd.read_file('public/data/udupi_wards.geojson')

print(f"  LULC features: {len(lulc)}")
print(f"  Classes: {lulc['class'].unique()}")

# Color mapping for LULC classes
lulc_colors = {
    'Built-up': '#ef4444',
    'Vegetation': '#22c55e',
    'Water': '#3b82f6',
    'Bare Soil': '#f59e0b',
    'Roads': '#4b5563',
    'Mixed': '#9ca3af',
    'Shadow': '#111827',
}

# Use the 'color' column from the data if available, else map
def get_color(row):
    c = str(row.get('color', '')).strip()
    if c and c != 'nan' and c.startswith('#'):
        return c
    cls = str(row.get('class', '')).strip()
    for key, color in lulc_colors.items():
        if key.lower() in cls.lower():
            return color
    return '#9ca3af'

lulc['plot_color'] = lulc.apply(get_color, axis=1)

# Calculate figure dimensions from ward bounds
minx, miny, maxx, maxy = wards.total_bounds
width = maxx - minx
height = maxy - miny
aspect = width / height

fig_h = 12
fig_w = fig_h * aspect + 0.5

fig, ax = plt.subplots(1, 1, figsize=(fig_w, fig_h), dpi=200, facecolor='#0f172a')
ax.set_facecolor('#0f172a')

# Plot ward background
wards.plot(ax=ax, color='#1e293b', edgecolor='#334155', linewidth=0.8, alpha=0.5, zorder=1)

# Plot LULC polygons
for cls in lulc['class'].unique():
    subset = lulc[lulc['class'] == cls]
    color = subset.iloc[0]['plot_color']
    subset.plot(ax=ax, color=color, edgecolor=color, linewidth=0.3, alpha=0.85, zorder=2)

# Plot ward boundary on top
wards.boundary.plot(ax=ax, color='#00d4aa', linewidth=2.0, zorder=10)

# Tight crop
pad_x = width * 0.02
pad_y = height * 0.02
ax.set_xlim(minx - pad_x, maxx + pad_x)
ax.set_ylim(miny - pad_y, maxy + pad_y)
ax.set_axis_off()

# Legend
legend_items = []
for cls in sorted(lulc['class'].unique()):
    color = lulc[lulc['class'] == cls].iloc[0]['plot_color']
    cnt = len(lulc[lulc['class'] == cls])
    legend_items.append(mpatches.Patch(facecolor=color, edgecolor='white', linewidth=0.5, label=f'{cls} ({cnt})'))

ax.legend(handles=legend_items, loc='lower left', fontsize=8, framealpha=0.9, 
          facecolor='#0f172a', edgecolor='#334155', labelcolor='white',
          borderpad=0.8, handlelength=1.5)

ax.set_title('Udupi City - LULC Classification', fontsize=14, fontweight='bold', 
             color='white', pad=10)

plt.savefig('public/data/lulc_map.png', dpi=200, bbox_inches='tight', pad_inches=0.05, facecolor='#0f172a')
plt.close()
print("  [OK] Saved public/data/lulc_map.png")

# Also save the full dashboard version
fig2, axes = plt.subplots(1, 2, figsize=(fig_w * 2, fig_h), dpi=200, facecolor='#0f172a',
                           gridspec_kw={'width_ratios': [3, 1], 'wspace': 0.02})

ax1 = axes[0]
ax1.set_facecolor('#0f172a')
wards.plot(ax=ax1, color='#1e293b', edgecolor='#334155', linewidth=0.8, alpha=0.5, zorder=1)
for cls in lulc['class'].unique():
    subset = lulc[lulc['class'] == cls]
    color = subset.iloc[0]['plot_color']
    subset.plot(ax=ax1, color=color, edgecolor=color, linewidth=0.3, alpha=0.85, zorder=2)
wards.boundary.plot(ax=ax1, color='#00d4aa', linewidth=2.0, zorder=10)
ax1.set_xlim(minx - pad_x, maxx + pad_x)
ax1.set_ylim(miny - pad_y, maxy + pad_y)
ax1.set_axis_off()
ax1.set_title('Udupi City - LULC Classification', fontsize=16, fontweight='bold', color='white', pad=10)

# Stats panel
ax2 = axes[1]
ax2.set_facecolor('#0f172a')
ax2.set_xlim(0, 1)
ax2.set_ylim(0, 1)
ax2.set_axis_off()

ax2.text(0.05, 0.95, 'LULC Summary', fontsize=14, fontweight='bold', color='#00d4aa', transform=ax2.transAxes, va='top')
ax2.text(0.05, 0.90, 'Sentinel-2 | 10m/pixel', fontsize=9, color='#94a3b8', transform=ax2.transAxes, va='top')

y = 0.82
for cls in sorted(lulc['class'].unique()):
    color = lulc[lulc['class'] == cls].iloc[0]['plot_color']
    cnt = len(lulc[lulc['class'] == cls])
    pct = (cnt / len(lulc)) * 100
    
    rect = plt.Rectangle((0.05, y - 0.015), 0.08, 0.025, facecolor=color, edgecolor='white', 
                          linewidth=0.3, transform=ax2.transAxes)
    ax2.add_patch(rect)
    ax2.text(0.16, y, f'{cls}', fontsize=10, fontweight='bold', color='white', transform=ax2.transAxes, va='center')
    ax2.text(0.16, y - 0.025, f'{cnt} features ({pct:.1f}%)', fontsize=8, color='#94a3b8', transform=ax2.transAxes, va='center')
    y -= 0.065

plt.savefig('public/data/lulc_dashboard.png', dpi=200, bbox_inches='tight', pad_inches=0.05, facecolor='#0f172a')
plt.close()
print("  [OK] Saved public/data/lulc_dashboard.png")

# ── 2. Generate Water Bodies GeoJSON ──
print("\n[2/2] Extracting water bodies from OSM data...")
try:
    osm = gpd.read_file('public/data/udupi_osm_data.geojson')
    print(f"  Total OSM features: {len(osm)}")
    
    # Filter for water-related features
    water_features = osm[
        (osm.get('natural', '').fillna('').str.contains('water', case=False, na=False)) |
        (osm.get('waterway', '').fillna('').str.contains('river|stream|canal|drain', case=False, na=False)) |
        (osm.get('water', '').fillna('').str.contains('lake|pond|river|reservoir', case=False, na=False)) |
        (osm.get('landuse', '').fillna('').str.contains('reservoir|basin', case=False, na=False))
    ] if 'natural' in osm.columns else gpd.GeoDataFrame()
    
    if len(water_features) == 0:
        # Try alternate column names
        cols = [c for c in osm.columns if 'water' in c.lower() or 'natural' in c.lower()]
        print(f"  Water-related columns found: {cols}")
        
        # Build water features from LULC data
        water_from_lulc = lulc[lulc['class'].str.contains('Water', case=False, na=False)]
        if len(water_from_lulc) > 0:
            water_gdf = gpd.GeoDataFrame(
                [{'name': f'Water Body {i+1}', 'type': 'water', 'source': 'LULC Classification'} 
                 for i in range(len(water_from_lulc))],
                geometry=water_from_lulc.geometry.values,
                crs='EPSG:4326'
            )
            water_gdf.to_file('public/data/water_bodies.geojson', driver='GeoJSON')
            print(f"  [OK] Extracted {len(water_gdf)} water bodies from LULC data")
        else:
            print("  No water features found in LULC or OSM data")
    else:
        water_features = water_features[['geometry']].copy()
        water_features['name'] = [f'Water Body {i+1}' for i in range(len(water_features))]
        water_features['type'] = 'water'
        water_features['source'] = 'OpenStreetMap'
        water_features.to_file('public/data/water_bodies.geojson', driver='GeoJSON')
        print(f"  [OK] Extracted {len(water_features)} water bodies from OSM")
except Exception as e:
    print(f"  Warning: Could not process OSM data: {e}")
    # Fallback: extract from LULC
    water_from_lulc = lulc[lulc['class'].str.contains('Water', case=False, na=False)]
    if len(water_from_lulc) > 0:
        water_gdf = gpd.GeoDataFrame(
            [{'name': f'Water Body {i+1}', 'type': 'water', 'source': 'LULC Classification'} 
             for i in range(len(water_from_lulc))],
            geometry=water_from_lulc.geometry.values,
            crs='EPSG:4326'
        )
        water_gdf.to_file('public/data/water_bodies.geojson', driver='GeoJSON')
        print(f"  [OK] Extracted {len(water_gdf)} water bodies from LULC data")

print("\nDone!")
