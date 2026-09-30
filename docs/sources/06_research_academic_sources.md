# 06 — Research & Academic Sources

> Academic papers, research studies, environmental reports, and analytical references used for waste management methodologies and routing algorithms.

---

| # | Source | Type | URL / Reference | What was used |
|---|--------|------|-----------------|---------------|
| 1 | **ScienceDirect — Urban Waste Management Study** | Academic Journal | Referenced in `Udupi CMC Vehicle System Analysis.md` | Two-stage waste transport system (primary collection → secondary transport), multi-tier collection efficiency models, urban waste flow optimization |
| 2 | **OpenCity Udupi CMC SWM Documentation** | Open Data Research | https://data.opencity.in/ | Udupi CMC solid waste management system documentation, ward-level waste generation data, collection infrastructure mapping |
| 3 | **CEE India — HSR SWM Study** | Environmental Research | https://ceeindia.org/hsr-swm | Centre for Environment Education study on Udupi City solid waste management, community-level waste practices, local infrastructure assessment |
| 4 | **Beegru.com — HSR 2025 Study** | Market Research | https://beegru.com/ | Udupi City 2025 study on real estate and infrastructure, population density data, building types and counts, referenced in constants.ts |
| 5 | **Wikipedia — Udupi City** | Encyclopedia | https://en.wikipedia.org/wiki/udupi_Layout | Area (18.5 km²), sector division (7 sectors), geographic context, administrative details (Udupi CMC, Bangalore South), general infrastructure overview |
| 6 | **Clarke-Wright Savings Algorithm** | Algorithm Reference | Clarke, G. & Wright, J.W. (1964). "Scheduling of Vehicles from a Central Depot to a Number of Delivery Points." Operations Research, 12(4), 568-581 | Core routing algorithm recommended for VRP solver — merging routes based on distance savings between stops |
| 7 | **K-Means Clustering for Zone Assignment** | Algorithm Reference | Standard machine learning methodology | Used in routes/page.tsx for coordinate-based zone clustering, assigning waste collection zones to vehicles |
| 8 | **Vehicle Routing Problem (VRP) — OR-Tools** | Optimization Framework | Google OR-Tools documentation | VRP formulation with capacity constraints, time windows, and multi-vehicle assignments. Referenced in routes/page.tsx algorithmic engine state as "OR-Tools (VRP) — Selected Optimization Algorithm" |
