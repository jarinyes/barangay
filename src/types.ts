export type AgencyType = 'BARANGAY' | 'LGU' | 'ADMIN' | 'RESIDENT';

export type UserRole = 
  | 'RESIDENT'
  | 'BARANGAY_ADMIN' 
  | 'BARANGAY_OFFICIAL' 
  | 'LGU_OFFICER' 
  | 'LGU_ADMINISTRATOR' 
  | 'SYSTEM_ADMIN';

export interface IncidentPhoto {
  id: string;
  url: string;
  caption?: string;
  uploadDate: string;
  size?: string;
}

export interface VehicleCrashDetail {
  id: string;
  vehicleType: 'Motorcycle' | 'Sedan / Hatchback' | 'SUV / AUV' | 'Tricycle' | 'Van' | 'Pickup' | 'Truck (Dump/Cargo)' | 'Bus / PUV' | 'Bicycle / E-Bike' | 'Pedestrian' | 'Other';
  makeModel?: string; // e.g. Yamaha Mio, Honda Click, Toyota Vios, Isuzu Elf
  plateNumberOrConduction?: string;
  color?: string;
  driverName?: string;
  driverLicenseNo?: string;
  driverCondition?: 'Uninjured' | 'Minor Scratches/Bruises' | 'Hospitalized' | 'Critical' | 'Unknown';
  damageSeverity?: 'Minor Dent/Scratch' | 'Moderate Functional Damage' | 'Severe / Total Wreck';
  helmetOrSeatbeltWorn?: boolean;
  insuranceCoverage?: boolean;
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  agencyType: AgencyType;
  agencyName: string;
  barangay?: string;
  position: string;
  badgeOrIdNumber?: string;
  email: string;
  avatarUrl?: string;
  passcode?: string;
  phone?: string;
  address?: string;
  residentIdNumber?: string;
}

export type CaseStatus = 
  | 'New'
  | 'Received'
  | 'Under Initial Assessment'
  | 'Under Investigation'
  | 'For Barangay Action'
  | 'Referred to Police Station'
  | 'Referred to LGU'
  | 'For DILG Monitoring'
  | 'Awaiting Documents'
  | 'Awaiting Respondent'
  | 'Awaiting Complainant'
  | 'Awaiting Agency Action'
  | 'Pending'
  | 'Resolved'
  | 'Closed'
  | 'Archived';

export type PriorityLevel = 'Low' | 'Medium' | 'High' | 'Urgent';

export type IncidentCategory = 
  | 'Motorcycle vs Motorcycle Collision'
  | 'Motorcycle vs Car / SUV Collision'
  | 'Motorcycle vs Tricycle Collision'
  | 'Car / 4-Wheeled Vehicle Collision'
  | 'Tricycle Collision / Rollover'
  | 'Truck / Bus / Heavy Vehicle Crash'
  | 'PUV / Jeepney / Multicab Accident'
  | 'Pedestrian Hit by Vehicle / Motorcycle'
  | 'Bicycle / E-Bike / E-Trike Crash'
  | 'Single-Vehicle Road Skid / Fixed Object Crash'
  | 'Multi-Vehicle Pileup Collision'
  | 'Hit-and-Run Vehicular Crash';

export type PendingReason = 
  | 'Awaiting investigation'
  | 'Awaiting additional documents'
  | 'Awaiting complainant response'
  | 'Awaiting respondent response'
  | 'Awaiting witness statement'
  | 'Awaiting Police Station action'
  | 'Awaiting LGU action'
  | 'Awaiting DILG action/recommendation'
  | 'Awaiting barangay action'
  | 'Scheduled hearing/meeting'
  | 'For mediation'
  | 'For further verification'
  | 'Lack of evidence'
  | 'Unable to contact involved person'
  | 'Referred to another agency'
  | 'Legal/administrative process ongoing'
  | 'Other reason';

export type BarangayRetentionReason =
  | 'Amicable settlement under Katarungang Pambarangay'
  | 'Ongoing mediation / Lupon conciliation'
  | 'Within barangay jurisdiction only'
  | 'Complainant requested local resolution'
  | 'Minor dispute resolved with reprimand/warning'
  | 'Lack of criminal element / Civil nature'
  | 'Administrative dispute resolved internally'
  | 'Awaiting further local documentation'
  | 'Other local reason';

export interface PersonInvolved {
  id: string;
  name: string;
  role: 'Complainant' | 'Respondent' | 'Witness' | 'Victim' | 'Official' | 'Other';
  contact?: string;
  address?: string;
  barangay?: string;
  isOfficial?: boolean;
  officialPosition?: string;
  officialAgency?: string;
}

export interface CaseAttachment {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
  uploadedBy: string;
  url?: string;
}

export interface StatusHistoryItem {
  id: string;
  previousStatus: CaseStatus;
  newStatus: CaseStatus;
  reason: string;
  changedBy: string;
  changedByRole: string;
  agency: string;
  timestamp: string;
  remarks?: string;
}

export interface CaseReferral {
  id: string;
  caseId: string;
  referringAgency: string;
  referringOfficer: string;
  receivingAgency: string;
  receivingOfficer?: string;
  referralReason: string;
  dateReferred: string;
  dateReceived?: string;
  documentsTransferred: string[];
  status: 'Pending Receipt' | 'Received' | 'Under Action' | 'Returned' | 'Completed';
  responseAction?: string;
  dateCompleted?: string;
  notes?: string;
}

export interface DilgRecommendation {
  id: string;
  caseId: string;
  dilgOfficer: string;
  dilgOfficerPosition: string;
  date: string;
  recommendationType: 
    | 'Recommendation for Immediate Action'
    | 'Request for Clarification'
    | 'Request for Additional Documents'
    | 'Request for Status Update'
    | 'Recommendation for Follow-up'
    | 'Recommendation for Referral'
    | 'Recommendation for Monitoring'
    | 'Recommendation for Coordination with Another Agency'
    | 'Administrative Compliance Directive'
    | 'Other Authorized Recommendation';
  detailedRecommendation: string;
  priority: 'Normal' | 'High' | 'Critical';
  targetAgency: string;
  responseDeadline: string;
  status: 'Awaiting Agency Response' | 'Acknowledged' | 'Action In Progress' | 'Completed' | 'Overdue';
  agencyResponse?: string;
  agencyActionOfficer?: string;
  dateResponseSubmitted?: string;
  dateCompleted?: string;
  complianceRemarks?: string;
}

export interface TimelineEvent {
  id: string;
  caseId: string;
  title: string;
  description: string;
  stage: 
    | 'Report Filed'
    | 'Initial Assessment'
    | 'Barangay Action / Lupon'
    | 'Referral Sent'
    | 'Referral Received'
    | 'Police Action'
    | 'LGU Action'
    | 'DILG Monitoring'
    | 'Recommendation Issued'
    | 'Response Recorded'
    | 'Status Update'
    | 'Resolution'
    | 'Case Closure';
  actorName: string;
  actorRole: string;
  actorAgency: string;
  timestamp: string;
  iconType?: string;
  metadata?: Record<string, any>;
}

export interface Case {
  id: string; // e.g. "BC-2026-001"
  incidentId: string; // e.g. "INC-2026-001"
  complaintId?: string;
  title: string;
  category: IncidentCategory;
  description: string;
  initialNarrative: string;
  currentNarrativeSummary?: string;
  dateReported: string; // ISO string
  incidentDate: string;
  barangay: string;
  specificLocation: string;
  
  // Persons
  complainants: PersonInvolved[];
  respondents: PersonInvolved[];
  witnesses: PersonInvolved[];
  personsInvolved: PersonInvolved[];
  
  // Officials Tracking
  isInvolvingOfficial: boolean;
  officialInvolvedType?: 'Barangay Official' | 'Municipal / LGU Official' | 'Police Personnel' | 'None';
  officialInvolvedName?: string;
  officialInvolvedPosition?: string;
  officialInvolvedAgency?: string;
  
  // Ownership & Agency Routing
  originatingAgency: string;
  currentHandlingAgency: string;
  assignedPersonnel: string;
  assignedPersonnelContact?: string;
  priority: PriorityLevel;
  status: CaseStatus;
  
  // Referral & Police/Barangay level tracking
  isReferredToPolice: boolean;
  policeCaseNo?: string;
  blotterEntryNo?: string;
  isReferredToLgu: boolean;
  lguEndorsementNo?: string;
  isMonitoredByDilg: boolean;
  dilgMonitoringFlagReason?: string;
  
  // Barangay Retention (when not referred to police)
  isRemainedAtBarangay: boolean;
  barangayRetentionReason?: BarangayRetentionReason;
  barangayRetentionNotes?: string;
  
  // Pending Management
  isPending: boolean;
  pendingReason?: PendingReason;
  pendingExplanation?: string;
  pendingSinceDate?: string;
  daysPending: number;
  lastActionTaken?: string;
  requiredNextAction?: string;
  
  // Outcomes
  resolutionSummary?: string;
  dateResolved?: string;
  dateClosed?: string;
  outcomeType?: 'Amicably Settled' | 'Referred to Prosecutor / Court' | 'Referred to Higher Authority' | 'Administrative Sanction' | 'Dismissed / Withdrawn' | 'Mediated' | 'Pending Action';
  
  // Attachments, Photos & Updates
  photos?: IncidentPhoto[];
  isCitizenReport?: boolean;
  residentReporterId?: string;
  isAccidentEmergency?: boolean;
  accidentVehicleDetails?: string;
  accidentCasualties?: string;
  isAccidentProneArea?: boolean;
  emergencyAlarmAcknowledged?: boolean;
  emergencyFirstRespondersDispatched?: boolean;
  
  // Vehicular Crash & Accident Specifics
  vehiclesInvolved?: VehicleCrashDetail[];
  collisionImpactType?: 'Head-On Collision' | 'Rear-End Impact' | 'Side-Swipe / T-Bone' | 'Intersection Collision' | 'Hit-and-Run' | 'Single Vehicle Skid / Rollover' | 'Pedestrian Impact' | 'Fixed Obstacle Collision' | 'Other Impact';
  roadSurfaceCondition?: 'Dry & Clear' | 'Wet / Slippery' | 'Potholes / Under Construction' | 'Poor Lighting / Blind Curve' | 'Gravel / Muddy';
  weatherCondition?: 'Clear & Sunny' | 'Heavy Rain / Storm' | 'Light Rain / Drizzle' | 'Foggy / Night Dark';
  injuriesCount?: number;
  casualtiesCount?: number;
  isHitAndRun?: boolean;
  respondingAmbulanceUnit?: string;
  hospitalTransported?: string;

  attachments: CaseAttachment[];
  statusHistory: StatusHistoryItem[];
  referrals: CaseReferral[];
  dilgRecommendations: DilgRecommendation[];
  timeline: TimelineEvent[];
  
  // Metadata
  dateCreated: string;
  dateLastUpdated: string;
  createdBy: string;
  isConfidential?: boolean;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  role: string;
  agency: string;
  action: string;
  caseId?: string;
  previousValue?: string;
  newValue?: string;
  details: string;
  ipAddress?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'referral' | 'recommendation' | 'pending_alert' | 'status_update' | 'system' | 'hearing' | 'advisory' | 'case_registered';
  caseId?: string;
  timestamp: string;
  isRead: boolean;
  targetAgency?: string;
  targetAgencyTypes?: AgencyType[];
  targetRoles?: UserRole[];
  targetBarangay?: string;
  targetUserId?: string;
  targetResidentName?: string;
  priority?: 'normal' | 'high' | 'urgent';
  actionUrl?: string;
  senderName?: string;
  senderAgency?: string;
  isAccidentEmergency?: boolean;
  accidentDetails?: {
    location?: string;
    vehicleType?: string;
    casualties?: string;
    isAccidentProneArea?: boolean;
  };
  alarmSound?: boolean;
}

// Graph Algorithm Types
export type GraphNodeType = 
  | 'case' 
  | 'incident' 
  | 'person' 
  | 'official' 
  | 'barangay' 
  | 'agency' 
  | 'location' 
  | 'document';

export type Person = PersonInvolved;

export interface GraphNode {
  id: string;
  label: string;
  subLabel?: string;
  type: GraphNodeType;
  subType?: string;
  group?: string;
  color?: string;
  radius?: number;
  degree?: number;
  rawCase?: Case;
  metadata: {
    caseId?: string;
    role?: string;
    barangay?: string;
    agency?: string;
    status?: string;
    date?: string;
    isOfficial?: boolean;
    officialPosition?: string;
    category?: string;
    degree?: number;
    contact?: string;
    fullAddress?: string;
    isPending?: boolean;
    [key: string]: any;
  };
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  type: 
    | 'INVOLVED_IN' 
    | 'COMPLAINED_AGAINST' 
    | 'REPORTED_IN' 
    | 'REFERRED_TO' 
    | 'MONITORED_BY' 
    | 'INVOLVES_OFFICIAL' 
    | 'LOCATED_AT' 
    | 'RELATED_CASE' 
    | 'HAS_ATTACHMENT';
  weight?: number;
}

export interface GraphCluster {
  id: string;
  title: string;
  label?: string;
  description: string;
  nodeIds: string[];
  caseIds?: string[];
  riskLevel: 'Normal' | 'Moderate' | 'High';
  commonFactor: string;
}

// Annual Report Types
export interface AnnualStatistics {
  year: number;
  totalIncidents: number;
  totalComplaints: number;
  totalCases: number;
  totalResolvedCases: number;
  totalClosedCases: number;
  totalOngoingCases: number;
  totalPendingCases: number;
  totalReferredToPolice: number;
  totalReferredToLgu: number;
  totalMonitoredByDilg: number;
  casesInvolvingBarangayOfficials: number;
  casesInvolvingLocalOfficials: number;
  casesInvolvingOfficials?: number;
  casesResolvedAtBarangayLevel: number;
  casesNotReferredToPolice: number;
  casesTransferredBetweenAgencies: number;
  
  // Breakdown
  pendingByReason: Record<string, number>;
  casesByBarangay: Record<string, number>;
  casesByCategory: Record<string, number>;
  averageResolutionDays: number;
  dilgRecommendationsCount: number;
  dilgComplianceRate: number;
}

export const ROXAS_BARANGAYS = [
  'Bagumbayan',
  'Libertad',
  'Odiong',
  'San Aquilino',
  'San Miguel',
  'Victoria'
] as const;

export const AGENCIES_LIST = [
  { 
    id: 'BARANGAY_OFFICES', 
    name: 'Barangay Local Government Units (6 Barangays of Roxas)', 
    type: 'BARANGAY',
    description: 'First-line community intake, Katarungang Pambarangay conciliation, accident alarms, and local peace & order.',
    jurisdictionScope: '6 Component Barangays (Bagumbayan, Libertad, Odiong, San Aquilino, San Miguel, Victoria)'
  },
  { 
    id: 'RESIDENT_COMMUNITY', 
    name: 'Resident Citizen Community Portal', 
    type: 'RESIDENT',
    description: 'Direct citizen incident filing, accident hazard alarms, hearing schedule notices, and status tracking.',
    jurisdictionScope: 'Verified Roxas Residents (Barangay Restricted)'
  },
  { 
    id: 'LGU_MUNICIPAL', 
    name: 'Municipal Government of Roxas (LGU Executive & Administration)', 
    type: 'LGU',
    description: 'Municipal administration, ordinance enforcement, Katarungang Pambarangay oversight, MENRO, MSWDO, and cross-barangay governance.',
    jurisdictionScope: 'Municipal Administration & Oversight'
  }
] as const;
