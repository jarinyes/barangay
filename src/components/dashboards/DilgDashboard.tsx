import React from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  FileCheck2, 
  Clock, 
  Building2, 
  ShieldAlert, 
  PlusCircle, 
  FileSpreadsheet,
  ArrowUpRight,
  Send,
  Eye
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StatusBadge, PriorityBadge, OfficialBadge } from '../common/StatusBadge';
import { formatDateShort } from '../../utils/reportGenerators';

export const DilgDashboard: React.FC = () => {
  const { cases, setSelectedCaseId, setActiveTab } = useApp();

  const safeCases = cases || [];
  const monitoredCases = safeCases.filter((c) => c.isMonitoredByDilg || c.isInvolvingOfficial || c.isPending);
  const officialInvolvedCases = safeCases.filter((c) => c.isInvolvingOfficial);
  const longPendingCases = safeCases.filter((c) => (c.isPending || c.status === 'Pending') && c.daysPending > 30);
  const casesNotReferredToPolice = safeCases.filter((c) => c.isRemainedAtBarangay);
  const casesReferredToPolice = safeCases.filter((c) => c.isReferredToPolice);

  // Recommendations overview
  const allDilgRecs = safeCases.flatMap((c) => c.dilgRecommendations || []);
  const pendingResponses = allDilgRecs.filter((r) => r.status === 'Awaiting Agency Response' || r.status === 'Overdue');
  const completedRecs = allDilgRecs.filter((r) => r.status === 'Completed');

  return (
    <div id="dilg-dashboard-view" className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-900 via-slate-900 to-stone-900 text-white rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 border border-amber-700/40">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-amber-800/80 text-amber-100 text-xs font-semibold mb-2">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Department of the Interior and Local Government • MLGOO Roxas</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">
            DILG Municipal Operations Oversight & Accountability Hub
          </h2>
          <p className="text-xs text-amber-100 mt-1 max-w-2xl">
            Monitoring barangay compliance, Katarungang Pambarangay timelines, complaints involving officials, overdue case alerts, and administrative directives.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('recommendations')}
            className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold shadow transition flex items-center gap-1.5 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            Issue Recommendation
          </button>
          <button
            onClick={() => setActiveTab('annual_narrative')}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Annual Monitoring Report
          </button>
        </div>
      </div>

      {/* High-Level Statutory Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs text-slate-500 uppercase font-bold tracking-tight">Monitored Cases</p>
          <h3 className="text-3xl font-bold mt-1 text-slate-900">{monitoredCases.length}</h3>
          <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-500 font-bold">
            <span>DILG Scope Active</span>
            <div className="h-px flex-1 bg-slate-100"></div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs text-slate-500 uppercase font-bold tracking-tight">Official Inquiries</p>
          <h3 className="text-3xl font-bold mt-1 text-rose-600">{officialInvolvedCases.length}</h3>
          <div className="flex items-center gap-2 mt-2 text-[10px] text-rose-600 font-bold">
            <span>Neutral Oversight</span>
            <div className="h-px flex-1 bg-slate-100"></div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs text-slate-500 uppercase font-bold tracking-tight">Overdue Cases &gt;30d</p>
          <h3 className="text-3xl font-bold mt-1 text-amber-500">{longPendingCases.length}</h3>
          <div className="flex items-center gap-2 mt-2 text-[10px] text-amber-600 font-bold">
            <span>Stalled KP / Actions</span>
            <div className="h-px flex-1 bg-slate-100"></div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs text-slate-500 uppercase font-bold tracking-tight">Brgy-Retained</p>
          <h3 className="text-3xl font-bold mt-1 text-sky-600">{casesNotReferredToPolice.length}</h3>
          <div className="flex items-center gap-2 mt-2 text-[10px] text-sky-600 font-bold">
            <span>Not Sent to PNP</span>
            <div className="h-px flex-1 bg-slate-100"></div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs text-slate-500 uppercase font-bold tracking-tight">PNP Referrals</p>
          <h3 className="text-3xl font-bold mt-1 text-blue-600">{casesReferredToPolice.length}</h3>
          <div className="flex items-center gap-2 mt-2 text-[10px] text-blue-600 font-bold">
            <span>Endorsed to PNP</span>
            <div className="h-px flex-1 bg-slate-100"></div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs text-slate-500 uppercase font-bold tracking-tight">Directives</p>
          <h3 className="text-3xl font-bold mt-1 text-purple-600">{allDilgRecs.length}</h3>
          <div className="flex items-center gap-2 mt-2 text-[10px] text-purple-600 font-bold">
            <span>{pendingResponses.length} Awaiting Response</span>
            <div className="h-px flex-1 bg-slate-100"></div>
          </div>
        </div>
      </div>

      {/* Official Inquiries Radar & Neutrality Notice */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-pulse" />
              <h3 className="font-bold text-sm text-slate-800">
                Complaints Involving Barangay & Local Government Officials
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Statutory oversight under RA 7160 (Local Government Code of 1991) and Anti-Red Tape Act (RA 11032)
            </p>
          </div>
          <div className="text-[11px] text-slate-500 bg-slate-50 px-2.5 py-1 rounded border">
            Classification: Neutral Administrative Review
          </div>
        </div>

        <div className="mt-3 divide-y divide-slate-100">
          {officialInvolvedCases.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400">
              No active complaints involving officials recorded.
            </div>
          ) : (
            officialInvolvedCases.map((c) => (
              <div
                key={c.id}
                onClick={() => setSelectedCaseId(c.id)}
                className="py-3 px-2 hover:bg-slate-50 rounded-lg cursor-pointer transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-blue-800">{c.id}</span>
                    <OfficialBadge officialType={c.officialInvolvedType} />
                    <StatusBadge status={c.status} size="sm" />
                    <span className="text-[11px] font-semibold text-slate-700">
                      Involved: {c.officialInvolvedName || c.officialInvolvedPosition} ({c.officialInvolvedAgency})
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-slate-800">{c.title}</div>
                  <div className="text-[11px] text-slate-500">
                    Barangay: {c.barangay} • Reported: {formatDateShort(c.dateReported)} • Retention Status: {c.isRemainedAtBarangay ? 'Retained at Barangay Level' : c.currentHandlingAgency}
                  </div>
                </div>

                <div className="text-right flex sm:flex-col items-center sm:items-end justify-between text-xs">
                  <span className="text-[11px] font-medium text-purple-900 bg-purple-50 px-2 py-0.5 rounded">
                    {c.dilgRecommendations?.length || 0} DILG Directives
                  </span>
                  {c.isPending && (
                    <span className="text-[10px] text-amber-800 font-medium mt-1">
                      Pending: {c.daysPending}d ({c.pendingReason})
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Long-Pending Cases & Recommendations Tracker */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Overdue Cases Radar */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Overdue / Long-Pending Radar (&gt;30 Days)
              </h3>
              <p className="text-xs text-slate-500">Cases exceeding Katarungang Pambarangay time limits</p>
            </div>
            <button
              onClick={() => setActiveTab('pending')}
              className="text-xs text-amber-700 hover:text-amber-900 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>Pending Radar</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-3 divide-y divide-slate-100">
            {longPendingCases.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                No cases exceeding 30 days pending threshold.
              </div>
            ) : (
              longPendingCases.map((c) => (
                <div
                  key={c.id}
                  onClick={() => setSelectedCaseId(c.id)}
                  className="py-2.5 px-2 hover:bg-slate-50 rounded cursor-pointer transition flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-slate-800">{c.id}</span>
                      <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded">
                        {c.daysPending} Days Stalled
                      </span>
                    </div>
                    <div className="text-xs font-medium text-slate-800 line-clamp-1 mt-0.5">{c.title}</div>
                    <div className="text-[10px] text-slate-500">
                      Reason: {c.pendingReason} (Brgy. {c.barangay})
                    </div>
                  </div>
                  <button className="text-xs text-blue-600 hover:underline">Inspect</button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Active DILG Directives & Compliance Score */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
                <FileCheck2 className="w-4 h-4 text-purple-600" />
                DILG Recommendations & Agency Responses
              </h3>
              <p className="text-xs text-slate-500">Track compliance and response turnaround</p>
            </div>
            <button
              onClick={() => setActiveTab('recommendations')}
              className="text-xs text-purple-700 hover:text-purple-900 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>Manage Directives</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-3 divide-y divide-slate-100">
            {allDilgRecs.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                No recommendations issued yet.
              </div>
            ) : (
              allDilgRecs.slice(0, 4).map((r) => (
                <div
                  key={r.id}
                  onClick={() => {
                    setSelectedCaseId(r.caseId);
                    setActiveTab('cases');
                  }}
                  className="py-2.5 px-2 hover:bg-slate-50 rounded cursor-pointer transition space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-purple-900">{r.id}</span>
                      <span className="text-xs font-semibold text-slate-800">For {r.caseId}</span>
                    </div>
                    <StatusBadge status={r.status} size="sm" />
                  </div>
                  <p className="text-xs text-slate-700 line-clamp-1">{r.detailedRecommendation}</p>
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span>Target: {r.targetAgency}</span>
                    <span>Deadline: {r.responseDeadline}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
