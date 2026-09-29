# Udupi CMC Waste Infrastructure Report — Accurate Data from Shapefiles
### Extracted from: `DS/Waste methane dumpyards centers/` Shapefiles
### Analysis Date: 5 June 2026

---

## BENGALURU (Udupi CMC) — COMPLETE TOTALS

| Facility Type | Total in Udupi | Inside Udupi City |
|---|---|---|
| **Dumpyards** | **3** | **0** |
| **Dry Waste Collection Centres (DWCCs)** | **336** | **6** |
| **Bio-Methanisation Units (BMUs)** | **11** | **0** |
| **Waste Processing Units** | **8** | **0** |

> Data source: Udupi CMC official shapefiles — `Udupi CMC_Dumpyards.shp`, `Udupi CMC_Dry_Waste_Collection_Centres.shp`, `Udupi CMC_BIO-Methanisation.shp`, `Udupi CMC_Waste_Processing_Units.shp`

---

## 1. DUMPYARDS IN BENGALURU — 3 Total

**Shapefile:** `Udupi CMC_Dumpyards.shp` (232 bytes, PointZ geometry)
**Attribute data:** NO .dbf file — only coordinates available (no names)
**Bounding box:** [77.645922, 13.103583] to [77.668878, 13.153942]

> All 3 dumpyards are in **North Udupi** (Yelahanka / Bellahalli area). None are in or near Udupi City.

| # | Latitude | Longitude | Distance from HSR | Likely Location |
|---|---|---|---|---|
| 1 | 13.153942 | 77.668878 | **26.74 km** | Bellahalli area (N Udupi) |
| 2 | 13.103950 | 77.646467 | **21.07 km** | Yelahanka / GKVK area |
| 3 | 13.103583 | 77.645922 | **21.03 km** | Yelahanka / GKVK area |

### Key Finding for HSR Routing:
- **0 dumpyards in Udupi City** — zero
- Nearest dumpyard is **21 km away** (north Udupi)
- Udupi City waste CANNOT go to dumpyards — must route to DWCCs, BMUs, or Waste Processing Units instead
- This is actually a positive — HSR uses the modern segregation model, not the old dumping model

---

## 2. DRY WASTE COLLECTION CENTRES (DWCCs) — 336 Total

**Shapefile:** `Udupi CMC_Dry_Waste_Collection_Centres.shp` (14,884 bytes, PointZ geometry)
**Attribute data:** `Udupi CMC_Dry_Waste_Collection_Centres.dbf` (361,890 bytes)
**Fields:** OID_, Name, FolderPath, SymbolID, AltMode, Base, Snippet, PopupInfo, HasLabel, LabelID
**All records named:** "Udupi CMC dry waste collection centr" (truncated at 32 chars)

### 2.1 The 6 DWCCs Inside Udupi City

| # | Record | Latitude | Longitude | Location Estimate |
|---|---|---|---|---|
| 1 | #32 | **12.91263** | **77.64903** | HSR Sector 2 — East side |
| 2 | #240 | **12.92218** | **77.64688** | HSR Sector 3 — North-Central |
| 3 | #241 | **12.91811** | **77.64545** | HSR Sector 3 — Central |
| 4 | #242 | **12.91218** | **77.64755** | HSR Sector 2 — East |
| 5 | #243 | **12.90536** | **77.63312** | HSR Sector 1 — Southwest |
| 6 | #244 | **12.89907** | **77.64077** | HSR Sector 1 — South |

### 2.2 DWCCs Near HSR (within 5 km, outside ward boundary)

| # | Record | Latitude | Longitude | Distance | Direction |
|---|---|---|---|---|---|
| 1 | #48 | 12.89435 | 77.64617 | **2.24 km** | South |
| 2 | #34 | 12.91763 | 77.62258 | **2.56 km** | West |
| 3 | #235 | 12.89119 | 77.62664 | **3.33 km** | Southwest |
| 4 | #246 | 12.91279 | 77.67673 | **3.34 km** | East |
| 5 | #31 | 12.92340 | 77.61448 | **3.56 km** | Northwest |
| 6 | #247 | 12.88012 | 77.64304 | **3.84 km** | South |
| 7 | #248 | 12.93099 | 77.61455 | **3.87 km** | Northwest |
| 8 | #249 | 12.94419 | 77.62704 | **3.89 km** | North |
| 9 | #250 | 12.93429 | 77.61465 | **4.05 km** | Northwest |
| 10 | #251 | 12.88932 | 77.61705 | **4.21 km** | Southwest |

### 2.3 DWCC Coverage Summary

```
Total DWCCs in Udupi:  336
Inside Udupi City:           6
Within 5 km of HSR:         16  (6 inside + 10 nearby)
Within 10 km of HSR:        48
Beyond 10 km:              288  (spread across city)
```

---

## 3. BIO-METHANISATION UNITS (BMUs) — 11 Total

**Shapefile:** `Udupi CMC_BIO-Methanisation.shp` (584 bytes, PointZ geometry)
**Attribute data:** `Udupi CMC_BIO-Methanisation.dbf` (12,190 bytes)
**All records named:** "Document/bio_mithanization_unit"
**Bounding box:** [77.540728, 12.872922] to [77.650711, 13.084772]

### 3.1 All 11 BMUs (sorted by distance from HSR)

| # | Latitude | Longitude | Distance from HSR | Area Estimate |
|---|---|---|---|---|
| 1 | **12.896183** | **77.650711** | **2.10 km** | **Kudlu / South HSR** |
| 2 | **12.933803** | **77.614044** | **4.07 km** | **Jayanagar / JP Nagar** |
| 3 | **12.933792** | **77.614061** | **4.07 km** | **Jayanagar / JP Nagar** (co-located) |
| 4 | 12.872922 | 77.626697 | 5.07 km | Begur / Bommanahalli |
| 5 | 12.960922 | 77.640711 | 5.19 km | Koramangala / Ejipura |
| 6 | 12.932492 | 77.580367 | 7.39 km | Banashankari |
| 7 | 12.936267 | 77.579978 | 7.55 km | Banashankari (2nd unit) |
| 8 | 12.965878 | 77.576706 | 9.44 km | Basavanagudi / Lalbagh |
| 9 | 12.976875 | 77.580500 | 9.92 km | VV Puram / Chamrajpet |
| 10 | 13.021314 | 77.563294 | 14.88 km | Rajajinagar / Malleswaram |
| 11 | 13.084772 | 77.540728 | 22.10 km | Yelahanka / North |

### 3.2 Key Findings for HSR Routing

- **0 BMUs inside Udupi City**
- **Nearest BMU: 2.10 km south** at (12.896, 77.651) — near Kudlu Gate
- **2nd/3rd nearest: 4.07 km northwest** at Jayanagar (2 co-located units at same location)
- HSR wet waste must travel **minimum 2.1 km** to reach a Bio-Methanisation facility
- The 2 BMUs used in the simulation (vehicle-sim) at `(12.9338, 77.6140)` match records #5 and #10 — **confirmed from actual Udupi CMC data**

---

## 4. WASTE PROCESSING UNITS — 8 Total

**Shapefile:** `Udupi CMC_Waste_Processing_Units.shp` (452 bytes, PointZ geometry)
**Attribute data:** `Udupi CMC_Waste_Processing_Units.dbf` (8,962 bytes)
**All records named:** "Udupi CMC waste processing units"
**Bounding box:** [77.430853, 12.857962] to [77.686032, 13.122286]

### 4.1 All 8 Waste Processing Units (sorted by distance from HSR)

| # | Latitude | Longitude | Distance from HSR | Area Estimate |
|---|---|---|---|---|
| 1 | **12.896044** | **77.649861** | **2.09 km** | **Kudlu area (nearest to HSR!)** |
| 2 | 12.857962 | 77.686032 | 7.64 km | Carmelaram / Bellandur |
| 3 | 12.875929 | 77.506767 | 15.69 km | Kengeri area |
| 4 | 13.031319 | 77.479684 | 22.21 km | Dasarahalli / Peenya |
| 5 | 12.968195 | 77.444193 | 22.67 km | Nagarbhavi / West |
| 6 | 12.973860 | 77.441004 | 23.18 km | Nagarbhavi / West (2nd) |
| 7 | 12.882866 | 77.430853 | 23.58 km | Rajarajeshwari Nagar |
| 8 | 13.122286 | 77.540021 | 25.80 km | Yelahanka / North |

### 4.2 Key Findings for HSR Routing

- **0 Waste Processing Units inside HSR**
- **Nearest: 2.09 km south** at Kudlu (12.896, 77.650) — this is the **Kudlu Waste Processing Plant**
- This Kudlu unit is **co-located with the nearest BMU** (also at 2.1 km south)
- 2nd nearest is 7.64 km at Carmelaram/Bellandur
- Remaining 6 units are 15–26 km away (western and northern Udupi)

---

## 5. HSR LAYOUT — COMPLETE INFRASTRUCTURE MAP

```
                        N
                        |
    ┌───────────────────┼────────────────────┐
    │  HSR LAYOUT       |    Udupi CMC        │
    │  (12.898-12.931°N, 77.623-77.669°E)    │
    │                                         │
    │  [DWCC-5] (12.905, 77.633)             │     ● BMU at 4.07 km NW
    │       ○ DWCC Sector 1 SW               │       (Jayanagar)
    │                                         │       (12.934, 77.614)
    │  [DWCC-6] (12.899, 77.641)             │
    │       ○ DWCC Sector 1 South            │
    │                                         │
    │  [DWCC-1] (12.913, 77.649)             │
    │       ○ DWCC Sector 2 East             │
    │                                         │
    │  [DWCC-4] (12.912, 77.648)             │
    │       ○ DWCC Sector 2 East             │
    │                                         │
    │  [DWCC-3] (12.918, 77.645)             │
    │       ○ DWCC Sector 3 Central          │
    │                                         │
    │  [DWCC-2] (12.922, 77.647)             │
    │       ○ DWCC Sector 3 North            │
    │                                         │
    └────────────────────────────────────────-┘
                        |
                 2.1 km ↓ SOUTH
                        |
    ┌────────────────────────────────────────┐
    │  KUDLU CLUSTER (12.896, 77.650)        │
    │  ● BMU-1 (Bio-Methanisation) — 2.1 km │
    │  ● Waste Processing Unit — 2.09 km     │
    └────────────────────────────────────────┘
                        |
                 7.6 km ↓ SOUTH-EAST
                        |
    ┌────────────────────────────────────────┐
    │  CARMELARAM (12.858, 77.686)           │
    │  ● Waste Processing Unit — 7.64 km     │
    └────────────────────────────────────────┘

    DUMPYARDS: ALL in NORTH BENGALURU (21-27 km away)
    ● Dumpyard 1: 13.154, 77.669 — 26.74 km N (Bellahalli)
    ● Dumpyard 2: 13.104, 77.646 — 21.07 km N (Yelahanka)
    ● Dumpyard 3: 13.104, 77.646 — 21.03 km N (Yelahanka)
```

---

## 6. ROUTING IMPLICATIONS

### 6.1 Where Does HSR Waste Go?

| Waste Type | % | Tons/day | Destination | Distance | Vehicle |
|---|---|---|---|---|---|
| **Dry / Recyclable** | 30% | 16.5 T | 6 DWCCs inside HSR | <1 km avg | Auto Tipper |
| **Wet / Organic** | 61% | 33.6 T | BMU at Kudlu | 2.1 km | Compactor |
| **Rejects from DWCC** | ~10% | 5.5 T | Processing Unit at Kudlu | 2.09 km | Compactor |
| **Hazardous** | 5% | 2.75 T | Authorised handler | Variable | Special vehicle |
| **Final rejects** | ~4% | 2.2 T | Dumpyard (Yelahanka) | 21 km | Heavy truck |

### 6.2 Critical Routing Distances

| From HSR Centre → | Facility | Distance | Road Route Est. |
|---|---|---|---|
| Nearest DWCC (inside ward) | DWCC #243 at (12.905, 77.633) | 0.5 km | 1-2 km |
| Nearest BMU | Kudlu BMU at (12.896, 77.651) | 2.1 km | 3-4 km |
| Nearest Processing Unit | Kudlu Plant at (12.896, 77.650) | 2.09 km | 3-4 km |
| Nearest Dumpyard | Yelahanka at (13.104, 77.646) | 21.03 km | 28-32 km |

### 6.3 Kudlu Cluster — HSR's Primary External Destination

The **Kudlu area** (2 km south of HSR) has both a BMU and a Processing Unit co-located. This is the natural hub for:
- Wet waste → BMU for bio-methanisation (biogas + compost)
- DWCC rejects → Processing Unit for final treatment
- This makes Kudlu the **single most important routing destination** for Udupi City

---

## 7. SHAPEFILE METADATA

| Dataset | File | Size | Records | Geometry | CRS | Has Attributes |
|---|---|---|---|---|---|---|
| Dumpyards | `Udupi CMC_Dumpyards.shp` | 232 B | 3 | PointZ | WGS 84 | NO (.dbf missing) |
| DWCCs | `Udupi CMC_Dry_Waste_Collection_Centres.shp` | 14.8 KB | 336 | PointZ | WGS 84 | YES (10 fields) |
| BMUs | `Udupi CMC_BIO-Methanisation.shp` | 584 B | 11 | PointZ | WGS 84 | YES (10 fields) |
| Processing Units | `Udupi CMC_Waste_Processing_Units.shp` | 452 B | 8 | PointZ | WGS 84 | YES (10 fields) |

**Attribute fields (common to DWCCs, BMUs, Processing Units):**
`OID_`, `Name`, `FolderPath`, `SymbolID`, `AltMode`, `Base`, `Snippet`, `PopupInfo`, `HasLabel`, `LabelID`

**Note:** Attribute data is minimal — only generic names (e.g., "Udupi CMC dry waste collection centr"). No individual facility names, capacities, or ward assignments are included in the shapefile attributes. All location identification is based on coordinate matching.

---

## 8. DATA QUALITY NOTES

| Issue | Detail |
|---|---|
| Dumpyard .dbf missing | No attribute data for dumpyards — only coordinates available |
| DWCC name truncation | All 336 DWCCs have same name "Udupi CMC dry waste collection centr" (32-char limit) |
| BMU name format | All named "Document/bio_mithanization_unit" — note typo: "mithanization" vs "methanisation" |
| No capacity data | None of the shapefiles include TPD capacity, ward assignment, or operational status |
| Co-located BMUs | Records #5 and #10 at (12.9338, 77.6140) are at essentially same coordinate — likely 2 units at one site |
| Coordinate precision | All coordinates are WGS 84 (EPSG:4326), sub-meter precision |

---

*Report generated by parsing raw Udupi CMC shapefiles using Python struct-based .shp/.dbf reader.*
*No external libraries used. All coordinates verified against Udupi City ward boundary.*
*Full raw output: `waste_facilities_analysis.txt` (1,607 lines) + `waste_facilities_analysis.json`*
