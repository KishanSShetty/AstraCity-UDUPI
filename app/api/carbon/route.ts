/**
 * Carbon Credits API — Calculate CO₂e and carbon credit value.
 * PRD §8.1: /api/carbon
 */
import { NextRequest, NextResponse } from 'next/server';
import { calculateCarbonCredits, calculateOperationalSavings } from '@/lib/carbon_calculator';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const wetWaste = searchParams.get('wet_waste_tpd')
    ? parseFloat(searchParams.get('wet_waste_tpd')!)
    : 33.55;

  const carbonResult = calculateCarbonCredits(wetWaste);
  const savingsResult = calculateOperationalSavings();

  return NextResponse.json({
    carbon: carbonResult,
    operational_savings: savingsResult,
    combined_annual_value_cr: `₹${(
      (carbonResult.credit_value_mid_inr + savingsResult.annual_saving_inr) / 10000000
    ).toFixed(2)} Cr`,
  });
}
