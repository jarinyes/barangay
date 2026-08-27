import React, { useState } from 'react';
import { 
  FilePieChart, 
  Download, 
  Printer, 
  Clock, 
  AlertTriangle, 
  Building2, 
  Filter, 
  Calendar,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { generateAnnualStatistics, exportToCsv, formatDateShort } from '../../utils/reportGenerators';
import { ROXAS_BARANGAYS } from '../../types';

export const AnnualPendingReport: React.FC = () => {
  const { cases, setSelectedCaseId } = useApp();
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedBarangay, setSelectedBarangay] = useState<string>('ALL');

  const pendingCases = cases.filter((c) => {
    const yr = new Date(c.dateReported).getFullYear();
    if (yr !== selectedYear) return false;
    if (!c.isPending && c.status !== 'Pending') return false;
    if (selectedBarangay !== 'ALL' && c.barangay !== selectedBarangay) return false;
    return true;
  });

  const totalPending = pendingCases.length;
  const overdueCount = pendingCases.filter((c) => c.daysPending > 30).length;
  const avgDaysPending = totalPending > 0 
    ? Math.round(pendingCases.reduce((acc, c) => acc + (c.daysPending || 0), 0) / totalPending) 
    : 0;

  // Reason breakdown
  const reasonCounts: Record<string, number> = {};
  pendingCases.forEach((c) => {
    const r = c.pendingReason || 'Unclassified Reason';
    reasonCounts[r] = (reasonCounts[r] || 0) + 1;
  });

  // Barangay breakdown
  const barangayCounts: Record<string, number> = {};
  pendingCases.forEach((c) => {
    barangayCounts[c.barangay] = (barangayCounts[c.barangay] || 0) + 1;
  });

  const handleExportCsv = () => {
    const headers = [
      'Case ID',
      'Incident Title',
      'Barangay',
      'Days Pending',
      'Pending Reason',
      'Detailed Explanation',
      'Next Required Action',
      'Handling Agency'
    ];

    const rows = pendingCases.map((c) => [
      c.id,
      c.title,
      c.barangay,
      c.daysPending,
      c.pendingReason || '',
      c.pendingExplanation || '',
      c.requiredNextAction || '',
      c.currentHandlingAgency
    ]);

    exportToCsv(`B-CONNECT_Annual_Pending_Cases_Report_${selectedYear}`, headers, rows);
  };

  return (
    <div id="annual-pending-report-view" className="space-y-4">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-stone-900 text-white rounded-xl p-5 shadow-sm border border-amber-800/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-amber-800/80 text-amber-100 text-xs font-semibold mb-2">
            <FilePieChart className="w-3.5 h-3.5" />
            <span>Annual Pending-Case Analytics & Diagnostics</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">
            Annual Pending Cases Analysis & Delay Mitigation Report ({selectedYear})
          </h2>
          <p className="text-xs text-amber-200 mt-1 max-w-2xl">
            In-depth evaluation of delayed dockets, Katarungang Pambarangay bottlenecks, subpoena summons, and agency referral backlogs in Roxas, Oriental Mindoro.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Export Pending CSV
          </button>
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold shadow transition flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Print Analysis
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 uppercase">Total Pending Cases</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{totalPending} Cases</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Recorded in {selectedYear}</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-rose-200 bg-rose-50/30 shadow-sm">
          <div className="text-xs font-semibold text-rose-700 uppercase flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            <span>Overdue Cases (&gt;30d)</span>
          </div>
          <div className="text-2xl font-bold text-rose-700 mt-1">{overdueCount} Cases</div>
          <div className="text-[11px] text-rose-600 mt-0.5">Exceeding standard KP timeline</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-amber-600 uppercase">Average Delay</div>
          <div className="text-2xl font-bold text-amber-700 mt-1">{avgDaysPending} Days</div>
          <div className="text-[11px] text-amber-600 mt-0.5">Across active pending matters</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-purple-600 uppercase">Primary Delay Factor</div>
          <div className="text-sm font-bold text-purple-900 mt-1 truncate">
            {Object.entries(reasonCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'}
          </div>
          <div className="text-[11px] text-purple-600 mt-0.5">Most common cause</div>
        </div>
      </div>

      {/* Two Column Layout: Reason Distribution + Barangay Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Delay Reason Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-3">
          <h3 className="font-bold text-sm text-slate-900">
            Categorical Breakdown: Why Cases Are Pending ({selectedYear})
          </h3>
          <p className="text-xs text-slate-500">
            Official justifications recorded by desk officers and Lupon secretaries
          </p>

          <div className="space-y-3 pt-2">
            {Object.entries(reasonCounts).map(([reason, cnt]) => {
              const pct = totalPending > 0 ? Math.round((cnt / totalPending) * 100) : 0;
              return (
                <div key={reason} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-700 truncate max-w-[280px]">{reason}</span>
                    <span className="font-mono text-amber-900 font-bold">{cnt} case{cnt === 1 ? '' : 's'} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-amber-600 h-2 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Barangay Pending Load */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-3">
          <h3 className="font-bold text-sm text-slate-900">
            Pending Cases Distribution by Barangay
          </h3>
          <p className="text-xs text-slate-500">16 Barangays of Roxas, Oriental Mindoro</p>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {ROXAS_BARANGAYS.map((bgy) => {
              const cnt = barangayCounts[bgy] || 0;
              const pct = totalPending > 0 ? Math.round((cnt / totalPending) * 100) : 0;
              return (
                <div key={bgy} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-slate-700">Brgy. {bgy}</span>
                    <span className="font-mono text-slate-500 font-bold">{cnt} pending</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-rose-500 h-1.5 rounded-full"
                      style={{ width: `${pct || (cnt > 0 ? 10 : 0)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Actionable Recommendations for DILG & Liga ng mga Barangay */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-3">
        <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          DILG & Municipal Recommended Action Plan for Delayed Dockets
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 space-y-1">
            <span className="font-bold text-amber-900 block">1. CFA Issuance for Stalled KP</span>
            <p className="text-slate-700 text-[11px] leading-relaxed">
              Cases pending over 30 days due to respondent non-appearance should be evaluated for Certificate to File Action (CFA) to prevent unconstitutional delays.
            </p>
          </div>

          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 space-y-1">
            <span className="font-bold text-blue-900 block">2. Police Investigation Coordination</span>
            <p className="text-slate-700 text-[11px] leading-relaxed">
              Expedite medico-legal and witness affidavits by assigning duty investigators from Roxas MPS to assist remote barangay desk officers.
            </p>
          </div>

          <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 space-y-1">
            <span className="font-bold text-emerald-900 block">3. Semi-Annual Lupon Training</span>
            <p className="text-slate-700 text-[11px] leading-relaxed">
              Conduct refresher seminars for Lupon Tagapamayapa secretaries on proper docketing, summons serving, and compliance timelines under RA 7160.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
