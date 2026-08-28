import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { CaseContext } from '../context/CaseContext';
import { NotificationContext } from '../context/NotificationContext';
import { supabase } from '../utils/supabaseClient';
import { Case, CaseStatus, TimelineEvent, AgencyType, UserRole } from '../types';

const VALID_6_BARANGAYS: string[] = ['San Aquilino', 'Bagumbayan', 'Libertad', 'Odiong', 'San Miguel', 'Victoria'];

export const useCases = () => {
  const caseState = useContext(CaseContext);
  const authState = useContext(AuthContext);
  const notifState = useContext(NotificationContext);

  if (!caseState) throw new Error('useCases must be used within CaseProvider');
  if (!authState) throw new Error('useCases must be used within AuthProvider');

  const { cases, setCases, auditLogs, setAuditLogs, selectedCaseId, setSelectedCaseId } = caseState;
  const { currentUser } = authState;

  const selectedCase = selectedCaseId ? cases.find(c => c.id === selectedCaseId) || null : null;

  const logActivity = (action: string, caseId?: string, details?: string, previousValue?: string, newValue?: string) => {
    const newLog = {
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
    supabase.from('audit_logs').insert(newLog).then(({error}) => { if (error) console.error(error) });
  };

  const triggerNotification = (
    title: string, message: string, type: any = 'system', caseId?: string, targetAgency?: string, priority: 'normal' | 'high' | 'urgent' = 'normal', options?: any
  ) => {
    if (!notifState) return;
    const uniqueId = `NOTIF-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const newNotif = {
      id: uniqueId,
      title, message, type, caseId, timestamp: new Date().toISOString(), isRead: false, targetAgency, priority, ...options
    };
    notifState.setNotifications((prev) => [newNotif, ...(prev || [])]);
    supabase.from('notifications').insert(newNotif).then(({error}) => { if (error) console.error(error) });
  };

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

    const isAccident = true; // Hardcoded in original file

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
      imageUrls: data.imageUrls || [],
      dateCreated: now,
      dateLastUpdated: now,
      createdBy: `${currentUser.name} (${currentUser.agencyName})`,
      isConfidential: !!data.isConfidential
    };

    setCases((prev) => [newCaseItem, ...prev]);
    supabase.from('cases').insert(newCaseItem).then(({error}) => { if (error) console.error(error) });

    logActivity('CASE_CREATED', caseId, `Registered new case ${caseId} (${newCaseItem.title}) at ${currentUser.agencyName}`);

    if (newCaseItem.isAccidentEmergency) {
      triggerNotification(
        `🚨 VEHICULAR ACCIDENT ALERT: Brgy. ${newCaseItem.barangay}`,
        `URGENT ALARM: Road/vehicular accident reported at ${newCaseItem.specificLocation}. Resident report #${caseId}. Immediate Tanod & First Responder deployment requested!`,
        'case_registered', caseId, 'BARANGAY', 'urgent',
        { targetAgencyTypes: ['BARANGAY'], targetBarangay: newCaseItem.barangay }
      );
    }

    if (newCaseItem.isCitizenReport || currentUser.agencyType === 'RESIDENT') {
      triggerNotification(
        'Incident Report Docketed',
        `Your report #${caseId} ("${newCaseItem.title}") has been received by Barangay ${newCaseItem.barangay} Lupon Tagapamayapa.`,
        'status_update', caseId, 'RESIDENT', 'normal',
        { targetAgencyTypes: ['RESIDENT'], targetRoles: ['RESIDENT'], targetUserId: currentUser.id, targetBarangay: newCaseItem.barangay }
      );

      if (!newCaseItem.isAccidentEmergency) {
        triggerNotification(
          `New Resident Report in Brgy. ${newCaseItem.barangay}`,
          `Resident submitted Case #${caseId}: "${newCaseItem.title}". Queued for Lupon review.`,
          'case_registered', caseId, 'BARANGAY', newCaseItem.priority === 'Urgent' ? 'urgent' : 'normal',
          { targetAgencyTypes: ['BARANGAY'], targetBarangay: newCaseItem.barangay }
        );
      }
    } else {
      if (!newCaseItem.isAccidentEmergency) {
        triggerNotification(
          `New Incident Docketed: #${caseId}`,
          `${currentUser.agencyName} registered Case #${caseId}: "${newCaseItem.title}"`,
          'system', caseId, currentUser.agencyName, newCaseItem.priority === 'Urgent' ? 'urgent' : 'normal',
          { targetAgencyTypes: currentUser.agencyType === 'BARANGAY' ? ['BARANGAY', 'ADMIN'] : ['ADMIN', currentUser.agencyType], targetBarangay: newCaseItem.barangay }
        );
      }
    }
    return caseId;
  };

  const updateCaseStatus = (caseId: string, newStatus: CaseStatus, reason: string, remarks?: string) => {
    const now = new Date().toISOString();
    setCases((prev) =>
      prev.map((c) => {
        if (c.id !== caseId) return c;
        const isNowResolved = newStatus === 'Resolved';
        const newStatusItem = {
          id: `SH-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          previousStatus: c.status, newStatus, reason,
          changedBy: currentUser.name, changedByRole: currentUser.position,
          agency: currentUser.agencyName, timestamp: now, remarks
        };
        const newTimelineEvent: TimelineEvent = {
          id: `TL-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          caseId, title: `Status Changed to: ${newStatus}`,
          description: `${reason}${remarks ? ` - Remarks: ${remarks}` : ''}`,
          stage: isNowResolved ? 'Resolution' : 'Status Update',
          actorName: currentUser.name, actorRole: currentUser.position,
          actorAgency: currentUser.agencyName, timestamp: now
        };
        const updatedCase = {
          ...c, status: newStatus,
          dateResolved: isNowResolved ? now : c.dateResolved,
          resolutionSummary: isNowResolved ? (remarks || reason) : c.resolutionSummary,
          dateLastUpdated: now,
          statusHistory: [newStatusItem, ...c.statusHistory],
          timeline: [...c.timeline, newTimelineEvent],
        };
        supabase.from('cases').update({
          status: updatedCase.status, dateResolved: updatedCase.dateResolved,
          resolutionSummary: updatedCase.resolutionSummary, dateLastUpdated: updatedCase.dateLastUpdated,
          statusHistory: updatedCase.statusHistory, timeline: updatedCase.timeline
        }).eq('id', caseId).then(({error}) => { if (error) console.error(error) });
        return updatedCase;
      })
    );
    logActivity('CASE_STATUS_UPDATED', caseId, `${currentUser.name} (${currentUser.agencyName}) updated status of #${caseId} to "${newStatus}". Reason: ${reason}`, undefined, newStatus);
    triggerNotification(`Status Update: #${caseId}`, `Case #${caseId} updated to "${newStatus}" by ${currentUser.agencyName}.`, 'status_update', caseId);
  };

  const addCaseTimelineEvent = (caseId: string, title: string, description: string, stage: TimelineEvent['stage']) => {
    const now = new Date().toISOString();
    const newEvent: TimelineEvent = {
      id: `TL-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      caseId, title, description, stage, actorName: currentUser.name, actorRole: currentUser.position, actorAgency: currentUser.agencyName, timestamp: now
    };
    setCases((prev) =>
      prev.map((c) => {
        if (c.id !== caseId) return c;
        const updatedCase = { ...c, timeline: [...c.timeline, newEvent], dateLastUpdated: now };
        supabase.from('cases').update({ timeline: updatedCase.timeline, dateLastUpdated: updatedCase.dateLastUpdated }).eq('id', caseId).then(({error}) => { if (error) console.error(error) });
        return updatedCase;
      })
    );
    logActivity('TIMELINE_EVENT_ADDED', caseId, `Added timeline milestone: "${title}"`);
  };

  return {
    ...caseState,
    selectedCase,
    createCase,
    updateCaseStatus,
    addCaseTimelineEvent,
    logActivity
  };
};
