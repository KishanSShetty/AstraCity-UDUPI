import geopandas as gpd
import pandas as pd
import numpy as np
from shapely.ops import unary_union
from shapely.geometry import box
import json

# 1. Load ward boundaries (CMC)
wards = gpd.read_file('public/data/udupi_wards.geojson')
ward_union = unary_union(wards.geometry)

minx, miny, maxx, maxy = ward_union.bounds

# 500m grid in degrees (approx 0.0045 degrees lat, 0.0046 degrees lon at 13N)
grid_size_lat = 0.0045
grid_size_lon = 0.0046

grid_cells = []
zone_id = 1
x = minx
while x < maxx:
    y = miny
    while y < maxy:
        cell = box(x, y, x + grid_size_lon, y + grid_size_lat)
        intersection = ward_union.intersection(cell)
        if not intersection.is_empty and intersection.area > 0:
            grid_cells.append({
                'geometry': intersection,
                'zone_id': f"Z{zone_id:03d}",
            })
            zone_id += 1
        y += grid_size_lat
    x += grid_size_lon

grid_gdf = gpd.GeoDataFrame(grid_cells, crs='EPSG:4326')

# Calculate areas and assign synthetic waste/population data based on density
np.random.seed(42)
for idx, row in grid_gdf.iterrows():
    # approximate area in sq km
    area = row['geometry'].area * 111.32 * 110.57
    
    # 3000 to 8000 people per sq km in urban Udupi
    pop_density = np.random.uniform(4000, 10000)
    pop = int(pop_density * area)
    
    # 0.45 kg per person per day
    waste_kg = pop * 0.45
    
    grid_gdf.at[idx, 'population_estimate'] = pop
    grid_gdf.at[idx, 'waste_kg_day'] = round(waste_kg, 1)
    
    # Risk
    if waste_kg > 1000:
        risk = "high"
    elif waste_kg > 400:
        risk = "medium"
    else:
        risk = "low"
        
    grid_gdf.at[idx, 'risk'] = risk

# Prepare GeoJSON output that matches what SmartMap expects:
# SmartMap expects features with properties: zone_id, waste_kg_day, population, risk
features = []
for idx, row in grid_gdf.iterrows():
    features.append({
        "type": "Feature",
        "geometry": row['geometry'].__geo_interface__,
        "properties": {
            "zone_id": row['zone_id'],
            "waste_kg_day": row['waste_kg_day'],
            "population": row['population_estimate'],
            "risk": row['risk'],
        }
    })

geojson = {
    "type": "FeatureCollection",
    "features": features,
    # Adding summary stats for ZoneAnalysis interface compatibility
    "total_structures": 11429,
    "estimated_population": 165401,
    "waste_per_day_kg": 72000,
    "zones": [] # empty array for zones since we populate features directly
}

with open('public/data/ward_grid_zones.geojson', 'w') as f:
    json.dump(geojson, f)

print(f"Generated {len(features)} zone grids covering Udupi CMC.")
