import React, { useState } from 'react';
import { 
  X, 
  FileText, 
  Clock, 
  ArrowRightLeft, 
  FileCheck2, 
  Upload, 
  CheckCircle, 
  AlertTriangle, 
  User, 
  Building2, 
  Shield, 
  Calendar, 
  Printer, 
  Paperclip, 
  MessageSquare,
  AlertCircle,
  Landmark,
  Layers,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StatusBadge, PriorityBadge, OfficialBadge } from '../common/StatusBadge';
import { CaseStatus, PendingReason, DilgRecommendation, TimelineEvent, AGENCIES_LIST } from '../../types';
import { formatDate, formatDateShort } from '../../utils/reportGenerators';

export const CaseDetailModal: React.FC = () => {
  const { 
    selectedCase, 
    setSelectedCaseId, 
    currentUser, 
    updateCaseStatus, 
    updatePendingReason,
    referCase,
    acceptReferral,
    issueDilgRecommendation,
    respondToDilgRecommendation,
    completeDilgRecommendation,
    addCaseAttachment,
    addCaseTimelineEvent
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'pending' | 'referrals' | 'dilg' | 'docs'>('overview');
  
  // Status modal state
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedNewStatus, setSelectedNewStatus] = useState<CaseStatus>('Under Initial Assessment');
  const [statusChangeReason, setStatusChangeReason] = useState('');
  const [statusChangeRemarks, setStatusChangeRemarks] = useState('');

  // Pending reason modal state
  const [isPendingModalOpen, setIsPendingModalOpen] = useState(false);
  const [pendingReasonVal, setPendingReasonVal] = useState<PendingReason>('Awaiting investigation');
  const [pendingExplanationVal, setPendingExplanationVal] = useState('');
  const [requiredNextActionVal, setRequiredNextActionVal] = useState('');

  // Referral modal state
  const [isReferralModalOpen, setIsReferralModalOpen] = useState(false);
  const [targetAgencyVal, setTargetAgencyVal] = useState('POLICE_STATION');
  const [referralReasonVal, setReferralReasonVal] = useState('');
  const [docsTransferredVal, setDocsTransferredVal] = useState('Case Docket, Witness Affidavits, Inspection Photos');

  // DILG Recommendation modal state
  const [isRecModalOpen, setIsRecModalOpen] = useState(false);
  const [recTypeVal, setRecTypeVal] = useState<DilgRecommendation['recommendationType']>('Administrative Compliance Directive');
  const [recDetailsVal, setRecDetailsVal] = useState('');
  const [recPriorityVal, setRecPriorityVal] = useState<'Normal' | 'High' | 'Critical'>('High');
  const [recTargetAgencyVal, setRecTargetAgencyVal] = useState('Barangay Office');
  const [recDeadlineVal, setRecDeadlineVal] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );

  // DILG response state
  const [activeRecResponseId, setActiveRecResponseId] = useState<string | null>(null);
  const [recResponseText, setRecResponseText] = useState('');

  // Attachment upload simulation state
  const [newDocName, setNewDocName] = useState('');
  const [newDocType, setNewDocType] = useState('application/pdf');

  if (!selectedCase) return null;

  // Strict Role-Based Access Control (RBAC) jurisdictional check
  const isBarangayOfficer = currentUser?.agencyType === 'BARANGAY' && !!currentUser?.barangay;
  const isResidentUser = currentUser?.agencyType === 'RESIDENT' || currentUser?.role === 'RESIDENT';

  const isBarangayUnauthorized = isBarangayOfficer && 
    selectedCase.barangay !== currentUser.barangay && 
    !selectedCase.originatingAgency?.includes(currentUser.barangay!);

  const isResidentUnauthorized = isResidentUser && 
    selectedCase.barangay !== (currentUser.barangay || 'San Aquilino') && 
    selectedCase.residentReporterId !== currentUser.id;

  if (isBarangayUnauthorized || isResidentUnauthorized) {
    return (
      <div 
        id="case-detail-modal-backdrop" 
        className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4"
      >
        <div className="bg-white text-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border-2 border-rose-500 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-gradient-to-r from-rose-700 to-red-800 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-6 h-6 text-amber-300" />
              <div>
                <span className="text-[10px] uppercase font-black tracking-widest bg-rose-900/80 px-2 py-0.5 rounded text-rose-200">
                  SECURITY & PRIVACY FIREWALL
                </span>
                <h3 className="font-extrabold text-sm sm:text-base">
                  403 JURISDICTIONAL ACCESS RESTRICTED
                </h3>
              </div>
            </div>
            <button
              onClick={() => setSelectedCaseId(null)}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-4 text-xs">
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-2 text-rose-900">
              <p className="font-bold leading-relaxed">
                You do not have authorization to view this incident docket ({selectedCase.id}).
              </p>
              <p className="text-rose-700 leading-relaxed text-[11px]">
                {isBarangayOfficer ? (
                  <>
                    Pursuant to <strong>Republic Act 7160 (Local Government Code)</strong> and the <strong>Data Privacy Act of 2012 (RA 10173)</strong>, Barangay Officials of <strong>Barangay {currentUser.barangay}</strong> are strictly restricted from accessing confidential blotter entries and dockets of other barangays (<strong>Barangay {selectedCase.barangay}</strong>).
                  </>
                ) : (
                  <>
                    Registered residents of <strong>Barangay {currentUser.barangay || 'San Aquilino'}</strong> can only access community incidents and reports filed within their own barangay jurisdiction.
                  </>
                )}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-slate-500 font-bold block">Case Location</span>
                <span className="font-bold text-slate-800">Brgy. {selectedCase.barangay}</span>
              </div>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-slate-500 font-bold block">Your Assigned Barangay</span>
                <span className="font-bold text-emerald-700">Brgy. {currentUser.barangay || 'San Aquilino'}</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedCaseId(null)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition cursor-pointer shadow-sm"
            >
              Return to Safe Ledger View
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleStatusSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusChangeReason.trim()) {
      alert('Please specify the mandatory reason for changing the case status.');
      return;
    }
    updateCaseStatus(selectedCase.id, selectedNewStatus, statusChangeReason, statusChangeRemarks);
    setIsStatusModalOpen(false);
    setStatusChangeReason('');
    setStatusChangeRemarks('');
  };

  const handlePendingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingExplanationVal.trim()) {
      alert('Mandatory "Pending Explanation" is required by DILG oversight.');
      return;
    }
    updatePendingReason(selectedCase.id, pendingReasonVal, pendingExplanationVal, requiredNextActionVal);
    setIsPendingModalOpen(false);
  };

  const handleReferralSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!referralReasonVal.trim()) {
      alert('Please provide the formal referral reason.');
      return;
    }
    const docs = docsTransferredVal.split(',').map((s) => s.trim()).filter(Boolean);
    const agencyObj = AGENCIES_LIST.find((a) => a.id === targetAgencyVal);
    const targetAgencyName = agencyObj ? agencyObj.name : targetAgencyVal;
    
    referCase(selectedCase.id, targetAgencyName, referralReasonVal, docs);
    setIsReferralModalOpen(false);
    setReferralReasonVal('');
  };

  const handleIssueRecSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recDetailsVal.trim()) {
      alert('Please enter detailed recommendation instructions.');
      return;
    }
    issueDilgRecommendation({
      caseId: selectedCase.id,
      dilgOfficer: currentUser.name,
      dilgOfficerPosition: currentUser.position,
      recommendationType: recTypeVal,
      detailedRecommendation: recDetailsVal,
      priority: recPriorityVal,
      targetAgency: recTargetAgencyVal,
      responseDeadline: recDeadlineVal
    });
    setIsRecModalOpen(false);
    setRecDetailsVal('');
  };

  const handleRecResponseSubmit = (recId: string) => {
    if (!recResponseText.trim()) {
      alert('Please enter the action taken / compliance response.');
      return;
    }
    respondToDilgRecommendation(selectedCase.id, recId, recResponseText);
    setActiveRecResponseId(null);
    setRecResponseText('');
  };

  const handleAddAttachment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocName.trim()) return;
    addCaseAttachment(selectedCase.id, {
      name: newDocName.endsWith('.pdf') ? newDocName : `${newDocName}.pdf`,
      size: `${(Math.random() * 2 + 0.5).toFixed(1)} MB`,
      type: newDocType
    });
    setNewDocName('');
  };

  const handlePrintDossier = () => {
    window.print();
  };

  return (
    <div 
      id="case-detail-modal-backdrop" 
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
    >
      <div 
        id="case-dossier-card" 
        className="bg-white text-slate-900 w-full max-w-5xl rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Modal Top Bar */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <span className="font-mono text-sm font-bold bg-blue-600 px-2 py-0.5 rounded text-white">
              {selectedCase.id}
            </span>
            <div>
              <h2 className="font-bold text-sm sm:text-base text-white tracking-tight line-clamp-1">
                {selectedCase.title}
              </h2>
              <div className="text-[11px] text-slate-400 flex items-center gap-2">
                <span>Incident #{selectedCase.incidentId}</span>
                <span>•</span>
                <span>Brgy. {selectedCase.barangay}</span>
                <span>•</span>
                <span>Reported: {formatDate(selectedCase.dateReported)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrintDossier}
              title="Print Case Dossier"
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={() => setSelectedCaseId(null)}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Action Strip */}
        <div className="bg-slate-50 px-5 py-2.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={selectedCase.status} />
            <PriorityBadge priority={selectedCase.priority} />
            {selectedCase.isInvolvingOfficial && (
              <OfficialBadge officialType={selectedCase.officialInvolvedType} />
            )}
            {selectedCase.isMonitoredByDilg && (
              <span className="text-[10px] bg-purple-100 text-purple-800 px-2 py-0.5 rounded font-semibold border border-purple-200">
                DILG Monitored
              </span>
            )}
            {selectedCase.isPending && (
              <span className="text-[10px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-semibold border border-amber-200">
                Pending: {selectedCase.daysPending} days
              </span>
            )}
          </div>

          {/* Interactive Case Action Triggers */}
          <div className="flex items-center space-x-2">
            <button
              id="btn-update-case-status"
              onClick={() => {
                setSelectedNewStatus(selectedCase.status);
                setIsStatusModalOpen(true);
              }}
              className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded font-semibold transition cursor-pointer"
            >
              Update Status
            </button>

            <button
              id="btn-update-pending-reason"
              onClick={() => {
                setPendingReasonVal(selectedCase.pendingReason || 'Awaiting investigation');
                setPendingExplanationVal(selectedCase.pendingExplanation || '');
                setRequiredNextActionVal(selectedCase.requiredNextAction || '');
                setIsPendingModalOpen(true);
              }}
              className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded font-semibold transition cursor-pointer"
            >
              Why is this Pending?
            </button>

            <button
              id="btn-refer-inter-agency"
              onClick={() => setIsReferralModalOpen(true)}
              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold transition flex items-center gap-1 cursor-pointer"
            >
              <ArrowRightLeft className="w-3 h-3" />
              Inter-Agency Referral
            </button>
          </div>
        </div>

        {/* Navigation Tabs within Case Dossier */}
        <div className="px-5 border-b border-slate-200 bg-white flex space-x-4 text-xs font-semibold overflow-x-auto">
          {[
            { id: 'overview', label: 'Case Overview & Parties', count: undefined },
            { id: 'timeline', label: 'Chronological Timeline', count: selectedCase.timeline?.length || 0 },
            { id: 'pending', label: 'Pending Management', count: selectedCase.isPending ? 'Active' : undefined },
            { id: 'referrals', label: 'Referrals & Transfers', count: selectedCase.referrals?.length || 0 },
            { id: 'dilg', label: 'DILG Directives & Compliance', count: selectedCase.dilgRecommendations?.length || 0 },
            { id: 'docs', label: 'Attachments & Evidence', count: selectedCase.attachments?.length || 0 }
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`py-2.5 border-b-2 transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeTab === t.id
                  ? 'border-blue-600 text-blue-700 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>{t.label}</span>
              {t.count !== undefined && (
                <span className="px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded text-[10px]">
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 text-xs">
          {/* TAB 1: OVERVIEW & PARTIES */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Official Involvement Neutrality Callout */}
              {selectedCase.isInvolvingOfficial && (
                <div className="bg-rose-50 border border-rose-200 rounded-lg p-3.5 space-y-1">
                  <div className="flex items-center space-x-2 text-rose-800 font-bold text-xs">
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                    <span>Special Classification: Complaint Involving Public Official</span>
                  </div>
                  <p className="text-[11px] text-rose-700 leading-relaxed">
                    This inquiry involves <strong>{selectedCase.officialInvolvedName || selectedCase.officialInvolvedPosition}</strong> ({selectedCase.officialInvolvedAgency}). As per DILG protocols, the record is maintained under neutral administrative classification without presumed guilt, subject to formal conciliation and MLGOO oversight.
                  </p>
                </div>
              )}

              {/* Narrative Summary */}
              <div className="bg-white rounded-lg border border-slate-200 p-4 space-y-2">
                <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                  Case Narrative & Facts of the Report
                </h3>
                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded border border-slate-100">
                  {selectedCase.initialNarrative}
                </p>
                {selectedCase.currentNarrativeSummary && selectedCase.currentNarrativeSummary !== selectedCase.initialNarrative && (
                  <div className="mt-2">
                    <span className="font-bold text-slate-700 block mb-1">Current Progress Summary:</span>
                    <p className="text-xs text-slate-600 bg-blue-50/50 p-2.5 rounded border border-blue-100">
                      {selectedCase.currentNarrativeSummary}
                    </p>
                  </div>
                )}
              </div>

              {/* Involved Parties Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Complainants */}
                <div className="bg-white rounded-lg border border-slate-200 p-3.5">
                  <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5 mb-2 text-blue-700">
                    <User className="w-4 h-4" />
                    Complainant(s)
                  </h4>
                  <div className="space-y-2">
                    {(!selectedCase.complainants || selectedCase.complainants.length === 0) ? (
                      <span className="text-slate-400">No complainant recorded</span>
                    ) : (
                      selectedCase.complainants.map((p) => (
                        <div key={p.id} className="p-2 bg-slate-50 rounded border border-slate-100 text-[11px]">
                          <div className="font-bold text-slate-800">{p.name}</div>
                          <div className="text-slate-500">{p.contact || 'No contact provided'}</div>
                          <div className="text-slate-500">{p.address ? `${p.address}, Brgy. ${p.barangay}` : `Brgy. ${p.barangay}`}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Respondents */}
                <div className="bg-white rounded-lg border border-slate-200 p-3.5">
                  <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5 mb-2 text-rose-700">
                    <User className="w-4 h-4" />
                    Respondent(s) / Inquired Parties
                  </h4>
                  <div className="space-y-2">
                    {(!selectedCase.respondents || selectedCase.respondents.length === 0) ? (
                      <span className="text-slate-400">No respondent recorded</span>
                    ) : (
                      selectedCase.respondents.map((p) => (
                        <div key={p.id} className="p-2 bg-slate-50 rounded border border-slate-100 text-[11px]">
                          <div className="font-bold text-slate-800 flex items-center justify-between">
                            <span>{p.name}</span>
                            {p.isOfficial && <span className="text-[9px] bg-rose-100 text-rose-800 px-1 rounded font-bold">Official</span>}
                          </div>
                          {p.officialPosition && (
                            <div className="text-rose-700 font-medium">{p.officialPosition} ({p.officialAgency})</div>
                          )}
                          <div className="text-slate-500">{p.contact || 'No contact provided'}</div>
                          <div className="text-slate-500">Brgy. {p.barangay || selectedCase.barangay}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Witnesses */}
                <div className="bg-white rounded-lg border border-slate-200 p-3.5">
                  <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5 mb-2 text-slate-700">
                    <User className="w-4 h-4" />
                    Witnesses & Responders
                  </h4>
                  <div className="space-y-2">
                    {(!selectedCase.witnesses || selectedCase.witnesses.length === 0) ? (
                      <span className="text-slate-400">No witnesses logged</span>
                    ) : (
                      selectedCase.witnesses.map((p) => (
                        <div key={p.id} className="p-2 bg-slate-50 rounded border border-slate-100 text-[11px]">
                          <div className="font-bold text-slate-800">{p.name}</div>
                          <div className="text-slate-500">{p.contact || 'No contact'}</div>
                          <div className="text-slate-500">{p.role || 'Witness'}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Administrative Jurisdiction Metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-500 text-[10px] block uppercase font-semibold">Originating Agency</span>
                  <span className="font-bold text-slate-800">{selectedCase.originatingAgency}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block uppercase font-semibold">Handling Agency</span>
                  <span className="font-bold text-blue-800">{selectedCase.currentHandlingAgency}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block uppercase font-semibold">Assigned Personnel</span>
                  <span className="font-bold text-slate-800">{selectedCase.assignedPersonnel || 'Unassigned'}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block uppercase font-semibold">Barangay Retention</span>
                  <span className="font-bold text-slate-800">
                    {selectedCase.isRemainedAtBarangay ? 'Stayed at Barangay Level' : 'Referred to Outside Agency'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TIMELINE */}
          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                    Full Case Chronology & Audit Chain
                  </h3>
                  <p className="text-[11px] text-slate-500">Every action, hearing, referral, and status update</p>
                </div>
              </div>

              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {(!selectedCase.timeline || selectedCase.timeline.length === 0) ? (
                  <div className="text-slate-400 py-4">No timeline events recorded.</div>
                ) : (
                  selectedCase.timeline.map((event, idx) => (
                    <div key={event.id ? `${event.id}-${idx}` : `event-${idx}`} className="relative group">
                      <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full border-2 border-white bg-blue-600 ring-2 ring-blue-100 shadow" />
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
                        <div className="flex flex-wrap items-center justify-between gap-1">
                          <span className="font-bold text-xs text-slate-900">{event.title}</span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {formatDate(event.timestamp)}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700">{event.description}</p>
                        <div className="text-[10px] text-slate-500 flex items-center gap-2 pt-1 border-t border-slate-200/60">
                          <span className="font-medium text-slate-700">Action by: {event.actorName}</span>
                          <span>•</span>
                          <span>{event.actorRole}</span>
                          <span>•</span>
                          <span className="text-blue-700 font-semibold">{event.actorAgency}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: PENDING MANAGEMENT */}
          {activeTab === 'pending' && (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-amber-700" />
                    <h3 className="font-bold text-xs text-amber-900 uppercase tracking-wider">
                      Pending Case Evaluation & Delay Diagnosis
                    </h3>
                  </div>
                  <span className="font-mono font-bold text-amber-900 text-sm">
                    {selectedCase.daysPending || 0} Days Pending
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-white p-3 rounded border border-amber-200">
                  <div>
                    <span className="text-slate-500 text-[10px] block font-semibold">Current Pending Reason:</span>
                    <span className="font-bold text-slate-800">{selectedCase.pendingReason || 'Not currently pending'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block font-semibold">Pending Since:</span>
                    <span className="font-bold text-slate-800">{selectedCase.pendingSinceDate || 'N/A'}</span>
                  </div>
                  <div className="md:col-span-2">
                    <span className="text-slate-500 text-[10px] block font-semibold">Detailed Pending Explanation:</span>
                    <p className="text-slate-700 mt-0.5">{selectedCase.pendingExplanation || 'No explanation provided.'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <span className="text-slate-500 text-[10px] block font-semibold">Next Required Action:</span>
                    <p className="text-blue-800 font-medium mt-0.5">{selectedCase.requiredNextAction || 'Awaiting assigned investigator action.'}</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setPendingReasonVal(selectedCase.pendingReason || 'Awaiting investigation');
                    setPendingExplanationVal(selectedCase.pendingExplanation || '');
                    setRequiredNextActionVal(selectedCase.requiredNextAction || '');
                    setIsPendingModalOpen(true);
                  }}
                  className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs font-semibold shadow transition cursor-pointer"
                >
                  Update Pending Reason & Next Actions
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: REFERRALS */}
          {activeTab === 'referrals' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                    Inter-Agency Referral History
                  </h3>
                  <p className="text-[11px] text-slate-500">Transfers between Barangay, Police Station, LGU, and DILG</p>
                </div>
                <button
                  onClick={() => setIsReferralModalOpen(true)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  Create New Referral
                </button>
              </div>

              <div className="space-y-3">
                {(!selectedCase.referrals || selectedCase.referrals.length === 0) ? (
                  <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-lg">
                    This case has not been referred to external agencies. It is handled at the local barangay level.
                  </div>
                ) : (
                  selectedCase.referrals.map((ref, idx) => (
                    <div key={ref.id ? `${ref.id}-${idx}` : `ref-${idx}`} className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-xs text-blue-800">{ref.id}</span>
                          <span className="text-xs font-semibold text-slate-800">
                            {ref.referringAgency} ➔ {ref.receivingAgency}
                          </span>
                        </div>
                        <StatusBadge status={ref.status} size="sm" />
                      </div>

                      <p className="text-xs text-slate-700">
                        <strong>Reason:</strong> {ref.referralReason}
                      </p>

                      <div className="text-[11px] text-slate-500 flex flex-wrap gap-x-4 gap-y-1">
                        <span>Referred by: {ref.referringOfficer}</span>
                        <span>Date: {formatDate(ref.dateReferred)}</span>
                        {ref.receivingOfficer && <span>Received by: {ref.receivingOfficer}</span>}
                      </div>

                      {/* If pending receipt and current user is in receiving agency */}
                      {ref.status === 'Pending Receipt' && (
                        <div className="pt-2 border-t border-slate-200 flex justify-end">
                          <button
                            onClick={() => {
                              const caseNo = prompt('Enter Police Blotter / Official Docket Number:');
                              acceptReferral(selectedCase.id, ref.id, caseNo || undefined);
                            }}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold cursor-pointer"
                          >
                            Acknowledge & Accept Referral
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 5: DILG DIRECTIVES */}
          {activeTab === 'dilg' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                    DILG Recommendations & Administrative Directives
                  </h3>
                  <p className="text-[11px] text-slate-500">Statutory guidance and response tracking</p>
                </div>
                {currentUser.agencyType === 'DILG' && (
                  <button
                    onClick={() => setIsRecModalOpen(true)}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <FileCheck2 className="w-3.5 h-3.5" />
                    Issue DILG Directive
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {(!selectedCase.dilgRecommendations || selectedCase.dilgRecommendations.length === 0) ? (
                  <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-lg">
                    No DILG recommendations issued for this case.
                  </div>
                ) : (
                  selectedCase.dilgRecommendations.map((rec, idx) => (
                    <div key={rec.id ? `${rec.id}-${idx}` : `rec-${idx}`} className="p-4 bg-purple-50/50 rounded-lg border border-purple-200 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-xs text-purple-900">{rec.id}</span>
                          <span className="font-bold text-xs text-slate-800">{rec.recommendationType}</span>
                        </div>
                        <StatusBadge status={rec.status} size="sm" />
                      </div>

                      <p className="text-xs text-slate-800 bg-white p-2.5 rounded border border-purple-100">
                        {rec.detailedRecommendation}
                      </p>

                      <div className="text-[11px] text-slate-600 flex flex-wrap justify-between items-center gap-2">
                        <span>Issued by: <strong>{rec.dilgOfficer}</strong> ({rec.dilgOfficerPosition})</span>
                        <span>Target: <strong>{rec.targetAgency}</strong></span>
                        <span className="text-rose-700 font-bold">Deadline: {rec.responseDeadline}</span>
                      </div>

                      {/* Agency Response Section */}
                      {rec.agencyResponse ? (
                        <div className="bg-emerald-50 p-2.5 rounded border border-emerald-200 mt-2 space-y-1">
                          <span className="font-bold text-emerald-900 text-[11px] block">
                            Agency Compliance Response (Submitted by {rec.agencyActionOfficer}):
                          </span>
                          <p className="text-xs text-emerald-800">{rec.agencyResponse}</p>
                          <span className="text-[10px] text-emerald-600 block">
                            Submitted: {formatDate(rec.dateResponseSubmitted)}
                          </span>

                          {currentUser.agencyType === 'DILG' && rec.status !== 'Completed' && (
                            <div className="pt-2 flex justify-end">
                              <button
                                onClick={() => completeDilgRecommendation(selectedCase.id, rec.id)}
                                className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-semibold cursor-pointer"
                              >
                                Verify & Close Directive
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="pt-2 border-t border-purple-200 flex justify-end">
                          {activeRecResponseId === rec.id ? (
                            <div className="w-full space-y-2">
                              <textarea
                                value={recResponseText}
                                onChange={(e) => setRecResponseText(e.target.value)}
                                placeholder="Describe compliance action taken, documents issued, or steps completed..."
                                className="w-full p-2 bg-white text-xs rounded border border-purple-300 focus:outline-none focus:ring-1 focus:ring-purple-500"
                                rows={3}
                              />
                              <div className="flex justify-end space-x-2">
                                <button
                                  onClick={() => setActiveRecResponseId(null)}
                                  className="px-2.5 py-1 text-slate-500 hover:text-slate-700 text-xs"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => handleRecResponseSubmit(rec.id)}
                                  className="px-3 py-1 bg-purple-700 hover:bg-purple-800 text-white rounded text-xs font-semibold"
                                >
                                  Submit Official Response
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => setActiveRecResponseId(rec.id)}
                              className="px-3 py-1 bg-purple-700 hover:bg-purple-800 text-white rounded text-xs font-semibold cursor-pointer"
                            >
                              Submit Compliance Action
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 6: ATTACHMENTS */}
          {activeTab === 'docs' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                    Supporting Documents & Case Exhibits
                  </h3>
                  <p className="text-[11px] text-slate-500">Official affidavits, blotter excerpts, notices, and photos</p>
                </div>
              </div>

              {/* Upload Form */}
              <form onSubmit={handleAddAttachment} className="flex gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <input
                  type="text"
                  placeholder="Document title (e.g., KP-Form-16-Settlement, Witness-Affidavit)"
                  value={newDocName}
                  onChange={(e) => setNewDocName(e.target.value)}
                  className="flex-1 px-3 py-1.5 bg-white text-xs rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <select
                  value={newDocType}
                  onChange={(e) => setNewDocType(e.target.value)}
                  className="px-2 py-1.5 bg-white text-xs rounded border border-slate-300"
                >
                  <option value="application/pdf">PDF Document</option>
                  <option value="image/jpeg">Photo Exhibit</option>
                  <option value="application/msword">Word Docket</option>
                </select>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Attach File
                </button>
              </form>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(!selectedCase.attachments || selectedCase.attachments.length === 0) ? (
                  <div className="col-span-2 p-6 text-center text-slate-400 bg-white rounded-lg border border-slate-200">
                    No attachments or exhibits uploaded yet.
                  </div>
                ) : (
                  selectedCase.attachments.map((att, idx) => (
                    <div key={att.id ? `${att.id}-${idx}` : `att-${idx}`} className="p-3 bg-white rounded-lg border border-slate-200 flex items-center justify-between hover:bg-slate-50 transition">
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <Paperclip className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-800 text-xs truncate">{att.name}</div>
                          <div className="text-[10px] text-slate-400">
                            {att.size} • Uploaded by {att.uploadedBy} on {att.uploadDate}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => alert(`Simulated download for secure evidence file: ${att.name}`)}
                        className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex-shrink-0 px-2 py-1 bg-blue-50 rounded cursor-pointer"
                      >
                        View
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-100 px-5 py-3 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
          <span>Last Updated: {formatDate(selectedCase.dateLastUpdated)}</span>
          <button
            onClick={() => setSelectedCaseId(null)}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded font-semibold transition cursor-pointer"
          >
            Close Dossier
          </button>
        </div>
      </div>

      {/* SUB-MODAL 1: STATUS CHANGE */}
      {isStatusModalOpen && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <form onSubmit={handleStatusSubmit} className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 my-auto">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  Update Case Status
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 font-mono">
                  {selectedCase.id} • {selectedCase.title}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsStatusModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Selected Status Visual Banner */}
            <div className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
              selectedNewStatus === 'Resolved' || selectedNewStatus === 'Closed'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : selectedNewStatus.startsWith('Referred')
                ? 'bg-blue-50 border-blue-200 text-blue-900'
                : selectedNewStatus.startsWith('Awaiting')
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}>
              <Sparkles className="w-4 h-4 flex-shrink-0 mt-0.5 text-current opacity-80" />
              <div>
                <div className="font-bold">
                  {selectedNewStatus === 'Resolved' && '✅ Case Outcome: RESOLVED / SETTLED (Completed)'}
                  {selectedNewStatus === 'Closed' && '📁 Case Outcome: CLOSED / TERMINATED (Completed)'}
                  {selectedNewStatus === 'Archived' && '🗄️ Case Outcome: ARCHIVED RECORD'}
                  {selectedNewStatus === 'For Barangay Action' && '⚖️ Action: Under Barangay Lupon Conciliation'}
                  {selectedNewStatus === 'Under Investigation' && '🔍 Action: Active Police / Law Enforcement Investigation'}
                  {selectedNewStatus === 'Under Initial Assessment' && '📋 Action: Desk Assessment & Intake'}
                  {selectedNewStatus === 'For DILG Monitoring' && '🏛️ Action: Under DILG MLGOO Compliance Monitoring'}
                  {selectedNewStatus === 'Referred to Police Station' && '🚓 Referral: Endorsed to PNP Roxas MPS'}
                  {selectedNewStatus === 'Referred to LGU' && '🏢 Referral: Endorsed to LGU / MSWDO / Legal'}
                  {selectedNewStatus.startsWith('Awaiting') && `⏳ Pending Action: ${selectedNewStatus}`}
                  {selectedNewStatus === 'New' && '🆕 Status: Newly Logged Incident'}
                </div>
                <p className="text-[11px] opacity-90 mt-0.5">
                  {(selectedNewStatus === 'Resolved' || selectedNewStatus === 'Closed')
                    ? 'The case will be marked completed. Automatically removed from the Overdue list and counted toward the Official Governance & LTIA Resolution Rate.'
                    : selectedNewStatus.startsWith('Referred')
                    ? 'Transfers and links the case file to the designated partner agency inbox.'
                    : 'The case remains active and in-progress in the system for continued monitoring and action.'}
                </p>
              </div>
            </div>
            
            {/* Categorized Status Dropdown */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center justify-between">
                <span>Select New Case Status *</span>
                <span className="text-[10px] text-slate-400 font-normal">Katarungang Pambarangay & Police Flow</span>
              </label>
              <select
                value={selectedNewStatus}
                onChange={(e) => setSelectedNewStatus(e.target.value as CaseStatus)}
                className="w-full p-2.5 text-xs bg-slate-50 hover:bg-white rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden transition"
              >
                <optgroup label="🟢 CASE TERMINATION & RESOLUTION (COMPLETED)">
                  <option value="Resolved">✅ Resolved (Amicable Settlement / Solved)</option>
                  <option value="Closed">📁 Closed (Certificate to File Action Issued / Terminated / Dismissed)</option>
                  <option value="Archived">🗄️ Archived (Historical / Inactive Record)</option>
                </optgroup>

                <optgroup label="🟡 ACTIVE PROCEEDINGS & HEARINGS (IN PROGRESS)">
                  <option value="For Barangay Action">⚖️ For Barangay Action (Lupon Tagapamayapa Mediation)</option>
                  <option value="Under Investigation">🔍 Under Investigation (PNP / Police Crime Investigation)</option>
                  <option value="Under Initial Assessment">📋 Under Initial Assessment (Desk Review)</option>
                  <option value="For DILG Monitoring">🏛️ For DILG Monitoring (MLGOO Compliance Oversight)</option>
                  <option value="New">🆕 New (Newly Registered)</option>
                </optgroup>

                <optgroup label="🔵 INTER-AGENCY REFERRALS (TRANSFERRED)">
                  <option value="Referred to Police Station">🚓 Referred to Police Station (PNP Roxas MPS)</option>
                  <option value="Referred to LGU">🏢 Referred to LGU (MSWDO / Mayor / Legal)</option>
                </optgroup>

                <optgroup label="🟠 PENDING & WAITING (AWAITING RESPONSE)">
                  <option value="Awaiting Respondent">👤 Awaiting Respondent (Summons / Hearing Attendance)</option>
                  <option value="Awaiting Complainant">👥 Awaiting Complainant (Response / Confirmation)</option>
                  <option value="Awaiting Documents">📄 Awaiting Documents (Evidence / Blotter Extracts)</option>
                  <option value="Awaiting Agency Action">🏢 Awaiting Agency Action (Feedback from Partner Agency)</option>
                </optgroup>
              </select>
            </div>

            {/* Quick Reason Templates (One-Click Auto-Fill) */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Quick Reason Templates (Click to auto-fill):
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1 bg-slate-50 rounded-lg border border-slate-200 text-[11px]">
                {/* Barangay KP Presets */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedNewStatus('Resolved');
                    setStatusChangeReason('Both parties reached an amicable settlement (KP Form 16) before the Lupon Tagapamayapa.');
                  }}
                  className="px-2 py-1 bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md font-medium text-left transition"
                >
                  🤝 Lupon Amicable Settlement (KP Form 16)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedNewStatus('Closed');
                    setStatusChangeReason('Issued Certificate to File Action (KP Form 20) due to failed conciliation proceedings.');
                  }}
                  className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-md font-medium text-left transition"
                >
                  📜 Issued CFA (KP Form 20)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedNewStatus('For Barangay Action');
                    setStatusChangeReason('1st Mediation Hearing scheduled before the Punong Barangay / Pangkat.');
                  }}
                  className="px-2 py-1 bg-white hover:bg-amber-50 text-amber-800 border border-amber-200 rounded-md font-medium text-left transition"
                >
                  📅 Mediation Hearing Scheduled
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedNewStatus('Referred to Police Station');
                    setStatusChangeReason('Endorsed to Roxas PNP Station because the offense constitutes a criminal act outside Lupon jurisdiction.');
                  }}
                  className="px-2 py-1 bg-white hover:bg-blue-50 text-blue-800 border border-blue-200 rounded-md font-medium text-left transition"
                >
                  🚓 Endorsed to Police (Non-KP Crime)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedNewStatus('Resolved');
                    setStatusChangeReason('Formal Criminal Complaint successfully filed with the Provincial Prosecutor\'s Office following PNP investigation.');
                  }}
                  className="px-2 py-1 bg-white hover:bg-indigo-50 text-indigo-800 border border-indigo-200 rounded-md font-medium text-left transition"
                >
                  ⚖️ PNP: Filed to Prosecutor / Court
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedNewStatus('Resolved');
                    setStatusChangeReason('MSWDO social welfare assistance and required family counseling services successfully delivered.');
                  }}
                  className="px-2 py-1 bg-white hover:bg-purple-50 text-purple-800 border border-purple-200 rounded-md font-medium text-left transition"
                >
                  🏢 LGU: MSWDO Assistance Completed
                </button>
              </div>
            </div>

            {/* Mandatory Reason Input */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Mandatory Reason for Status Change *
              </label>
              <textarea
                required
                rows={2}
                placeholder="e.g. Complainant and respondent reached an agreement before the Lupon and signed the settlement document."
                value={statusChangeReason}
                onChange={(e) => setStatusChangeReason(e.target.value)}
                className="w-full p-2.5 text-xs bg-slate-50 hover:bg-white rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden transition"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Additional Remarks / Terms of Agreement (Optional)</label>
              <textarea
                placeholder="Optional details of the agreement, conditions, next hearing date, or specific instructions..."
                value={statusChangeRemarks}
                onChange={(e) => setStatusChangeRemarks(e.target.value)}
                rows={2}
                className="w-full p-2.5 text-xs bg-slate-50 hover:bg-white rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden transition"
              />
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsStatusModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1.5"
              >
                <CheckCircle className="w-4 h-4" />
                Save & Record Audit Entry
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SUB-MODAL 2: WHY IS THIS PENDING? */}
      {isPendingModalOpen && (
        <div className="fixed inset-0 z-60 bg-black/60 flex items-center justify-center p-4">
          <form onSubmit={handlePendingSubmit} className="bg-white rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl border">
            <h3 className="font-bold text-sm text-amber-900 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-600" />
              Why is this Case Pending? (#{selectedCase.id})
            </h3>
            
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Select Pending Reason *</label>
              <select
                value={pendingReasonVal}
                onChange={(e) => setPendingReasonVal(e.target.value as PendingReason)}
                className="w-full p-2 text-xs bg-slate-50 rounded border border-slate-300 font-medium text-amber-900"
              >
                <option value="Awaiting investigation">Awaiting investigation</option>
                <option value="Awaiting additional documents">Awaiting additional documents</option>
                <option value="Awaiting complainant response">Awaiting complainant response</option>
                <option value="Awaiting respondent response">Awaiting respondent response</option>
                <option value="Awaiting witness statement">Awaiting witness statement</option>
                <option value="Awaiting Police Station action">Awaiting Police Station action</option>
                <option value="Awaiting LGU action">Awaiting LGU action</option>
                <option value="Awaiting DILG action/recommendation">Awaiting DILG action/recommendation</option>
                <option value="Awaiting barangay action">Awaiting barangay action</option>
                <option value="Scheduled hearing/meeting">Scheduled hearing/meeting</option>
                <option value="For mediation">For mediation</option>
                <option value="For further verification">For further verification</option>
                <option value="Lack of evidence">Lack of evidence</option>
                <option value="Unable to contact involved person">Unable to contact involved person</option>
                <option value="Referred to another agency">Referred to another agency</option>
                <option value="Legal/administrative process ongoing">Legal/administrative process ongoing</option>
                <option value="Other reason">Other reason</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Pending Explanation (Required by DILG) *
              </label>
              <textarea
                required
                placeholder="Explain in detail why progress is delayed and what specific document/person is pending..."
                value={pendingExplanationVal}
                onChange={(e) => setPendingExplanationVal(e.target.value)}
                rows={3}
                className="w-full p-2 text-xs bg-slate-50 rounded border border-slate-300 focus:bg-white"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Required Next Action
              </label>
              <input
                type="text"
                placeholder="e.g., Issue 2nd summons, Obtain medico-legal report"
                value={requiredNextActionVal}
                onChange={(e) => setRequiredNextActionVal(e.target.value)}
                className="w-full p-2 text-xs bg-slate-50 rounded border border-slate-300 focus:bg-white"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setIsPendingModalOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs font-semibold"
              >
                Record Pending Diagnosis
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SUB-MODAL 3: INTER-AGENCY REFERRAL */}
      {isReferralModalOpen && (
        <div className="fixed inset-0 z-60 bg-black/60 flex items-center justify-center p-4">
          <form onSubmit={handleReferralSubmit} className="bg-white rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl border">
            <h3 className="font-bold text-sm text-blue-900 flex items-center gap-1.5">
              <ArrowRightLeft className="w-4 h-4 text-blue-600" />
              Inter-Agency Referral (#{selectedCase.id})
            </h3>
            
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Receiving Target Agency *</label>
              <select
                value={targetAgencyVal}
                onChange={(e) => setTargetAgencyVal(e.target.value)}
                className="w-full p-2 text-xs bg-slate-50 rounded border border-slate-300 font-medium"
              >
                <option value="POLICE_STATION">Roxas Municipal Police Station (PNP)</option>
                <option value="LGU_MUNICIPAL">Municipal Government of Roxas (LGU Executive / MENRO / Legal)</option>
                <option value="DILG_ROXAS">DILG Municipal Operations Office - Roxas</option>
                <option value="BARANGAY_OFFICES">Barangay Local Government Unit</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Formal Referral Reason *</label>
              <textarea
                required
                placeholder="State legal or operational reason for inter-agency endorsement..."
                value={referralReasonVal}
                onChange={(e) => setReferralReasonVal(e.target.value)}
                rows={3}
                className="w-full p-2 text-xs bg-slate-50 rounded border border-slate-300 focus:bg-white"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Documents Transferred</label>
              <input
                type="text"
                placeholder="Comma separated document names"
                value={docsTransferredVal}
                onChange={(e) => setDocsTransferredVal(e.target.value)}
                className="w-full p-2 text-xs bg-slate-50 rounded border border-slate-300 focus:bg-white"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setIsReferralModalOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold"
              >
                Execute Inter-Agency Endorsement
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SUB-MODAL 4: DILG DIRECTIVE */}
      {isRecModalOpen && (
        <div className="fixed inset-0 z-60 bg-black/60 flex items-center justify-center p-4">
          <form onSubmit={handleIssueRecSubmit} className="bg-white rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl border">
            <h3 className="font-bold text-sm text-purple-900 flex items-center gap-1.5">
              <FileCheck2 className="w-4 h-4 text-purple-600" />
              Issue DILG Directive / Recommendation
            </h3>
            
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Directive Classification *</label>
              <select
                value={recTypeVal}
                onChange={(e) => setRecTypeVal(e.target.value as any)}
                className="w-full p-2 text-xs bg-slate-50 rounded border border-slate-300 font-medium"
              >
                <option value="Administrative Compliance Directive">Administrative Compliance Directive</option>
                <option value="Recommendation for Immediate Action">Recommendation for Immediate Action</option>
                <option value="Request for Clarification">Request for Clarification</option>
                <option value="Request for Additional Documents">Request for Additional Documents</option>
                <option value="Request for Status Update">Request for Status Update</option>
                <option value="Recommendation for Follow-up">Recommendation for Follow-up</option>
                <option value="Recommendation for Referral">Recommendation for Referral</option>
                <option value="Recommendation for Coordination with Another Agency">Recommendation for Coordination with Another Agency</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Target Agency *</label>
              <input
                type="text"
                required
                value={recTargetAgencyVal}
                onChange={(e) => setRecTargetAgencyVal(e.target.value)}
                placeholder="e.g. Barangay San Aquilino LGU, Roxas MPS, LGU MENRO"
                className="w-full p-2 text-xs bg-slate-50 rounded border border-slate-300 focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Priority</label>
                <select
                  value={recPriorityVal}
                  onChange={(e) => setRecPriorityVal(e.target.value as any)}
                  className="w-full p-2 text-xs bg-slate-50 rounded border border-slate-300"
                >
                  <option value="Normal">Normal</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Response Deadline *</label>
                <input
                  type="date"
                  required
                  value={recDeadlineVal}
                  onChange={(e) => setRecDeadlineVal(e.target.value)}
                  className="w-full p-2 text-xs bg-slate-50 rounded border border-slate-300"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Detailed Recommendation *</label>
              <textarea
                required
                placeholder="Specify administrative requirements, statutory basis (RA 7160 / RA 11032), and required response..."
                value={recDetailsVal}
                onChange={(e) => setRecDetailsVal(e.target.value)}
                rows={3}
                className="w-full p-2 text-xs bg-slate-50 rounded border border-slate-300 focus:bg-white"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setIsRecModalOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded text-xs font-semibold"
              >
                Issue Formal Directive
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
