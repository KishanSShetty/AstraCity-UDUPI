export interface MockFIR {
  id: string;
  fir_number: string;
  station_id: string;
  station_name: string;
  district: string;
  district_id?: string;
  crime_type_en: string;
  crime_type_kn: string;
  date: string;
  timestamp?: string;
  status_en: string;
  status_kn: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  description: string;
  suspects_count: number;
}

export interface MockCase {
  id: string;
  case_no: string;
  title: string;
  status: "Active" | "Under Investigation" | "Charge-sheeted" | "Closed" | "Pending Trial";
  firs: string[];
  fir_count: number;
  primary_crime_type: string;
  primary_district: string;
  latest_date: string;
  summary: string;
  lead_investigator: string;
  priority: "High" | "Critical" | "Medium" | "Low";
}

export interface MockPerson {
  id: string;
  name: string;
  aliases: string[];
  age: number;
  gender: string;
  risk_score: number;
  is_repeat_offender: boolean;
  active_warrants: number;
  primary_crime: string;
  district: string;
  last_spotted: string;
  associates_count: number;
  status: "At Large" | "In Custody" | "Under Surveillance" | "Bailed";
}

export interface MockAlert {
  id: string;
  title: string;
  category: "Spike Anomaly" | "Threat Escalation" | "Repeat Offender" | "Syndicate Movement";
  severity: "CRITICAL" | "HIGH" | "ELEVATED" | "MEDIUM";
  location: string;
  timestamp: string;
  description: string;
  confidence: number;
  recommended_action: string;
  status: "Active" | "Acknowledged" | "Investigating" | "Resolved";
}

export interface MockFinancialTx {
  id: string;
  tx_id: string;
  sender_name: string;
  sender_account: string;
  receiver_name: string;
  receiver_account: string;
  amount: number;
  date: string;
  risk_level: "CRITICAL" | "SUSPICIOUS" | "NORMAL";
  flow_pattern: "Mule Account" | "Smurfing" | "Rapid Hop" | "Direct Syndicate";
  flagged: boolean;
}

export interface MockAuditLog {
  id: string;
  timestamp: string;
  user_id: string;
  user_name: string;
  role: string;
  action: string;
  resource: string;
  ip_address: string;
  status: "Success" | "Flagged" | "Denied";
}

export const MOCK_DASHBOARD_STATS = {
  activeInvestigations: 48,
  personsOfInterest: 32,
  highRiskAlerts: 14,
  resolutionRate: 88.6,
  threatIndex: "OPTIMAL",
  systemAccuracy: 97.2,
  nodeStatus: "ONLINE"
};

export const MOCK_TRENDS_DATA = [
  { month: "Jan", incidents: 38, resolved: 35, anomaly: false },
  { month: "Feb", incidents: 42, resolved: 40, anomaly: false },
  { month: "Mar", incidents: 51, resolved: 47, anomaly: false },
  { month: "Apr", incidents: 79, resolved: 61, anomaly: true },
  { month: "May", incidents: 58, resolved: 54, anomaly: false },
  { month: "Jun", incidents: 64, resolved: 59, anomaly: false },
  { month: "Jul", incidents: 86, resolved: 74, anomaly: true },
];

export const MOCK_FIRS: MockFIR[] = [
  {
    id: "FIR-2026-00891",
    fir_number: "SWM/UDUPI/2026/0891",
    station_id: "WARD-12",
    station_name: "Indrali Landfill Remediation Zone",
    district: "Udupi CMC",
    crime_type_en: "Methane Flare Spike & Surface Combustion",
    crime_type_kn: "ಮೀಥೇನ್ ಅನಿಲ ಜ್ವಾಲೆ ಮತ್ತು ಮೇಲ್ಮೈ ದಹನ",
    date: "2026-09-11T14:30:00Z",
    status_en: "Under Investigation",
    status_kn: "ತನಿಖೆಯಲ್ಲಿದೆ",
    severity: "CRITICAL",
    location: { lat: 13.3524, lng: 74.7732, address: "Indrali Solid Waste Remediation Plant, Ward 12, Udupi" },
    description: "Thermal drone inspection flagged 480 ppm methane concentration and smoldering subsurface combustion along North Pit 3.",
    suspects_count: 3
  },
  {
    id: "FIR-2026-00885",
    fir_number: "SWM/UDUPI/2026/0885",
    station_id: "WARD-04",
    station_name: "Malpe Coastal DWCC Division",
    district: "Udupi CMC",
    crime_type_en: "Illegal Commercial Coastal Fish-Waste Dumping",
    crime_type_kn: "ಕರಾವಳಿ ಮೀನು ತ್ಯಾಜ್ಯ ಅಕ್ರಮ ವಿಲೇವಾರಿ",
    date: "2026-09-10T22:15:00Z",
    status_en: "Active Pursuit",
    status_kn: "ಸಕ್ರಿಯ ಅನ್ವೇಷಣೆ",
    severity: "HIGH",
    location: { lat: 13.3512, lng: 74.7021, address: "Malpe Port Beach Intertidal Terminal, Ward 4, Udupi" },
    description: "Unauthorized midnight dumping of 4.2 tonnes of unsegregated organic fish processing slurry directly onto mudflats.",
    suspects_count: 2
  },
  {
    id: "FIR-2026-00874",
    fir_number: "SWM/UDUPI/2026/0874",
    station_id: "WARD-08",
    station_name: "Manipal Institutional Sanitation Sector",
    district: "Udupi CMC",
    crime_type_en: "Bulk Generator Source-Segregation Default",
    crime_type_kn: "ಬೃಹತ್ ತ್ಯಾಜ್ಯ ವಿಂಗಡಣೆ ನಿಯಮ ಉಲ್ಲಂಘನೆ",
    date: "2026-09-09T18:40:00Z",
    status_en: "Charge-sheeted",
    status_kn: "ದೋಷಾರೋಪಣೆ ಸಲ್ಲಿಸಲಾಗಿದೆ",
    severity: "MEDIUM",
    location: { lat: 13.3538, lng: 74.7865, address: "Tiger Circle Commercial Corridor, Manipal, Udupi" },
    description: "Repeated non-compliance by private catering hubs failing to hand over separated wet fraction to biomethanation compactor trucks.",
    suspects_count: 4
  },
  {
    id: "FIR-2026-00862",
    fir_number: "SWM/UDUPI/2026/0862",
    station_id: "WARD-15",
    station_name: "City Center KM Marg Health Office",
    district: "Udupi CMC",
    crime_type_en: "Hazardous Biomedical Waste Cohabitation",
    crime_type_kn: "ಅಪಾಯಕಾರಿ ಜೈವಿಕ ವೈದ್ಯಕೀಯ ತ್ಯಾಜ್ಯ ಮಿಶ್ರಣ",
    date: "2026-09-08T03:20:00Z",
    status_en: "Under Investigation",
    status_kn: "ತನಿಖೆಯಲ್ಲಿದೆ",
    severity: "CRITICAL",
    location: { lat: 13.3409, lng: 74.7421, address: "KM Marg Hospital Zone, City Center Ward 15, Udupi" },
    description: "Infectious clinical sharps and pharmaceutical vials discovered co-mingled in municipal secondary dumper placer container.",
    suspects_count: 2
  },
  {
    id: "FIR-2026-00850",
    fir_number: "SWM/UDUPI/2026/0850",
    station_id: "WARD-21",
    station_name: "Gundibail Biomethanation Unit",
    district: "Udupi CMC",
    crime_type_en: "Inorganic Contamination & Digester Impeller Clog",
    crime_type_kn: "ಅಜೈವಿಕ ಮಾಲಿನ್ಯ ಮತ್ತು ಡೈಜೆಸ್ಟರ್ ವೈಫಲ್ಯ",
    date: "2026-09-06T11:05:00Z",
    status_en: "Trial",
    status_kn: "ವಿಚಾರಣೆಯ ಹಂತ",
    severity: "HIGH",
    location: { lat: 13.3480, lng: 74.7560, address: "Gundibail Wet Waste Processing Facility, Ward 21, Udupi" },
    description: "High volume of heavy plastic and construction debris dumped into organic digester causing 18-hour anaerobic processing shutdown.",
    suspects_count: 2
  }
];

export const MOCK_CASES: MockCase[] = [
  {
    id: "CASE-KA-2026-442",
    case_no: "SWM-442/2026",
    title: "Indrali Dumpsite Remediation & Methane Mitigation Taskforce",
    status: "Active",
    firs: ["FIR-2026-00891"],
    fir_count: 1,
    primary_crime_type: "Methane Mitigation & Bio-mining",
    primary_district: "Indrali Ward 12",
    latest_date: "2026-09-11",
    summary: "Comprehensive multi-agency probe into subsurface methane venting, leachate lagoon integrity, and contractor bio-mining schedules.",
    lead_investigator: "Er. Rajesh Shenoy (Env. Eng.)",
    priority: "Critical"
  },
  {
    id: "CASE-KA-2026-389",
    case_no: "SWM-389/2026",
    title: "Coastal Marine Plastic & Fish Processing Waste Cartel",
    status: "Under Investigation",
    firs: ["FIR-2026-00885"],
    fir_count: 1,
    primary_crime_type: "Coastal Environmental Violation",
    primary_district: "Malpe Coastal Ward 4",
    latest_date: "2026-09-10",
    summary: "Surveillance operation tracking night-shift tanker trucks discharging unprocessed fishery effluents along Malpe beach intertidal zones.",
    lead_investigator: "Insp. Shweta Shetty (Health Insp.)",
    priority: "High"
  },
  {
    id: "CASE-KA-2026-210",
    case_no: "SWM-210/2026",
    title: "Manipal Educational Zone Commercial Segregation Compliance",
    status: "Charge-sheeted",
    firs: ["FIR-2026-00874"],
    fir_count: 1,
    primary_crime_type: "Bulk Generator SWM 2026 Enforcement",
    primary_district: "Manipal Ward 8",
    latest_date: "2026-09-09",
    summary: "Formal statutory summons and penal review for institutional kitchens exceeding 100 kg/day waste generation without on-site composting.",
    lead_investigator: "Dr. K. Nayak (Chief Health Officer)",
    priority: "Medium"
  },
  {
    id: "CASE-KA-2026-105",
    case_no: "SWM-105/2026",
    title: "Gundibail Anaerobic Digester Feedstock Adulteration Enquiry",
    status: "Pending Trial",
    firs: ["FIR-2026-00850"],
    fir_count: 1,
    primary_crime_type: "Infrastructure Sabotage / Contamination",
    primary_district: "Gundibail Ward 21",
    latest_date: "2026-09-06",
    summary: "Investigation into illegal delivery of industrial plastic debris under false manifest as segregated municipal market wet waste.",
    lead_investigator: "Insp. Anand Rao (Zonal Sanitary Insp.)",
    priority: "High"
  }
];

export const MOCK_PERSONS: MockPerson[] = [
  {
    id: "PER-9901",
    name: "Coastal Marine Fish Processors Consortium",
    aliases: ["Malpe DeepSea Unit", "Harbor Syndicate"],
    age: 42,
    gender: "Male",
    risk_score: 92,
    is_repeat_offender: true,
    active_warrants: 3,
    primary_crime: "Commercial Coastal Effluent Dumping",
    district: "Malpe Coastal Ward",
    last_spotted: "Malpe Harbor Jetty 2 (Yesterday)",
    associates_count: 12,
    status: "Under Surveillance"
  },
  {
    id: "PER-9842",
    name: "Indrali Bio-Mining & Capping Contractor Agency",
    aliases: ["Pit-3 Concessionaire", "Greentech Allied"],
    age: 48,
    gender: "Male",
    risk_score: 84,
    is_repeat_offender: true,
    active_warrants: 1,
    primary_crime: "Leachate Flare Non-Compliance",
    district: "Indrali Ward 12",
    last_spotted: "Indrali Weighbridge Control Station (3 days ago)",
    associates_count: 18,
    status: "At Large"
  },
  {
    id: "PER-9710",
    name: "Manipal University Private Hostels Food Services",
    aliases: ["Tiger Caterers", "Mess Block C-4"],
    age: 35,
    gender: "Male",
    risk_score: 79,
    is_repeat_offender: false,
    active_warrants: 2,
    primary_crime: "Bulk Waste Segregation Default",
    district: "Manipal Ward 8",
    last_spotted: "Eshwar Nagar Loading Dock (Today)",
    associates_count: 9,
    status: "Bailed"
  },
  {
    id: "PER-9654",
    name: "Udupi Central Medical Sharps Aggregator Network",
    aliases: ["MediDispose Agency", "Sharps Care"],
    age: 50,
    gender: "Male",
    risk_score: 91,
    is_repeat_offender: true,
    active_warrants: 2,
    primary_crime: "Hazardous Biomedical Waste Commingling",
    district: "City Center Ward 15",
    last_spotted: "KM Marg Secondary Storage Hub (4 days ago)",
    associates_count: 7,
    status: "In Custody"
  }
];

export const MOCK_ALERTS: MockAlert[] = [
  {
    id: "ALT-701",
    title: "Anomalous Indrali Methane Flaring Spike (+185% ppm)",
    category: "Spike Anomaly",
    severity: "CRITICAL",
    location: "Indrali Dumpsite North Slope",
    timestamp: "12 mins ago",
    description: "IoT telemetry detected subsurface methane surge reaching 480 ppm. Elevated risk of smoldering fires under SWM 2026 safety caps.",
    confidence: 96.8,
    recommended_action: "Activate bio-cover sprinkler dampers and deploy mobile methane suppression squad.",
    status: "Active"
  },
  {
    id: "ALT-702",
    title: "Malpe Beach Micro-Plastic & Organic Effluent Inflow Warning",
    category: "Syndicate Movement",
    severity: "CRITICAL",
    location: "Malpe Intertidal Beach Zone 2",
    timestamp: "45 mins ago",
    description: "Optical satellite water-turbidity sensor confirms 4.2-tonne unsegregated fish slurry plume entering estuary.",
    confidence: 92.4,
    recommended_action: "Dispatch harbor patrol intercept team and issue coastal dumping summons to Unit 4.",
    status: "Active"
  },
  {
    id: "ALT-703",
    title: "Rapid Tipping Fee Default Alert (INR 1.45M)",
    category: "Threat Escalation",
    severity: "HIGH",
    location: "Manipal Commercial Corridor",
    timestamp: "2 hours ago",
    description: "Three bulk generator accounts defaulted on mandatory monthly decentralized composting tipping payments.",
    confidence: 89.1,
    recommended_action: "Issue statutory recovery notices and suspend automated gate weighbridge clearance under CMC SWM Bylaws.",
    status: "Investigating"
  },
  {
    id: "ALT-704",
    title: "Gundibail Biomethanation Wet Inflow Deficit (-45%)",
    category: "Repeat Offender",
    severity: "ELEVATED",
    location: "Gundibail Decentralized Plant",
    timestamp: "5 hours ago",
    description: "Anaerobic digester operating at only 42% capacity due to missed municipal collection truck arrivals from Indrali.",
    confidence: 84.0,
    recommended_action: "Reroute compactor fleet KA-20-EA-4102 to discharge primary wet waste fraction directly to Gundibail.",
    status: "Acknowledged"
  }
];

export const MOCK_FINANCIAL_TX: MockFinancialTx[] = [
  {
    id: "TX-9001",
    tx_id: "TXN2026091100984",
    sender_name: "Malpe Commercial Fish Processors",
    sender_account: "HDFC **** 8492",
    receiver_name: "Udupi CMC Green Cess & Tipping Fund",
    receiver_account: "SBI **** 3310",
    amount: 850000,
    date: "2026-09-11 11:20",
    risk_level: "CRITICAL",
    flow_pattern: "Mule Account",
    flagged: true
  },
  {
    id: "TX-9002",
    tx_id: "TXN2026091100762",
    sender_name: "Gundibail Biomethanation Grid Feed",
    sender_account: "SBI **** 1192",
    receiver_name: "Karnataka Renewable Energy Development (KREDL)",
    receiver_account: "CANARA **** 9043",
    amount: 1450000,
    date: "2026-09-11 12:45",
    risk_level: "NORMAL",
    flow_pattern: "Rapid Hop",
    flagged: false
  },
  {
    id: "TX-9003",
    tx_id: "TXN2026091000411",
    sender_name: "Manipal University Campus Services",
    sender_account: "CANARA **** 7731",
    receiver_name: "Udupi Municipal Council Escrow",
    receiver_account: "AXIS **** 2280",
    amount: 620000,
    date: "2026-09-10 16:10",
    risk_level: "NORMAL",
    flow_pattern: "Direct Syndicate",
    flagged: false
  },
  {
    id: "TX-9004",
    tx_id: "TXN2026090900155",
    sender_name: "Indrali Remediation Bio-mining JV",
    sender_account: "SBI **** 6610",
    receiver_name: "Sub-Contractor Dumper Fleet Ops",
    receiver_account: "KBL **** 4491",
    amount: 320000,
    date: "2026-09-09 09:30",
    risk_level: "SUSPICIOUS",
    flow_pattern: "Direct Syndicate",
    flagged: true
  }
];

export const MOCK_AUDIT_LOGS: MockAuditLog[] = [
  {
    id: "AUD-101",
    timestamp: "2026-09-12 17:45:10",
    user_id: "U10943",
    user_name: "Er. K. P. Bhat (Env. Eng)",
    role: "INSPECTOR",
    action: "VIEW_FACILITY_DOSSIER",
    resource: "Facility: Indrali Landfill & Bio-Mining Plant",
    ip_address: "10.204.14.88",
    status: "Success"
  },
  {
    id: "AUD-102",
    timestamp: "2026-09-12 17:12:04",
    user_id: "U10943",
    user_name: "Er. K. P. Bhat (Env. Eng)",
    role: "INSPECTOR",
    action: "GENERATE_SWM_COMPLIANCE_REPORT",
    resource: "Case: SWM-442/2026 Indrali Remediation",
    ip_address: "10.204.14.88",
    status: "Success"
  },
  {
    id: "AUD-103",
    timestamp: "2026-09-12 16:30:29",
    user_id: "U88102",
    user_name: "Ward Supervisor M. Patil",
    role: "CONSTABLE",
    action: "EXPORT_TIPPING_FEE_LEDGER",
    resource: "Financial: TX-9001 to TX-9004",
    ip_address: "10.204.14.102",
    status: "Denied"
  },
  {
    id: "AUD-104",
    timestamp: "2026-09-12 15:10:00",
    user_id: "U10943",
    user_name: "Er. K. P. Bhat (Env. Eng)",
    role: "INSPECTOR",
    action: "RESOLVE_EARLY_WARNING",
    resource: "Alert: ALT-701 Methane Suppression Trigger",
    ip_address: "10.204.14.88",
    status: "Success"
  }
];

export const MOCK_NETWORK_GRAPH = {
  nodes: [
    { id: "p1", name: "Indrali Landfill Remediation Hub", type: "facility", risk: 92, role: "Central Processing & Bio-Mining" },
    { id: "p2", name: "Malpe Coastal DWCC", type: "facility", risk: 85, role: "Dry Waste Aggregation & Sorting" },
    { id: "p3", name: "Gundibail Biomethanation Center", type: "facility", risk: 72, role: "Decentralized Wet Digestion" },
    { id: "v1", name: "Compactor Truck KA-20-EA-4102", type: "vehicle", risk: 65, role: "Fleet Route Indrali-Manipal" },
    { id: "b1", name: "Udupi CMC Green Fund (SBI 8492)", type: "bank", risk: 30, role: "Municipal Treasury Escrow" },
    { id: "b2", name: "Concessionaire Bio-Mining A/C (Canara 3310)", type: "bank", risk: 78, role: "Contractor Tipping Account" },
    { id: "f1", name: "SWM/UDUPI/2026/0891 (Methane Spike)", type: "fir", risk: 88, role: "Active Regulatory Incident" },
    { id: "loc1", name: "Indrali Rail Siding Transfer Yard", type: "location", risk: 55, role: "Transit Logistics Depot" }
  ],
  links: [
    { source: "p1", target: "p2", relationship: "Dry Refuse Residual Haulage", strength: 0.9 },
    { source: "p1", target: "p3", relationship: "Organic Wet Feedstock Transfer", strength: 0.8 },
    { source: "p2", target: "b1", relationship: "Recyclables EPR Credit", strength: 1.0 },
    { source: "b1", target: "b2", relationship: "INR 850,000 Tipping Disbursement", strength: 0.95 },
    { source: "p3", target: "v1", relationship: "Daily Slurry Transport", strength: 0.85 },
    { source: "p2", target: "f1", relationship: "Inspection Notice Linked", strength: 1.0 },
    { source: "p1", target: "loc1", relationship: "RDF Rail Logistics Transfer", strength: 0.75 }
  ]
};
