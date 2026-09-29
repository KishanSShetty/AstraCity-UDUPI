# 08 — Industry Standards & Guidelines

> Waste management industry standards, vehicle classification norms, and operational guidelines used for routing constraints and compliance.

---

## Vehicle Classification Standards

| # | Source | Standard | What was used |
|---|--------|----------|---------------|
| 1 | **Standard Municipal Truck Classification** | Indian Road Congress (IRC) guidelines aligned with Udupi CMC usage | Vehicle width requirements: Trunk roads (>12m), Primary (>9m), Secondary (>6m), Tertiary (>4m), Residential (2-4m), Service (2-3m), Footway (<2m). Used for vehicle-road compatibility matrix in routing_config.json |
| 2 | **CNG Vehicle Standards for Waste Collection** | Bureau of Indian Standards (BIS) / Automotive Industry Standards (AIS) | CNG/Petrol fuel type for auto tippers, diesel for compactors and trucks. Fleet transition towards CNG for emissions compliance |

## Waste Composition & Handling

| # | Source | Standard | What was used |
|---|--------|----------|---------------|
| 3 | **Udupi CMC 2013 Chemical Analysis Report** | Udupi CMC / Laboratory Analysis | Waste composition for Udupi City: Wet 61% (33.55 TPD), Dry 30% (16.5 TPD), Hazardous 5% (2.75 TPD), Other 4% (2.2 TPD). Used for compartment ratio calculations (default 60:40 wet:dry) |
| 4 | **CPCB Per-Capita Waste Generation Benchmark** | CPCB Official | 0.5 kg/capita/day standard, used as `waste_per_capita` in constants.ts for Udupi City calculations (110,000 pop × 0.5 = 55 TPD) |

## Operational Standards

| # | Source | Standard | What was used |
|---|--------|----------|---------------|
| 5 | **Udupi CMC Operational Time Windows** | Udupi CMC SWM Operations Manual | Primary collection: 6:00 AM – 10:00 AM, Secondary transport: 10:00 AM – 6:00 PM, Night restrictions for heavy vehicles (>3.5T) after 10 PM on residential roads. Used for time_windows in routing_config.json |
| 6 | **India Carbon Credit Trading Scheme (CCTS) 2023** | Bureau of Energy Efficiency (BEE), MoEFCC | Carbon pricing: ₹1,200–2,200/ton CO₂e. Used in economic calculations for methane reduction carbon credits (₹5.19 Cr/year for Udupi City at 25,959 tons CO₂e/year) |

---

## Summary of Standards Applied in Routing

```
┌─────────────────────────────────────────────────────────────┐
│          STANDARDS → ROUTING CONSTRAINT MAPPING              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Vehicle Classification → Road-Vehicle Compatibility Matrix │
│  SWM Rules 2016        → Source Segregation Mandate         │
│  Udupi CMC Waste Analysis   → Compartment Ratio (60:40)         │
│  CPCB Benchmark        → Waste Volume Estimation            │
│  Udupi CMC Time Windows     → Route Scheduling Constraints       │
│  KSPCB Guidelines      → Liquid Waste Route Restrictions    │
│  Carbon Credit Scheme  → Economic Impact Calculations       │
│  IRC Road Standards    → Road Width Filtering               │
│  Motor Vehicles Act    → Vehicle Registration & Compliance  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```
