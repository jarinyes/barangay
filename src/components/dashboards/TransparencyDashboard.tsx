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
import { useCases } from '../../hooks/useCases';
import { generateAnnualStatistics } from '../../utils/reportGenerators';
import { ROXAS_BARANGAYS } from '../../types';

export const TransparencyDashboard: React.FC = () => {
  const { cases } = useCases();
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
            {stats.totalCases > 0 ? Math.round(((stats.totalResolvedCases) / stats.totalCases) * 100) : 0}%
          </h3>
          <p className="text-[10px] text-teal-600 font-medium mt-1">
            {stats.totalCases > 0 ? Math.round(((stats.totalResolvedCases) / stats.totalCases) * 100) : 0}% settlement rate
          </p>
        </div>

        <div className="bg-amber-600 rounded-lg shadow-sm border border-amber-700 p-4 flex flex-col justify-center items-center text-white">
          <span className="text-xs uppercase font-bold tracking-wider opacity-90 mb-1 text-center">Active & Ongoing Cases</span>
          <span className="text-4xl font-extrabold">{stats.totalOngoingCases}</span>
          <p className="text-[10px] text-amber-100 font-medium mt-1 text-center">
            Currently unresolved
          </p>
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

        </div>
      </div>
    </div>
  );
};
