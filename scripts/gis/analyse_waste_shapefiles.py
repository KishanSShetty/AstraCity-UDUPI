import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
"""
Analyse all BBMP waste management shapefiles:
  1. BBMP_Dumpyards
  2. BBMP_Dry_Waste_Collection_Centres
  3. BBMP_BIO-Methanisation
  4. BBMP_Waste_Processing_Units

Extracts: total count, all attributes, coordinates, and HSR Layout proximity.
"""
import struct
import os
import json

BASE = r"DS\Waste methane dumpyards centers\Dry Waste Collection,Waste Processing & Landfill Locations"

# HSR Layout bounding box (from ward boundary shapefile)
udupi_BOUNDS = {
    "lon_min": 77.622725,
    "lon_max": 77.669342,
    "lat_min": 12.897941,
    "lat_max": 12.931016
}
udupi_CENTER = (12.9145, 77.6460)

def haversine(lat1, lon1, lat2, lon2):
    """Distance in km between two lat/lon points."""
    import math
    R = 6371
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2)**2
    return R * 2 * math.asin(math.sqrt(a))

def is_in_hsr(lat, lon):
    """Check if a point falls inside HSR Layout ward boundary."""
    return (udupi_BOUNDS["lat_min"] <= lat <= udupi_BOUNDS["lat_max"] and
            udupi_BOUNDS["lon_min"] <= lon <= udupi_BOUNDS["lon_max"])

def read_dbf(filepath):
    """Read a .dbf file and return list of record dicts."""
    if not os.path.exists(filepath):
        return None, []
    
    with open(filepath, 'rb') as f:
        version = struct.unpack('B', f.read(1))[0]
        f.read(3)  # date
        num_records = struct.unpack('<I', f.read(4))[0]
        header_size = struct.unpack('<H', f.read(2))[0]
        record_size = struct.unpack('<H', f.read(2))[0]
        f.read(20)  # reserved
        
        # Read field descriptors
        fields = []
        while True:
            field_data = f.read(32)
            if field_data[0:1] == b'\r':
                break
            name = field_data[:11].replace(b'\x00', b'').decode('ascii', errors='replace').strip()
            ftype = chr(field_data[11])
            flen = field_data[16]
            fields.append((name, ftype, flen))
        
        # Read records
        records = []
        for _ in range(num_records):
            record = {}
            deletion_flag = f.read(1)
            for name, ftype, flen in fields:
                raw = f.read(flen)
                try:
                    val = raw.decode('ascii', errors='replace').strip()
                except:
                    val = str(raw)
                if ftype in ('N', 'F'):
                    try:
                        val = float(val) if '.' in val else int(val)
                    except:
                        pass
                record[name] = val
            records.append(record)
        
        return fields, records

def read_shp_points(filepath):
    """Read point geometries from a .shp file."""
    if not os.path.exists(filepath):
        return []
    
    points = []
    with open(filepath, 'rb') as f:
        # File header - 100 bytes
        file_code = struct.unpack('>I', f.read(4))[0]
        if file_code != 9994:
            print(f"  WARNING: Not a valid shapefile (code={file_code})")
            return []
        
        f.read(20)  # unused
        file_length = struct.unpack('>I', f.read(4))[0] * 2  # in bytes
        version = struct.unpack('<I', f.read(4))[0]
        shape_type = struct.unpack('<I', f.read(4))[0]
        
        # Bounding box
        xmin = struct.unpack('<d', f.read(8))[0]
        ymin = struct.unpack('<d', f.read(8))[0]
        xmax = struct.unpack('<d', f.read(8))[0]
        ymax = struct.unpack('<d', f.read(8))[0]
        f.read(32)  # zmin, zmax, mmin, mmax
        
        print(f"  Shape type: {shape_type} (1=Point, 11=PointZ)")
        print(f"  Bounding box: [{xmin:.6f}, {ymin:.6f}] to [{xmax:.6f}, {ymax:.6f}]")
        
        # Read records
        while f.tell() < file_length:
            try:
                rec_num = struct.unpack('>I', f.read(4))[0]
                content_length = struct.unpack('>I', f.read(4))[0] * 2
                
                st = struct.unpack('<I', f.read(4))[0]
                if st == 0:  # Null shape
                    continue
                elif st == 1:  # Point
                    x = struct.unpack('<d', f.read(8))[0]
                    y = struct.unpack('<d', f.read(8))[0]
                    points.append((y, x))  # lat, lon
                elif st == 11:  # PointZ
                    x = struct.unpack('<d', f.read(8))[0]
                    y = struct.unpack('<d', f.read(8))[0]
                    z = struct.unpack('<d', f.read(8))[0]
                    if content_length > 28:
                        m = struct.unpack('<d', f.read(8))[0]
                    points.append((y, x))  # lat, lon
                else:
                    # Skip unknown shape types
                    remaining = content_length - 4
                    if remaining > 0:
                        f.read(remaining)
            except struct.error:
                break
    
    return points

def read_shx(filepath):
    """Read .shx index to get record count."""
    if not os.path.exists(filepath):
        return 0
    with open(filepath, 'rb') as f:
        f.read(24)
        file_length = struct.unpack('>I', f.read(4))[0] * 2
        record_count = (file_length - 100) // 8
        return record_count

# ============================================================
# ANALYSE ALL SHAPEFILES
# ============================================================
output_lines = []

def log(text=""):
    print(text)
    output_lines.append(text)

log("=" * 80)
log("BBMP WASTE MANAGEMENT SHAPEFILES — COMPLETE ANALYSIS")
log("=" * 80)
log()

datasets = [
    ("BBMP_Dumpyards", "DUMPYARDS"),
    ("BBMP_Dry_Waste_Collection_Centres", "DRY WASTE COLLECTION CENTRES (DWCCs)"),
    ("BBMP_BIO-Methanisation", "BIO-METHANISATION UNITS (BMUs)"),
    ("BBMP_Waste_Processing_Units", "WASTE PROCESSING UNITS"),
]

all_results = {}

for filename, label in datasets:
    log("=" * 80)
    log(f"  {label}")
    log(f"  File: {filename}")
    log("=" * 80)
    
    shp_path = os.path.join(BASE, filename + ".shp")
    dbf_path = os.path.join(BASE, filename + ".dbf")
    shx_path = os.path.join(BASE, filename + ".shx")
    
    # File sizes
    for ext in ['.shp', '.dbf', '.shx', '.prj', '.cpg']:
        fp = os.path.join(BASE, filename + ext)
        if os.path.exists(fp):
            log(f"  {ext}: {os.path.getsize(fp):,} bytes")
        else:
            log(f"  {ext}: MISSING")
    log()
    
    # Record count from .shx
    rec_count = read_shx(shx_path)
    log(f"  Records (from .shx): {rec_count}")
    
    # Read points
    log(f"  Reading geometries from .shp...")
    points = read_shp_points(shp_path)
    log(f"  Points extracted: {len(points)}")
    log()
    
    # Read attributes
    fields_info = None
    records = []
    if os.path.exists(dbf_path):
        log(f"  Reading attributes from .dbf...")
        fields_info, records = read_dbf(dbf_path)
        log(f"  Attribute records: {len(records)}")
        if fields_info:
            log(f"  Fields: {[f[0] for f in fields_info]}")
        log()
    else:
        log(f"  [!] NO .dbf FILE - No attribute data available")
        log()
    
    # Merge points + attributes
    merged = []
    for i in range(max(len(points), len(records))):
        entry = {}
        if i < len(points):
            entry["lat"] = round(points[i][0], 6)
            entry["lon"] = round(points[i][1], 6)
            entry["in_hsr"] = is_in_hsr(points[i][0], points[i][1])
            entry["dist_to_udupi_km"] = round(haversine(udupi_CENTER[0], udupi_CENTER[1], points[i][0], points[i][1]), 2)
        if i < len(records):
            entry["attributes"] = records[i]
        merged.append(entry)
    
    # Summary
    total = len(merged)
    in_hsr = sum(1 for m in merged if m.get("in_hsr", False))
    
    log(f"  ╔════════════════════════════════════════╗")
    log(f"  ║  TOTAL {label}: {total:>4}              ")
    log(f"  ║  Inside HSR Layout:        {in_hsr:>4}              ")
    log(f"  ╚════════════════════════════════════════╝")
    log()
    
    # Print ALL records
    log(f"  --- ALL {total} RECORDS ---")
    for i, entry in enumerate(merged):
        lat = entry.get("lat", "?")
        lon = entry.get("lon", "?")
        in_h = "[IN HSR]" if entry.get("in_hsr") else f"  {entry.get('dist_to_udupi_km', '?')} km from HSR"
        attrs = entry.get("attributes", {})
        
        # Extract meaningful fields
        popup = attrs.get("PopupInfo", "")
        name = attrs.get("Name", "")
        
        log(f"  [{i+1:>3}] Lat: {lat}, Lon: {lon} | {in_h}")
        if name and name != "Placemark":
            log(f"        Name: {name}")
        if popup:
            # Clean up HTML from popup
            popup_clean = popup.replace("<br>", " | ").replace("<b>", "").replace("</b>", "")
            if len(popup_clean) > 200:
                popup_clean = popup_clean[:200] + "..."
            log(f"        Info: {popup_clean}")
        
        # Print all non-empty attributes
        for k, v in attrs.items():
            if v and v != "" and k not in ("PopupInfo", "Name", "FolderPath") and str(v).strip():
                log(f"        {k}: {v}")
    
    log()
    
    # HSR-specific summary
    if in_hsr > 0:
        log(f"  --- INSIDE HSR LAYOUT ({in_hsr} records) ---")
        for i, entry in enumerate(merged):
            if entry.get("in_hsr"):
                lat = entry.get("lat", "?")
                lon = entry.get("lon", "?")
                attrs = entry.get("attributes", {})
                log(f"    HSR #{i+1}: ({lat}, {lon})")
                for k, v in attrs.items():
                    if v and str(v).strip() and k not in ("FolderPath",):
                        log(f"      {k}: {v}")
        log()
    
    # Nearest to HSR
    nearby = sorted([m for m in merged if not m.get("in_hsr", False)], key=lambda x: x.get("dist_to_udupi_km", 999))[:10]
    if nearby:
        log(f"  --- 10 NEAREST TO HSR (outside boundary) ---")
        for j, entry in enumerate(nearby[:10]):
            lat = entry.get("lat", "?")
            lon = entry.get("lon", "?")
            dist = entry.get("dist_to_udupi_km", "?")
            attrs = entry.get("attributes", {})
            popup = attrs.get("PopupInfo", "")
            name = attrs.get("Name", "")
            popup_short = popup.replace("<br>", " | ").replace("<b>", "").replace("</b>", "")[:120] if popup else ""
            log(f"    [{j+1}] {dist} km — ({lat}, {lon}) {popup_short}")
    
    log()
    log()
    
    all_results[filename] = {
        "total": total,
        "in_hsr": in_hsr,
        "records": merged
    }

# ============================================================
# FINAL SUMMARY
# ============================================================
log("=" * 80)
log("FINAL SUMMARY")
log("=" * 80)
log()
log(f"  Bengaluru (BBMP) Totals:")
log(f"    Dumpyards:                    {all_results['BBMP_Dumpyards']['total']}")
log(f"    Dry Waste Collection Centres: {all_results['BBMP_Dry_Waste_Collection_Centres']['total']}")
log(f"    Bio-Methanisation Units:      {all_results['BBMP_BIO-Methanisation']['total']}")
log(f"    Waste Processing Units:       {all_results['BBMP_Waste_Processing_Units']['total']}")
log()
log(f"  Inside HSR Layout (Ward 174):")
log(f"    Dumpyards:                    {all_results['BBMP_Dumpyards']['in_hsr']}")
log(f"    Dry Waste Collection Centres: {all_results['BBMP_Dry_Waste_Collection_Centres']['in_hsr']}")
log(f"    Bio-Methanisation Units:      {all_results['BBMP_BIO-Methanisation']['in_hsr']}")
log(f"    Waste Processing Units:       {all_results['BBMP_Waste_Processing_Units']['in_hsr']}")
log()

# Save output
with open("waste_facilities_analysis.txt", "w", encoding="utf-8") as f:
    f.write("\n".join(output_lines))

# Save JSON
json_out = {}
for k, v in all_results.items():
    json_out[k] = {
        "total_bengaluru": v["total"],
        "inside_hsr": v["in_hsr"],
        "all_records": v["records"]
    }
with open("waste_facilities_analysis.json", "w", encoding="utf-8") as f:
    json.dump(json_out, f, indent=2, ensure_ascii=False)

log("Output saved to: waste_facilities_analysis.txt + waste_facilities_analysis.json")
