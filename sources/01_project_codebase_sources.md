# 01 — Project Codebase Sources (Internal)

> Files read directly from the AstraSky-maing codebase to build the vehicle routing document.

---

## Core Data Files

| # | File | Path | What was used |
|---|------|------|---------------|
| 1 | **constants.ts** | `lib/constants.ts` | All UDUPI_DATA values: fleet size (4 trucks, 12 autos), road segments (2,027), waste data (55 TPD), route optimization (132.44→32.41 km), economic savings (₹9.42 Cr), zone counts, LULC data, methane projections, data_sources[] array |
| 2 | **ward_scores.json** | `data/ward_scores.json` | 20 ward entries with scores, dumpRisk, methaneIntensity, routeEfficiency, complaintRate, wasteTons, trend |
| 3 | **dump_sites.json** | `data/dump_sites.json` | 35 detected dump sites with lat/lon, risk (high/medium/low), area_sqm, detection method, ward name |
| 4 | **economic_params.json** | `data/economic_params.json` | Udupi CMC cost constants: ₹15.65/km truck cost, ₹52,000 dump cleanup, ₹1,200/ton carbon, ₹175/hr labor, 2,500 trucks, route baselines |
| 5 | **simulation_lookup.json** | `data/simulation_lookup.json` | 54 pre-computed simulation outputs for population/rainfall/festival combinations |
| 6 | **udupi_wards.geojson** | `data/udupi_wards.geojson` | 20 ward polygon boundaries for map rendering |

## Page Components

| # | File | Path | What was used |
|---|------|------|---------------|
| 7 | **Routes Page** | `app/routes/page.tsx` (718 lines) | Two-tier routing system, road type breakdown, optimization results, vehicle optimizer with compartment ratio, fleet analysis, OR-Tools VRP engine UI |
| 8 | **Vehicle Simulation Page** | `app/vehicle-sim/page.tsx` (732 lines) | 7 vehicle definitions (V1-V7), DWCC locations (4), BMU locations (2), depot coordinates, OSRM routing integration, real-time animation system |
| 9 | **Smart Map Page** | `app/map/page.tsx` | MapLibre GL integration, 6 toggleable layers, ward polygon rendering |
| 10 | **Simulation Page** | `app/simulation/page.tsx` | Scenario controls, waste generation formulas, simulation lookup engine |
| 11 | **Impact Page** | `app/impact/page.tsx` | Economic calculations (fuel/cleanup/carbon/labor savings), ROI charts |

## Documentation Files

| # | File | Path | What was used |
|---|------|------|---------------|
| 12 | **Udupi CMC Vehicle System Analysis** | `Udupi CMC Vehicle System Analysis.md` | Vehicle types (Auto Tipper 0.5T, Compactor 5-10T, Garbage Truck 5T, Hook Loader 16-18T), waste flow system, fleet size (~5,300 auto tippers, ~550 compactors, ~700 trucks), all cited sources |
| 13 | **AstraCity Blueprint** | `AstraCity_Blueprint.md` | Page specs, tech stack, data strategy, economic formulas (fuelSavings, cleanupSavings, carbonCredits, laborSavings), Udupi CMC cost constants |
| 14 | **AstraCity Implementation Doc** | `AstraCity_Implementation_Doc.md` | Full implementation details for all 6 pages, data schemas, design system, known issues, upgrade roadmap |
| 15 | **Udupi City Dataset Analysis** | `Data Analysis/udupi_layout_dataset_analysis.md` | Ward boundary metadata (Udupi CMC, PolygonZ), road network (2,027 segments from OSM), road type distribution, satellite data specs |
| 16 | **Dataset Summary** | `Data Analysis/dataset_summary.md` | Udupi CMC boundary dataset (268,001 road segments city-wide), highway classification breakdown, GIS workflows |

## Data Analysis Scripts

| # | File | Path | What was used |
|---|------|------|---------------|
| 17 | **Route Optimization Results** | `Data Analysis/results.txt` | Zone-to-sector mapping (67 zones, 256 vehicles, 4 DWCCs), per-sector waste/vehicle/distance breakdown |
| 18 | **CPCB Annual Report (PDF extract)** | `pdf_out.txt` (5,553 lines) | CPCB Annual Report on Solid Waste Management 2021-2022: national waste data (1,70,339 TPD), Karnataka data (13,034 TPD generated, 5,440 treated), SWM Rules 2016 text, collection/segregation/transportation details, per-capita waste generation (123.45 g/capita/day) |
