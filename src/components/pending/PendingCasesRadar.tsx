import React, { useState } from 'react';
import { 
  Clock, 
  AlertTriangle, 
  Filter, 
  Search, 
  ArrowRightLeft, 
  Building2, 
  Download, 
  CheckCircle2, 
  Eye,
  FileSpreadsheet
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StatusBadge, PriorityBadge } from '../common/StatusBadge';
import { ROXAS_BARANGAYS, PendingReason } from '../../types';
import { formatDateShort, exportToCsv } from '../../utils/reportGenerators';

export const PendingCasesRadar: React.FC = () => {
  const { cases, setSelectedCaseId } = useApp();

  const [selectedReason, setSelectedReason] = useState<string>('ALL');
  const [selectedBarangay, setSelectedBarangay] = useState<string>('ALL');
  const [durationFilter, setDurationFilter] = useState<'ALL' | 'OVERDUE' | 'MODERATE' | 'RECENT'>('ALL');
  const [search, setSearch] = useState('');

  // All pending cases
  const allPending = cases.filter((c) => c.isPending || c.status === 'Pending' || c.status.startsWith('Awaiting'));

  // Filtered
  const filteredPending = allPending.filter((c) => {
    if (selectedReason !== 'ALL' && c.pendingReason !== selectedReason) return false;
    if (selectedBarangay !== 'ALL' && c.barangay !== selectedBarangay) return false;

    if (durationFilter === 'OVERDUE' && c.daysPending <= 30) return false;
    if (durationFilter === 'MODERATE' && (c.daysPending < 15 || c.daysPending > 30)) return false;
    if (durationFilter === 'RECENT' && c.daysPending >= 15) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const mId = c.id.toLowerCase().includes(q);
      const mTitle = c.title.toLowerCase().includes(q);
      const mReason = c.pendingReason?.toLowerCase().includes(q);
      const mExpl = c.pendingExplanation?.toLowerCase().includes(q);
      if (!mId && !mTitle && !mReason && !mExpl) return false;
    }

    return true;
  });

  // Reason breakdown
  const reasonCounts: Record<string, number> = {};
  allPending.forEach((c) => {
    const r = c.pendingReason || 'Unclassified Delay';
    reasonCounts[r] = (reasonCounts[r] || 0) + 1;
  });

  // Overdue count (>30 days)
  const overdueCases = allPending.filter((c) => c.daysPending > 30);

  const handleExportCsv = () => {
    const headers = [
      'Case ID',
      'Title',
      'Barangay',
      'Days Pending',
      'Pending Reason',
      'Pending Explanation',
      'Required Next Action',
      'Current Agency',
      'Date Reported'
    ];

    const rows = filteredPending.map((c) => [
      c.id,
      c.title,
      c.barangay,
      c.daysPending,
      c.pendingReason || '',
      c.pendingExplanation || '',
      c.requiredNextAction || '',
      c.currentHandlingAgency,
      c.dateReported
    ]);

    exportToCsv(`B-CONNECT_Pending_Cases_Radar_${new Date().toISOString().slice(0, 10)}`, headers, rows);
  };

  return (
    <div id="pending-radar-view" className="space-y-4">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-900 via-stone-900 to-slate-900 text-white rounded-xl p-5 shadow-sm border border-amber-800/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-amber-800/80 text-amber-100 text-xs font-semibold mb-2">
            <Clock className="w-3.5 h-3.5" />
            <span>Delay Diagnostics & Statutory Timeline Radar</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">
            "Why is this case pending?" Analysis & Action Radar
          </h2>
          <p className="text-xs text-amber-200 mt-1 max-w-2xl">
            Tracking stalled investigations, Katarungang Pambarangay mediation delays, missing witness affidavits, and overdue agency responses in Roxas, Oriental Mindoro.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleExportCsv}
            className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold shadow transition flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Export Pending Analysis CSV
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs text-slate-500 uppercase font-bold tracking-tight">Active Pending</p>
          <h3 className="text-3xl font-bold mt-1 text-slate-900">{allPending.length}</h3>
          <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-500 font-bold">
            <span>Across all 4 agencies</span>
            <div className="h-px flex-1 bg-slate-100"></div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs text-slate-500 uppercase font-bold tracking-tight">Overdue (&gt;30 Days)</p>
          <h3 className="text-3xl font-bold mt-1 text-rose-600">{overdueCases.length}</h3>
          <div className="flex items-center gap-2 mt-2 text-[10px] text-rose-600 font-bold">
            <span>Requires urgent review</span>
            <div className="h-px flex-1 bg-slate-100"></div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs text-slate-500 uppercase font-bold tracking-tight">Moderate (15-30 Days)</p>
          <h3 className="text-3xl font-bold mt-1 text-amber-500">
            {allPending.filter((c) => c.daysPending >= 15 && c.daysPending <= 30).length}
          </h3>
          <div className="flex items-center gap-2 mt-2 text-[10px] text-amber-600 font-bold">
            <span>Active mediation / review</span>
            <div className="h-px flex-1 bg-slate-100"></div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs text-slate-500 uppercase font-bold tracking-tight">Recent (&lt;15 Days)</p>
          <h3 className="text-3xl font-bold mt-1 text-blue-600">
            {allPending.filter((c) => c.daysPending < 15).length}
          </h3>
          <div className="flex items-center gap-2 mt-2 text-[10px] text-blue-600 font-bold">
            <span>Standard KP window</span>
            <div className="h-px flex-1 bg-slate-100"></div>
          </div>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
          <div>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">Search Keywords</label>
            <input
              type="text"
              placeholder="Search case, title, reason..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full p-1.5 text-xs bg-slate-50 rounded border border-slate-300"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">Specific Pending Reason</label>
            <select
              value={selectedReason}
              onChange={(e) => setSelectedReason(e.target.value)}
              className="w-full p-1.5 text-xs bg-slate-50 rounded border border-slate-300"
            >
              <option value="ALL">All Pending Reasons</option>
              {Object.keys(reasonCounts).map((r) => (
                <option key={r} value={r}>{r} ({reasonCounts[r]})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">Barangay</label>
            <select
              value={selectedBarangay}
              onChange={(e) => setSelectedBarangay(e.target.value)}
              className="w-full p-1.5 text-xs bg-slate-50 rounded border border-slate-300"
            >
              <option value="ALL">All Barangays</option>
              {ROXAS_BARANGAYS.map((b) => (
                <option key={b} value={b}>Brgy. {b}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">Duration Threshold</label>
            <select
              value={durationFilter}
              onChange={(e) => setDurationFilter(e.target.value as any)}
              className="w-full p-1.5 text-xs bg-slate-50 rounded border border-slate-300 font-medium"
            >
              <option value="ALL">All Durations</option>
              <option value="OVERDUE">Overdue Only (&gt;30 Days)</option>
              <option value="MODERATE">Moderate (15-30 Days)</option>
              <option value="RECENT">Recent (&lt;15 Days)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Pending Cases Detailed Ledger */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs divide-y divide-slate-200">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-3">Case ID</th>
                <th className="py-3 px-3">Subject / Barangay</th>
                <th className="py-3 px-3">Days Pending</th>
                <th className="py-3 px-3">Pending Reason</th>
                <th className="py-3 px-3">Mandatory Explanation</th>
                <th className="py-3 px-3">Required Next Action</th>
                <th className="py-3 px-3 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPending.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No pending cases match the selected filter criteria.
                  </td>
                </tr>
              ) : (
                filteredPending.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-amber-50/40 transition cursor-pointer"
                    onClick={() => setSelectedCaseId(c.id)}
                  >
                    <td className="py-3 px-3 align-top font-mono font-bold text-blue-700 whitespace-nowrap">
                      {c.id}
                      <div className="text-[10px] text-slate-400 font-normal">
                        Reported: {formatDateShort(c.dateReported)}
                      </div>
                    </td>

                    <td className="py-3 px-3 align-top max-w-xs">
                      <div className="font-semibold text-slate-900 line-clamp-1">{c.title}</div>
                      <div className="text-[11px] text-slate-500">
                        Brgy. {c.barangay} • Handled by: {c.currentHandlingAgency}
                      </div>
                    </td>

                    <td className="py-3 px-3 align-top whitespace-nowrap">
                      <span className={`inline-block font-mono font-bold px-2 py-0.5 rounded text-xs ${
                        c.daysPending > 30
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : c.daysPending >= 15
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-blue-50 text-blue-800'
                      }`}>
                        {c.daysPending} days
                      </span>
                    </td>

                    <td className="py-3 px-3 align-top max-w-xs">
                      <span className="font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded text-[11px] block border border-amber-200/60">
                        {c.pendingReason || 'Unclassified'}
                      </span>
                    </td>

                    <td className="py-3 px-3 align-top max-w-sm text-slate-700 text-[11px]">
                      {c.pendingExplanation || 'No detailed explanation provided.'}
                    </td>

                    <td className="py-3 px-3 align-top max-w-xs text-blue-800 text-[11px] font-medium">
                      {c.requiredNextAction || 'Awaiting action.'}
                    </td>

                    <td className="py-3 px-3 align-top text-right whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCaseId(c.id);
                        }}
                        className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded text-xs font-semibold"
                      >
                        Action Dossier
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
