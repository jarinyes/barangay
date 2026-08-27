import React, { useState } from 'react';
import { 
  ArrowRightLeft, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  Shield, 
  Building2, 
  Landmark, 
  FileText, 
  ExternalLink,
  PlusCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../common/StatusBadge';
import { formatDate } from '../../utils/reportGenerators';

export const InterAgencyReferralHub: React.FC = () => {
  const { cases, setSelectedCaseId, acceptReferral, currentUser } = useApp();

  const [statusFilter, setStatusFilter] = useState('ALL');
  const [agencyFilter, setAgencyFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  // Collect all referrals across cases
  const allReferrals = (cases || []).flatMap((c) => 
    (c.referrals || []).map((r) => ({
      ...r,
      caseTitle: c.title || 'Untitled Case',
      caseBarangay: c.barangay || 'General',
      casePriority: c.priority || 'Medium',
      caseCategory: c.category || 'Dispute'
    }))
  );

  const filteredReferrals = allReferrals.filter((r) => {
    if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
    if (agencyFilter !== 'ALL') {
      if (!r.referringAgency.includes(agencyFilter) && !r.receivingAgency.includes(agencyFilter)) {
        return false;
      }
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      const mId = r.id.toLowerCase().includes(q);
      const mCase = r.caseId.toLowerCase().includes(q);
      const mTitle = r.caseTitle.toLowerCase().includes(q);
      const mReason = r.referralReason.toLowerCase().includes(q);
      if (!mId && !mCase && !mTitle && !mReason) return false;
    }
    return true;
  });

  return (
    <div id="referrals-hub-view" className="space-y-4">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white rounded-xl p-5 shadow-sm border border-blue-800/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-blue-800/80 text-blue-100 text-xs font-semibold mb-2">
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Multi-Agency Coordination Gateway</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">
            Inter-Agency Referral & Transfer Registry
          </h2>
          <p className="text-xs text-blue-200 mt-1 max-w-2xl">
            Managing official case endorsements between Barangay Lupon Offices, Municipal LGU Departments (MSWDO, Legal, POSO, MENRO), and Executive Administration.
          </p>
        </div>

        <div className="text-right text-xs bg-slate-800/80 p-3 rounded-lg border border-slate-700">
          <div className="text-slate-400">Total Referrals Logged</div>
          <div className="text-2xl font-bold text-white">{allReferrals.length}</div>
          <div className="text-[11px] text-amber-400 font-medium mt-0.5">
            {allReferrals.filter((r) => r.status === 'Pending Receipt').length} Pending Acceptance
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search referral ID, case..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-2.5 py-1.5 bg-slate-50 rounded border border-slate-300 text-xs focus:bg-white"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-1.5 bg-slate-50 rounded border border-slate-300 font-medium text-xs"
          >
            <option value="ALL">All Referral Statuses</option>
            <option value="Pending Receipt">Pending Receipt Only</option>
            <option value="Accepted">Accepted</option>
            <option value="Under Investigation">Under Investigation</option>
            <option value="Action In Progress">Action In Progress</option>
            <option value="Completed">Completed</option>
          </select>

          <select
            value={agencyFilter}
            onChange={(e) => setAgencyFilter(e.target.value)}
            className="p-1.5 bg-slate-50 rounded border border-slate-300 font-medium text-xs"
          >
            <option value="ALL">All Agencies</option>
            <option value="Barangay">Barangay Offices</option>
            <option value="LGU">LGU / Municipal Departments</option>
          </select>
        </div>

        <div className="text-[11px] text-slate-500 font-medium">
          Showing <strong>{filteredReferrals.length}</strong> of <strong>{allReferrals.length}</strong> referrals
        </div>
      </div>

      {/* Referrals Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredReferrals.length === 0 ? (
          <div className="md:col-span-2 py-12 text-center text-xs text-slate-400 bg-white rounded-xl border border-slate-200">
            No inter-agency referrals match the specified filters.
          </div>
        ) : (
          filteredReferrals.map((r) => (
            <div
              key={r.id}
              className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3 hover:border-blue-300 transition"
            >
              {/* Header: IDs and Status */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <span className="font-mono font-bold text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                    {r.id}
                  </span>
                  <button
                    onClick={() => setSelectedCaseId(r.caseId)}
                    className="font-mono font-bold text-xs text-slate-800 hover:text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>{r.caseId}</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </button>
                </div>
                <StatusBadge status={r.status} size="sm" />
              </div>

              {/* Agency Transfer Direction */}
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-1.5 min-w-0">
                  <Building2 className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                  <span className="font-semibold text-slate-700 truncate">{r.referringAgency}</span>
                </div>
                <ArrowRightLeft className="w-3.5 h-3.5 text-blue-600 flex-shrink-0 mx-2" />
                <div className="flex items-center space-x-1.5 min-w-0 text-right">
                  <Shield className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                  <span className="font-bold text-blue-900 truncate">{r.receivingAgency}</span>
                </div>
              </div>

              {/* Case Subject */}
              <div>
                <h4 className="font-bold text-xs text-slate-900 line-clamp-1">{r.caseTitle}</h4>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Barangay {r.caseBarangay} • {r.caseCategory}
                </div>
              </div>

              {/* Referral Reason */}
              <div className="text-xs text-slate-700 bg-blue-50/30 p-2 rounded border border-blue-100/60">
                <span className="font-bold text-slate-800 block text-[11px] mb-0.5">Reason for Referral:</span>
                <p className="line-clamp-2">{r.referralReason}</p>
              </div>

              {/* Metadata & Officer */}
              <div className="text-[11px] text-slate-500 flex flex-wrap justify-between items-center pt-1 border-t border-slate-100 gap-1">
                <span>Endorsed by: <strong>{r.referringOfficer}</strong></span>
                <span>Date: {formatDate(r.dateReferred)}</span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setSelectedCaseId(r.caseId)}
                  className="text-xs text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
                >
                  View Case Dossier
                </button>

                {r.status === 'Pending Receipt' && (
                  <button
                    onClick={() => {
                      const caseNo = prompt('Enter Receiving Docket / Blotter Entry Number:');
                      acceptReferral(r.caseId, r.id, caseNo || undefined);
                    }}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold shadow-sm cursor-pointer"
                  >
                    Acknowledge & Receive
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
