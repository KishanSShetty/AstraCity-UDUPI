import urllib.request
import json
import urllib.parse
import os

print('Starting Overpass query for Udupi District buildings...')
# District bounds: [74.58, 13.07, 75.21, 13.99]
# We will query the building ways.
bbox = [13.07, 74.58, 13.99, 75.21] # S, W, N, E

overpass_query = f"""
[out:json][timeout:300];
(
  way["building"]({bbox[0]},{bbox[1]},{bbox[2]},{bbox[3]});
);
out body;
>;
out skel qt;
"""
url = 'https://overpass-api.de/api/interpreter'
data = urllib.parse.urlencode({'data': overpass_query}).encode('utf-8')
req = urllib.request.Request(url, data=data)

try:
    print('Downloading... this might take 1-2 minutes')
    with urllib.request.urlopen(req) as response:
        osm_data = json.loads(response.read().decode('utf-8'))
        print(f'Downloaded {len(osm_data.get("elements", []))} elements.')
        
        # Fast conversion to GeoJSON
        nodes = {}
        ways = []
        for el in osm_data['elements']:
            if el['type'] == 'node':
                nodes[el['id']] = [el['lon'], el['lat']]
            elif el['type'] == 'way':
                ways.append(el)
        
        features = []
        for way in ways:
            if 'nodes' not in way or len(way['nodes']) < 3:
                continue
            coords = []
            valid = True
            for nid in way['nodes']:
                if nid in nodes:
                    coords.append(nodes[nid])
                else:
                    valid = False
                    break
            if not valid: continue
            
            # Close polygon if not closed
            if coords[0] != coords[-1]:
                coords.append(coords[0])
                
            features.append({
                "type": "Feature",
                "properties": {
                    "building": way.get('tags', {}).get('building', 'yes'),
                    "building_type": "Residential (House)", # default mock
                },
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [coords]
                }
            })
            
        geojson = {
            "type": "FeatureCollection",
            "features": features
        }
        with open('public/data/udupi_osm_data.geojson', 'w') as f:
            json.dump(geojson, f)
        print(f'Saved {len(features)} building polygons to udupi_osm_data.geojson')
except Exception as e:
    print('Failed:', e)
