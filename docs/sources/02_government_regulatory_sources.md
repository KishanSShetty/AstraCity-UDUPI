# 02 — Government & Regulatory Sources

> Official government publications, rules, and regulatory frameworks referenced for vehicle routing requirements and compliance.

---

## Central Government

| # | Source | Authority | URL / Reference | What was used |
|---|--------|-----------|-----------------|---------------|
| 1 | **Solid Waste Management Rules, 2016** | Ministry of Environment, Forest & Climate Change (MoEFCC) | https://cpcb.nic.in/rules/ | Mandatory source segregation (wet/dry/hazardous), door-to-door collection mandate, local authority responsibilities, waste processing definitions, sanitary landfill requirements |
| 2 | **CPCB Annual Report on SWM 2021-2022** | Central Pollution Control Board (CPCB), Delhi | https://cpcb.nic.in/uploads/MSW/MSW_AnnualReport_2021-22.pdf | National waste data (1,70,339 TPD), Karnataka-specific data (13,034 TPD), per-capita waste generation (123.45 g/day nationally), collection efficiency (92%), processing rate (54%), landfill data (24%), 2,452 dumpsites nationally |
| 3 | **CPCB Waste Generation Standards** | CPCB | https://cpcb.nic.in/ | Per-capita waste generation benchmark: 0.5 kg/capita/day (used in constants.ts as `waste_per_capita`) |
| 4 | **Biomedical Waste Management Rules, 2016** | MoEFCC | https://cpcb.nic.in/bio-medical-waste/ | Separate handling requirements for biomedical/hazardous waste, dedicated vehicle mandates |
| 5 | **Motor Vehicles Act, 1988 (Amended)** | Ministry of Road Transport & Highways | https://morth.nic.in/ | Vehicle registration requirements, fitness certificates, PUC certificates, commercial vehicle permits |

## Karnataka State Government

| # | Source | Authority | URL / Reference | What was used |
|---|--------|-----------|-----------------|---------------|
| 6 | **Karnataka Motor Vehicles Rules** | Regional Transport Office (RTO), Karnataka | https://transport.karnataka.gov.in/ | KA-XX registration series, commercial vehicle permit requirements, fitness certificate annual renewal, GPS/GPRS tracker mandate |
| 7 | **KSPCB Guidelines for Liquid Waste** | Karnataka State Pollution Control Board (KSPCB) | https://kspcb.karnataka.gov.in/ | Consent-to-operate for liquid waste tankers, leachate transport sealed tanker requirement, geo-fence compliance for liquid waste vehicles |
| 8 | **Udupi CMC SWM Bylaws 2016** | Bruhat Udupi Mahanagara Palike (Udupi CMC) | https://udupi_cmc.gov.in/ | Ward-level collection responsibility, contractor compliance monitoring, vehicle body marking ("Udupi CMC WASTE MANAGEMENT"), RFID tag for weighbridge verification |

## International Standards

| # | Source | Authority | URL / Reference | What was used |
|---|--------|-----------|-----------------|---------------|
| 9 | **IPCC 2006 Guidelines for National GHG Inventories** | Intergovernmental Panel on Climate Change (IPCC) | https://www.ipcc-nggip.iges.or.jp/public/2006gl/ | Methane emission factors for waste, landfill gas capture rate calculations |
| 10 | **IPCC AR5 — CH₄ GWP=28** | IPCC | https://www.ipcc.ch/assessment-report/ar5/ | Global Warming Potential of methane (28× CO₂ over 100 years), used for CO₂e calculations |
| 11 | **India Carbon Market 2024** | Bureau of Energy Efficiency (BEE) / MoEFCC | Government of India Carbon Credit Trading Scheme | Carbon pricing: ₹1,800–2,200/ton CO₂e (used as ₹2,000/ton in blueprint, ₹1,200/ton in economic_params.json) |
| 12 | **Census 2011 — Udupi CMC Karnataka** | Census of India / Registrar General | https://censusindia.gov.in/ | Population data for Udupi City (110,000), household count (35,992), building-based population estimation |
