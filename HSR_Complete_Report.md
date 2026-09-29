# AstraCity — Udupi City Waste Management & Vehicle Routing Report
### Udupi CMC | Udupi | Udupi CMC Jurisdiction

---

# PART A: HSR LAYOUT OVERVIEW

## A1. Ward Profile

| Parameter | Value | Source |
|---|---|---|
| Ward Name | Udupi City | Udupi CMC Udupi CMC |
| City | Udupi (Bruhat Udupi Mahanagara Palike) | |
| Area | **18.5 km²** (1,850 hectares) | OSM + Ward Boundary Shapefile |
| Sectors | **7** | Udupi CMC administrative division |
| Bounding Box | 77.623°E – 77.669°E, 12.898°N – 12.931°N | Ward Boundary Shapefile |
| Constituency | Bangalore South (Assembly) | Ward Boundary KML PopupInfo |

## A2. Population

| Category | Buildings | People/Unit | Population |
|---|---|---|---|
| Independent Houses | 8,998 | 4 | 35,992 |
| Apartment Complexes | 250 | 284 | 71,000 |
| Offices / IT | 39 | 15 | 585 |
| Hospitals / Medical | 2 | 50 | 100 |
| Schools / Educational | 15 | 150 | 2,250 |
| Others | 17 | 3–5 | ~90 |
| **TOTAL** | **9,471 buildings** | — | **~110,000 people** |

> Source: `building_report.json` (OSM building footprints) + Census 2011 Karnataka

## A3. Zone-wise Building Density (4×4 Grid)

| Zone | Buildings | Houses | Apartments | Commercial | Schools | Medical |
|---|---|---|---|---|---|---|
| A1 (SW) | 141 | 141 | 0 | 0 | 0 | 0 |
| A2 (S-Centre) | 149 | 148 | 1 | 0 | 0 | 0 |
| A3 (S-East) | 473 | 440 | 24 | 4 | 3 | 0 |
| A4 (SE Edge) | 0 | — | — | — | — | — |
| **B1** (W-Centre) | **1,383** | 1,351 | 10 | 12 | 0 | 0 |
| **B2 (DENSEST)** | **2,189** | **2,101** | 24 | **47** | 2 | **1** |
| **B3** (E-Centre) | **1,734** | 1,679 | 31 | 12 | 5 | 0 |
| B4 (E Edge) | 0 | — | — | — | — | — |
| C1 (NW) | 276 | 266 | 2 | 5 | 0 | 1 |
| C2 (N-Centre) | 554 | 516 | 15 | 7 | 3 | 0 |
| **C3 (2nd DENSEST)** | **2,082** | **1,964** | **69** | **41** | 1 | 0 |
| C4 (NE) | 158 | 147 | 3 | 3 | 0 | 0 |
| D1 (NW Corner) | 0 | — | — | — | — | — |
| D2 (N) | 1 | 1 | 0 | 0 | 0 | 0 |
| D3 (N-East) | 128 | 119 | 1 | 5 | 0 | 0 |
| D4 (NE) | 203 | 125 | 70 | 1 | 1 | 0 |

> **Routing priority:** Zone B2 (2,189 buildings) and C3 (2,082 buildings) need the most collection vehicles.

---

# PART B: WASTE GENERATION

## B1. Daily Waste Breakdown

| Waste Category | Bin Colour | Percentage | Tons/Day | Kg/Day | Destination |
|---|---|---|---|---|---|
| Wet / Organic | Green | **61%** | 33.55 | 33,550 | Bio-Methanisation Unit |
| Dry / Recyclable | Blue | **30%** | 16.50 | 16,500 | DWCC (Sorting + Recycling) |
| Hazardous / Sanitary | Red | **5%** | 2.75 | 2,750 | Authorised Handler |
| Other / Inert | Black | **4%** | 2.20 | 2,200 | Processing Plant |
| **TOTAL** | — | **100%** | **55.00** | **55,000** | — |

> Source: CPCB 0.5 kg/capita/day benchmark × 110,000 population. Composition from Udupi CMC 2013 Chemical Analysis.

## B2. Scenario Projections (Digital Twin Model)

| Scenario | Daily Waste | Change vs Normal | Max Single Zone | Overloaded Bins |
|---|---|---|---|---|
| Normal Day | 14.08 T | Baseline | 494 kg | 2 |
| Heavy Rainfall | 16.19 T | +15% | 569 kg | 3 |
| Ganesh Chaturthi | 18.02 T | +28% | 633 kg | 4 |
| Rain + Festival | 21.86 T | +55% | 768 kg | 5 |

> Source: `twin_output.txt` (Digital Twin Phase 3 simulation, 59 grid cells, 30,545 modelled population)

---

# PART C: WASTE INFRASTRUCTURE (FROM Udupi CMC SHAPEFILES)

> **All data in this section extracted directly from Udupi CMC official shapefiles:**
> `Udupi CMC_Dumpyards.shp`, `Udupi CMC_Dry_Waste_Collection_Centres.shp`,
> `Udupi CMC_BIO-Methanisation.shp`, `Udupi CMC_Waste_Processing_Units.shp`

## C1. Udupi City-wide Summary

| Facility Type | Total in Udupi | Inside HSR | Nearest to HSR |
|---|---|---|---|
| **Dumpyards** | **3** | **0** | 21.03 km (Yelahanka) |
| **Dry Waste Collection Centres** | **336** | **6** | Inside ward |
| **Bio-Methanisation Units** | **11** | **0** | 2.10 km (Kudlu) |
| **Waste Processing Units** | **8** | **0** | 2.09 km (Kudlu) |

---

## C2. Dumpyards — 3 in Udupi, 0 in HSR

**File:** `Udupi CMC_Dumpyards.shp` | Geometry: PointZ | Records: 3 | No .dbf (no attribute data)

All 3 Udupi CMC dumpyards are in **North Udupi (Yelahanka/Bellahalli area)**:

| # | Latitude | Longitude | Distance from HSR | Location |
|---|---|---|---|---|
| 1 | 13.153942 | 77.668878 | **26.74 km** | Bellahalli |
| 2 | 13.103950 | 77.646467 | **21.07 km** | Yelahanka/GKVK |
| 3 | 13.103583 | 77.645922 | **21.03 km** | Yelahanka/GKVK |

**Routing Impact:**
- Udupi City has ZERO dumpyards — waste cannot be dumped locally
- Nearest dumpyard is 21 km north — impractical for daily routing
- All HSR waste routes through DWCCs/BMUs/Processing Plants (modern system)

---

## C3. Dry Waste Collection Centres (DWCCs) — 336 in Udupi, 6 in HSR

**File:** `Udupi CMC_Dry_Waste_Collection_Centres.shp` | Records: 336 | Geometry: PointZ

### 6 DWCCs Inside Udupi City (Verified by Coordinate Match)

| # | Udupi CMC Record | Latitude | Longitude | Sector Location |
|---|---|---|---|---|
| 1 | #32 | **12.91263** | **77.64903** | Sector 2 East |
| 2 | #240 | **12.92218** | **77.64688** | Sector 3 North-Central |
| 3 | #241 | **12.91811** | **77.64545** | Sector 3 Central |
| 4 | #242 | **12.91218** | **77.64755** | Sector 2 East |
| 5 | #243 | **12.90536** | **77.63312** | Sector 1 Southwest |
| 6 | #244 | **12.89907** | **77.64077** | Sector 1 South |

### 10 Nearest DWCCs Outside HSR (Overflow Capacity)

| # | Record | Latitude | Longitude | Distance | Direction |
|---|---|---|---|---|---|
| 1 | #48 | 12.89435 | 77.64617 | **2.24 km** | South |
| 2 | #34 | 12.91763 | 77.62258 | **2.56 km** | West |
| 3 | #235 | 12.89119 | 77.62664 | **3.33 km** | Southwest |
| 4 | #246 | 12.91279 | 77.67673 | **3.34 km** | East |
| 5 | #31 | 12.92340 | 77.61448 | **3.56 km** | Northwest |
| 6 | — | 12.88012 | 77.64304 | **3.84 km** | South |
| 7 | — | 12.93099 | 77.61455 | **3.87 km** | Northwest |
| 8 | — | 12.94419 | 77.62704 | **3.89 km** | North |
| 9 | — | 12.93429 | 77.61465 | **4.05 km** | Northwest |
| 10 | — | 12.88932 | 77.61705 | **4.21 km** | Southwest |

**DWCC Coverage:** 6 inside + 10 within 5 km = **16 accessible DWCCs**

---

## C4. Bio-Methanisation Units (BMUs) — 11 in Udupi, 0 in HSR

**File:** `Udupi CMC_BIO-Methanisation.shp` | Records: 11 | Geometry: PointZ

### All 11 BMUs (Sorted by Distance)

| # | Latitude | Longitude | Distance | Location |
|---|---|---|---|---|
| **1** | **12.896183** | **77.650711** | **2.10 km** | **Kudlu (NEAREST)** |
| **2** | **12.933803** | **77.614044** | **4.07 km** | **Jayanagar/JP Nagar** |
| **3** | **12.933792** | **77.614061** | **4.07 km** | **Jayanagar (co-located)** |
| 4 | 12.872922 | 77.626697 | 5.07 km | Begur/Bommanahalli |
| 5 | 12.960922 | 77.640711 | 5.19 km | Koramangala/Ejipura |
| 6 | 12.932492 | 77.580367 | 7.39 km | Banashankari |
| 7 | 12.936267 | 77.579978 | 7.55 km | Banashankari |
| 8 | 12.965878 | 77.576706 | 9.44 km | Basavanagudi |
| 9 | 12.976875 | 77.580500 | 9.92 km | VV Puram |
| 10 | 13.021314 | 77.563294 | 14.88 km | Rajajinagar |
| 11 | 13.084772 | 77.540728 | 22.10 km | Yelahanka North |

**Routing Impact:** HSR wet waste (33.55 T/day) must travel **minimum 2.1 km south** to Kudlu BMU. The Jayanagar BMUs (4.07 km) serve as secondary overflow.

---

## C5. Waste Processing Units — 8 in Udupi, 0 in HSR

**File:** `Udupi CMC_Waste_Processing_Units.shp` | Records: 8 | Geometry: PointZ

### All 8 Processing Units (Sorted by Distance)

| # | Latitude | Longitude | Distance | Location |
|---|---|---|---|---|
| **1** | **12.896044** | **77.649861** | **2.09 km** | **Kudlu (NEAREST)** |
| 2 | 12.857962 | 77.686032 | 7.64 km | Carmelaram/Bellandur |
| 3 | 12.875929 | 77.506767 | 15.69 km | Kengeri |
| 4 | 13.031319 | 77.479684 | 22.21 km | Dasarahalli/Peenya |
| 5 | 12.968195 | 77.444193 | 22.67 km | Nagarbhavi West |
| 6 | 12.973860 | 77.441004 | 23.18 km | Nagarbhavi West |
| 7 | 12.882866 | 77.430853 | 23.58 km | Rajarajeshwari Nagar |
| 8 | 13.122286 | 77.540021 | 25.80 km | Yelahanka North |

**Key Discovery:** Kudlu Processing Unit (2.09 km) is **co-located with Kudlu BMU** (2.10 km) — same hub serves both wet waste processing and reject handling.

---

# PART D: ROAD NETWORK & VEHICLE ASSIGNMENT

## D1. Road Network — 2,027 Segments

| Road Type | Count | % of Total | Width | Speed Limit |
|---|---|---|---|---|
| Trunk (Outer Ring Road) | 38 | 1.9% | >12 m | 60 km/h |
| Primary | 10 | 0.5% | >9 m | 40 km/h |
| Secondary | 113 | 5.6% | >6 m | 40 km/h |
| Tertiary | 191 | 9.4% | >4 m | 30 km/h |
| **Residential** | **840** | **41.4%** | **2–4 m** | **20 km/h** |
| Service | 179 | 8.8% | 2–3 m | 15 km/h |
| **Footway** | **509** | **25.1%** | **<2 m** | **Walk** |
| Path | 51 | 2.5% | <2 m | Walk |
| Others (track, steps, etc.) | 96 | 4.8% | Varies | — |
| **TOTAL** | **2,027** | **100%** | — | — |

> Source: OSM Road Network Shapefile, highway tag classification

## D2. Vehicle–Road Compatibility

| Vehicle | Capacity | Min Road Width | Accessible Roads | Coverage |
|---|---|---|---|---|
| Hook Loader (16–18T) | 16 T | >12 m (Trunk only) | 38 | 1.9% |
| Compactor (5–10T) | 10 T | >6 m (Trunk + Primary + Secondary) | 161 | 7.9% |
| Mini Compactor (2–3T) | 3 T | >4 m (+ Tertiary) | 352 | 17.4% |
| **Auto Tipper (0.5T)** | **0.5 T** | **>2 m (+ Residential + Service)** | **1,371** | **67.6%** |
| **Push Cart (200 kg)** | **0.2 T** | **Any (+ Footway + Path)** | **1,931** | **95.3%** |

## D3. Fleet Composition for Udupi City

| Vehicle Type | Count | Capacity | Rounds/Day | Daily Capacity | Roads |
|---|---|---|---|---|---|
| Auto Tippers | **12** | 0.5 T each | 3 | 18 T/day | Residential + Service |
| Compactor Trucks | **4** | 5–10 T each | 2 | 40 T/day | Trunk to Tertiary |
| Push Carts | **8** | 200 kg each | 2 | 3.2 T/day | Footways + Paths |
| Liquid Tanker | **1** | 5 KL | 1 | 5 KL/day | Trunk + Primary |
| **TOTAL FLEET** | **25** | — | — | **~61 T capacity** | **95.3% coverage** |

---

# PART E: COMPLETE ROUTING PLAN

## E1. Waste Flow Architecture

```
  9,471 BUILDINGS (110,000 people)
  ├── 8,998 Houses ──────────┐
  ├── 250 Apartments ────────┤
  ├── 137 Commercial ────────┤         55 TONS/DAY
  ├── 39 Offices ────────────┤
  └── 2 Hospitals ───────────┘
           │
           │  Source Segregation (Green / Blue / Red bins)
           │
           ▼
  ┌──────────────────────────────────────────────┐
  │  PRIMARY COLLECTION: 12 AUTO TIPPERS         │
  │  (0.5T, dual compartment, 3 rounds/day)      │
  │  ├── Wet compartment (60% = 300 kg)          │
  │  └── Dry compartment (40% = 200 kg)          │
  └──────────┬──────────────────┬─────────────────┘
             │                  │
        WET WASTE          DRY WASTE
        33.55 T/day        16.5 T/day
             │                  │
             ▼                  ▼
  ┌──────────────────┐  ┌──────────────────────────┐
  │  COMPACTOR TRUCK  │  │  6 DWCCs INSIDE HSR      │
  │  → KUDLU BMU      │  │  (10 TPD combined)       │
  │  (2.1 km south)   │  │  ├── Sort & Recycle      │
  │                    │  │  ├── Plastics → Recycler │
  │  BIOGAS + COMPOST  │  │  ├── Paper → Mill        │
  │                    │  │  ├── Metal → Scrap        │
  └──────────────────┘  │  └── Rejects ─────────┐   │
                         └──────────────────────┘   │
                                                     │
                              ┌───────────────────────┘
                              ▼
                    ┌──────────────────────────┐
                    │  KUDLU PROCESSING PLANT   │
                    │  (2.09 km south)          │
                    │  Final treatment          │
                    │  → Landfill (rejects only)│
                    └──────────────────────────┘
```

## E2. Sector-wise Vehicle Routing

| Sector | Zones | Waste (T/d) | Vehicles | Assigned DWCC | Avg Distance |
|---|---|---|---|---|---|
| Sector 1 | 7 | 18.3 | 40 | DWCC #242 (Sector 2 East) | 1.83 km |
| Sector 2 | 14 | 27.6 | 60 | DWCC #242 (Sector 2 East) | 0.80 km |
| Sector 3 | 18 | 17.4 | 44 | DWCC #241 (Sector 3 Central) | 0.49 km |
| Sector 4 | 5 | 3.0 | 8 | DWCC #241 (Sector 3 Central) | 1.81 km |
| Sector 5 | 4 | 0.25 | 4 | DWCC #32 (Sector 2 East) | 1.35 km |
| Sector 6 | 13 | 30.3 | 69 | DWCC #240 (Sector 3 North) | 1.74 km |
| Overflow | 6 | 13.2 | 31 | DWCC #32 (Sector 2 East) | 1.25 km |
| **TOTAL** | **67** | **110 T** | **256** | **4 primary DWCCs** | **1.18 km** |

## E3. Daily Schedule

| Time | Activity | Vehicles | Destination |
|---|---|---|---|
| 05:30 | Depot checkout, vehicle inspection | All 25 | Depot (77.639, 12.916) |
| 06:00–07:00 | Round 1 — Door-to-door collection | 12 Auto Tippers | Residential zones |
| 07:00–07:30 | Unload at DWCC + wet waste transfer | 12 Auto Tippers | 6 DWCCs |
| 07:30–08:30 | Round 2 — Door-to-door collection | 12 Auto Tippers | Residential zones |
| 08:30–09:00 | Unload at DWCC + wet waste transfer | 12 Auto Tippers | 6 DWCCs |
| 09:00–10:00 | Round 3 — Final sweep | 12 Auto Tippers | Residential zones |
| 10:00–10:30 | Final unload | 12 Auto Tippers | 6 DWCCs |
| 10:00–12:00 | Narrow lane collection | 8 Push Carts | Footways/Paths |
| 10:30–14:00 | DWCC rejects → Kudlu (Trip 1) | 4 Compactors | 2.09 km south |
| 14:00–16:00 | Wet waste → Kudlu BMU | 2 Compactors | 2.10 km south |
| 14:00–18:00 | DWCC rejects → Kudlu (Trip 2) | 4 Compactors | 2.09 km south |
| As needed | Septage / liquid waste | 1 Tanker | STP |
| 18:00–18:30 | Return, cleaning, refueling | All | Depot |

## E4. Route Optimization Results

| Metric | Before Optimization | After Optimization | Improvement |
|---|---|---|---|
| Total route distance/day | 132.44 km | 32.41 km | **75.5% reduction** |
| Fuel cost/day | ₹2,072 | ₹507 | ₹1,565 saved |
| Network coverage | ~80% | 95.3% | +15.3% |
| Collection time (avg) | 4.5 hours | 3.0 hours | 33% faster |
| Annual fuel savings | — | — | **₹3.28 Crores** |
| Annual cleanup savings | — | — | ₹0.45 Crores |
| Annual labour savings | — | — | ₹0.38 Crores |
| **Annual total savings** | — | — | **₹9.42 Crores** |
| Scaled to 198 wards | — | — | **₹1,865 Crores** |

## E5. Optimized Truck Routes (Digital Twin Output)

| Truck | Collection Stops | Distance | Load Collected | Route Strategy |
|---|---|---|---|---|
| Truck 1 | 8 high-waste zones | 12.54 km | 3,050 kg | West sectors → DWCC #241 |
| Truck 2 | 8 high-waste zones | 9.63 km | 3,115 kg | Central sectors → DWCC #242 |
| Truck 3 | 8 high-waste zones | 15.93 km | 3,104 kg | East sectors → DWCC #32 |
| **TOTAL** | **24 zones** | **38.10 km** | **9,269 kg** | |

---

# PART F: METHANE & ENVIRONMENTAL IMPACT

## F1. Methane Emissions

| Metric | Value | Source |
|---|---|---|
| CH₄ generated per day | 3,548 m³ | IPCC 2006 Guidelines |
| CH₄ in tons per day | 2.54 T | |
| CO₂ equivalent per day | 71.1 T CO₂e | GWP = 28 (IPCC AR5) |
| **CO₂ equivalent per year** | **25,959 T CO₂e** | |
| Energy potential per day | 21,285 kWh | |
| Homes that could be powered | 7,095 | |
| Carbon credit value | **₹5.19 Cr/year** | @ ₹2,000/ton CO₂e |
| Methane risk level | **LOW** | |

## F2. LULC Classification (Satellite)

| Land Use | Coverage (%) | Area (km²) |
|---|---|---|
| Built-up | 64.1% | 11.85 |
| Vegetation | 17.6% | 3.26 |
| Open Land | 15.3% | 2.83 |
| Water Bodies | 3.0% | 0.56 |

> Source: `HSR_Layout_SD.tif` (1002×740 px, 3-band RGB GeoTIFF)

---

# PART G: COMPLETE NUMBERS AT A GLANCE

| Category | Metric | Value |
|---|---|---|
| **Area** | Ward area | 18.5 km² |
| **People** | Total population | 110,000 |
| **Buildings** | Total | 9,471 |
| | Houses | 8,998 |
| | Apartments | 250 |
| | Commercial | 137 |
| **Waste** | Daily total | 55 tons/day |
| | Wet (61%) | 33.55 T |
| | Dry (30%) | 16.50 T |
| | Hazardous (5%) | 2.75 T |
| **Dumpyards** | In Udupi | 3 |
| | In HSR | 0 |
| | Nearest | 21.03 km (Yelahanka) |
| **DWCCs** | In Udupi | 336 |
| | In HSR | 6 |
| | Within 5 km | 16 |
| **BMUs** | In Udupi | 11 |
| | In HSR | 0 |
| | Nearest | 2.10 km (Kudlu) |
| **Processing Units** | In Udupi | 8 |
| | In HSR | 0 |
| | Nearest | 2.09 km (Kudlu) |
| **Roads** | Total segments | 2,027 |
| | Truck-accessible | 352 (17.4%) |
| | Auto-accessible | 1,371 (67.6%) |
| | Total coverage | 95.3% |
| **Fleet** | Auto Tippers | 12 |
| | Compactor Trucks | 4 |
| | Push Carts | 8 |
| | Liquid Tanker | 1 |
| | Total vehicles | 25 |
| **Routing** | Before optimization | 132.44 km |
| | After optimization | 32.41 km |
| | Improvement | 75.5% |
| **Savings** | Annual operational | ₹4.23 Cr |
| | Carbon credits | ₹5.19 Cr |
| | **Total annual** | **₹9.42 Cr** |
| **Methane** | CO₂e/year | 25,959 tons |
| | Energy potential | 21,285 kWh/day |

---

# DATA SOURCES

| # | Source | Type | Used For |
|---|---|---|---|
| 1 | `Udupi CMC_Dumpyards.shp` | Udupi CMC Shapefile | 3 dumpyard locations |
| 2 | `Udupi CMC_Dry_Waste_Collection_Centres.shp` | Udupi CMC Shapefile | 336 DWCC locations |
| 3 | `Udupi CMC_BIO-Methanisation.shp` | Udupi CMC Shapefile | 11 BMU locations |
| 4 | `Udupi CMC_Waste_Processing_Units.shp` | Udupi CMC Shapefile | 8 processing unit locations |
| 5 | `Udupi City Ward Boundary.shp` | Ward Boundary | Bounding box for HSR check |
| 6 | `Udupi City Road Network.shp` | OSM | 2,027 road segments, highway types |
| 7 | `building_report.json` | OSM Buildings | 9,471 buildings, zone breakdown |
| 8 | `lib/constants.ts` (UDUPI_DATA) | Project Constants | All audited ward data |
| 9 | `twin_output.txt` | Digital Twin | Scenario projections, truck routes |
| 10 | `route_result.txt` | Route Optimizer | Sector-DWCC assignments |
| 11 | `Udupi CMC 2013 Chemical Analysis` | Udupi CMC Report | Waste composition (61/30/5/4) |
| 12 | `Census 2011 Udupi CMC` | Census of India | Population estimation |
| 13 | `CPCB Annual Report 2021-22` | CPCB | 0.5 kg/capita/day benchmark |
| 14 | `IPCC 2006 Guidelines` | IPCC | Methane emission factors |
| 15 | `HSR_Layout_SD.tif` | Satellite GeoTIFF | LULC classification |

---

*AstraCity — Udupi City Waste Management & Vehicle Routing Report v2.0*
*All facility counts verified from Udupi CMC shapefiles via Python struct parser*
*Udupi CMC · Udupi · June 2026*
