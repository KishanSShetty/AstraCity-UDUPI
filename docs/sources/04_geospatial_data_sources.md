# 04 — Geospatial & Map Data Sources

> GIS datasets, map tiles, satellite imagery, and routing APIs used for spatial analysis and route computation.

---

## Vector Data (Shapefiles / GeoJSON)

| # | Source | Format | Path / URL | What was used |
|---|--------|--------|------------|---------------|
| 1 | **OpenStreetMap (OSM)** | Shapefile → GeoJSON | https://www.openstreetmap.org/ | Udupi City road network (2,027 segments), road type classification (highway tag), building footprints (9,471 buildings), full_id/osm_id/osm_type/highway attributes. Source for both `udupi_road_network.geojson` and Udupi Road Network R&U shapefile (268,001 segments city-wide) |
| 2 | **Udupi CMC Ward Boundary (Udupi CMC)** | Shapefile (PolygonZ) | `DS/udupi_Layput/` | Udupi City ward polygon, 2,475 vertices, bounding box 77.622°–77.669° E / 12.898°–12.931° N, ~18.5 km² area, exported from Google Earth/KML |
| 3 | **Udupi CMC Boundary Dataset** | Shapefile (PolygonZ) | `DS/Udupi_Udupi CMC_Boundary/` | Full Udupi CMC outer boundary, 1 polygon, ~715 km², bounding box 77.460°–77.784° E / 12.834°–13.144° N |
| 4 | **HSR Ward Boundary GeoJSON** | GeoJSON | `data/udupi_wards.geojson` (used in vehicle-sim) | Ward boundary overlay on MapLibre map, teal fill with 4% opacity |
| 5 | **Udupi Wards GeoJSON** | GeoJSON | `data/udupi_wards.geojson` (13 KB) | 20 ward polygons generated from ward_scores.json via `generate_geojson.js` |
| 6 | **Udupi CMC Full GeoJSON** | GeoJSON | `data/Udupi CMC.geojson` (2.1 MB) | Complete Udupi CMC boundary for city-wide analysis |

## Raster / Satellite Data

| # | Source | Format | Path / URL | What was used |
|---|--------|--------|------------|---------------|
| 7 | **Udupi City Satellite Image** | GeoTIFF | `udupi_Layout_SD.tif` (4.25 MB) | 1002×740 px, 3-band RGB, uncompressed. Referenced in constants.ts as satellite data source. Used for LULC classification (Built-up 64.1%, Vegetation 17.6%, Open 15.3%, Water 3.0%) |
| 8 | **Udupi CMC Boundary Satellite Image** | GeoTIFF | `Udupi CMC_BOUNDARY_SD.tif` (275.9 MB) | City-wide satellite coverage, used for broader spatial analysis |

## Map Tile Services

| # | Source | Type | URL | What was used |
|---|--------|------|-----|---------------|
| 9 | **OpenFreeMap Positron** | Vector Tiles | `https://tiles.openfreemap.org/styles/positron` | Light theme map tiles for MapLibre GL in the Smart Map page (no API key required) |
| 10 | **OpenStreetMap Raster Tiles** | Raster Tiles | `https://tile.openstreetmap.org/{z}/{x}/{y}.png` | Dark-themed basemap in vehicle simulation page with brightness/saturation adjustments |

## Routing APIs

| # | Source | Type | URL | What was used |
|---|--------|------|-----|---------------|
| 11 | **OSRM (Open Source Routing Machine)** | Routing API | `https://router.project-osrm.org/route/v1/driving/` | Real road-snapped routes for all 7 vehicles in vehicle-sim, full geometry with GeoJSON output, distance (km) and duration (min) per route |

## Population / Demographics

| # | Source | Type | URL | What was used |
|---|--------|------|-----|---------------|
| 12 | **GeoIQ Population Data** | Geospatial Intelligence | https://geoiq.io/ | Population estimates for Udupi City area, referenced in constants.ts data_sources |
