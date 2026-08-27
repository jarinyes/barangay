import React from 'react';
import { 
  Building2, 
  FileCheck, 
  Clock, 
  ArrowUpRight, 
  ShieldAlert, 
  PlusCircle, 
  AlertTriangle, 
  CheckCircle,
  FileText,
  UserX,
  Siren,
  Car,
  Volume2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StatusBadge, PriorityBadge } from '../common/StatusBadge';
import { formatDateShort } from '../../utils/reportGenerators';

export const BarangayDashboard: React.FC = () => {
  const { 
    currentUser, 
    cases, 
    setIsNewCaseModalOpen, 
    setSelectedCaseId, 
    setActiveTab,
    triggerNotification
  } = useApp();

  const currentBarangay = currentUser.barangay || 'San Aquilino';

  // Cases relevant to this barangay
  const barangayCases = cases.filter((c) => c.barangay === currentBarangay || c.originatingAgency.includes(currentBarangay));

  const totalIncidents = barangayCases.length;
  const resolvedCount = barangayCases.filter((c) => c.status === 'Resolved' || c.status === 'Closed').length;
  const pendingCount = barangayCases.filter((c) => c.isPending || c.status === 'Pending').length;
  const referredToPolice = barangayCases.filter((c) => c.isReferredToPolice).length;
  const remainedAtBarangay = barangayCases.filter((c) => c.isRemainedAtBarangay).length;
  const officialComplaints = barangayCases.filter((c) => c.isInvolvingOfficial).length;
  const overdueCases = barangayCases.filter((c) => (c.isPending || c.status === 'Pending') && c.daysPending > 30);
  const accidentCases = barangayCases.filter((c) => c.isAccidentEmergency || c.category === 'Traffic / Vehicular Incident');

  const handleTestAccidentAlarm = () => {
    triggerNotification(
      `🚨 TEST ALARM: Vehicular Accident in Brgy. ${currentBarangay}`,
      `SIMULATED EMERGENCY: Motorcycle & Tricycle collision reported along National Highway, Barangay ${currentBarangay}. Resident report filed. Tanod emergency deployment required!`,
      'pending_alert',
      undefined,
      'BARANGAY',
      'urgent',
      {
        targetAgencyTypes: ['BARANGAY'],
        targetBarangay: currentBarangay
      }
    );
  };

  return (
    <div id="barangay-dashboard-view" className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-sky-800 to-blue-900 text-white rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-sky-700/80 text-sky-100 text-xs font-semibold mb-2">
            <Building2 className="w-3.5 h-3.5" />
            <span>Barangay Governance & Lupon Operations</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">
            Barangay {currentBarangay} Public Safety & Dispute Management
          </h2>
          <p className="text-xs text-sky-100 mt-1 max-w-2xl">
            Managing community complaints, Katarungang Pambarangay conciliation, police/LGU referrals, and official transparency monitoring in Roxas, Oriental Mindoro.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            id="btn-brgy-test-alarm"
            onClick={handleTestAccidentAlarm}
            className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-black shadow-sm transition flex items-center gap-1.5 cursor-pointer ring-2 ring-rose-400/40"
            title="Simulate incoming accident report to test audio alarm and emergency popup"
          >
            <Siren className="w-4 h-4 text-amber-200 animate-pulse" />
            <span>🚨 Test Accident Alarm</span>
          </button>
          <button
            id="btn-brgy-new-case"
            onClick={() => setIsNewCaseModalOpen(true)}
            className="px-3.5 py-2 bg-white text-sky-900 hover:bg-sky-50 rounded-lg text-xs font-bold shadow transition flex items-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-sky-700" />
            File Complaint / Incident
          </button>
          <button
            id="btn-brgy-view-annual"
            onClick={() => setActiveTab('annual_narrative')}
            className="px-3.5 py-2 bg-sky-700/60 hover:bg-sky-700 text-white border border-sky-500/40 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            Annual Summary
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs text-slate-500 uppercase font-bold tracking-tight">Total Logged</p>
          <h3 className="text-3xl font-bold mt-1 text-slate-900">{totalIncidents}</h3>
          <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-500 font-bold">
            <span>Recorded Reports</span>
            <div className="h-px flex-1 bg-slate-100"></div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs text-slate-500 uppercase font-bold tracking-tight">Resolved Locally</p>
          <h3 className="text-3xl font-bold mt-1 text-emerald-600">{resolvedCount}</h3>
          <div className="flex items-center gap-2 mt-2 text-[10px] text-emerald-600 font-bold">
            <span>Lupon / Amicable</span>
            <div className="h-px flex-1 bg-slate-100"></div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs text-slate-500 uppercase font-bold tracking-tight">Pending Cases</p>
          <h3 className="text-3xl font-bold mt-1 text-amber-500">{pendingCount}</h3>
          <div className="flex items-center gap-2 mt-2 text-[10px] text-amber-600 font-bold">
            <span>Under Mediation</span>
            <div className="h-px flex-1 bg-slate-100"></div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs text-slate-500 uppercase font-bold tracking-tight">Referred to PNP</p>
          <h3 className="text-3xl font-bold mt-1 text-blue-600">{referredToPolice}</h3>
          <div className="flex items-center gap-2 mt-2 text-[10px] text-blue-600 font-bold">
            <span>Criminal / Port</span>
            <div className="h-px flex-1 bg-slate-100"></div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs text-slate-500 uppercase font-bold tracking-tight">Brgy-Retained</p>
          <h3 className="text-3xl font-bold mt-1 text-sky-600">{remainedAtBarangay}</h3>
          <div className="flex items-center gap-2 mt-2 text-[10px] text-sky-600 font-bold">
            <span>Barangay Scope</span>
            <div className="h-px flex-1 bg-slate-100"></div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs text-slate-500 uppercase font-bold tracking-tight">Official Inquiries</p>
          <h3 className="text-3xl font-bold mt-1 text-rose-600">{officialComplaints}</h3>
          <div className="flex items-center gap-2 mt-2 text-[10px] text-rose-600 font-bold">
            <span>DILG Monitored</span>
            <div className="h-px flex-1 bg-slate-100"></div>
          </div>
        </div>
      </div>

      {/* Overdue Alert Banner if any */}
      {overdueCases.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-lg p-3.5 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-xs font-bold text-rose-900">
              Katarungang Pambarangay Hearing Overdue Alert ({overdueCases.length} Cases)
            </h4>
            <p className="text-xs text-rose-700 mt-0.5">
              The following case(s) in Barangay {currentBarangay} have exceeded 30 days pending without resolution. DILG requires evaluation for Certificate to File Action (CFA) issuance:
            </p>
            <div className="mt-2 space-y-1.5">
              {overdueCases.map((c) => (
                <div 
                  key={c.id}
                  onClick={() => {
                    setSelectedCaseId(c.id);
                    setActiveTab('cases');
                  }}
                  className="bg-white p-2 rounded border border-rose-200 text-xs flex items-center justify-between hover:bg-rose-100/50 cursor-pointer"
                >
                  <span className="font-semibold text-slate-800">
                    {c.id}: {c.title}
                  </span>
                  <span className="text-rose-700 font-mono font-bold text-[11px]">
                    {c.daysPending} days pending ({c.pendingReason})
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Two Columns: Recent Barangay Ledger & Katarungang Pambarangay Protocols */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Active Barangay Cases */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-sm text-slate-800">
                Recent Incident & Dispute Ledger ({currentBarangay})
              </h3>
              <p className="text-xs text-slate-500">Live docket under Barangay jurisdiction</p>
            </div>
            <button
              onClick={() => setActiveTab('cases')}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-3 divide-y divide-slate-100">
            {barangayCases.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No cases currently registered for Barangay {currentBarangay}.
              </div>
            ) : (
              barangayCases.slice(0, 5).map((c) => (
                <div
                  key={c.id}
                  onClick={() => setSelectedCaseId(c.id)}
                  className="py-3 px-2 hover:bg-slate-50 rounded-lg cursor-pointer transition flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-blue-700">{c.id}</span>
                      <StatusBadge status={c.status} size="sm" />
                      <PriorityBadge priority={c.priority} />
                      {c.isInvolvingOfficial && (
                        <span className="text-[10px] bg-rose-100 text-rose-800 px-1.5 py-0.2 rounded font-semibold">
                          Official Inquired
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-semibold text-slate-800 line-clamp-1">{c.title}</div>
                    <div className="text-[11px] text-slate-500">
                      Reported: {formatDateShort(c.dateReported)} • Location: {c.specificLocation}
                    </div>
                  </div>

                  <div className="text-right flex sm:flex-col items-center sm:items-end justify-between text-xs">
                    <span className="text-[11px] font-medium text-slate-600">
                      {c.isRemainedAtBarangay ? 'Barangay Level' : c.currentHandlingAgency}
                    </span>
                    {c.isPending && (
                      <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded font-medium mt-1">
                        Pending: {c.daysPending}d ({c.pendingReason})
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Col: Lupon Summary & Protocols */}
        <div className="space-y-4">
          {/* Lupon Status Summary */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <h3 className="font-bold text-sm text-slate-800 mb-2 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              Katarungang Pambarangay Status
            </h3>
            <p className="text-xs text-slate-600 mb-3">
              Standard local conciliation performance for Barangay {currentBarangay} (RA 7160).
            </p>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                <span className="text-slate-600">Amicable Settlement Rate</span>
                <span className="font-bold text-emerald-700">82%</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                <span className="text-slate-600">Cases Not Reached Police</span>
                <span className="font-bold text-sky-700">{remainedAtBarangay} cases</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                <span className="text-slate-600">Avg Mediation Duration</span>
                <span className="font-bold text-slate-800">8.4 days</span>
              </div>
            </div>
          </div>

          {/* Barangay Official Inquiries Notice */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-800">
              <UserX className="w-4 h-4 text-slate-600" />
              <span>Official Complaint Neutrality</span>
            </div>
            <p className="text-[11px] text-slate-600 mt-1.5 leading-relaxed">
              Complaints regarding barangay kagawad or officials are logged under neutral administrative review and automatically coordinated with DILG MLGOO Roxas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
