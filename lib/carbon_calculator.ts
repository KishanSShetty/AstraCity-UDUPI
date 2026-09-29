/**
 * Carbon Credit Calculator — CO₂e from methane avoided × CCTS pricing.
 * PRD §12.1: Carbon Credit Calculation
 */

export interface CarbonResult {
  wet_waste_tpd: number;
  methane_avoided_m3_day: number;
  methane_tonnes_day: number;
  co2e_tonnes_day: number;
  co2e_tonnes_year: number;
  energy_kwh_day: number;
  homes_powered: number;
  credit_value_low_inr: number;
  credit_value_high_inr: number;
  credit_value_mid_inr: number;
  credit_value_mid_cr: string;
  methodology: string;
}

/**
 * Calculate carbon credit value from wet waste processed at BMU.
 * 
 * @param wetWasteTPD - Wet organic waste per day (tonnes)
 * @param gwp - Global Warming Potential of CH₄ (default: 25, IPCC AR5)
 * @param biogasYield - m³ biogas per kg organic waste (default: 0.75)
 * @param cctsLow - CCTS 2023 low price ₹/tonne CO₂e (default: 1200)
 * @param cctsHigh - CCTS 2023 high price ₹/tonne CO₂e (default: 2200)
 */
export function calculateCarbonCredits(
  wetWasteTPD: number = 33.55,
  gwp: number = 28, // IPCC AR5 (PRD uses 28)
  cctsLow: number = 1200,
  cctsHigh: number = 2200
): CarbonResult {
  // PRD §12.1: CH₄ generation = 3,548 m³/day for 33.55 TPD wet waste
  // That's ~105.7 m³/tonne wet waste
  const methane_m3_per_tonne = 105.7;
  const methane_m3_day = wetWasteTPD * methane_m3_per_tonne;
  // Methane density ~0.717 kg/m³
  const methane_tonnes_day = (methane_m3_day * 0.717) / 1000;
  // CO₂ equivalent (GWP × CH₄ tonnes) — PRD target: 71.1 T CO₂e/day → 25,959/year
  const co2e_day = methane_tonnes_day * gwp;
  const co2e_year = co2e_day * 365;
  
  // Energy potential: PRD says 21,285 kWh/day
  const energy_kwh = Math.round(methane_m3_day * 6); // 6 kWh per m³ biogas
  const homes = Math.round(energy_kwh / 3); // avg 3 kWh/day per home
  
  // Carbon credit value
  const credit_low = co2e_year * cctsLow;
  const credit_high = co2e_year * cctsHigh;
  const credit_mid = (credit_low + credit_high) / 2;
  
  return {
    wet_waste_tpd: wetWasteTPD,
    methane_avoided_m3_day: Math.round(methane_m3_day),
    methane_tonnes_day: Math.round(methane_tonnes_day * 100) / 100,
    co2e_tonnes_day: Math.round(co2e_day * 10) / 10,
    co2e_tonnes_year: Math.round(co2e_year),
    energy_kwh_day: energy_kwh,
    homes_powered: homes,
    credit_value_low_inr: Math.round(credit_low),
    credit_value_high_inr: Math.round(credit_high),
    credit_value_mid_inr: Math.round(credit_mid),
    credit_value_mid_cr: `₹${(credit_mid / 10000000).toFixed(2)} Cr`,
    methodology: `IPCC AR5 GWP=${gwp}, CH₄=${methane_m3_per_tonne} m³/tonne wet, CCTS 2023 ₹${cctsLow}-${cctsHigh}/tonne`,
  };
}

/**
 * Calculate operational cost savings from route optimisation.
 */
export function calculateOperationalSavings(
  dailyWasteTonnes: number = 55,
  currentCostPerTonne: number = 2800,
  optimisedCostPerTonne: number = 2200
): {
  daily_saving_inr: number;
  annual_saving_inr: number;
  annual_saving_cr: string;
  pct_reduction: number;
} {
  const dailySaving = dailyWasteTonnes * (currentCostPerTonne - optimisedCostPerTonne);
  const annualSaving = dailySaving * 365;
  return {
    daily_saving_inr: dailySaving,
    annual_saving_inr: annualSaving,
    annual_saving_cr: `₹${(annualSaving / 10000000).toFixed(2)} Cr`,
    pct_reduction: Math.round(((currentCostPerTonne - optimisedCostPerTonne) / currentCostPerTonne) * 100),
  };
}
