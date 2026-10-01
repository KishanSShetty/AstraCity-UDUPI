/**
 * Carbon Credits API — Calculate CO₂e and carbon credit value from audited Udupi CMC data.
 * PRD §12.1: /api/carbon
 */
import { NextRequest, NextResponse } from 'next/server';
import { calculateCarbonCredits, calculateOperationalSavings } from '@/lib/carbon_calculator';
import { UDUPI_DATA } from '@/lib/constants';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  // Default to audited Udupi CMC wet organic waste (43.92 TPD = 61% of 72 TPD)
  const wetWaste = searchParams.get('wet_waste_tpd')
    ? parseFloat(searchParams.get('wet_waste_tpd')!)
    : UDUPI_DATA.waste_wet_tons;

  const totalWaste = searchParams.get('total_waste_tpd')
    ? parseFloat(searchParams.get('total_waste_tpd')!)
    : UDUPI_DATA.daily_waste_tons;

  const carbonResult = calculateCarbonCredits(wetWaste);
  const savingsResult = calculateOperationalSavings(totalWaste);

  const combinedValueCr = (
    (carbonResult.credit_value_mid_inr + savingsResult.annual_saving_inr) / 10000000
  ).toFixed(2);

  return NextResponse.json({
    success: true,
    carbon: carbonResult,
    operational_savings: savingsResult,
    combined_annual_value_cr: `₹${combinedValueCr} Cr`,
    baseline_reference: {
      audited_daily_waste_tpd: UDUPI_DATA.daily_waste_tons,
      wet_waste_tpd: UDUPI_DATA.waste_wet_tons,
      dry_waste_tpd: UDUPI_DATA.waste_dry_tons,
      hazardous_waste_tpd: UDUPI_DATA.waste_hazardous_tons,
      population: UDUPI_DATA.population,
      source: UDUPI_DATA.waste_source,
    },
    timestamp: new Date().toISOString(),
  });
}
