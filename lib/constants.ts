// Single source of truth for all components after audit.
// Hardcoded to avoid JSON import issues during build.

export const UDUPI_DATA = {
  // Area
  area_sq_km: 68.33,
  area_hectares: 6833,
  sectors: 7,

  // Population
  population: 165401,
  population_houses: 40688,
  population_apts: 5484,
  population_offices: 855,
  population_hospitals: 2850,
  population_schools: 25650,
  population_others: 1545,
  population_source: 'Buildings × Census 2011 Karnataka',
  population_building_based: 165401,

  // Waste
  waste_per_capita: 0.435,
  waste_per_capita_kg: 0.435,
  waste_daily_tons: 72,
  daily_waste_tons: 72,
  waste_daily_kg: 72000,
  daily_waste_kg: 72000,
  waste_display: '72 tons/day',
  waste_daily_display: '72 tons/day',
  daily_waste_display: '72 tons/day',
  
  waste_wet_tons: 43.92,
  waste_wet_pct: 61,
  waste_wet_kg: 43920,
  
  waste_dry_tons: 21.6,
  waste_dry_pct: 30,
  waste_dry_kg: 21600,
  
  waste_haz_tons: 3.6,
  waste_hazardous_tons: 3.6,
  waste_haz_pct: 5,
  waste_hazardous_pct: 5,
  waste_hazardous_kg: 3600,
  
  waste_other_tons: 2.88,
  waste_other_pct: 4,
  waste_other_kg: 2880,
  
  waste_diversion_pct: 80,
  waste_source: 'Udupi CMC 2013 Chemical Analysis',

  // Buildings
  buildings_total: 11429,
  total_buildings: 11429,
  buildings_density: 167,
  building_density_per_sqkm: 167,
  buildings_avg_sqm: 163,
  buildings_footprint_ha: 154.4,
  buildings_residential_pct: 93.0,

  // Roads
  roads_total: 2027,
  road_segments: 2027,
  roads_density: 110,
  road_density_per_sqkm: 110,
  
  roads_truck: 352,
  truck_roads: 352,
  roads_truck_pct: 17.4,
  truck_roads_pct: 17.4,
  
  roads_auto: 1579,
  auto_roads: 1579,
  roads_auto_pct: 77.9,
  auto_roads_pct: 77.9,
  
  roads_coverage: 95.3,
  total_coverage_pct: 95.3,
  road_breakdown: [
    { type: "Trunk", count: 38, pct: 1.9, vehicle: "Large Truck" },
    { type: "Primary", count: 10, pct: 0.5, vehicle: "Large Truck" },
    { type: "Secondary", count: 113, pct: 5.6, vehicle: "Truck" },
    { type: "Tertiary", count: 191, pct: 9.4, vehicle: "Truck" },
    { type: "Residential", count: 840, pct: 41.4, vehicle: "Auto Rickshaw" },
    { type: "Service", count: 179, pct: 8.8, vehicle: "Auto Rickshaw" },
    { type: "Footway", count: 509, pct: 25.1, vehicle: "Walk/Handcart" },
    { type: "Path", count: 51, pct: 2.5, vehicle: "Walk/Handcart" }
  ],

  // Infrastructure
  dwcc_count: 16,
  dwcc_centers: 16,
  dwcc_capacity_tpd: 40,
  dwcc_utilisation: 17.5,
  bio_meth_units: 2,
  bio_methanisation_units: 2,
  dumpyards: 0,

  // Satellite/LULC
  dump_sites: 4,
  dump_sites_detected: 4,
  dump_high: 10,
  high_risk_dumps: 10,
  dump_medium: 3,
  dump_low: 16,
  
  lulc_builtup: 64.1,
  lulc_vegetation: 17.6,
  lulc_open: 15.3,
  lulc_water: 3.0,
  
  lulc_builtup_area: 11.85,
  lulc_vegetation_area: 3.26,
  lulc_open_area: 2.83,
  lulc_water_area: 0.56,

  // Methane
  ch4_m3_day: 3548,
  methane_m3_per_day: 3548,
  ch4_tons_day: 2.54,
  co2e_day: 71.1,
  co2e_per_day_tons: 71.1,
  co2e_year: 25959,
  co2e_per_year_tons: 25959,
  energy_kwh_day: 21285,
  energy_kwh_per_day: 21285,
  homes_powered: 7095,
  homes_powered_per_day: 7095,
  carbon_credits_cr: 5.19,
  carbon_credits_cr_per_year: 5.19,
  methane_risk: 'LOW',
  methane_risk_level: 'LOW',

  // Zones
  zones_total: 36,
  zones_active: 36,
  zones_high: 8,
  zones_medium: 11,
  zones_low: 17,
  zones_top: ['Z30','Z29','Z24','Z22','Z08'],

  // Routes
  route_baseline_km: 132.44,
  baseline_route_km: 132.44,
  route_optimized_km: 32.41,
  optimized_route_km: 32.41,
  route_improvement: 75.5,
  route_improvement_pct: 75.5,
  
  // Fleet
  fleet_trucks: 4,
  fleet_autos: 12,
  fleet_rounds_per_day: 3,

  // Economics
  savings_route_cr: 3.28,
  fuel_savings_cr: 3.28,
  savings_cleanup_cr: 0.45,
  savings_labor_cr: 0.38,
  savings_other_cr: 0.12,
  savings_operational_cr: 4.23,
  annual_savings_cr: 4.23,
  savings_carbon_cr: 5.19,
  annual_savings_carbon_cr: 5.19,
  savings_total_cr: 9.42,
  annual_savings_total_cr: 9.42,
  annual_savings_total_cr_val: 9.42,
  savings_scaled_198_cr: 1865,

  ward: 'Udupi City',
  ward_name: 'Udupi City',
  ward_number: '174',
  city: 'Udupi',

  // Building Occupancy Model (Validated against latest spatial footprint data)
  population_breakdown: {
    houses:     { count: 10172, per_unit: 4,   total: 40688 },
    apartments: { count: 457,   per_unit: 272, total: 124304 },
    offices:    { count: 57,    per_unit: 5,   total: 285   },
    hospitals:  { count: 57,    per_unit: 0,   total: 0   }, // Transient, not permanent residents
    schools:    { count: 171,   per_unit: 0,   total: 0  }, // Transient, not permanent residents
    others:     { count: 515,   per_unit: 0,   total: 0    },
  },
  
  // Data sources
  data_sources: [
    'OpenStreetMap — Udupi buildings + roads',
    'Census 2011 Udupi CMC Karnataka',
    'CPCB official — 0.435kg/capita/day',
    'Udupi CMC 2013 Chemical Analysis',
    'Udupi CMC official — udupi_cmc.gov.in',
    'IPCC 2006 Guidelines',
    'IPCC AR5 — CH4 GWP=28',
    'India Carbon Market 2024',
    'Karvalu SWM Campus Technical Audit',
    'Beedinagudde BMU Operational Plan',
    'data.opencity.in',
    'Wikipedia — Udupi City',
    'Deccan Herald — Karvalu SWM Plant',
    'geoiq.io — Udupi population data',
    'Sentinel-2 LULC Satellite Imagery (Udupi)'
  ],
  
  // Extra Info
  udupi_cmc_bio_capacity_tpd: 10,
  karvalu_status: 'Operational',
  swachagraha_exists: true,
  udupi_total_tpd: "72 TPD",
  udupi_cmc_wet_plants: 2,
  udupi_cmc_wet_capacity_tpd: 45,
  udupi_cmc_bio_plants: 2,
};
