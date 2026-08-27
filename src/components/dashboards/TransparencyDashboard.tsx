import React from 'react';
import { 
  Eye, 
  ShieldCheck, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  Building2, 
  FileText, 
  Lock
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { generateAnnualStatistics } from '../../utils/reportGenerators';
import { ROXAS_BARANGAYS } from '../../types';

export const TransparencyDashboard: React.FC = () => {
  const { cases } = useApp();
  const currentYear = 2026;
  const stats = generateAnnualStatistics(cases, currentYear);

  return (
    <div id="transparency-dashboard-view" className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-xl p-5 shadow-sm border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-blue-900/80 text-blue-200 text-xs font-semibold mb-2">
            <Eye className="w-3.5 h-3.5" />
            <span>Public Sector Accountability & Transparency Portal</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">
            Cross-Agency Governance & Case Performance Transparency
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Controlled transparency metrics aggregated across Barangay Local Governments, Roxas Municipal Police Station, Municipal LGU, and DILG Roxas.
          </p>
        </div>

        <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700 text-xs text-slate-300 max-w-xs">
          <div className="flex items-center space-x-1.5 text-emerald-400 font-semibold mb-1">
            <Lock className="w-3.5 h-3.5" />
            <span>Data Privacy Safeguards Active</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Compliant with RA 10173 (Data Privacy Act of 2012). Sensitive personal records, blotter narratives, and witness identities are strictly role-gated.
          </p>
        </div>
      </div>

      {/* Aggregate Transparency KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs text-slate-500 uppercase font-bold tracking-tight">Complaints Received</p>
          <h3 className="text-3xl font-bold mt-1 text-slate-900">{stats.totalCases}</h3>
          <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-500 font-bold">
            <span>Recorded in {currentYear}</span>
            <div className="h-px flex-1 bg-slate-100"></div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs text-slate-500 uppercase font-bold tracking-tight">Resolution Rate</p>
          <h3 className="text-3xl font-bold mt-1 text-emerald-600">
            {stats.totalCases > 0 ? Math.round(((stats.totalResolvedCases + stats.totalClosedCases) / stats.totalCases) * 100) : 0}%
          </h3>
          <div className="flex items-center gap-2 mt-2 text-[10px] text-emerald-600 font-bold">
            <span>{stats.totalResolvedCases + stats.totalClosedCases} Settled or Closed</span>
            <div className="h-px flex-1 bg-slate-100"></div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs text-slate-500 uppercase font-bold tracking-tight">Pending Cases</p>
          <h3 className="text-3xl font-bold mt-1 text-amber-500">{stats.totalPendingCases}</h3>
          <div className="flex items-center gap-2 mt-2 text-[10px] text-amber-600 font-bold">
            <span>Documented Delays</span>
            <div className="h-px flex-1 bg-slate-100"></div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs text-slate-500 uppercase font-bold tracking-tight">Avg Duration</p>
          <h3 className="text-3xl font-bold mt-1 text-blue-600">{stats.averageResolutionDays} days</h3>
          <div className="flex items-center gap-2 mt-2 text-[10px] text-blue-600 font-bold">
            <span>Intake to Resolution</span>
            <div className="h-px flex-1 bg-slate-100"></div>
          </div>
        </div>
      </div>

      {/* Two Column Visual Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cases by Category */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <h3 className="font-bold text-sm text-slate-800 mb-1">
            Case Categories & Incident Types ({currentYear})
          </h3>
          <p className="text-xs text-slate-500 mb-4">Distribution of community disputes and reports</p>

          <div className="space-y-3">
            {Object.entries(stats.casesByCategory).map(([cat, count]) => {
              const pct = stats.totalCases > 0 ? Math.round((count / stats.totalCases) * 100) : 0;
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-700 truncate max-w-[260px]">{cat}</span>
                    <span className="font-mono text-slate-500">{count} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Inter-Agency Transfer & Oversight Metrics */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-4">
          <div>
            <h3 className="font-bold text-sm text-slate-800 mb-1">
              Multi-Agency Coordination & Referral Ratios
            </h3>
            <p className="text-xs text-slate-500">How cases flow through the 4 government levels</p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-sky-50 rounded-lg border border-sky-100">
              <span className="text-sky-800 font-semibold block">Settled at Barangay Level</span>
              <span className="text-2xl font-bold text-sky-900 mt-1 block">
                {stats.casesNotReferredToPolice}
              </span>
              <span className="text-[10px] text-sky-700 mt-0.5 block">
                Katarungang Pambarangay jurisdiction
              </span>
            </div>

            <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-100">
              <span className="text-indigo-800 font-semibold block">Police Station Referrals</span>
              <span className="text-2xl font-bold text-indigo-900 mt-1 block">
                {stats.totalReferredToPolice}
              </span>
              <span className="text-[10px] text-indigo-700 mt-0.5 block">
                Criminal investigation required
              </span>
            </div>

            <div className="p-3 bg-teal-50 rounded-lg border border-teal-100">
              <span className="text-teal-800 font-semibold block">Municipal LGU Referrals</span>
              <span className="text-2xl font-bold text-teal-900 mt-1 block">
                {stats.totalReferredToLgu}
              </span>
              <span className="text-[10px] text-teal-700 mt-0.5 block">
                MENRO / Market / Legal Review
              </span>
            </div>

            <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
              <span className="text-purple-800 font-semibold block">DILG Monitored Matters</span>
              <span className="text-2xl font-bold text-purple-900 mt-1 block">
                {stats.totalMonitoredByDilg}
              </span>
              <span className="text-[10px] text-purple-700 mt-0.5 block">
                Official oversight & compliance directives
              </span>
            </div>
          </div>

          {/* Pending Reason Analysis */}
          <div className="pt-2 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-800 mb-2">Pending Case Reason Summary</h4>
            <div className="space-y-1.5 text-xs">
              {Object.entries(stats.pendingByReason).length === 0 ? (
                <div className="text-slate-400 text-xs py-2">No pending cases.</div>
              ) : (
                Object.entries(stats.pendingByReason).map(([reason, cnt]) => (
                  <div key={reason} className="flex justify-between items-center bg-slate-50 p-1.5 rounded">
                    <span className="text-slate-700">{reason}</span>
                    <span className="font-mono font-bold text-amber-700">{cnt} case{cnt === 1 ? '' : 's'}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
