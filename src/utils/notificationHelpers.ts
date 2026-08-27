import { NotificationItem, User, Case, AgencyType, UserRole } from '../types';

/**
 * Determines whether a given notification belongs to the active user based on role, agency, barangay, and case ownership.
 */
export function isNotificationForUser(
  notif: NotificationItem, 
  user: User, 
  cases: Case[] = []
): boolean {
  if (!user) return false;

  const userAgencyType = user.agencyType;
  const userRole = user.role;
  const userBarangay = user.barangay;
  const userId = user.id;
  const userName = user.name.toLowerCase();

  // Find related case if any
  const relatedCase = notif.caseId ? cases.find((c) => c.id === notif.caseId) : undefined;

  // 1. Direct User targeting
  if (notif.targetUserId && notif.targetUserId === userId) {
    return true;
  }

  // 2. Direct Resident Name match
  if (notif.targetResidentName && notif.targetResidentName.toLowerCase() === userName) {
    return true;
  }

  // ----------------------------------------------------
  // RESIDENT ROLE FILTERING
  // ----------------------------------------------------
  if (userAgencyType === 'RESIDENT' || userRole === 'RESIDENT') {
    // RESIDENTS MUST NEVER SEE ACCOUNT REGISTRATION OR ADMINISTRATIVE SYSTEM NOTIFICATIONS
    const titleLower = notif.title.toLowerCase();
    const msgLower = notif.message.toLowerCase();
    
    if (
      titleLower.includes('account registered') || 
      titleLower.includes('new account') ||
      titleLower.includes('account created') ||
      titleLower.includes('new user') ||
      titleLower.includes('officer authorized') ||
      msgLower.includes('has been authorized in the b-connect network') ||
      msgLower.includes('registered new official user account')
    ) {
      return false;
    }



    // If targeted explicitly for residents
    if (notif.targetAgencyTypes?.includes('RESIDENT') || notif.targetRoles?.includes('RESIDENT') || notif.targetAgency === 'RESIDENT') {
      if (notif.targetBarangay && userBarangay && notif.targetBarangay !== userBarangay) {
        return false;
      }
      return true;
    }

    // Community advisory for resident's barangay
    if (notif.type === 'advisory' && (notif.targetBarangay === userBarangay || !notif.targetBarangay)) {
      return true;
    }

    // Check if the notification relates to a case filed by or involving this resident
    if (relatedCase) {
      const isReporter = 
        relatedCase.residentReporterId === userId ||
        relatedCase.createdBy.toLowerCase().includes(userName) ||
        (relatedCase.complainants && relatedCase.complainants.some((c) => c.name.toLowerCase() === userName || c.id === userId));

      const isPersonInvolved = 
        relatedCase.personsInvolved && 
        relatedCase.personsInvolved.some((p) => p.name.toLowerCase() === userName || p.id === userId);

      if (isReporter || isPersonInvolved) {
        return true;
      }
    }

    return false;
  }

  // ----------------------------------------------------
  // BARANGAY OFFICIAL ROLE FILTERING
  // ----------------------------------------------------
  if (userAgencyType === 'BARANGAY') {
    // If targeted to all BARANGAY agency or specific role
    if (notif.targetAgencyTypes?.includes('BARANGAY') || notif.targetAgency === 'BARANGAY') {
      if (!notif.targetBarangay || notif.targetBarangay === userBarangay) {
        return true;
      }
    }

    // If targeted specifically to this barangay
    if (notif.targetBarangay && notif.targetBarangay === userBarangay) {
      return true;
    }

    if (notif.targetAgency === user.agencyName) {
      return true;
    }

    // Check if case is located in or handled by this Barangay
    if (relatedCase) {
      if (relatedCase.barangay === userBarangay || relatedCase.originatingAgency.includes(userBarangay || '')) {
        return true;
      }
    }

    return false;
  }

  // ----------------------------------------------------
  // LGU / MUNICIPAL EXECUTIVE & ADMIN FILTERING
  // ----------------------------------------------------
  if (userAgencyType === 'LGU' || userRole === 'LGU_ADMINISTRATOR' || userRole === 'LGU_OFFICER') {
    // LGU as Admin sees all municipal alerts, referrals, welfare cases, and directives
    if (
      notif.targetAgencyTypes?.includes('LGU') || 
      notif.targetAgencyTypes?.includes('ADMIN') ||
      notif.targetAgency === 'LGU' || 
      notif.targetAgency === 'ADMIN' ||
      (notif.targetAgency && notif.targetAgency.toLowerCase().includes('lgu')) ||
      (notif.targetAgency && notif.targetAgency.toLowerCase().includes('municipal')) ||
      notif.type === 'system'
    ) {
      return true;
    }

    if (relatedCase) {
      return true;
    }

    return true;
  }

  // ----------------------------------------------------
  // SYSTEM ADMIN ROLE FILTERING
  // ----------------------------------------------------
  if (userAgencyType === 'ADMIN' || userRole === 'SYSTEM_ADMIN') {
    // Admin sees all system, security, registration, and network notifications
    return true;
  }

  return true;
}

/**
 * Filters a notification list for a specific active user.
 */
export function filterNotificationsForUser(
  notifications: NotificationItem[],
  user: User,
  cases: Case[] = []
): NotificationItem[] {
  if (!notifications || !Array.isArray(notifications)) return [];
  return notifications.filter((n) => isNotificationForUser(n, user, cases));
}

/**
 * Returns role-specific UI descriptors for the Notification Center dropdown/button.
 */
export function getRoleNotificationMeta(agencyType: AgencyType, barangay?: string): {
  centerTitle: string;
  badgeLabel: string;
  subHeader: string;
  themeColor: string;
  borderBadge: string;
  emptyMessage: string;
  quickFilters: { id: string; label: string }[];
} {
  switch (agencyType) {
    case 'RESIDENT':
      return {
        centerTitle: 'Citizen Notification Center',
        badgeLabel: `Resident • Brgy. ${barangay || 'San Aquilino'}`,
        subHeader: 'Real-time hearing summons, Lupon milestones, and report status',
        themeColor: 'bg-emerald-600 text-white',
        borderBadge: 'border-emerald-300 bg-emerald-50 text-emerald-800',
        emptyMessage: 'No active incident alerts or hearings for your submitted reports.',
        quickFilters: [
          { id: 'ALL', label: 'All Alerts' },
          { id: 'CASES', label: 'My Report Updates' },
          { id: 'HEARINGS', label: 'Lupon Summons' },
          { id: 'ADVISORIES', label: 'Community Notices' }
        ]
      };
    case 'BARANGAY':
      return {
        centerTitle: 'Barangay Lupon & Peace Desk Alerts',
        badgeLabel: `Barangay ${barangay || 'San Aquilino'} LGU`,
        subHeader: 'Incoming resident blotter reports, summons deadlines, and KP conciliation',
        themeColor: 'bg-teal-700 text-white',
        borderBadge: 'border-teal-300 bg-teal-50 text-teal-900',
        emptyMessage: `No active blotter alerts in Barangay ${barangay || 'San Aquilino'}.`,
        quickFilters: [
          { id: 'ALL', label: 'All Barangay Alerts' },
          { id: 'REPORTS', label: 'Resident Reports' },
          { id: 'MEDIATION', label: 'Lupon Hearings' },
          { id: 'REFERRALS', label: 'Inter-Agency' }
        ]
      };
    case 'LGU':
      return {
        centerTitle: 'LGU Municipal Administrator & Executive Feed',
        badgeLabel: 'Municipal Government of Roxas',
        subHeader: 'Cross-barangay dispute referrals, directives, and municipal permits',
        themeColor: 'bg-emerald-700 text-white',
        borderBadge: 'border-emerald-300 bg-emerald-50 text-emerald-900',
        emptyMessage: 'No pending municipal action items or administrative directives.',
        quickFilters: [
          { id: 'ALL', label: 'All LGU Alerts' },
          { id: 'REFERRALS', label: 'Referrals' },
          { id: 'DIRECTIVES', label: 'Directives & Oversight' }
        ]
      };
    case 'ADMIN':
    default:
      return {
        centerTitle: 'System Administration & Security Ledger',
        badgeLabel: 'B-CONNECT Network Admin Node',
        subHeader: 'Officer account registrations, system audits, and database events',
        themeColor: 'bg-slate-900 text-white',
        borderBadge: 'border-slate-300 bg-slate-100 text-slate-900',
        emptyMessage: 'No system security anomalies or pending administrative approvals.',
        quickFilters: [
          { id: 'ALL', label: 'All Network Alerts' },
          { id: 'ACCOUNTS', label: 'Account Registrations' },
          { id: 'SYSTEM', label: 'System Audits' }
        ]
      };
  }
}
