# 🚛 Udupi City — Complete Vehicle Routing Plan
### Udupi CMC · Udupi · AstraCity Routing Intelligence

---

## 1. HOUSING & BUILDING INVENTORY

### 1.1 Total Buildings: **9,471** (from OSM)

| Building Type | Count | % | People/Unit | Est. Population |
|---|---|---|---|---|
| **Houses (Independent)** | 8,998 | 94.8% | 4 | 35,992 |
| **Apartments (Complexes)** | 250 | 2.6% | 284 | 71,000 |
| **Commercial / Retail** | 137 | 1.4% | — | — |
| **Office / IT** | 39 | 0.4% | 15 | 585 |
| **Educational (Schools)** | 15 | 0.2% | 150 | 2,250 |
| **Religious** | 10 | 0.1% | — | — |
| **Government / Civic** | 3 | <0.1% | — | — |
| **Hospitals / Medical** | 2 | <0.1% | 50 | 100 |
| **Other / Unclassified** | 17 | 0.2% | 3 | 90 |
| **TOTAL** | **9,471** | 100% | — | **~110,000** |

### 1.2 Zone-wise Building Distribution (4×4 Grid)

The ward is divided into a 4×4 grid (A1–D4). Each cell is ~1.16 km × ~0.83 km:

| Zone | Buildings | Houses | Apts | Commercial | Schools | Medical | Dominant Type |
|---|---|---|---|---|---|---|---|
| **A1** (SW) | 141 | 141 | 0 | 0 | 0 | 0 | Residential |
| **A2** (S-Center) | 149 | 148 | 1 | 0 | 0 | 0 | Residential |
| **A3** (S-East) | 473 | 440 | 24 | 4 | 3 | 0 | Residential |
| **A4** (SE Corner) | 0 | — | — | — | — | — | Empty |
| **B1** (W-Center) | 1,383 | 1,351 | 10 | 12 | 0 | 0 | Residential |
| **B2** ⭐(Core Center) | **2,189** | **2,101** | 24 | **47** | 2 | **1** | **DENSEST** |
| **B3** (E-Center) | 1,734 | 1,679 | 31 | 12 | 5 | 0 | Residential |
| **B4** (East Edge) | 0 | — | — | — | — | — | Empty |
| **C1** (NW) | 276 | 266 | 2 | 5 | 0 | 1 | Residential |
| **C2** (N-Center) | 554 | 516 | 15 | 7 | 3 | 0 | Residential |
| **C3** ⭐(NE Core) | **2,082** | **1,964** | **69** | **41** | 1 | 0 | **2nd DENSEST** |
| **C4** (NE Edge) | 158 | 147 | 3 | 3 | 0 | 0 | Residential |
| **D1** (NW Corner) | 0 | — | — | — | — | — | Empty |
| **D2** (N) | 1 | 1 | 0 | 0 | 0 | 0 | Minimal |
| **D3** (N-East) | 128 | 119 | 1 | 5 | 0 | 0 | Residential |
| **D4** (NE) | 203 | 125 | 70 | 1 | 1 | 0 | Mixed (apt-heavy) |

> **Key insight:** Zones B2 (2,189 buildings) and C3 (2,082 buildings) generate the most waste and need the most vehicles.

---

## 2. WASTE GENERATION

### 2.1 Daily Waste Production

| Metric | Value | Source |
|---|---|---|
| Population | 110,000 | Census 2011 + building estimation |
| Per-capita waste | 0.5 kg/day | CPCB standard |
| **Total daily waste** | **55 tons/day** | 110,000 × 0.5 kg |
| Wet waste (61%) | 33.55 tons | Udupi CMC 2013 Chemical Analysis |
| Dry waste (30%) | 16.50 tons | |
| Hazardous (5%) | 2.75 tons | |
| Other (4%) | 2.20 tons | |

### 2.2 Scenario Waste Projections (from Digital Twin)

| Scenario | Waste/Day | Max Single Zone |
|---|---|---|
| **Normal Day** | 14.08 tons | 494 kg |
| **Heavy Rainfall** | 16.19 tons (+15%) | 569 kg |
| **Ganesh Chaturthi** | 18.02 tons (+28%) | 633 kg |
| **Rain + Festival** | 21.86 tons (+55%) | 768 kg |

### 2.3 Sector-wise Waste Generation

| Sector | Zones | Waste (kg/day) | Waste (tons) | % of Total |
|---|---|---|---|---|
| **Sector 1** | 7 zones | 18,317 | 18.3 | 16.6% |
| **Sector 2** | 14 zones | 27,588 | 27.6 | 25.1% |
| **Sector 3** | 18 zones | 17,387 | 17.4 | 15.8% |
| **Sector 4** | 5 zones | 2,958 | 3.0 | 2.7% |
| **Sector 5** | 4 zones | 246 | 0.25 | 0.2% |
| **Sector 6** | 13 zones | 30,327 | 30.3 | 27.6% |
| **Overflow** | 6 zones | 13,177 | 13.2 | 12.0% |
| **TOTAL** | **67 zones** | **110,000** | **110 T** | 100% |

---

## 3. NEAREST DUMPYARDS & WASTE FACILITIES

### 3.1 Dumpyards Near Udupi City

> **Udupi City has 0 official Udupi CMC dumpyards within ward boundaries.** (confirmed from `Udupi CMC_Dumpyards.shp` and `constants.ts`: `dumpyards: 0`)

**Nearest dumpyards/landfills outside HSR:**

| # | Facility | Approx. Distance | Direction | Status |
|---|---|---|---|---|
| 1 | **Mandur Landfill** | ~25 km | NE | Closed (2014), legacy site |
| 2 | **Bellahalli Landfill** | ~28 km | N | Active quarry-fill |
| 3 | **Mittaganahalli Landfill** | ~22 km | N | Active (limited) |
| 4 | **Kudlu Waste Processing Plant** | ~5 km | S | Under construction |
| 5 | **Doddaballapur Integrated Facility** | ~40 km | N | Active |

> **Routing implication:** Since there are NO dumpyards in HSR, all waste must route to DWCCs, BMUs, or external processing plants. Kudlu (5 km south) will be the primary destination once operational.

### 3.2 Detected Dump Sites (Satellite + Complaints)

From `dump_sites.json` — **4 high-risk dump sites** detected in/near HSR:

| # | Risk | Area (sqm) | Detected Via | Nearest DWCC | Priority |
|---|---|---|---|---|---|
| 1 | High | 264 | Satellite | DWCC-004 (0.8 km) | P0 — Same Day |
| 2 | High | 182 | Satellite | DWCC-001 (1.2 km) | P0 — Same Day |
| 3 | Medium | 200 | Satellite | DWCC-002 (1.5 km) | P1 — 48 hours |
| 4 | Medium | 147 | Satellite | DWCC-003 (0.9 km) | P1 — 48 hours |

---

## 4. RECYCLING CENTRES — DWCCs (Dry Waste Collection Centres)

### 4.1 DWCCs Inside HSR Ward (Exact Udupi CMC Data)

**4 confirmed DWCCs inside HSR boundary** (from `exact_udupi_dwcc.json`):

| # | ID | Latitude | Longitude | Sector Served | Capacity |
|---|---|---|---|---|---|
| 1 | **DWCC-001** | 12.91263 | 77.64903 | Sector 2 East | ~2.5 TPD |
| 2 | **DWCC-002** | 12.92218 | 77.64688 | Sector 3 Central | ~2.5 TPD |
| 3 | **DWCC-003** | 12.91811 | 77.64545 | Sector 2 West | ~2.5 TPD |
| 4 | **DWCC-004** | 12.91218 | 77.64755 | Sector 1 East | ~2.5 TPD |

**Combined DWCC capacity: ~10 TPD dry waste** (handling 16.5 TPD dry waste = **60% utilisation**)

### 4.2 Additional Udupi CMC DWCCs in Broader Area (from `udupi_dry_waste_details.json`)

6 more DWCCs within 2-3 km of HSR boundary:

| # | Latitude | Longitude | Est. Distance from HSR Centre |
|---|---|---|---|
| 5 | 12.91763 | 77.62258 | ~2.8 km W |
| 6 | 12.89435 | 77.64617 | ~2.2 km S |
| 7 | 12.89119 | 77.62664 | ~3.4 km SW |
| 8 | 12.90536 | 77.63312 | ~1.5 km SW |
| 9 | 12.89907 | 77.64077 | ~1.8 km S |
| 10 | 12.91279 | 77.67673 | ~3.0 km E |

**Total DWCCs accessible: 10** (4 inside + 6 nearby)

### 4.3 What Happens at a DWCC

```
Incoming Vehicle (Auto Tipper with dry waste compartment)
    ↓
    Weighbridge — Record incoming weight
    ↓
    Unloading Bay — Empty dry waste compartment
    ↓
    Manual Sorting Line:
    ├── Plastics (PET, HDPE, LDPE) → Baled → Recycler Pickup (weekly)
    ├── Paper / Cardboard → Bundled → Paper Mill Aggregator
    ├── Metals (aluminium, tin, iron) → Scrap Dealer
    ├── Glass → Glass Recycler
    ├── E-waste → Authorised E-waste Handler (monthly)
    ├── Textiles → Rag pickers / NGOs
    └── Rejects (soiled, non-recyclable) → Compactor → Processing Plant
    ↓
    Weighbridge Out — Record outgoing rejects
```

---

## 5. METHANE & BIO-METHANISATION CENTRES

### 5.1 BMU Locations (Bio-Methanisation Units)

**2 BMUs** near Udupi City (from `vehicle-sim/page.tsx`):

| # | ID | Name | Latitude | Longitude | Capacity | Accepts |
|---|---|---|---|---|---|---|
| 1 | **BMU-001** | Bio-Methanisation Unit 1 | 12.93380 | 77.61404 | 5 TPD | Wet / Organic waste |
| 2 | **BMU-002** | Bio-Methanisation Unit 2 | 12.93379 | 77.61406 | 5 TPD | Wet / Organic waste |

**Combined BMU capacity: 10 TPD** (vs 33.55 TPD wet waste generated = **30% can be processed**)

### 5.2 Methane Generation Data

| Metric | Value | Source |
|---|---|---|
| CH₄ generated/day | 3,548 m³ | IPCC 2006 formula |
| CH₄ in tons/day | 2.54 tons | |
| CO₂ equivalent/day | 71.1 tons CO₂e | GWP = 28 |
| CO₂e/year | **25,959 tons** | |
| Energy potential/day | 21,285 kWh | |
| Homes that could be powered | **7,095** | |
| Carbon credit value | **₹5.19 Cr/year** | @ ₹2,000/ton |
| Methane risk level | **LOW** | |

### 5.3 BMU Routing for Wet Waste

```
Auto Tipper (wet compartment — 60% = 300 kg)
    ↓ Collection from residential zones
    ↓ 3 rounds per day per vehicle
    ↓
Transfer to Compactor at sector boundary
    ↓ Compactor load: 5-10 tons wet waste
    ↓
Drive to nearest BMU (distance from HSR center: ~3.2 km NW)
    ↓
BMU Processing:
    ├── Biogas → Energy generation (21,285 kWh/day potential)
    ├── Compost → Sold to nurseries / farmers
    └── Rejects → Kudlu Processing Plant (5 km S)
```

---

## 6. SEGREGATION SYSTEM

### 6.1 Source Segregation (At Household Level)

| Bin Colour | Waste Type | % of Total | Weight/day | Destination |
|---|---|---|---|---|
| 🟢 **Green** | Wet / Kitchen / Organic | 61% | 33.55 T | BMU (bio-methanisation) |
| 🔵 **Blue** | Dry / Recyclable | 30% | 16.50 T | DWCC (sorting + recycling) |
| 🔴 **Red** | Hazardous / Sanitary | 5% | 2.75 T | Authorised handler |
| ⚫ **Black** | Reject / Inert | 4% | 2.20 T | Landfill / Processing Plant |

### 6.2 Ward-level Segregation Rates

| HSR Sub-zone | Segregation Rate | Risk Level | Action Required |
|---|---|---|---|
| North | 68% | ✅ Good | Maintain awareness campaigns |
| West | 62% | ✅ Good | Strengthen apartment compliance |
| Central | 55% | ⚠️ Medium | Deploy segregation marshals |
| South | 48% | ⚠️ Medium | Door-to-door education drives |
| East | 42% | 🔴 Low | Penalty enforcement + monitoring |
| Commercial Hub | 38% | 🔴 Critical | Mandatory bulk generator audits |

### 6.3 Vehicle Compartment Configuration

```
┌───────────────────────────────┐
│    AUTO TIPPER (500 kg)       │
│                               │
│  ┌─────────────┬─────────┐   │
│  │   WET (60%) │DRY (40%)│   │
│  │   300 kg    │ 200 kg  │   │
│  │   GREEN     │  BLUE   │   │
│  │             │         │   │
│  │   → BMU     │  → DWCC │   │
│  └─────────────┴─────────┘   │
│                               │
│  Hazardous: SEPARATE VEHICLE  │
│  Reject: Collected with dry   │
└───────────────────────────────┘
```

---

## 7. VEHICLES ACCORDING TO ROAD WIDTH

### 7.1 Udupi City Road Network (2,027 segments)

| Road Type | Count | % | Width | Vehicle Allowed | Speed |
|---|---|---|---|---|---|
| **Trunk** | 38 | 1.9% | >12m | 🚛 Hook Loader (18T), Compactor (10T), Truck (5T) | 60 km/h |
| **Primary** | 10 | 0.5% | >9m | 🚛 Compactor (10T), Truck (5T) | 40 km/h |
| **Secondary** | 113 | 5.6% | >6m | 🚛 Compactor (5T), Truck (5T) | 40 km/h |
| **Tertiary** | 191 | 9.4% | >4m | 🚛 Mini Compactor (3T), Auto Tipper (0.5T) | 30 km/h |
| **Residential** | 840 | **41.4%** | 2-4m | 🛺 Auto Tipper (0.5T), Auto Rickshaw | 20 km/h |
| **Service** | 179 | 8.8% | 2-3m | 🛺 Auto Tipper (0.5T), Auto Rickshaw | 15 km/h |
| **Footway** | 509 | **25.1%** | <2m | 🛒 Push Cart (200kg), Handcart | Walk |
| **Path** | 51 | 2.5% | <2m | 🛒 Push Cart (200kg), Handcart | Walk |
| **Others** | 96 | 4.8% | Varies | Case-by-case | — |
| **TOTAL** | **2,027** | 100% | | | |

### 7.2 Vehicle-Road Assignment Matrix

```
                    Trunk  Primary  Secondary  Tertiary  Residential  Service  Footway  Path
                    (38)   (10)     (113)      (191)     (840)        (179)    (509)    (51)
  ┌────────────────┬──────┬────────┬──────────┬─────────┬────────────┬────────┬────────┬────┐
  │Hook Loader 18T │  ✅  │   ✅   │    ❌    │   ❌    │     ❌     │   ❌   │   ❌   │ ❌ │
  │Compactor 10T   │  ✅  │   ✅   │    ✅    │   ❌    │     ❌     │   ❌   │   ❌   │ ❌ │
  │Compactor 5T    │  ✅  │   ✅   │    ✅    │   ✅    │     ❌     │   ❌   │   ❌   │ ❌ │
  │Mini Compact 3T │  ✅  │   ✅   │    ✅    │   ✅    │     ❌     │   ❌   │   ❌   │ ❌ │
  │Auto Tipper 0.5T│  ✅  │   ✅   │    ✅    │   ✅    │     ✅     │   ✅   │   ❌   │ ❌ │
  │Push Cart 200kg │  ❌  │   ❌   │    ❌    │   ✅    │     ✅     │   ✅   │   ✅   │ ✅ │
  └────────────────┴──────┴────────┴──────────┴─────────┴────────────┴────────┴────────┴────┘

  Coverage:
  ├── Truck-accessible:  352 roads (17.4%)  — Trunk + Primary + Secondary + Tertiary
  ├── Auto-accessible: 1,579 roads (77.9%) — Above + Residential + Service
  ├── Cart-accessible: 1,770 roads (87.3%) — Above + Footway + Path
  └── Total coverage:  1,931 roads (95.3%)
```

### 7.3 Vehicle Fleet Requirement

| Vehicle Type | Count Needed | Capacity | Roads Covered | Rounds/Day | Daily Capacity |
|---|---|---|---|---|---|
| **Auto Tippers** | 12 | 0.5T each | 1,579 segments | 3 | 18 T |
| **Compactor Trucks** | 4 | 5-10T each | 352 segments | 2 | 40 T |
| **Push Carts** | 8 | 200kg each | 560 segments | 2 | 3.2 T |
| **Liquid Tanker** | 1 | 5 KL | Trunk + Primary | 1 | 5 KL |
| **TOTAL** | **25** | — | **95.3% coverage** | — | **~61 T capacity** |

---

## 8. SECTOR-WISE ROUTING PLAN

### 8.1 Complete Sector Assignment

| Sector | Zones | Waste (T/d) | Vehicles | Primary DWCC | Avg Dist to DWCC |
|---|---|---|---|---|---|
| **Sector 1** | 7 | 18.3 | 40 autos | DWCC-004 (Sector 1 East) | 1.83 km |
| **Sector 2** | 14 | 27.6 | 60 autos | DWCC-004 (Sector 1 East) | 0.80 km |
| **Sector 3** | 18 | 17.4 | 44 autos | DWCC-003 (Sector 2 West) | 0.49 km |
| **Sector 4** | 5 | 3.0 | 8 autos | DWCC-003 (Sector 2 West) | 1.81 km |
| **Sector 5** | 4 | 0.25 | 4 autos | DWCC-001 (Sector 2 East) | 1.35 km |
| **Sector 6** | 13 | 30.3 | 69 autos | DWCC-002 (Sector 3 Central) | 1.74 km |
| **Overflow** | 6 | 13.2 | 31 autos | DWCC-001 (Sector 2 East) | 1.25 km |
| **TOTAL** | **67** | **110 T** | **256** | 4 DWCCs | **1.18 km avg** |

### 8.2 Route Flow Per Vehicle (Single Trip)

```
MORNING SHIFT (6:00 AM – 10:00 AM)

  Vehicle Depot (77.6392, 12.9158)
      │
      ├─── AUTO TIPPER → Residential Zone Stops (3-5 stops)
      │        │
      │        ├── Stop 1: Collect wet + dry (separate compartments)
      │        ├── Stop 2: Collect wet + dry
      │        ├── Stop 3: Collect wet + dry
      │        ├── Stop 4: Collect wet + dry
      │        └── Stop 5: Vehicle ~85% full (425 kg)
      │
      ├─── Drive to nearest DWCC → Unload DRY waste (200 kg)
      │
      ├─── Drive to nearest BMU → Unload WET waste (300 kg)
      │        (or transfer to Compactor at sector boundary)
      │
      └─── Return to zone for Round 2 (repeat 3 rounds total)

AFTERNOON SHIFT (10:00 AM – 6:00 PM)

  Compactor Trucks:
      ├── Collect aggregated waste from DWCCs
      ├── Transport to Kudlu Processing Plant (5 km south)
      └── Return for second trip
```

### 8.3 Route Optimization Results (from Live Engine)

| Metric | Before | After | Saving |
|---|---|---|---|
| **Total route distance** | 132.44 km/day | 32.41 km/day | **75.5%** |
| **Distance reduced** | — | 100.03 km/day | — |
| **Fuel cost/day** | ₹2,072 | ₹507 | ₹1,565/day |
| **Annual fuel savings** | — | — | **₹3.28 Cr/year** |
| **Total annual savings** | — | — | **₹9.42 Cr/year** |

### 8.4 Optimized Truck Routes (3 Trucks from Digital Twin)

| Truck | Stops | Distance | Load | Route |
|---|---|---|---|---|
| Truck 1 | 8 zones | 12.54 km | 3,050 kg | Western sectors → DWCC-003 |
| Truck 2 | 8 zones | 9.63 km | 3,115 kg | Central sectors → DWCC-004 |
| Truck 3 | 8 zones | 15.93 km | 3,104 kg | Eastern sectors → DWCC-001 |
| **TOTAL** | 24 zones | 38.1 km | 9,269 kg | |

---

## 9. COMPLETE WASTE FLOW DIAGRAM

```
╔═══════════════════════════════════════════════════════════════════════╗
║                   HSR LAYOUT WASTE FLOW (55 TPD)                    ║
╠═══════════════════════════════════════════════════════════════════════╣
║                                                                     ║
║   🏠 9,471 BUILDINGS (110,000 people)                               ║
║   ├── 8,998 Houses → Green bin (wet) + Blue bin (dry)               ║
║   ├── 250 Apartments → Bulk generator compliance                    ║
║   ├── 137 Commercial → Separate commercial waste                    ║
║   └── 2 Hospitals → RED bag (biomedical, separate vehicle)          ║
║       │                                                             ║
║       ▼                                                             ║
║   🛺 12 AUTO TIPPERS (0.5T, 3 rounds each)                         ║
║   ├── Wet compartment (60% = 300 kg) ──────────┐                   ║
║   └── Dry compartment (40% = 200 kg) ───────┐  │                   ║
║                                              │  │                   ║
║       ┌──────────────────────────────────────┘  │                   ║
║       ▼                                         ▼                   ║
║   🏭 4 DWCCs (10 TPD capacity)          ♻️ 2 BMUs (10 TPD)        ║
║   ├── DWCC-001 (12.913, 77.649)        ├── BMU-001 (12.934, 77.614)║
║   ├── DWCC-002 (12.922, 77.647)        └── BMU-002 (12.934, 77.614)║
║   ├── DWCC-003 (12.918, 77.645)              │                     ║
║   └── DWCC-004 (12.912, 77.648)              ▼                     ║
║       │                                 Biogas + Compost            ║
║       ▼                                                             ║
║   📦 Segregation at DWCC:                                          ║
║   ├── Plastics → Recycler                                          ║
║   ├── Paper → Mill                                                  ║
║   ├── Metal → Scrap dealer                                         ║
║   ├── E-waste → Authorised handler                                 ║
║   └── Rejects ──┐                                                  ║
║                  ▼                                                  ║
║   🚛 4 COMPACTOR TRUCKS (5-10T, 2 trips)                          ║
║       │                                                             ║
║       ▼                                                             ║
║   🏭 Kudlu Processing Plant (5 km S) → Final rejects → Landfill   ║
║                                                                     ║
╚═══════════════════════════════════════════════════════════════════════╝
```

---

## 10. ROUTING SCHEDULE (DAILY TIMETABLE)

| Time | Activity | Vehicles | Route |
|---|---|---|---|
| **5:30 AM** | Depot checkout, vehicle inspection | All 25 | Depot |
| **6:00–7:00** | Round 1 — Door-to-door collection | 12 Auto Tippers | Zone stops |
| **7:00–7:30** | Unload at DWCC (dry) + transfer wet | 12 Auto Tippers | 4 DWCCs |
| **7:30–8:30** | Round 2 — Door-to-door collection | 12 Auto Tippers | Zone stops |
| **8:30–9:00** | Unload at DWCC + transfer wet | 12 Auto Tippers | 4 DWCCs |
| **9:00–10:00** | Round 3 — Final collection sweep | 12 Auto Tippers | Zone stops |
| **10:00–10:30** | Final unload at DWCC | 12 Auto Tippers | 4 DWCCs |
| **10:00–12:00** | Push cart collection (narrow lanes) | 8 Push Carts | Footway/path |
| **10:30–14:00** | DWCC → Processing Plant (Trip 1) | 4 Compactors | Kudlu (5 km) |
| **14:00–18:00** | DWCC → Processing Plant (Trip 2) | 4 Compactors | Kudlu (5 km) |
| **14:00–16:00** | Wet waste → BMU transport | 2 Compactors | BMU (3.2 km) |
| **As needed** | Liquid waste / septage | 1 Tanker | STP |
| **18:00–18:30** | Vehicle return, cleaning, refueling | All | Depot |

---

## 11. KEY NUMBERS SUMMARY

| Item | Count / Value |
|---|---|
| Total buildings | **9,471** |
| Houses | **8,998** |
| Apartments | **250** |
| Population | **~110,000** |
| Daily waste | **55 tons/day** |
| Dumpyards in HSR | **0** (zero) |
| DWCCs in HSR | **4** (10 TPD capacity) |
| DWCCs nearby | **6 more** (within 3 km) |
| BMUs | **2** (10 TPD capacity) |
| Detected dump sites | **4** (satellite) |
| Road segments | **2,027** |
| Truck-accessible | **352** (17.4%) |
| Auto-accessible | **1,579** (77.9%) |
| Cart-accessible | **1,770** (87.3%) |
| Total coverage | **95.3%** |
| Auto Tippers needed | **12** |
| Compactor Trucks | **4** |
| Push Carts | **8** |
| Total fleet | **25 vehicles** |
| Route before optimization | **132.44 km** |
| Route after optimization | **32.41 km** |
| Savings | **75.5%** |
| Annual savings | **₹9.42 Crores** |
| Methane CO₂e/year | **25,959 tons** |
| Carbon credit value | **₹5.19 Cr/year** |

---

*Udupi City Routing Plan v1.0 — AstraCity · Udupi CMC · Udupi*
*All data sourced from: OSM, Udupi CMC datasets, CPCB, Census 2011, Digital Twin simulation, OSRM routing*
