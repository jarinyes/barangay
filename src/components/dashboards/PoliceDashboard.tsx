import React from 'react';
import { 
  Shield, 
  FileSpreadsheet, 
  CheckCircle2, 
  Clock, 
  ArrowRightLeft, 
  FileText, 
  AlertCircle,
  FolderLock,
  ArrowUpRight
} from 'lucide-react';
import { useCases } from '../../hooks/useCases';
import { useUI } from '../../hooks/useUI';
import { StatusBadge, PriorityBadge } from '../common/StatusBadge';
import { formatDateShort } from '../../utils/reportGenerators';

export const PoliceDashboard: React.FC = () => {
  const { cases, setSelectedCaseId } = useCases();
  const { setActiveTab } = useUI();

  const policeCases = cases.filter(
    (c) => c.isReferredToPolice || c.currentHandlingAgency.includes('Police') || c.status === 'Referred to Police Station'
  );

  const pendingReceiptCount = policeCases.filter((c) => c.status === 'Referred to Police Station').length;
  const underInvestigationCount = policeCases.filter((c) => c.status === 'Under Investigation' || c.status === 'Received').length;
  const courtFilingCount = policeCases.filter((c) => c.outcomeType === 'Referred to Prosecutor / Court' || c.status === 'Closed').length;
  const pendingDocsCount = policeCases.filter((c) => c.pendingReason === 'Awaiting additional documents' || c.pendingReason === 'Awaiting witness statement').length;

  return (
    <div id="police-dashboard-view" className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 border border-blue-900/40">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-blue-800/80 text-blue-100 text-xs font-semibold mb-2">
            <Shield className="w-3.5 h-3.5" />
            <span>PNP MIMAROPA • Roxas Municipal Police Station</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">
            Police Blotter & Inter-Agency Criminal Investigation Gateway
          </h2>
          <p className="text-xs text-blue-200 mt-1 max-w-2xl">
            Managing cases referred from the 16 Barangays of Roxas, preliminary investigation tracking, medico-legal requirements, and prosecutor endorsements.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('referrals')}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow transition flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowRightLeft className="w-4 h-4" />
            Manage Referral Inbox
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs text-slate-500 uppercase font-bold tracking-tight">Referred to Police</p>
          <h3 className="text-3xl font-bold mt-1 text-slate-900">{policeCases.length}</h3>
          <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-500 font-bold">
            <span>Endorsed Cases</span>
            <div className="h-px flex-1 bg-slate-100"></div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs text-slate-500 uppercase font-bold tracking-tight">Pending Receipt</p>
          <h3 className="text-3xl font-bold mt-1 text-amber-500">{pendingReceiptCount}</h3>
          <div className="flex items-center gap-2 mt-2 text-[10px] text-amber-600 font-bold">
            <span>Awaiting Blotter</span>
            <div className="h-px flex-1 bg-slate-100"></div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs text-slate-500 uppercase font-bold tracking-tight">Investigation</p>
          <h3 className="text-3xl font-bold mt-1 text-blue-600">{underInvestigationCount}</h3>
          <div className="flex items-center gap-2 mt-2 text-[10px] text-blue-600 font-bold">
            <span>IOC Assigned</span>
            <div className="h-px flex-1 bg-slate-100"></div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs text-slate-500 uppercase font-bold tracking-tight">Prosecutor Endorsed</p>
          <h3 className="text-3xl font-bold mt-1 text-emerald-600">{courtFilingCount}</h3>
          <div className="flex items-center gap-2 mt-2 text-[10px] text-emerald-600 font-bold">
            <span>Preliminary Filed</span>
            <div className="h-px flex-1 bg-slate-100"></div>
          </div>
        </div>
      </div>

      {/* Police Cases Ledger */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-sm text-slate-800">
              Roxas MPS Inter-Agency Investigation Docket
            </h3>
            <p className="text-xs text-slate-500">Cases referred from Barangay Halls across Roxas</p>
          </div>
          <button
            onClick={() => setActiveTab('cases')}
            className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <span>View Full Ledger</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="mt-3 divide-y divide-slate-100">
          {policeCases.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No police referrals currently registered.
            </div>
          ) : (
            policeCases.map((c) => (
              <div
                key={c.id}
                onClick={() => setSelectedCaseId(c.id)}
                className="py-3 px-2 hover:bg-slate-50 rounded-lg cursor-pointer transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-blue-800">{c.id}</span>
                    {c.blotterEntryNo && (
                      <span className="text-[11px] font-mono font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border">
                        {c.blotterEntryNo}
                      </span>
                    )}
                    <StatusBadge status={c.status} size="sm" />
                    <PriorityBadge priority={c.priority} />
                    <span className="text-[11px] text-slate-500 bg-slate-50 px-2 py-0.5 rounded">
                      Brgy. {c.barangay}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-slate-800">{c.title}</div>
                  <div className="text-[11px] text-slate-500">
                    Complainant: {c.complainants.map((p) => p.name).join(', ') || 'N/A'} • Respondent: {c.respondents.map((p) => p.name).join(', ') || 'Unknown'}
                  </div>
                </div>

                <div className="text-right flex sm:flex-col items-center sm:items-end justify-between text-xs">
                  <span className="text-[11px] font-medium text-blue-900">
                    {c.assignedPersonnel || 'Assigned Investigator'}
                  </span>
                  {c.isPending && (
                    <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded font-medium mt-1">
                      Pending: {c.pendingReason} ({c.daysPending}d)
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
