"""Convert BBMP shapefiles to GeoJSON for the routing platform."""
import sys, io, struct, os, json
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

HSR_BOUNDS = {"lon_min": 77.622725, "lon_max": 77.669342, "lat_min": 12.897941, "lat_max": 12.931016}
HSR_CENTER = (12.9145, 77.6460)

def haversine(lat1, lon1, lat2, lon2):
    import math
    R = 6371
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2)**2
    return R * 2 * math.asin(math.sqrt(a))

def is_in_hsr(lat, lon):
    return (HSR_BOUNDS["lat_min"] <= lat <= HSR_BOUNDS["lat_max"] and
            HSR_BOUNDS["lon_min"] <= lon <= HSR_BOUNDS["lon_max"])

def read_shp_points(filepath):
    points = []
    with open(filepath, 'rb') as f:
        file_code = struct.unpack('>I', f.read(4))[0]
        if file_code != 9994: return []
        f.read(20)
        file_length = struct.unpack('>I', f.read(4))[0] * 2
        f.read(4)  # version
        shape_type = struct.unpack('<I', f.read(4))[0]
        f.read(64)  # bounding box + z/m ranges
        while f.tell() < file_length:
            try:
                f.read(4)  # rec_num
                content_length = struct.unpack('>I', f.read(4))[0] * 2
                st = struct.unpack('<I', f.read(4))[0]
                if st == 0: continue
                elif st in (1, 11):
                    x = struct.unpack('<d', f.read(8))[0]
                    y = struct.unpack('<d', f.read(8))[0]
                    remaining = content_length - 20
                    if remaining > 0: f.read(remaining)
                    points.append((y, x))
                else:
                    remaining = content_length - 4
                    if remaining > 0: f.read(remaining)
            except: break
    return points

def read_dbf(filepath):
    if not os.path.exists(filepath): return []
    with open(filepath, 'rb') as f:
        f.read(1)  # version
        f.read(3)  # date
        num_records = struct.unpack('<I', f.read(4))[0]
        header_size = struct.unpack('<H', f.read(2))[0]
        f.read(2)  # record_size
        f.read(20)  # reserved
        fields = []
        while True:
            field_data = f.read(32)
            if field_data[0:1] == b'\r': break
            name = field_data[:11].replace(b'\x00', b'').decode('ascii', errors='replace').strip()
            ftype = chr(field_data[11])
            flen = field_data[16]
            fields.append((name, ftype, flen))
        records = []
        for _ in range(num_records):
            record = {}
            f.read(1)  # deletion flag
            for name, ftype, flen in fields:
                raw = f.read(flen)
                try: val = raw.decode('ascii', errors='replace').strip()
                except: val = ''
                if ftype in ('N', 'F'):
                    try: val = float(val) if '.' in str(val) else int(val)
                    except: pass
                record[name] = val
            records.append(record)
        return records

def to_geojson(points, records, name, filter_radius_km=None):
    features = []
    for i in range(len(points)):
        lat, lon = points[i]
        props = records[i] if i < len(records) else {}
        props["_lat"] = round(lat, 6)
        props["_lon"] = round(lon, 6)
        props["_in_hsr"] = is_in_hsr(lat, lon)
        props["_dist_to_hsr_km"] = round(haversine(HSR_CENTER[0], HSR_CENTER[1], lat, lon), 2)
        
        if filter_radius_km and props["_dist_to_hsr_km"] > filter_radius_km:
            continue
        
        feature = {
            "type": "Feature",
            "geometry": {"type": "Point", "coordinates": [round(lon, 6), round(lat, 6)]},
            "properties": {k: v for k, v in props.items() if v and str(v).strip()}
        }
        features.append(feature)
    
    return {"type": "FeatureCollection", "features": features}

BASE = os.path.join("DS", "Waste methane dumpyards centers", 
                     "Dry Waste Collection,Waste Processing & Landfill Locations")
OUT = "data"

datasets = [
    ("BBMP_Dumpyards", "dumpyard_locations.geojson", None),  # All 3
    ("BBMP_Dry_Waste_Collection_Centres", "dwcc_locations.geojson", 10),  # Within 10km
    ("BBMP_BIO-Methanisation", "bmu_locations.geojson", 10),  # Within 10km
    ("BBMP_Waste_Processing_Units", "wpu_locations.geojson", 10),  # Within 10km
]

for filename, outname, radius in datasets:
    shp = os.path.join(BASE, filename + ".shp")
    dbf = os.path.join(BASE, filename + ".dbf")
    
    points = read_shp_points(shp)
    records = read_dbf(dbf) if os.path.exists(dbf) else [{} for _ in points]
    
    geojson = to_geojson(points, records, filename, radius)
    
    outpath = os.path.join(OUT, outname)
    with open(outpath, 'w', encoding='utf-8') as f:
        json.dump(geojson, f, indent=2)
    
    total = len(points)
    kept = len(geojson["features"])
    in_hsr = sum(1 for ft in geojson["features"] if ft["properties"].get("_in_hsr"))
    print(f"[OK] {outname}: {total} total -> {kept} kept (radius={radius}km), {in_hsr} in HSR")

# Also create HSR ward boundary GeoJSON from existing BBMP boundary
# Extract ward 174 polygon
print("\n[OK] All GeoJSON files created in data/")
