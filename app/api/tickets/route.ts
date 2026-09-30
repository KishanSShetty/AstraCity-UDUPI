import { NextRequest, NextResponse } from 'next/server';

export interface SWMGrievanceTicket {
  id: string;
  ticket_number: string;
  ward_id: string;
  ward_name: string;
  category: string;
  category_kn?: string;
  location: string;
  description: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED';
  created_at: string;
  sla_limit_hours: number;
  sla_remaining_hours: number;
  assigned_team: string;
  assigned_vehicle: string;
  waste_estimate_kg: number;
}

// Initial audited baseline tickets for Udupi CMC
const BASELINE_TICKETS: SWMGrievanceTicket[] = [
  {
    id: 'TICK-UD-891',
    ticket_number: 'SWM/UDUPI/2026/0891',
    ward_id: 'WARD-20',
    ward_name: 'Indrali Landfill Remediation Zone',
    category: 'Methane Flare Spike & Surface Combustion',
    category_kn: 'ಮೀಥೇನ್ ಅನಿಲ ಜ್ವಾಲೆ ಮತ್ತು ಮೇಲ್ಮೈ ದಹನ',
    location: 'Indrali Solid Waste Remediation Plant, Ward 20, Udupi',
    description: 'Thermal probe sensor flagged 480 ppm methane concentration and subsurface heating along North Pit 3.',
    severity: 'CRITICAL',
    status: 'IN_PROGRESS',
    created_at: new Date(Date.now() - 3.5 * 60 * 60 * 1000).toISOString(),
    sla_limit_hours: 4,
    sla_remaining_hours: 0.5,
    assigned_team: 'Hazardous Mitigation Squad',
    assigned_vehicle: 'C-02 (Heavy Compactor)',
    waste_estimate_kg: 8500,
  },
  {
    id: 'TICK-UD-885',
    ticket_number: 'SWM/UDUPI/2026/0885',
    ward_id: 'WARD-04',
    ward_name: 'Malpe Coastal DWCC Division',
    category: 'Illegal Commercial Coastal Fish-Waste Dumping',
    category_kn: 'ಕರಾವಳಿ ಮೀನು ತ್ಯಾಜ್ಯ ಅಕ್ರಮ ವಿಲೇವಾರಿ',
    location: 'Malpe Port Beach Intertidal Terminal, Ward 04, Udupi',
    description: 'Unauthorized commercial dumping of 4.2 tonnes of unsegregated fish processing slurry near port dock.',
    severity: 'HIGH',
    status: 'IN_PROGRESS',
    created_at: new Date(Date.now() - 6.2 * 60 * 60 * 1000).toISOString(),
    sla_limit_hours: 12,
    sla_remaining_hours: 5.8,
    assigned_team: 'Coastal Sanitation Patrol',
    assigned_vehicle: 'AT-05 (Malpe Tipper)',
    waste_estimate_kg: 4200,
  },
  {
    id: 'TICK-UD-874',
    ticket_number: 'SWM/UDUPI/2026/0874',
    ward_id: 'WARD-18',
    ward_name: 'Manipal Institutional Sanitation Sector',
    category: 'Bulk Generator Source-Segregation Default',
    category_kn: 'ಬೃಹತ್ ತ್ಯಾಜ್ಯ ವಿಂಗಡಣೆ ನಿಯಮ ಉಲ್ಲಂಘನೆ',
    location: 'Tiger Circle Commercial Corridor, Manipal, Udupi',
    description: 'Repeated non-compliance by commercial food courts failing to segregate wet fraction for BMU delivery.',
    severity: 'MEDIUM',
    status: 'PENDING',
    created_at: new Date(Date.now() - 11.5 * 60 * 60 * 1000).toISOString(),
    sla_limit_hours: 24,
    sla_remaining_hours: 12.5,
    assigned_team: 'Ward 18 Inspection Wing',
    assigned_vehicle: 'AT-07 (Manipal Tipper)',
    waste_estimate_kg: 1800,
  },
  {
    id: 'TICK-UD-862',
    ticket_number: 'SWM/UDUPI/2026/0862',
    ward_id: 'WARD-25',
    ward_name: 'City Center KM Marg Health Office',
    category: 'Hazardous Biomedical Waste Cohabitation',
    category_kn: 'ಅಪಾಯಕಾರಿ ಜೈವಿಕ ವೈದ್ಯಕೀಯ ತ್ಯಾಜ್ಯ ಮಿಶ್ರಣ',
    location: 'KM Marg Hospital Zone, City Center Ward 25, Udupi',
    description: 'Clinical packaging and pharmaceutical containers discovered mixed inside public dumper container.',
    severity: 'CRITICAL',
    status: 'IN_PROGRESS',
    created_at: new Date(Date.now() - 2.1 * 60 * 60 * 1000).toISOString(),
    sla_limit_hours: 4,
    sla_remaining_hours: 1.9,
    assigned_team: 'Health Officer Flying Squad',
    assigned_vehicle: 'SC-01 (Small Compactor)',
    waste_estimate_kg: 2400,
  },
  {
    id: 'TICK-UD-850',
    ticket_number: 'SWM/UDUPI/2026/0850',
    ward_id: 'WARD-21',
    ward_name: 'Beedinagudde Biomethanation Unit',
    category: 'Inorganic Contamination & Digester Impeller Clog',
    category_kn: 'ಅಜೈವಿಕ ಮಾಲಿನ್ಯ ಮತ್ತು ಡೈಜೆಸ್ಟರ್ ವೈಫಲ್ಯ',
    location: 'Beedinagudde BMU Campus, Kasturba Nagar, Udupi',
    description: 'Heavy construction debris mixed into wet digest gate causing 12-hour processing delay.',
    severity: 'HIGH',
    status: 'RESOLVED',
    created_at: new Date(Date.now() - 28.0 * 60 * 60 * 1000).toISOString(),
    sla_limit_hours: 12,
    sla_remaining_hours: 0,
    assigned_team: 'Plant Mechanical Crew',
    assigned_vehicle: 'GT-01 (Wet Truck)',
    waste_estimate_kg: 3100,
  },
  {
    id: 'TICK-UD-842',
    ticket_number: 'SWM/UDUPI/2026/0842',
    ward_id: 'WARD-14',
    ward_name: 'Bannanje Market Corridor',
    category: 'Overflowing Municipal Dumper Bin',
    category_kn: 'ತುಂಬಿ ಹರಿಯುತ್ತಿರುವ ಕಸದ ತೊಟ್ಟಿ',
    location: 'Near Old Bus Stand, Bannanje, Udupi',
    description: 'Overflowing community collection bin with plastic bags spilling into pedestrian pathway.',
    severity: 'MEDIUM',
    status: 'PENDING',
    created_at: new Date(Date.now() - 5.0 * 60 * 60 * 1000).toISOString(),
    sla_limit_hours: 24,
    sla_remaining_hours: 19.0,
    assigned_team: 'Bannanje Sanitation Division',
    assigned_vehicle: 'AT-04 (Bannanje Tipper)',
    waste_estimate_kg: 950,
  },
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const statusFilter = searchParams.get('status');

  // Compute live mathematical values for each ticket based on elapsed time
  const now = Date.now();
  const computedTickets = BASELINE_TICKETS.map((t) => {
    const elapsedHours = (now - new Date(t.created_at).getTime()) / (1000 * 60 * 60);
    const remainingHours = Math.max(0, Math.round((t.sla_limit_hours - elapsedHours) * 10) / 10);
    
    return {
      ...t,
      sla_remaining_hours: remainingHours,
      sla_breached: elapsedHours > t.sla_limit_hours && t.status !== 'RESOLVED',
    };
  });

  const filtered = statusFilter && statusFilter !== 'ALL'
    ? computedTickets.filter((t) => t.status === statusFilter)
    : computedTickets;

  // Real-time calculated summary metrics
  const total = computedTickets.length;
  const criticalCount = computedTickets.filter((t) => t.severity === 'CRITICAL' && t.status !== 'RESOLVED').length;
  const highCount = computedTickets.filter((t) => t.severity === 'HIGH' && t.status !== 'RESOLVED').length;
  const inProgressCount = computedTickets.filter((t) => t.status === 'IN_PROGRESS').length;
  const pendingCount = computedTickets.filter((t) => t.status === 'PENDING').length;
  const resolvedCount = computedTickets.filter((t) => t.status === 'RESOLVED').length;
  const totalWasteUnderRemediationKg = computedTickets
    .filter((t) => t.status !== 'RESOLVED')
    .reduce((sum, t) => sum + t.waste_estimate_kg, 0);

  const slaBreachedCount = computedTickets.filter((t) => t.sla_breached).length;
  const slaCompliancePct = total > 0 ? Math.round(((total - slaBreachedCount) / total) * 1000) / 10 : 100;

  return NextResponse.json({
    success: true,
    tickets: filtered,
    summary: {
      total,
      pending: pendingCount,
      in_progress: inProgressCount,
      resolved: resolvedCount,
      critical: criticalCount,
      high: highCount,
      sla_breached: slaBreachedCount,
      sla_compliance_pct: slaCompliancePct,
      total_waste_remediation_tonnes: Math.round((totalWasteUnderRemediationKg / 1000) * 10) / 10,
    },
    timestamp: new Date().toISOString(),
  });
}
