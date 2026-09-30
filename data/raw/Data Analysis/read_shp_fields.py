import shapefile
import json
import os

BASE_DIR = r'c:\Users\Kishan Shetty\Downloads\AstraSky-maing'
SHP_PATH = os.path.join(BASE_DIR, r'DS\Waste methane dumpyards centers\Dry Waste Collection,Waste Processing & Landfill Locations\BBMP_Dry_Waste_Collection_Centres.shp')

def main():
    print("Reading Shapefile...")
    try:
        sf = shapefile.Reader(SHP_PATH)
    except Exception as e:
        print(f"Error: {e}")
        return

    # Print field names
    fields = [f[0] for f in sf.fields[1:]] # Skip DeletionFlag
    print("Fields:", fields)

    records = sf.shapeRecords()
    udupi_entries = []

    for idx, sr in enumerate(records):
        pt = sr.shape.points[0]
        lon, lat = pt[0], pt[1]

        # Bounding box filter for HSR layout region
        if 12.89 <= lat <= 12.94 and 77.62 <= lon <= 77.68:
            rec_dict = {
                "idx": idx,
                "lat": lat,
                "lon": lon
            }
            # Add all record attributes
            for f_idx, f_name in enumerate(fields):
                val = sr.record[f_idx]
                # Decode bytes to string if needed
                if isinstance(val, bytes):
                    val = val.decode('utf-8', errors='ignore')
                rec_dict[f_name] = val
            
            udupi_entries.append(rec_dict)

    print(f"\nFound {len(udupi_entries)} points near HSR Layout bounded box.")
    print(json.dumps(udupi_entries[:3], indent=2)) # Print first 3 for review

    with open('udupi_dry_waste_details.json', 'w', encoding='utf-8') as f:
        json.dump(udupi_entries, f, indent=2)
    print("\nSaved file to udupi_dry_waste_details.json")

if __name__ == '__main__':
    main()
