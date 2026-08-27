import React, { useState } from 'react';
import { 
  Camera, 
  Upload, 
  Image as ImageIcon, 
  Trash2, 
  Send, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ShieldCheck, 
  MapPin, 
  Phone, 
  User, 
  FileText, 
  Calendar, 
  PlusCircle, 
  Search, 
  Printer, 
  Sparkles, 
  HelpCircle, 
  ExternalLink, 
  ChevronRight, 
  Building2, 
  Eye, 
  Shield, 
  Info,
  X,
  MessageSquare
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { 
  ROXAS_BARANGAYS, 
  IncidentCategory, 
  PriorityLevel, 
  Case,
  PersonInvolved
} from '../../types';
import { formatDate, formatDateShort } from '../../utils/reportGenerators';
import { StatusBadge, PriorityBadge } from '../common/StatusBadge';



export const ResidentPortalView: React.FC<{ initialTab?: 'overview' | 'submit' | 'my_reports' | 'directory' }> = ({ initialTab = 'overview' }) => {
  const { 
    currentUser, 
    cases, 
    createCase, 
    setSelectedCaseId, 
    setActiveTab,
    triggerNotification
  } = useApp();

  const [portalTab, setPortalTab] = useState<'overview' | 'submit' | 'my_reports' | 'directory'>(initialTab);
  
  // Incident submission form state - Vehicular Accidents
  const [reportTitle, setReportTitle] = useState('');
  const [reportCategory, setReportCategory] = useState<IncidentCategory>('Motorcycle vs Motorcycle Collision');
  const [reportBarangay, setReportBarangay] = useState(currentUser.barangay || 'San Aquilino');
  const [reportLocation, setReportLocation] = useState('');
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [reportTime, setReportTime] = useState('14:00');
  const [reportNarrative, setReportNarrative] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);

  // Complainant & Involved persons
  const [reporterName, setReporterName] = useState(currentUser.name || '');
  const [reporterPhone, setReporterPhone] = useState(currentUser.phone || '0917-555-2144');
  const [reporterAddress, setReporterAddress] = useState(currentUser.address || `Purok 2, ${currentUser.barangay || 'San Aquilino'}`);
  const [respondentName, setRespondentName] = useState('');
  const [witnessName, setWitnessName] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccessCaseId, setSubmittedSuccessCaseId] = useState<string | null>(null);



  // Search in My Reports
  const [reportSearch, setReportSearch] = useState('');

  // Filter reports submitted by or involving this resident/barangay
  const myReports = (cases || []).filter(c => {
    const isReporter = c.residentReporterId === currentUser.id || 
                       c.createdBy?.toLowerCase().includes(currentUser.name.toLowerCase()) ||
                       c.complainants?.some(p => p.name.toLowerCase() === currentUser.name.toLowerCase());
    const isSameBarangay = c.barangay === (currentUser.barangay || 'San Aquilino');
    return isReporter || (currentUser.role === 'RESIDENT' && isSameBarangay && c.isCitizenReport);
  });

  const filteredMyReports = myReports.filter(c => {
    if (!reportSearch.trim()) return true;
    const q = reportSearch.toLowerCase();
    return c.id.toLowerCase().includes(q) ||
           c.title.toLowerCase().includes(q) ||
           c.category.toLowerCase().includes(q) ||
           c.status.toLowerCase().includes(q) ||
           c.specificLocation.toLowerCase().includes(q);
  });



  // Submit Incident Report Form
  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();

    if (!reportTitle.trim()) {
      alert('Pakilagay ang Pamagat o Paksa ng Insidente (Please enter the incident title).');
      return;
    }
    if (!reportNarrative.trim()) {
      alert('Pakilahad ang Salaysay o Detalye ng Pangyayari (Please provide the narrative description).');
      return;
    }
    if (!reportLocation.trim()) {
      alert('Pakilagay ang Tiyak na Lokasyon o Purok/Sitio (Please specify the location or Purok).');
      return;
    }

    setIsSubmitting(true);

    const complainantPerson: PersonInvolved = {
      id: `P-RES-${Date.now()}`,
      name: isAnonymous ? 'Protected Resident (Anonymous Report)' : (reporterName.trim() || currentUser.name),
      role: 'Complainant',
      contact: isAnonymous ? undefined : (reporterPhone.trim() || currentUser.phone),
      address: isAnonymous ? undefined : (reporterAddress.trim() || currentUser.address),
      barangay: reportBarangay
    };

    const respondentPersons: PersonInvolved[] = respondentName.trim() ? [
      {
        id: `P-RESP-${Date.now()}`,
        name: respondentName.trim(),
        role: 'Respondent',
        barangay: reportBarangay
      }
    ] : [];

    const witnessPersons: PersonInvolved[] = witnessName.trim() ? [
      {
        id: `P-WIT-${Date.now()}`,
        name: witnessName.trim(),
        role: 'Witness',
        barangay: reportBarangay
      }
    ] : [];

    const isAccidentReport = 
      reportCategory === 'Traffic / Vehicular Incident' ||
      reportTitle.toLowerCase().includes('accident') ||
      reportTitle.toLowerCase().includes('banggaan') ||
      reportTitle.toLowerCase().includes('vehicular') ||
      reportTitle.toLowerCase().includes('disgrasya') ||
      reportTitle.toLowerCase().includes('motorcycle') ||
      reportNarrative.toLowerCase().includes('accident') ||
      reportNarrative.toLowerCase().includes('banggaan') ||
      reportNarrative.toLowerCase().includes('nabangga') ||
      reportNarrative.toLowerCase().includes('crash');

    const newCaseId = createCase({
      title: reportTitle.trim(),
      category: reportCategory,
      description: reportNarrative.trim().substring(0, 180) + '...',
      initialNarrative: reportNarrative.trim(),
      incidentDate: reportDate,
      barangay: reportBarangay,
      specificLocation: `${reportLocation.trim()}, Barangay ${reportBarangay}, Roxas, Oriental Mindoro`,
      complainants: [complainantPerson],
      respondents: respondentPersons,
      witnesses: witnessPersons,
      priority: isAccidentReport || isUrgent ? 'Urgent' : 'Medium',
      isAccidentEmergency: isAccidentReport,
      accidentVehicleDetails: isAccidentReport ? 'Road/Vehicular Accident Reported by Resident' : undefined,
      isAccidentProneArea: isAccidentReport,
      originatingAgency: `Barangay ${reportBarangay} Resident Portal`,
      currentHandlingAgency: `Barangay ${reportBarangay} LGU`,
      status: 'Received',
      isCitizenReport: true,
      residentReporterId: currentUser.id,
      isRemainedAtBarangay: true,
      barangayRetentionReason: isAccidentReport ? 'Emergency first responder dispatch & Lupon desk blotter' : 'Ongoing mediation / Lupon conciliation',
      barangayRetentionNotes: isAccidentReport 
        ? '🚨 ROAD ACCIDENT REPORT: Dispatched urgent alert to Punong Barangay and Tanod First Responders.' 
        : 'Citizen report received via B-CONNECT Resident Portal. Queued for Barangay Secretary / Lupon Tagapamayapa review.',
      isConfidential: isAnonymous
    });

    setIsSubmitting(false);
    setSubmittedSuccessCaseId(newCaseId);

    // Reset Form
    setReportTitle('');
    setReportNarrative('');
    setReportLocation('');
    setRespondentName('');
    setWitnessName('');
    setIsUrgent(false);

    triggerNotification(
      'Incident Report Submitted Successfully!',
      `Your report #${newCaseId} has been officially logged with Barangay ${reportBarangay}. You may track its progress anytime.`,
      'system',
      newCaseId,
      'RESIDENT',
      'normal',
      {
        targetAgencyTypes: ['RESIDENT'],
        targetRoles: ['RESIDENT'],
        targetUserId: currentUser.id,
        targetBarangay: reportBarangay
      }
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      
      {/* ----------------- TOP WELCOME & RESIDENT HERO ----------------- */}
      <div className="bg-gradient-to-br from-emerald-800 via-emerald-900 to-teal-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        {/* Ambient background decoration */}
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute left-1/3 bottom-0 -mb-12 w-60 h-60 bg-teal-400/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
              <span>Official Resident Portal • Barangay {currentUser.barangay || 'San Aquilino'}</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Welcome, {currentUser.name}!
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/80 max-w-2xl leading-relaxed">
              Quickly and securely report neighborhood incidents with attached photos and evidence, and monitor real-time case resolution by the Barangay Lupon and Authorities.
            </p>
          </div>

          {/* Quick Action Navigation Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              id="btn-nav-file-report"
              onClick={() => {
                setPortalTab('submit');
                setSubmittedSuccessCaseId(null);
              }}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition cursor-pointer shadow-sm ${
                portalTab === 'submit'
                  ? 'bg-white text-emerald-950 ring-2 ring-white/40'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>Report Incident</span>
            </button>

            <button
              id="btn-nav-my-reports"
              onClick={() => {
                setPortalTab('my_reports');
                setSubmittedSuccessCaseId(null);
              }}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition cursor-pointer border ${
                portalTab === 'my_reports'
                  ? 'bg-white text-emerald-950 border-white'
                  : 'bg-emerald-900/60 hover:bg-emerald-900 border-emerald-700/60 text-emerald-100'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>My Reports ({myReports.length})</span>
            </button>

            <button
              id="btn-nav-directory"
              onClick={() => {
                setPortalTab('directory');
                setSubmittedSuccessCaseId(null);
              }}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition cursor-pointer border ${
                portalTab === 'directory'
                  ? 'bg-white text-emerald-950 border-white'
                  : 'bg-emerald-900/60 hover:bg-emerald-900 border-emerald-700/60 text-emerald-100'
              }`}
            >
              <Phone className="w-4 h-4" />
              <span>Hotlines & Directory</span>
            </button>
          </div>
        </div>

        {/* Quick Resident Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-emerald-700/50">
          <div className="bg-white/10 backdrop-blur-xs p-3 rounded-2xl border border-white/10">
            <span className="text-[11px] text-emerald-200 block font-medium">Total Submitted</span>
            <span className="text-xl font-extrabold text-white mt-0.5 block">{myReports.length}</span>
          </div>
          <div className="bg-white/10 backdrop-blur-xs p-3 rounded-2xl border border-white/10">
            <span className="text-[11px] text-emerald-200 block font-medium">Under Barangay Action</span>
            <span className="text-xl font-extrabold text-amber-300 mt-0.5 block">
              {myReports.filter(c => c.status !== 'Resolved' && c.status !== 'Closed').length}
            </span>
          </div>
          <div className="bg-white/10 backdrop-blur-xs p-3 rounded-2xl border border-white/10">
            <span className="text-[11px] text-emerald-200 block font-medium">Resolved / Settled</span>
            <span className="text-xl font-extrabold text-emerald-300 mt-0.5 block">
              {myReports.filter(c => c.status === 'Resolved' || c.status === 'Closed').length}
            </span>
          </div>
          <div className="bg-white/10 backdrop-blur-xs p-3 rounded-2xl border border-white/10">
            <span className="text-[11px] text-emerald-200 block font-medium">Barangay Response Rate</span>
            <span className="text-xl font-extrabold text-teal-200 mt-0.5 block">100% Active</span>
          </div>
        </div>
      </div>

      {/* ----------------- TAB 1: SUBMIT INCIDENT REPORT (FORM WITH PHOTOS) ----------------- */}
      {portalTab === 'submit' && (
        <div className="space-y-6">
          
          {/* Submission Success Banner */}
          {submittedSuccessCaseId && (
            <div className="bg-emerald-50 border-2 border-emerald-500 rounded-3xl p-6 shadow-md space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-emerald-600 text-white rounded-2xl">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-1 flex-1">
                  <h3 className="text-lg font-black text-emerald-950">
                    Incident Report Submitted Successfully!
                  </h3>
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    Your report has been officially forwarded to the <strong>Barangay {reportBarangay} Lupon & Desk Officer</strong>. It has been assigned an official Tracking Reference Number:
                  </p>
                  
                  <div className="inline-flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-emerald-300 shadow-xs mt-2">
                    <span className="text-xs text-slate-500 font-bold uppercase">Reference Code:</span>
                    <span className="text-base font-black font-mono text-emerald-700">{submittedSuccessCaseId}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-emerald-200">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCaseId(submittedSuccessCaseId);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer"
                >
                  <Eye className="w-4 h-4" />
                  <span>View Case Details & Status</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPortalTab('my_reports');
                    setSubmittedSuccessCaseId(null);
                  }}
                  className="px-4 py-2 bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  View in My Reports List
                </button>
                <button
                  type="button"
                  onClick={() => setSubmittedSuccessCaseId(null)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900 text-xs font-semibold"
                >
                  Submit another report
                </button>
              </div>
            </div>
          )}

          {/* Main Reporting Form */}
          <div className="bg-white border border-emerald-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-8">
            <div className="border-b border-slate-100 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-emerald-600" />
                    <span>Incident & Complaint Reporting Form</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Fill out the required incident details and attach photos or evidence to expedite review and action by the Barangay and Lupon Tagapamayapa.
                  </p>
                </div>
                <span className="text-[11px] text-slate-400 hidden sm:block">
                  Fields marked with (<span className="text-rose-500 font-bold">*</span>) are mandatory
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmitReport} className="space-y-6">
              
              {/* 1. Category & Title */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-5 space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">
                    Accident / Crash Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    id="select-incident-category"
                    value={reportCategory}
                    onChange={(e) => setReportCategory(e.target.value as IncidentCategory)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Motorcycle vs Motorcycle Collision">Motorcycle vs Motorcycle Collision</option>
                    <option value="Motorcycle vs Car / SUV Collision">Motorcycle vs Car / SUV Collision</option>
                    <option value="Motorcycle vs Tricycle Collision">Motorcycle vs Tricycle Collision</option>
                    <option value="Car / 4-Wheeled Vehicle Collision">Car / 4-Wheeled Vehicle Collision</option>
                    <option value="Tricycle Collision / Rollover">Tricycle Collision / Rollover</option>
                    <option value="Truck / Bus / Heavy Vehicle Crash">Truck / Bus / Heavy Vehicle Crash</option>
                    <option value="PUV / Jeepney / Multicab Accident">PUV / Jeepney / Multicab Accident</option>
                    <option value="Pedestrian Hit by Vehicle / Motorcycle">Pedestrian Hit by Vehicle / Motorcycle</option>
                    <option value="Bicycle / E-Bike / E-Trike Crash">Bicycle / E-Bike / E-Trike Crash</option>
                    <option value="Single-Vehicle Road Skid / Fixed Object Crash">Single-Vehicle Road Skid / Fixed Object Crash</option>
                    <option value="Multi-Vehicle Pileup Collision">Multi-Vehicle Pileup Collision</option>
                    <option value="Hit-and-Run Vehicular Crash">Hit-and-Run Vehicular Crash</option>
                  </select>
                </div>

                <div className="md:col-span-7 space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">
                    Accident Title / Summary <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="input-report-title"
                    type="text"
                    required
                    placeholder="e.g., Motor na-bangga sa Tricycle sa Kanto ng Morente Ave / Nadulas na Motor sa Daan"
                    value={reportTitle}
                    onChange={(e) => setReportTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* 2. Location & Date/Time */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">
                    Barangay Jurisdiction <span className="text-rose-500">*</span>
                  </label>
                  {(currentUser.role === 'RESIDENT' || currentUser.agencyType === 'RESIDENT') ? (
                    <div className="w-full bg-emerald-50 border border-emerald-300 rounded-xl px-3 py-2.5 text-xs text-emerald-950 font-bold flex items-center justify-between shadow-2xs">
                      <span>Brgy. {currentUser.barangay || 'San Aquilino'}</span>
                      <span className="text-[9px] bg-emerald-200 text-emerald-900 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                        Home Barangay Locked
                      </span>
                    </div>
                  ) : (
                    <select
                      id="select-report-barangay"
                      value={reportBarangay}
                      onChange={(e) => setReportBarangay(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      {ROXAS_BARANGAYS.map((b) => (
                        <option key={b} value={b}>Brgy. {b}</option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-800">
                    Specific Location / Purok / Sitio / Landmark <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      id="input-report-location"
                      type="text"
                      required
                      placeholder="e.g., Purok 3, across San Aquilino Elementary School / Near Bridge"
                      value={reportLocation}
                      onChange={(e) => setReportLocation(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>Incident Date</span>
                  </label>
                  <input
                    type="date"
                    value={reportDate}
                    onChange={(e) => setReportDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>Estimated Time</span>
                  </label>
                  <input
                    type="time"
                    value={reportTime}
                    onChange={(e) => setReportTime(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">
                    Urgency Level
                  </label>
                  <div className="flex items-center gap-2 pt-1">
                    <label className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-bold cursor-pointer transition ${
                      !isUrgent 
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800' 
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}>
                      <input
                        type="radio"
                        name="urgency"
                        checked={!isUrgent}
                        onChange={() => setIsUrgent(false)}
                        className="hidden"
                      />
                      <span>Normal</span>
                    </label>

                    <label className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-bold cursor-pointer transition ${
                      isUrgent 
                        ? 'bg-rose-50 border-rose-500 text-rose-800' 
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}>
                      <input
                        type="radio"
                        name="urgency"
                        checked={isUrgent}
                        onChange={() => setIsUrgent(true)}
                        className="hidden"
                      />
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                      <span>Urgent / Priority</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* 3. Detailed Narrative */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  Detailed Narrative & Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  id="textarea-report-narrative"
                  required
                  rows={4}
                  placeholder="Clearly describe the incident: What happened? Who was involved? Were there any damages or injuries? What assistance or intervention are you requesting from the Barangay?"
                  value={reportNarrative}
                  onChange={(e) => setReportNarrative(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs text-slate-900 leading-relaxed focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* 5. Involved Persons & Anonymous Protection */}
              <div className="bg-slate-50 rounded-3xl p-5 sm:p-6 border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-600" />
                    <span>Parties Involved & Identity Protection</span>
                  </h3>

                  {/* Anonymous Toggle */}
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer bg-white px-3 py-1.5 rounded-xl border border-slate-200">
                    <input
                      type="checkbox"
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-emerald-900">File as Anonymous Report</span>
                  </label>
                </div>

                {!isAnonymous ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-600">Complainant / Reporter Name:</label>
                      <input
                        type="text"
                        value={reporterName}
                        onChange={(e) => setReporterName(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-600">Contact Number:</label>
                      <input
                        type="text"
                        value={reporterPhone}
                        onChange={(e) => setReporterPhone(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-600">Residential Address in Barangay:</label>
                      <input
                        type="text"
                        value={reporterAddress}
                        onChange={(e) => setReporterAddress(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
                    <Shield className="w-4 h-4 text-amber-700 flex-shrink-0" />
                    <span>
                      <strong>Anonymous Mode Active:</strong> Your personal identity details will remain protected and strictly confidential.
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-600">
                      Respondent / Complained Party Name (If known):
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Juan Dela Cruz / Unknown group"
                      value={respondentName}
                      onChange={(e) => setRespondentName(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-600">
                      Witness Name / Contact (Optional):
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Neighboring resident witness"
                      value={witnessName}
                      onChange={(e) => setWitnessName(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setPortalTab('overview')}
                  className="w-full sm:w-auto px-5 py-2.5 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="btn-submit-resident-report"
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Submitting Report to Barangay...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Official Incident Report</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ----------------- TAB 2: MY FILED REPORTS (LIVE TRACKER) ----------------- */}
      {portalTab === 'my_reports' && (
        <div className="space-y-6">
          <div className="bg-white border border-emerald-100 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-emerald-600" />
                  <span>My Submitted Incident Reports & Resolution Status</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Track every milestone and hearing action taken by the Barangay Lupon Tagapamayapa and Authorities.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by Case ID or Keyword..."
                    value={reportSearch}
                    onChange={(e) => setReportSearch(e.target.value)}
                    className="pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 w-48 sm:w-64"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setPortalTab('submit')}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>File New Report</span>
                </button>
              </div>
            </div>

            {/* List of Reports */}
            {filteredMyReports.length === 0 ? (
              <div className="text-center py-12 px-4 space-y-3">
                <div className="p-4 bg-emerald-50 rounded-full w-16 h-16 mx-auto flex items-center justify-center text-emerald-600">
                  <FileText className="w-8 h-8" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">No Incident Reports Found</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  You have not submitted any incident reports yet. Click the button below whenever you need to report an incident.
                </p>
                <button
                  type="button"
                  onClick={() => setPortalTab('submit')}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition cursor-pointer"
                >
                  Submit First Incident Report
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredMyReports.map((c) => {
                  const isResolved = c.status === 'Resolved' || c.status === 'Closed';

                  return (
                    <div
                      key={c.id}
                      className="p-5 rounded-3xl border border-slate-200 hover:border-emerald-400 bg-white hover:bg-emerald-50/20 transition duration-200 shadow-xs space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-black text-emerald-800 px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-lg">
                            {c.id}
                          </span>
                          <StatusBadge status={c.status} />
                          <PriorityBadge priority={c.priority} />
                        </div>

                        <span className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>Reported on {formatDateShort(c.dateReported)}</span>
                        </span>
                      </div>

                      <div>
                        <h3 className="text-sm font-bold text-slate-900 hover:text-emerald-700 transition">
                          {c.title}
                        </h3>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed line-clamp-2">
                          {c.initialNarrative}
                        </p>
                      </div>

                      {/* Status Progress Milestones */}
                      <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200/80 space-y-2">
                        <div className="flex items-center justify-between text-[11px] text-slate-600 font-bold">
                          <span>Current Processing Stage:</span>
                          <span className="text-emerald-700">
                            {c.lastActionTaken || 'Under active review by Barangay Lupon'}
                          </span>
                        </div>

                        {/* Visual Progress Steps */}
                        <div className="grid grid-cols-4 gap-1 pt-1">
                          <div className="text-center">
                            <div className="h-1.5 rounded-full bg-emerald-600"></div>
                            <span className="text-[9px] font-bold text-slate-700 mt-1 block">1. Received</span>
                          </div>
                          <div className="text-center">
                            <div className={`h-1.5 rounded-full ${c.status !== 'Received' ? 'bg-emerald-600' : 'bg-slate-200'}`}></div>
                            <span className="text-[9px] font-bold text-slate-700 mt-1 block">2. Blotter / Review</span>
                          </div>
                          <div className="text-center">
                            <div className={`h-1.5 rounded-full ${c.status === 'For Barangay Action' || c.status === 'Resolved' || c.status === 'Closed' ? 'bg-emerald-600' : 'bg-slate-200'}`}></div>
                            <span className="text-[9px] font-bold text-slate-700 mt-1 block">3. Hearing / Lupon</span>
                          </div>
                          <div className="text-center">
                            <div className={`h-1.5 rounded-full ${isResolved ? 'bg-emerald-600' : 'bg-slate-200'}`}></div>
                            <span className="text-[9px] font-bold text-slate-700 mt-1 block">4. Resolved</span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                        <span className="text-[11px] text-slate-500">
                          Assigned to: <strong>{c.currentHandlingAgency}</strong>
                        </span>

                        <button
                          type="button"
                          onClick={() => setSelectedCaseId(c.id)}
                          className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Open Full Case Dossier & Timeline</span>
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ----------------- TAB 3: BARANGAY DIRECTORY & HOTLINES ----------------- */}
      {portalTab === 'directory' && (
        <div className="space-y-6">
          <div className="bg-white border border-emerald-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Phone className="w-5 h-5 text-emerald-600" />
                <span>Barangay & Public Emergency Authority Directory</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Official contact numbers and duty desks across the Municipality of Roxas, Oriental Mindoro for prompt public service.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Barangay Hall Card */}
              <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-600 text-white">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-emerald-950">Barangay {currentUser.barangay || 'San Aquilino'} Hall</h3>
                    <span className="text-[10px] text-emerald-700 font-bold">Punong Barangay & Lupon Tagapamayapa</span>
                  </div>
                </div>
                <div className="space-y-1.5 text-xs text-slate-700 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Barangay Captain Desk:</span>
                    <strong className="text-slate-900 font-mono">0917-888-{(currentUser.barangay || 'SAQ').substring(0, 3).toUpperCase()}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Barangay Tanod Emergency:</span>
                    <strong className="text-rose-600 font-mono font-bold">0920-555-{(currentUser.barangay || '1234').substring(0, 4)}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Office Hours:</span>
                    <strong className="text-slate-900">Mon - Fri (8:00 AM - 5:00 PM)</strong>
                  </div>
                </div>
              </div>

              {/* Police Station Card */}
              <div className="p-5 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-blue-700 text-white">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-blue-950">Roxas Municipal Police Station (PNP)</h3>
                    <span className="text-[10px] text-blue-700 font-bold">24/7 Police Assistance Desk</span>
                  </div>
                </div>
                <div className="space-y-1.5 text-xs text-slate-700 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Emergency Hotline:</span>
                    <strong className="text-rose-600 font-mono font-black">911 / 0998-598-5680</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Desk Officer:</span>
                    <strong className="text-slate-900 font-mono">(043) 289-2026</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Location:</span>
                    <strong className="text-slate-900">Poblacion, Roxas</strong>
                  </div>
                </div>
              </div>

              {/* MDRRMO & Rescue Card */}
              <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-600 text-white">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-amber-950">MDRRMO & Rescue Operations</h3>
                    <span className="text-[10px] text-amber-700 font-bold">Ambulance & Disaster Response</span>
                  </div>
                </div>
                <div className="space-y-1.5 text-xs text-slate-700 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Disaster Hotline:</span>
                    <strong className="text-slate-900 font-mono">0917-700-MDRRMO</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">BFP Fire Station:</span>
                    <strong className="text-slate-900 font-mono">0919-444-FIRE</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Status:</span>
                    <strong className="text-emerald-700 font-bold">24/7 Standby Alert</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Katarungang Pambarangay Guide */}
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-4">
              <h3 className="text-xs font-black text-slate-900 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-emerald-600" />
                <span>Katarungang Pambarangay Flow (How Barangay Mediation Works)</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-700">
                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                  <strong className="text-emerald-800 block font-bold">1. Summons & Invitation</strong>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Upon receipt of the complaint, the Punong Barangay issues formal summons to both parties within 3 days for initial mediation.
                  </p>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                  <strong className="text-emerald-800 block font-bold">2. Pangkat Conciliation</strong>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    If unmediated before the Punong Barangay, a 3-member Pangkat Tagapagkasundo is constituted for in-depth conciliation (up to 15 days).
                  </p>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                  <strong className="text-emerald-800 block font-bold">3. Amicable Settlement / CFA</strong>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    If settled, an Amicable Settlement agreement is executed. If unresolved, a Certificate to File Action (CFA) is issued for court or prosecution referral.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- TAB 0: OVERVIEW PORTAL HUB ----------------- */}
      {portalTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Quick Action Card 1: File Report */}
            <div className="p-6 rounded-3xl bg-white border border-emerald-200 hover:border-emerald-400 transition shadow-sm space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="p-3 w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <Camera className="w-6 h-6" />
                </div>
                <h3 className="text-base font-black text-slate-900">Report an Incident</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  File neighborhood disturbances, boundary conflicts, sanitation issues, or damages with photo evidence for prompt barangay action.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setPortalTab('submit');
                  setSubmittedSuccessCaseId(null);
                }}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <span>Start Incident Report</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Action Card 2: Track Reports */}
            <div className="p-6 rounded-3xl bg-white border border-blue-200 hover:border-blue-400 transition shadow-sm space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="p-3 w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center">
                  <Clock className="w-6 h-6" />
                </div>
                <h3 className="text-base font-black text-slate-900">Track Reports & Status</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  View real-time case updates, scheduled Lupon hearing dates, and official settlement notes on your filed reports.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setPortalTab('my_reports')}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <span>View My Reports ({myReports.length})</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Action Card 3: Directory & Contacts */}
            <div className="p-6 rounded-3xl bg-white border border-amber-200 hover:border-amber-400 transition shadow-sm space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="p-3 w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
                  <Phone className="w-6 h-6" />
                </div>
                <h3 className="text-base font-black text-slate-900">Directory & Hotlines</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Access direct contacts for Barangay Tanod, PNP Roxas Station, MDRRMO Rescue, and VAWC Desk Officers for immediate help.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setPortalTab('directory')}
                className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <span>Open Directory</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

          </div>

          {/* Recent Reports in Barangay */}
          <div className="bg-white border border-emerald-100 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  <span>Recent Incident Reports in Barangay {currentUser.barangay || 'San Aquilino'}</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Official blotter and mediation logs handled by Lupon Tagapamayapa
                </p>
              </div>

              <button
                type="button"
                onClick={() => setPortalTab('my_reports')}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-900"
              >
                View All →
              </button>
            </div>

            {myReports.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500">
                No active incident reports at this time. Community peace and order is stable.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {myReports.slice(0, 3).map((c) => (
                  <div key={c.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold text-slate-600">{c.id}</span>
                        <StatusBadge status={c.status} />
                      </div>
                      <h4 className="text-xs font-bold text-slate-900">{c.title}</h4>
                      <span className="text-[10px] text-slate-500">{c.specificLocation}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedCaseId(c.id)}
                      className="px-3 py-1 bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-900 rounded-lg text-xs font-semibold transition cursor-pointer flex-shrink-0"
                    >
                      Details
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}



    </div>
  );
};
