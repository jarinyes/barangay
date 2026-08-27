import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { 
  Case, 
  User, 
  AuditLog, 
  NotificationItem, 
  CaseStatus, 
  TimelineEvent, 
  GraphNode, 
  GraphEdge, 
  GraphCluster,
  AgencyType,
  UserRole
} from '../types';
import { SEED_USERS, SEED_CASES, SEED_AUDIT_LOGS, SEED_NOTIFICATIONS } from '../data/seedData';
import { buildGraphFromCases } from '../utils/graphEngine';
import { calculateDaysDifference } from '../utils/reportGenerators';
import { filterNotificationsForUser } from '../utils/notificationHelpers';

interface AppContextType {
  isAuthenticated: boolean;
  login: (user: User) => void;
  loginWithCredentials: (emailOrId: string, passcode?: string) => { success: boolean; message?: string };
  logout: () => void;
  currentUser: User;
  setCurrentUser: (user: User) => void;
  users: User[];
  addUser: (newUser: Omit<User, 'id'> & { id?: string }) => User;
  updateUser: (userId: string, updatedData: Partial<User>) => User | null;
  deleteUser: (userId: string) => void;
  clearAllUsers: () => void;
  cases: Case[];
  auditLogs: AuditLog[];
  notifications: NotificationItem[];
  userNotifications: NotificationItem[];
  unreadNotifCount: number;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedCaseId: string | null;
  setSelectedCaseId: (id: string | null) => void;
  selectedCase: Case | null;
  isNewCaseModalOpen: boolean;
  setIsNewCaseModalOpen: (open: boolean) => void;
  isCreateAccountModalOpen: boolean;
  setIsCreateAccountModalOpen: (open: boolean) => void;
  isEditAccountModalOpen: boolean;
  setIsEditAccountModalOpen: (open: boolean) => void;
  userToEdit: User | null;
  setUserToEdit: (user: User | null) => void;
  openEditAccountModal: (user?: User) => void;
  
  // Search & Filter state
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  filterBarangay: string;
  setFilterBarangay: (b: string) => void;
  filterStatus: string;
  setFilterStatus: (s: string) => void;
  filterCategory: string;
  setFilterCategory: (c: string) => void;
  filterOfficialInvolved: 'ALL' | 'YES' | 'NO';
  setFilterOfficialInvolved: (val: 'ALL' | 'YES' | 'NO') => void;
  filterAgency: string;
  setFilterAgency: (a: string) => void;
  
  // Operations
  createCase: (newCase: Partial<Case>) => string;
  updateCaseStatus: (caseId: string, newStatus: CaseStatus, reason: string, remarks?: string) => void;
  addCaseTimelineEvent: (caseId: string, title: string, description: string, stage: TimelineEvent['stage']) => void;
  triggerNotification: (
    title: string, 
    message: string, 
    type?: NotificationItem['type'], 
    caseId?: string, 
    targetAgency?: string,
    priority?: 'normal' | 'high' | 'urgent',
    options?: {
      targetAgencyTypes?: AgencyType[];
      targetRoles?: UserRole[];
      targetBarangay?: string;
      targetUserId?: string;
      targetResidentName?: string;
      actionUrl?: string;
    }
  ) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  logActivity: (action: string, caseId?: string, details?: string, previousValue?: string, newValue?: string) => void;
  resetToDefaults: () => void;
  
  // Graph algorithm output
  graphData: {
    nodes: GraphNode[];
    edges: GraphEdge[];
    clusters: GraphCluster[];
  };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_CASES_KEY = 'bconnect_roxas_cases_v7';
const LOCAL_STORAGE_LOGS_KEY = 'bconnect_roxas_logs_v7';
const LOCAL_STORAGE_NOTIFS_KEY = 'bconnect_roxas_notifs_v7';
const LOCAL_STORAGE_USER_KEY = 'bconnect_roxas_user_v11';
const LOCAL_STORAGE_USERS_KEY = 'bconnect_roxas_users_v11';
const LOCAL_STORAGE_AUTH_KEY = 'bconnect_roxas_auth_status_v11';

const VALID_6_BARANGAYS: string[] = ['San Aquilino', 'Bagumbayan', 'Libertad', 'Odiong', 'San Miguel', 'Victoria'];

const sanitizeCaseBarangay = (rawCase: any): Case => {
  let b = rawCase.barangay;
  if (!VALID_6_BARANGAYS.includes(b)) {
    b = 'San Aquilino';
  }
  
  return {
    ...rawCase,
    barangay: b,
    personsInvolved: Array.isArray(rawCase.personsInvolved) ? rawCase.personsInvolved.map((p: any) => ({
      ...p,
      barangay: VALID_6_BARANGAYS.includes(p.barangay) ? p.barangay : b
    })) : [],
    statusHistory: Array.isArray(rawCase.statusHistory) ? rawCase.statusHistory : []
  };
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Authentication status
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const savedAuth = localStorage.getItem(LOCAL_STORAGE_AUTH_KEY);
    if (savedAuth !== null) {
      return savedAuth === 'true';
    }
    // Default to true for convenience if user already had a saved session, or false for clean login
    const savedUser = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
    return !!savedUser;
  });

  // Users state
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_USERS_KEY);
    if (saved) {
      try { 
        const parsed = JSON.parse(saved); 
        if (Array.isArray(parsed) && parsed.length > 0) {
          const filtered = parsed
            .filter((u: any) => 
              u.agencyType !== 'POLICE' && 
              u.agencyType !== 'DILG' && 
              u.role !== 'POLICE_CHIEF' && 
              u.role !== 'POLICE_OFFICER' &&
              u.role !== 'DILG_DIRECTOR' &&
              u.role !== 'DILG_OFFICER'
            )
            .map((u: User) => ({
              ...u,
              passcode: u.passcode || 'jarinyes'
            }));
          if (filtered.length > 0) return filtered;
        }
      } catch {}
    }
    return SEED_USERS;
  });

  // Current user / role
  const [currentUser, setCurrentUserState] = useState<User>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
    if (saved) {
      try { 
        const parsed = JSON.parse(saved); 
        if (parsed && typeof parsed === 'object' && parsed.id && parsed.name && (parsed.agencyType as any) !== 'POLICE' && (parsed.agencyType as any) !== 'DILG') {
          return parsed;
        }
      } catch {}
    }
    return SEED_USERS[0]; // Barangay San Aquilino / Master Admin
  });

  const login = (user: User) => {
    setCurrentUserState(user);
    setIsAuthenticated(true);
    localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(user));
    localStorage.setItem(LOCAL_STORAGE_AUTH_KEY, 'true');
    logActivity('USER_LOGIN', undefined, `Officer ${user.name} (${user.position}, ${user.agencyName}) logged in to B-CONNECT.`);
  };

  const loginWithCredentials = (emailOrId: string, passcode?: string): { success: boolean; message?: string } => {
    const cleanQuery = emailOrId.trim().toLowerCase();
    if (!cleanQuery) {
      return { success: false, message: 'Please enter your Official Email, User ID, or Badge ID.' };
    }

    const matchedUser = (users || []).find((u) => 
      u.email.toLowerCase() === cleanQuery || 
      u.id.toLowerCase() === cleanQuery || 
      (u.badgeOrIdNumber && u.badgeOrIdNumber.toLowerCase() === cleanQuery) ||
      u.name.toLowerCase() === cleanQuery ||
      u.name.toLowerCase().includes(cleanQuery)
    );

    if (matchedUser) {
      const cleanPass = (passcode || '').trim();
      const expectedPass = (matchedUser.passcode || 'jarinyes').trim();

      if (!cleanPass) {
        return {
          success: false,
          message: 'Please enter your password / passcode.'
        };
      }

      // Check if password matches the user's registered password
      if (cleanPass !== expectedPass) {
        return {
          success: false,
          message: 'Incorrect password. The password you entered does not match this account.'
        };
      }

      login(matchedUser);
      return { success: true };
    }

    return { 
      success: false, 
      message: 'Authentication failed. No officer account found matching the provided identifier.' 
    };
  };

  const logout = () => {
    logActivity('USER_LOGOUT', undefined, `Officer ${currentUser.name} logged out.`);
    setIsAuthenticated(false);
    localStorage.setItem(LOCAL_STORAGE_AUTH_KEY, 'false');
  };

  const setCurrentUser = (user: User) => {
    setCurrentUserState(user);
    setIsAuthenticated(true);
    localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(user));
    localStorage.setItem(LOCAL_STORAGE_AUTH_KEY, 'true');
    logActivity('USER_ROLE_SWITCH', undefined, `Switched active session to ${user.name} (${user.position}, ${user.agencyName})`);
  };

  const addUser = (newUserData: Omit<User, 'id'> & { id?: string }): User => {
    const userId = newUserData.id || `USR-${newUserData.agencyType.slice(0, 3)}-${String((users?.length || 0) + 1).padStart(2, '0')}`;
    const newUser: User = {
      ...newUserData,
      id: userId
    };

    setUsers((prev) => {
      const updated = [...(prev || []), newUser];
      localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(updated));
      return updated;
    });

    logActivity(
      'ACCOUNT_CREATED', 
      undefined, 
      `Registered new official user account: ${newUser.name} (${newUser.position}, ${newUser.agencyName}) under role tier ${newUser.role}.`
    );

    // Explicitly target ADMIN only so residents and other non-admin roles do not see account creations
    triggerNotification(
      'New Account Registered',
      `Officer account ${newUser.name} (${newUser.position}) has been authorized in the B-CONNECT network.`,
      'system',
      undefined,
      'ADMIN',
      'normal',
      {
        targetAgencyTypes: ['ADMIN'],
        targetRoles: ['SYSTEM_ADMIN']
      }
    );

    return newUser;
  };

  const deleteUser = (userId: string) => {
    setUsers((prev) => {
      const updated = (prev || []).filter((u) => u.id !== userId);
      localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(updated));

      if (currentUser?.id === userId) {
        if (updated.length > 0) {
          setCurrentUserState(updated[0]);
          localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(updated[0]));
        } else {
          setIsAuthenticated(false);
          localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
          localStorage.setItem(LOCAL_STORAGE_AUTH_KEY, 'false');
        }
      }
      return updated;
    });
    logActivity('ACCOUNT_DELETED', undefined, `Removed user account ID ${userId}`);
  };

  const updateUser = (userId: string, updatedData: Partial<User>): User | null => {
    let resultUser: User | null = null;

    setUsers((prev) => {
      const list = prev || [];
      const updated = list.map((u) => {
        if (u.id === userId) {
          resultUser = {
            ...u,
            ...updatedData,
            id: u.id // preserve user ID
          };
          return resultUser;
        }
        return u;
      });

      localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(updated));

      if (currentUser?.id === userId && resultUser) {
        setCurrentUserState(resultUser);
        localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(resultUser));
      }

      return updated;
    });

    if (resultUser) {
      logActivity('ACCOUNT_UPDATED', undefined, `Updated account information for ${(resultUser as User).name} (${(resultUser as User).position})`);
    }

    return resultUser;
  };

  const clearAllUsers = () => {
    setUsers([]);
    localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify([]));
    localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
    localStorage.setItem(LOCAL_STORAGE_AUTH_KEY, 'false');
    setIsAuthenticated(false);
    logActivity('ACCOUNTS_CLEARED', undefined, 'All previous accounts have been deleted. Ready to register new accounts.');
  };

  // Cases state
  const [cases, setCases] = useState<Case[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_CASES_KEY);
    if (saved) {
      try { 
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((c: any) => sanitizeCaseBarangay(c));
        }
      } catch {}
    }
    return SEED_CASES.map((c) => sanitizeCaseBarangay(c));
  });

  // Audit logs state
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_LOGS_KEY);
    if (saved) {
      try { 
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch {}
    }
    return SEED_AUDIT_LOGS;
  });

  // Notifications state
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_NOTIFS_KEY);
    if (saved) {
      try { 
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const seenIds = new Set<string>();
          const deduped: NotificationItem[] = [];
          parsed.forEach((n: any, idx: number) => {
            let cleanId = n?.id ? String(n.id) : `NOTIF-${Date.now()}-${idx}`;
            if (seenIds.has(cleanId)) {
              cleanId = `${cleanId}-${idx}-${Math.random().toString(36).substring(2, 6)}`;
            }
            seenIds.add(cleanId);
            deduped.push({ ...n, id: cleanId });
          });
          return deduped;
        }
      } catch {}
    }
    return SEED_NOTIFICATIONS;
  });

  // UI Navigation & Filters
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [isNewCaseModalOpen, setIsNewCaseModalOpen] = useState<boolean>(false);
  const [isCreateAccountModalOpen, setIsCreateAccountModalOpen] = useState<boolean>(false);
  const [isEditAccountModalOpen, setIsEditAccountModalOpen] = useState<boolean>(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);

  const openEditAccountModal = (user?: User) => {
    setUserToEdit(user || currentUser);
    setIsEditAccountModalOpen(true);
  };

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterBarangay, setFilterBarangay] = useState<string>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
    if (saved) {
      try {
        const u = JSON.parse(saved);
        if (u?.agencyType === 'BARANGAY' && u.barangay) return u.barangay;
      } catch {}
    }
    return 'ALL';
  });
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterOfficialInvolved, setFilterOfficialInvolved] = useState<'ALL' | 'YES' | 'NO'>('ALL');
  const [filterAgency, setFilterAgency] = useState<string>('ALL');

  // Auto-align filterBarangay whenever active user changes
  useEffect(() => {
    if (currentUser?.agencyType === 'BARANGAY' && currentUser.barangay) {
      setFilterBarangay(currentUser.barangay);
    }
  }, [currentUser]);

  // Persistence effects
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_CASES_KEY, JSON.stringify(cases));
  }, [cases]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_LOGS_KEY, JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_NOTIFS_KEY, JSON.stringify(notifications));
  }, [notifications]);

  // Selected case helper
  const selectedCase = useMemo(() => {
    if (!selectedCaseId) return null;
    return cases.find((c) => c.id === selectedCaseId) || null;
  }, [cases, selectedCaseId]);

  // Graph algorithm execution
  const graphData = useMemo(() => {
    return buildGraphFromCases(cases);
  }, [cases]);

  const userNotifications = useMemo(() => {
    return filterNotificationsForUser(notifications, currentUser, cases);
  }, [notifications, currentUser, cases]);

  const unreadNotifCount = useMemo(() => {
    return (userNotifications || []).filter((n) => !n.isRead).length;
  }, [userNotifications]);

  // Logging function
  const logActivity = (
    action: string, 
    caseId?: string, 
    details?: string, 
    previousValue?: string, 
    newValue?: string
  ) => {
    const newLog: AuditLog = {
      id: `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      userId: currentUser.id,
      userName: currentUser.name,
      role: currentUser.position,
      agency: currentUser.agencyName,
      action,
      caseId,
      previousValue,
      newValue,
      details: details || `User ${currentUser.name} executed ${action}`,
      ipAddress: '192.168.1.104 (LGU-Secure-VPN)'
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Notification helper
  const triggerNotification = (
    title: string, 
    message: string, 
    type: NotificationItem['type'] = 'system', 
    caseId?: string, 
    targetAgency?: string,
    priority: 'normal' | 'high' | 'urgent' = 'normal',
    options?: {
      targetAgencyTypes?: AgencyType[];
      targetRoles?: UserRole[];
      targetBarangay?: string;
      targetUserId?: string;
      targetResidentName?: string;
      actionUrl?: string;
    }
  ) => {
    const uniqueId = `NOTIF-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const newNotif: NotificationItem = {
      id: uniqueId,
      title,
      message,
      type,
      caseId,
      timestamp: new Date().toISOString(),
      isRead: false,
      targetAgency,
      priority,
      targetAgencyTypes: options?.targetAgencyTypes,
      targetRoles: options?.targetRoles,
      targetBarangay: options?.targetBarangay,
      targetUserId: options?.targetUserId,
      targetResidentName: options?.targetResidentName,
      actionUrl: options?.actionUrl
    };
    setNotifications((prev) => [newNotif, ...(prev || [])]);
  };

  // Case Operations
  const createCase = (data: Partial<Case>): string => {
    const year = new Date().getFullYear();
    const count = cases.filter((c) => c.id.startsWith(`BC-${year}`)).length + 1;
    const caseId = `BC-${year}-${String(count).padStart(3, '0')}`;
    const incidentId = `INC-${year}-${String(count).padStart(3, '0')}`;
    const complaintId = `CMP-${year}-${String(count).padStart(3, '0')}`;

    const now = new Date().toISOString();


    const initialTimeline: TimelineEvent[] = [
      {
        id: `TL-${Date.now()}-1-${Math.random().toString(36).substring(2, 6)}`,
        caseId,
        title: 'Report Received & Case Registered',
        description: `Case registered by ${currentUser.name} at ${currentUser.agencyName}. Initial classification: ${data.category}.`,
        stage: 'Report Filed',
        actorName: currentUser.name,
        actorRole: currentUser.position,
        actorAgency: currentUser.agencyName,
        timestamp: now
      }
    ];

    if (data.isInvolvingOfficial) {
      initialTimeline.push({
        id: `TL-${Date.now()}-2-${Math.random().toString(36).substring(2, 6)}`,
        caseId,
        title: 'Official Involvement Recorded',
        description: `Involves ${data.officialInvolvedPosition || 'Official'} (${data.officialInvolvedName || 'Named Person'}). Flagged for cross-agency oversight.`,
        stage: 'Initial Assessment',
        actorName: currentUser.name,
        actorRole: currentUser.position,
        actorAgency: currentUser.agencyName,
        timestamp: now
      });
    }

    const isAccident = true; // System is exclusively for vehicular accidents & crashes

    const newCaseItem: Case = {
      id: caseId,
      incidentId,
      complaintId,
      title: data.title || 'Untitled Vehicular Accident Report',
      category: data.category || 'Motorcycle vs Motorcycle Collision',
      description: data.description || '',
      initialNarrative: data.initialNarrative || data.description || '',
      currentNarrativeSummary: data.initialNarrative || '',
      dateReported: data.dateReported || now,
      incidentDate: data.incidentDate || now.split('T')[0],
      barangay: (data.barangay && VALID_6_BARANGAYS.includes(data.barangay)) ? data.barangay : (currentUser.barangay || 'San Aquilino'),
      specificLocation: data.specificLocation || `Barangay ${(data.barangay && VALID_6_BARANGAYS.includes(data.barangay)) ? data.barangay : (currentUser.barangay || 'San Aquilino')}, Roxas`,
      
      complainants: data.complainants || [],
      respondents: data.respondents || [],
      witnesses: data.witnesses || [],
      personsInvolved: [...(data.complainants || []), ...(data.respondents || [])],
      
      isAccidentEmergency: isAccident || !!data.isAccidentEmergency,
      accidentVehicleDetails: data.accidentVehicleDetails || (isAccident ? 'Motorcycle / Road Vehicle Incident' : undefined),
      accidentCasualties: data.accidentCasualties,
      isAccidentProneArea: data.isAccidentProneArea ?? isAccident,
      residentReporterId: data.residentReporterId || (currentUser.agencyType === 'RESIDENT' ? currentUser.id : undefined),
      isCitizenReport: !!data.isCitizenReport || currentUser.agencyType === 'RESIDENT',
      status: data.status || 'Unresolved',
      
      isInvolvingOfficial: !!data.isInvolvingOfficial,
      officialInvolvedType: data.officialInvolvedType || 'None',
      officialInvolvedName: data.officialInvolvedName,
      officialInvolvedPosition: data.officialInvolvedPosition,
      officialInvolvedAgency: data.officialInvolvedAgency,
      
      originatingAgency: currentUser.agencyName,
      currentHandlingAgency: data.currentHandlingAgency || currentUser.agencyName,
      assignedPersonnel: data.assignedPersonnel || `${currentUser.name} (${currentUser.position})`,
      assignedPersonnelContact: data.assignedPersonnelContact,
      priority: isAccident ? 'Urgent' : (data.priority || 'Medium'),
      
      statusHistory: [
        {
          id: `SH-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          previousStatus: 'Unresolved',
          newStatus: data.status || 'Unresolved',
          reason: 'Initial case creation and registration',
          changedBy: currentUser.name,
          changedByRole: currentUser.position,
          agency: currentUser.agencyName,
          timestamp: now
        }
      ],
      timeline: initialTimeline,
      
      dateCreated: now,
      dateLastUpdated: now,
      createdBy: `${currentUser.name} (${currentUser.agencyName})`,
      isConfidential: !!data.isConfidential
    };

    setCases((prev) => [newCaseItem, ...prev]);

    logActivity(
      'CASE_CREATED', 
      caseId, 
      `Registered new case ${caseId} (${newCaseItem.title}) at ${currentUser.agencyName}`
    );

    // If accident emergency, trigger immediate siren alarm notification to Barangay
    if (newCaseItem.isAccidentEmergency) {
      triggerNotification(
        `🚨 VEHICULAR ACCIDENT ALERT: Brgy. ${newCaseItem.barangay}`,
        `URGENT ALARM: Road/vehicular accident reported at ${newCaseItem.specificLocation}. Resident report #${caseId}. Immediate Tanod & First Responder deployment requested!`,
        'case_registered',
        caseId,
        'BARANGAY',
        'urgent',
        {
          targetAgencyTypes: ['BARANGAY'],
          targetBarangay: newCaseItem.barangay
        }
      );
    }

    if (newCaseItem.isCitizenReport || currentUser.agencyType === 'RESIDENT') {
      // 1. Send citizen confirmation (for the resident)
      triggerNotification(
        'Incident Report Docketed',
        `Your report #${caseId} ("${newCaseItem.title}") has been received by Barangay ${newCaseItem.barangay} Lupon Tagapamayapa.`,
        'status_update',
        caseId,
        'RESIDENT',
        'normal',
        {
          targetAgencyTypes: ['RESIDENT'],
          targetRoles: ['RESIDENT'],
          targetUserId: currentUser.id,
          targetBarangay: newCaseItem.barangay
        }
      );

      // 2. Alert Barangay Lupon & officials of incoming report (if not already alerted via accident alarm)
      if (!newCaseItem.isAccidentEmergency) {
        triggerNotification(
          `New Resident Report in Brgy. ${newCaseItem.barangay}`,
          `Resident submitted Case #${caseId}: "${newCaseItem.title}". Queued for Lupon review.`,
          'case_registered',
          caseId,
          'BARANGAY',
          newCaseItem.priority === 'Urgent' ? 'urgent' : 'normal',
          {
            targetAgencyTypes: ['BARANGAY'],
            targetBarangay: newCaseItem.barangay
          }
        );
      }
    } else {
      // Officer created case - notify respective agency and system admin
      if (!newCaseItem.isAccidentEmergency) {
        triggerNotification(
          `New Incident Docketed: #${caseId}`,
          `${currentUser.agencyName} registered Case #${caseId}: "${newCaseItem.title}"`,
          'system',
          caseId,
          currentUser.agencyName,
          newCaseItem.priority === 'Urgent' ? 'urgent' : 'normal',
          {
            targetAgencyTypes: currentUser.agencyType === 'BARANGAY' ? ['BARANGAY', 'ADMIN'] : ['ADMIN', currentUser.agencyType],
            targetBarangay: newCaseItem.barangay
          }
        );
      }
    }



    return caseId;
  };

  const updateCaseStatus = (
    caseId: string, 
    newStatus: CaseStatus, 
    reason: string, 
    remarks?: string
  ) => {
    const now = new Date().toISOString();
    let updatedCaseTitle = '';

    setCases((prev) =>
      prev.map((c) => {
        if (c.id !== caseId) return c;
        updatedCaseTitle = c.title;

        const isNowResolved = newStatus === 'Resolved';

        const newStatusItem = {
          id: `SH-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          previousStatus: c.status,
          newStatus,
          reason,
          changedBy: currentUser.name,
          changedByRole: currentUser.position,
          agency: currentUser.agencyName,
          timestamp: now,
          remarks
        };

        const newTimelineEvent: TimelineEvent = {
          id: `TL-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          caseId,
          title: `Status Changed to: ${newStatus}`,
          description: `${reason}${remarks ? ` - Remarks: ${remarks}` : ''}`,
          stage: isNowResolved ? 'Resolution' : 'Status Update',
          actorName: currentUser.name,
          actorRole: currentUser.position,
          actorAgency: currentUser.agencyName,
          timestamp: now
        };

        return {
          ...c,
          status: newStatus,
          dateResolved: isNowResolved ? now : c.dateResolved,
          resolutionSummary: isNowResolved ? (remarks || reason) : c.resolutionSummary,
          dateLastUpdated: now,
          statusHistory: [newStatusItem, ...c.statusHistory],
          timeline: [...c.timeline, newTimelineEvent],
        };
      })
    );

    logActivity(
      'CASE_STATUS_UPDATED',
      caseId,
      `${currentUser.name} (${currentUser.agencyName}) updated status of #${caseId} to "${newStatus}". Reason: ${reason}`,
      undefined,
      newStatus
    );

    triggerNotification(
      `Status Update: #${caseId}`,
      `Case #${caseId} updated to "${newStatus}" by ${currentUser.agencyName}.`,
      'status_update',
      caseId
    );
  };



  const addCaseTimelineEvent = (
    caseId: string, 
    title: string, 
    description: string, 
    stage: TimelineEvent['stage']
  ) => {
    const now = new Date().toISOString();
    const newEvent: TimelineEvent = {
      id: `TL-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      caseId,
      title,
      description,
      stage,
      actorName: currentUser.name,
      actorRole: currentUser.position,
      actorAgency: currentUser.agencyName,
      timestamp: now
    };

    setCases((prev) =>
      prev.map((c) => {
        if (c.id !== caseId) return c;
        return {
          ...c,
          timeline: [...c.timeline, newEvent],
          dateLastUpdated: now
        };
      })
    );

    logActivity('TIMELINE_EVENT_ADDED', caseId, `Added timeline milestone: "${title}"`);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const resetToDefaults = () => {
    localStorage.removeItem(LOCAL_STORAGE_CASES_KEY);
    localStorage.removeItem(LOCAL_STORAGE_LOGS_KEY);
    localStorage.removeItem(LOCAL_STORAGE_NOTIFS_KEY);
    localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
    localStorage.removeItem(LOCAL_STORAGE_USERS_KEY);
    setCases(SEED_CASES);
    setAuditLogs(SEED_AUDIT_LOGS);
    setNotifications(SEED_NOTIFICATIONS);
    setUsers(SEED_USERS);
    setCurrentUserState(SEED_USERS[0]);
    logActivity('SYSTEM_RESET', undefined, 'System state reset to original seed baseline for Roxas, Oriental Mindoro.');
  };

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        login,
        loginWithCredentials,
        logout,
        currentUser,
        setCurrentUser,
        users,
        addUser,
        updateUser,
        deleteUser,
        clearAllUsers,
        cases,
        auditLogs,
        notifications,
        userNotifications,
        unreadNotifCount,
        activeTab,
        setActiveTab,
        selectedCaseId,
        setSelectedCaseId,
        selectedCase,
        isNewCaseModalOpen,
        setIsNewCaseModalOpen,
        isCreateAccountModalOpen,
        setIsCreateAccountModalOpen,
        isEditAccountModalOpen,
        setIsEditAccountModalOpen,
        userToEdit,
        setUserToEdit,
        openEditAccountModal,
        searchQuery,
        setSearchQuery,
        filterBarangay,
        setFilterBarangay,
        filterStatus,
        setFilterStatus,
        filterCategory,
        setFilterCategory,
        filterOfficialInvolved,
        setFilterOfficialInvolved,
        filterAgency,
        setFilterAgency,
        createCase,
        updateCaseStatus,
        addCaseTimelineEvent,
        triggerNotification,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        logActivity,
        resetToDefaults,
        graphData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
