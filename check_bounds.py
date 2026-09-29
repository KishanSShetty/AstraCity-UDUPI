import json
import os

with open('public/data/udupi_wards.geojson', 'r') as f:
    data = json.load(f)

min_lon, min_lat = 180, 90
max_lon, max_lat = -180, -90

for feature in data['features']:
    coords = feature['geometry']['coordinates']
    
    def update_bounds(c):
        global min_lon, min_lat, max_lon, max_lat
        if type(c[0]) in (float, int):
            lon, lat = c[0], c[1]
            min_lon = min(min_lon, lon)
            max_lon = max(max_lon, lon)
            min_lat = min(min_lat, lat)
            max_lat = max(max_lat, lat)
        else:
            for item in c:
                update_bounds(item)
                
    update_bounds(coords)

print(f'Wards Bounds: lon [{min_lon}, {max_lon}], lat [{min_lat}, {max_lat}]')

try:
    with open('public/data/ward_grid_zones.geojson', 'r') as f:
        grid = json.load(f)
        features = grid.get("features", [])
        print(f'Grid has {len(features)} features')
        if len(features) > 0:
            g_min_lon, g_min_lat = 180, 90
            g_max_lon, g_max_lat = -180, -90
            for f in features:
                update_bounds(f['geometry']['coordinates'])
                
            print(f'Grid Bounds: lon [{g_min_lon}, {g_max_lon}], lat [{g_min_lat}, {g_max_lat}]')
except Exception as e:
    print('Could not read grid:', e)
