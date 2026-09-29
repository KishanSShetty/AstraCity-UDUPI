# External References & Methodologies

The AstraCity Routing Engine and Carbon Calculator were built strictly adhering to real-world government frameworks, scientific methodologies, and established routing algorithms. 

None of the core logic was "invented"; it was mapped from the following external references:

## 1. Carbon & Environmental Frameworks
* **IPCC AR5 (Fifth Assessment Report)**: Used to determine the Global Warming Potential (GWP) of Methane. The logic applies the standard factor that 1 tonne of Methane (CH₄) = 28 tonnes of CO₂e over a 100-year horizon.
* **CCTS (Carbon Credit Trading Scheme) 2023**: Formulated by the Indian Ministry of Power. Used for the baseline carbon credit pricing logic (₹1,200 to ₹2,200 per tonne of CO₂e) to calculate the financial ROI of the Kudlu BMU.
* **US EPA WARM (Waste Reduction Model)**: Referenced for baseline assumptions regarding methane generation rates from wet/organic waste in landfills vs. biomethanation plants.

## 2. Urban Planning & Transport Standards
* **Indian Roads Congress (IRC) Guidelines**: Used for the road-width compliance matrix. The logic dictates that Auto Tippers can navigate `<3m` widths (footways/residential), while Large Compactors (10T+) require `>5.5m` widths (primary/trunk roads).
* **Udupi CMC SWM Manual 2016 (Solid Waste Management)**: Used for the core operational rules of Udupi waste management:
  * Two-tier collection mandate (Primary: Auto Tippers → DWCCs; Secondary: Compactors → BMU/Landfill).
  * Time windows: Primary collection (06:00-10:00) and Secondary transport (10:00-18:00).
  * Heavy vehicle night bans (22:00-06:00).

## 3. Algorithmic & Geospatial References
* **Clarke-Wright Savings Algorithm (1964)**: The core mathematics driving our Capacitated Vehicle Routing Problem (CVRP) solver. It calculates the "savings" of combining two delivery points into a single route rather than visiting them separately from a depot.
* **OpenStreetMap (OSM) / OSRM**: The geospatial foundation used for mapping the 2,027 road segments in Udupi City and querying real-world driving distances/times between DWCCs.
* **Haversine Formula**: Used as the fallback heuristic for calculating great-circle distances between spatial coordinates when OSRM API limits are hit.

## 4. Local Civic Data
* **Udupi CMC Udupi CMC (Udupi City) Demographics**: 68.23 sq km area, ~110,000 population, and an empirically measured 55 TPD waste generation rate (0.5 kg/capita/day).
* **Kudlu Biomethanation Plant Data**: Referenced for capacity limits and power generation conversion metrics (1 cubic meter biogas ≈ 1.25 kWh electricity).
