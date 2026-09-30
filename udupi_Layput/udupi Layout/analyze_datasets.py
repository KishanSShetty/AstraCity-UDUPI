
import struct
import os

BASE = r"c:\Users\Kishan Shetty\Downloads\Spacetech\udupi_Layput\HSR Layout"

def read_dbf(path):
    with open(path, 'rb') as f:
        f.read(4)
        num_records = struct.unpack('<I', f.read(4))[0]
        header_size = struct.unpack('<H', f.read(2))[0]
        record_size = struct.unpack('<H', f.read(2))[0]
        f.read(20)
        fields = []
        while True:
            fd = f.read(32)
            if not fd or fd[0] == 0x0D:
                break
            name = fd[:11].replace(b'\x00', b'').decode('latin-1').strip()
            ftype = chr(fd[11])
            length = fd[16]
            fields.append((name, ftype, length))
        f.seek(header_size)
        records = []
        for i in range(min(5, num_records)):
            flag = f.read(1)
            if not flag:
                break
            row = {}
            for name, ftype, length in fields:
                raw = f.read(length)
                val = raw.decode('latin-1').strip()
                row[name] = val
            records.append(row)
    return num_records, fields, records

def read_shp_header(path):
    with open(path, 'rb') as f:
        f.read(24)
        file_length = struct.unpack('>I', f.read(4))[0] * 2  # in bytes
        version = struct.unpack('<I', f.read(4))[0]
        shape_type = struct.unpack('<I', f.read(4))[0]
        xmin = struct.unpack('<d', f.read(8))[0]
        ymin = struct.unpack('<d', f.read(8))[0]
        xmax = struct.unpack('<d', f.read(8))[0]
        ymax = struct.unpack('<d', f.read(8))[0]
    shape_types = {
        0: 'Null Shape', 1: 'Point', 3: 'Polyline', 5: 'Polygon',
        8: 'MultiPoint', 11: 'PointZ', 13: 'PolylineZ', 15: 'PolygonZ',
        18: 'MultiPointZ', 21: 'PointM', 23: 'PolylineM', 25: 'PolygonM',
        28: 'MultiPointM', 31: 'MultiPatch'
    }
    return {
        'file_size_bytes': file_length,
        'version': version,
        'shape_type': shape_types.get(shape_type, f'Unknown({shape_type})'),
        'bounding_box': {
            'xmin': round(xmin, 6), 'ymin': round(ymin, 6),
            'xmax': round(xmax, 6), 'ymax': round(ymax, 6)
        }
    }

def read_tif_basic(path):
    size = os.path.getsize(path)
    with open(path, 'rb') as f:
        byte_order = f.read(2)
        endian = 'little' if byte_order == b'II' else 'big'
        f.read(2)  # TIFF magic
        offset = struct.unpack('<I' if endian=='little' else '>I', f.read(4))[0]
        f.seek(offset)
        num_entries = struct.unpack('<H' if endian=='little' else '>H', f.read(2))[0]
        tags = {}
        tag_names = {
            256: 'ImageWidth', 257: 'ImageLength', 258: 'BitsPerSample',
            259: 'Compression', 262: 'PhotometricInterp', 277: 'SamplesPerPixel',
            284: 'PlanarConfig', 317: 'Predictor', 339: 'SampleFormat',
            33550: 'ModelPixelScale', 33922: 'ModelTiepoint', 34736: 'GeoDoubleParams'
        }
        for _ in range(num_entries):
            entry = f.read(12)
            if len(entry) < 12: break
            tag_id = struct.unpack('<H' if endian=='little' else '>H', entry[:2])[0]
            tag_type = struct.unpack('<H' if endian=='little' else '>H', entry[2:4])[0]
            count = struct.unpack('<I' if endian=='little' else '>I', entry[4:8])[0]
            value_offset = entry[8:]
            type_sizes = {1:1, 2:1, 3:2, 4:4, 5:8, 6:1, 7:1, 8:2, 9:4, 10:8, 11:4, 12:8}
            tsize = type_sizes.get(tag_type, 1)
            if count * tsize <= 4:
                if tag_type == 3:
                    val = struct.unpack('<H' if endian=='little' else '>H', value_offset[:2])[0]
                elif tag_type == 4:
                    val = struct.unpack('<I' if endian=='little' else '>I', value_offset[:4])[0]
                else:
                    val = value_offset[:count*tsize]
                tags[tag_names.get(tag_id, f'Tag{tag_id}')] = val
    return {'file_size_mb': round(size/1024/1024, 2), 'tags': tags}

print("=" * 60)
print("DATASET ANALYSIS REPORT")
print("=" * 60)

# ---- WARD BOUNDARY ----
print("\n1. HSR LAYOUT WARD BOUNDARY")
print("-" * 40)
shp = read_shp_header(BASE + r"\HSR Layout Ward Boundary\udupi_Layout.shp")
n, fields, rows = read_dbf(BASE + r"\HSR Layout Ward Boundary\udupi_Layout.dbf")
print(f"  File Size (SHP): {shp['file_size_bytes']} bytes")
print(f"  Shape Type: {shp['shape_type']}")
print(f"  Total Features: {n}")
print(f"  Bounding Box (WGS84):")
bb = shp['bounding_box']
print(f"    Lon: {bb['xmin']} to {bb['xmax']}")
print(f"    Lat: {bb['ymin']} to {bb['ymax']}")
print(f"  Attributes ({len(fields)} fields):")
for fld in fields:
    print(f"    - {fld[0]} [{fld[1]}, len={fld[2]}]")
print("  Sample Record:")
if rows:
    for k, v in rows[0].items():
        print(f"    {k}: {v}")

# ---- ROAD NETWORK ----
print("\n2. HSR LAYOUT ROAD NETWORK")
print("-" * 40)
shp2 = read_shp_header(BASE + r"\HSR Layout Road Network\HSR Layout.shp")
n2, fields2, rows2 = read_dbf(BASE + r"\HSR Layout Road Network\HSR Layout.dbf")
print(f"  File Size (SHP): {shp2['file_size_bytes']} bytes")
print(f"  Shape Type: {shp2['shape_type']}")
print(f"  Total Features: {n2}")
print(f"  Bounding Box (WGS84):")
bb2 = shp2['bounding_box']
print(f"    Lon: {bb2['xmin']} to {bb2['xmax']}")
print(f"    Lat: {bb2['ymin']} to {bb2['ymax']}")
print(f"  Attributes ({len(fields2)} fields):")
for fld in fields2:
    print(f"    - {fld[0]} [{fld[1]}, len={fld[2]}]")
print("  Sample Records (3):")
for i, row in enumerate(rows2[:3]):
    print(f"  Record {i+1}:")
    for k, v in row.items():
        if v:
            print(f"    {k}: {v}")

# ---- SATELLITE DATA ----
print("\n3. SATELLITE DATA")
print("-" * 40)
for fname in ["BBMP_BOUNDARY_SD.tif", "udupi_Layout_SD.tif"]:
    fpath = BASE + r"\Satellite Data" + "\\" + fname
    tif = read_tif_basic(fpath)
    print(f"  File: {fname}")
    print(f"  Size: {tif['file_size_mb']} MB")
    t = tif['tags']
    if 'ImageWidth' in t: print(f"  Width: {t['ImageWidth']} px")
    if 'ImageLength' in t: print(f"  Height: {t['ImageLength']} px")
    if 'SamplesPerPixel' in t: print(f"  Bands: {t['SamplesPerPixel']}")
    if 'BitsPerSample' in t: print(f"  Bits/Sample: {t['BitsPerSample']}")
    if 'Compression' in t:
        comp = {1:'None',5:'LZW',6:'JPEG',8:'DEFLATE',32773:'PackBits'}
        print(f"  Compression: {comp.get(t['Compression'], t['Compression'])}")
    if 'PhotometricInterp' in t:
        pi = {1:'BlackIsZero/Grayscale',2:'RGB',3:'Palette',4:'TransparencyMask',5:'CMYK',6:'YCbCr',32803:'CFA (RAW)'}
        print(f"  Photometric: {pi.get(t['PhotometricInterp'], t['PhotometricInterp'])}")
    print()

print("=" * 60)
print("CRS (Coordinate Reference System)")
print("  Both shapefiles: WGS 84 (EPSG:4326)")
print("  Geographic coordinates: Latitude/Longitude in Degrees")
print("=" * 60)
