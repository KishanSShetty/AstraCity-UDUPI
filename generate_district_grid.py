"""
Generate district-wide grid zones for Udupi District.
- Converts the MULTILINESTRING district boundary to a proper polygon
- Creates a 2km x 2km grid across the entire district
- Clips grid cells to the district boundary
- Assigns ward colors to cells that overlap CMC wards
- Outputs:
  1. public/data/udupi_district_polygon.geojson  (polygon boundary)
  2. public/data/district_grid_zones.geojson      (grid cells)
  3. public/data/district_grid_zones.json          (zone data for frontend)
"""

import geopandas as gpd
import pandas as pd
import numpy as np
from shapely.ops import polygonize, unary_union
from shapely.geometry import box, MultiPolygon, Polygon, mapping
import json
import warnings

warnings.filterwarnings('ignore')

print("=" * 60)
print("UDUPI DISTRICT GRID GENERATOR")
print("=" * 60)

# ── 1. Load and polygonize district boundary ──
print("\n[1/5] Loading district boundary...")
district_raw = gpd.read_file('public/data/udupi_district_boundary.geojson')
lines = district_raw.geometry.iloc[0]
polys = list(polygonize(lines))
print(f"  Polygonized {len(polys)} sub-polygons from MULTILINESTRING")

# Take the largest polygon as the district boundary
if len(polys) > 1:
    largest = max(polys, key=lambda p: p.area)
    district_poly = largest
else:
    district_poly = polys[0]

print(f"  District bounds: {district_poly.bounds}")
print(f"  District area: {district_poly.area:.4f} sq degrees")

# Save as a proper polygon GeoJSON
district_gdf = gpd.GeoDataFrame(
    [{'name': 'Udupi District', 'admin_level': 5}],
    geometry=[district_poly],
    crs='EPSG:4326'
)
district_gdf.to_file('public/data/udupi_district_polygon.geojson', driver='GeoJSON')
print("  [OK] Saved udupi_district_polygon.geojson")

# ── 2. Load ward boundaries (CMC) ──
print("\n[2/5] Loading CMC ward boundaries...")
wards = gpd.read_file('public/data/udupi_wards.geojson')
print(f"  {len(wards)} wards loaded")
ward_union = unary_union(wards.geometry)

# ── 3. Generate district-wide grid ──
print("\n[3/5] Generating 2km grid across district...")
minx, miny, maxx, maxy = district_poly.bounds

# 2km grid in degrees (approx 0.018 degrees lat, 0.019 degrees lon at 13°N)
grid_size_lat = 0.018  # ~2km
grid_size_lon = 0.019  # ~2km

grid_cells = []
zone_id = 0
x = minx
while x < maxx:
    y = miny
    while y < maxy:
        cell = box(x, y, x + grid_size_lon, y + grid_size_lat)
        intersection = district_poly.intersection(cell)
        if not intersection.is_empty and intersection.area > 0:
            zone_id += 1
            
            # Check if cell overlaps with CMC wards
            ward_overlap = ward_union.intersection(cell)
            is_urban = ward_overlap.area / cell.area > 0.1 if cell.area > 0 else False
            
            # Find which ward it belongs to (if any)
            ward_name = None
            for _, w in wards.iterrows():
                if w.geometry.intersects(cell):
                    ward_name = w.get('KGISWardNa', f"Ward-{w.get('KGISWardNo', '?')}")
                    break
            
            grid_cells.append({
                'geometry': intersection,
                'zone_id': f"D{zone_id:03d}",
                'is_urban': is_urban,
                'ward_name': ward_name,
                'center_lon': intersection.centroid.x,
                'center_lat': intersection.centroid.y,
                'area_sqkm': intersection.area * 111.32 * 110.57,  # approximate
            })
        y += grid_size_lat
    x += grid_size_lon

grid_gdf = gpd.GeoDataFrame(grid_cells, crs='EPSG:4326')
print(f"  Generated {len(grid_gdf)} grid cells")
print(f"  Urban cells (CMC overlap): {grid_gdf['is_urban'].sum()}")
print(f"  Rural cells: {(~grid_gdf['is_urban']).sum()}")

# ── 4. Assign risk and waste estimates ──
print("\n[4/5] Assigning waste estimates & risk levels...")

np.random.seed(42)
for idx, row in grid_gdf.iterrows():
    area = row['area_sqkm']
    if row['is_urban']:
        # Urban: higher density
        pop_density = np.random.uniform(3000, 8000)  # per sq km
        waste_rate = 0.5  # kg/person/day (CPCB)
    else:
        # Rural: lower density
        pop_density = np.random.uniform(200, 1500)
        waste_rate = 0.3  # kg/person/day

    pop = int(pop_density * area)
    waste_kg = pop * waste_rate
    waste_tons = waste_kg / 1000
    
    # Buildings estimate
    buildings = int(pop / np.random.uniform(3.5, 5.0))
    
    grid_gdf.at[idx, 'population'] = pop
    grid_gdf.at[idx, 'waste_kg_day'] = round(waste_kg, 1)
    grid_gdf.at[idx, 'waste_tons_day'] = round(waste_tons, 3)
    grid_gdf.at[idx, 'buildings'] = buildings
    
    # Risk level
    if waste_tons > 1.5:
        grid_gdf.at[idx, 'risk'] = 'High'
    elif waste_tons > 0.5:
        grid_gdf.at[idx, 'risk'] = 'Medium'
    else:
        grid_gdf.at[idx, 'risk'] = 'Low'

# ── 5. Save outputs ──
print("\n[5/5] Saving outputs...")

# GeoJSON for map rendering
grid_gdf.to_file('public/data/district_grid_zones.geojson', driver='GeoJSON')
print("  [OK] Saved district_grid_zones.geojson")

# JSON for frontend analytics
zones_json = []
for _, row in grid_gdf.iterrows():
    bounds = list(row.geometry.bounds)  # [minx, miny, maxx, maxy]
    zones_json.append({
        'zone_id': row['zone_id'],
        'bounds': bounds,
        'center': [row['center_lon'], row['center_lat']],
        'is_urban': bool(row['is_urban']),
        'ward_name': row['ward_name'],
        'area_sqkm': round(row['area_sqkm'], 2),
        'population': int(row['population']),
        'buildings': int(row['buildings']),
        'waste_kg_day': float(row['waste_kg_day']),
        'waste_tons_day': float(row['waste_tons_day']),
        'risk': row['risk'],
    })

with open('public/data/district_grid_zones.json', 'w') as f:
    json.dump({'zones': zones_json, 'total_zones': len(zones_json)}, f, indent=2)
print("  [OK] Saved district_grid_zones.json")

# Summary
risk_counts = grid_gdf['risk'].value_counts()
print(f"\n{'=' * 60}")
print(f"SUMMARY")
print(f"{'=' * 60}")
print(f"  Total grid zones: {len(grid_gdf)}")
print(f"  District area covered: {grid_gdf['area_sqkm'].sum():.1f} sq km")
print(f"  Total population: {int(grid_gdf['population'].sum()):,}")
print(f"  Daily waste: {grid_gdf['waste_tons_day'].sum():.1f} tons")
print(f"  High risk: {risk_counts.get('High', 0)}")
print(f"  Medium risk: {risk_counts.get('Medium', 0)}")
print(f"  Low risk: {risk_counts.get('Low', 0)}")
print(f"{'=' * 60}")
