# 03 — Udupi CMC & Municipal Data Sources

> Sources specific to Bruhat Udupi Mahanagara Palike (Udupi CMC) operations, fleet data, and waste management infrastructure.

---

| # | Source | Type | URL / Reference | What was used |
|---|--------|------|-----------------|---------------|
| 1 | **Udupi CMC Official Portal** | Government Website | https://udupi_cmc.gov.in/ | Waste management policies, contractor compliance, vehicle GPS mandate (since 2018), ward-level collection responsibility |
| 2 | **Udupi CMC Dataset — OpenCity Data Portal** | Open Data | https://data.opencity.in/ | Auto tipper capacity (0.5 ton), vehicle fleet data, Udupi CMC SWM documentation, ward-level waste statistics |
| 3 | **Udupi CMC 2013 Chemical Analysis** | Official Report | Referenced in `constants.ts` | Waste composition breakdown: Wet 61%, Dry 30%, Hazardous 5%, Other 4% — used for compartment ratio calculations |
| 4 | **Udupi CMC Fleet Statistics** | Municipal Record | Referenced in `Udupi CMC Vehicle System Analysis.md` | Fleet size: ~5,300–5,500 Auto Tippers, ~550–600 Compactors, ~700 Garbage Trucks (city-wide) |
| 5 | **Udupi CMC Compactor Upgrade Report** | Municipal Report | Referenced via New Indian Express | Compactor capacity upgrade: older models 5 tons → newer models 10 tons |
| 6 | **Udupi CMC Capsule System Implementation** | Municipal Program | Referenced via Bangalore Mirror | Hook Loader + Capsule system: 16–18 tons per capsule, sealed transport, reduced leakage |
| 7 | **Udupi CMC SWM Cost Constants** | Cost Analysis | Used in `economic_params.json` | Cost per km (truck): ₹15.65–22, cleanup cost per dump: ₹52,000–80,000, total trucks: 2,500–2,800 |
| 8 | **Udupi City DWCC Data** | Udupi CMC Infrastructure | `Data Analysis/hsr_dry_waste_details.json` | 16 DWCCs in Udupi City, 40 TPD combined capacity, 17.5% utilisation rate |
| 9 | **Udupi City Bio-Methanisation Units** | Udupi CMC Infrastructure | `vehicle-sim/page.tsx` BMU_LOCATIONS | 2 BMU units at coordinates [77.614044, 12.933803] and [77.614061, 12.933792], 10 TPD capacity |
| 10 | **HSR Citizen Forum** | Community Portal | https://hsrcitizenforum.in/ | Local ward data, waste management grievances, community-level waste statistics for Udupi City |
