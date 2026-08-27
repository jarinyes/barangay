import React, { useState } from 'react';
import { 
  FileCheck2, 
  Search, 
  Filter, 
  Send, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  ExternalLink,
  PlusCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../common/StatusBadge';
import { DilgRecommendation } from '../../types';
import { formatDate } from '../../utils/reportGenerators';

export const DilgRecommendationsHub: React.FC = () => {
  const { 
    cases, 
    setSelectedCaseId, 
    currentUser, 
    issueDilgRecommendation,
    respondToDilgRecommendation,
    completeDilgRecommendation
  } = useApp();

  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  // Response input state
  const [activeRecId, setActiveRecId] = useState<string | null>(null);
  const [responseText, setResponseText] = useState('');

  // Collect all DILG recommendations across cases
  const allRecommendations = (cases || []).flatMap((c) =>
    (c.dilgRecommendations || []).map((r) => ({
      ...r,
      caseTitle: c.title || 'Untitled Case',
      caseBarangay: c.barangay || 'General',
      casePriority: c.priority || 'Medium',
      caseStatus: c.status || 'New'
    }))
  );

  const filteredRecs = allRecommendations.filter((r) => {
    if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
    if (priorityFilter !== 'ALL' && r.priority !== priorityFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const mId = r.id.toLowerCase().includes(q);
      const mCase = r.caseId.toLowerCase().includes(q);
      const mTitle = r.caseTitle.toLowerCase().includes(q);
      const mAgency = r.targetAgency.toLowerCase().includes(q);
      const mDetails = r.detailedRecommendation.toLowerCase().includes(q);
      if (!mId && !mCase && !mTitle && !mAgency && !mDetails) return false;
    }
    return true;
  });

  const handleResponseSubmit = (caseId: string, recId: string) => {
    if (!responseText.trim()) {
      alert('Please enter compliance action taken.');
      return;
    }
    respondToDilgRecommendation(caseId, recId, responseText);
    setActiveRecId(null);
    setResponseText('');
  };

  return (
    <div id="dilg-recommendations-hub-view" className="space-y-4">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white rounded-xl p-5 shadow-sm border border-purple-800/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-800/80 text-emerald-100 text-xs font-semibold mb-2">
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>LGU Municipal Directives & Statutory Oversight</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">
            LGU Executive Recommendations & Administrative Directives
          </h2>
          <p className="text-xs text-emerald-200 mt-1 max-w-2xl">
            Issuing guidance, tracking mandatory responses, and ensuring barangay and municipal compliance with statutory standards in Roxas, Oriental Mindoro.
          </p>
        </div>

        <div className="text-right text-xs bg-slate-800/80 p-3 rounded-lg border border-slate-700">
          <div className="text-slate-400">Total Directives Issued</div>
          <div className="text-2xl font-bold text-white">{allRecommendations.length}</div>
          <div className="text-[11px] text-amber-400 font-medium mt-0.5">
            {allRecommendations.filter((r) => r.status === 'Awaiting Agency Response').length} Awaiting Action
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
              placeholder="Search recommendation, case ID, target..."
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
            <option value="ALL">All Compliance Statuses</option>
            <option value="Awaiting Agency Response">Awaiting Agency Response</option>
            <option value="Response Submitted">Response Submitted</option>
            <option value="Under DILG Review">Under DILG Review</option>
            <option value="Completed">Completed / Verified</option>
            <option value="Overdue">Overdue</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="p-1.5 bg-slate-50 rounded border border-slate-300 font-medium text-xs"
          >
            <option value="ALL">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Normal">Normal</option>
          </select>
        </div>

        <div className="text-[11px] text-slate-500 font-medium">
          Showing <strong>{filteredRecs.length}</strong> of <strong>{allRecommendations.length}</strong> directives
        </div>
      </div>

      {/* Recommendations Cards */}
      <div className="space-y-3">
        {filteredRecs.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400 bg-white rounded-xl border border-slate-200">
            No DILG recommendations match the selected filters.
          </div>
        ) : (
          filteredRecs.map((rec) => (
            <div
              key={rec.id}
              className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3 hover:border-purple-300 transition"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-slate-100 gap-2">
                <div className="flex items-center space-x-2.5">
                  <span className="font-mono font-bold text-xs text-purple-900 bg-purple-100 px-2 py-0.5 rounded">
                    {rec.id}
                  </span>
                  <span className="font-bold text-xs text-slate-800">{rec.recommendationType}</span>
                  <button
                    onClick={() => setSelectedCaseId(rec.caseId)}
                    className="font-mono font-bold text-xs text-blue-700 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>{rec.caseId}</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </button>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    rec.priority === 'Critical' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {rec.priority} Priority
                  </span>
                  <StatusBadge status={rec.status} size="sm" />
                </div>
              </div>

              {/* Case Subject */}
              <div className="text-xs text-slate-700">
                <span className="font-semibold text-slate-900">Case: {rec.caseTitle}</span>
                <span className="text-slate-400 ml-2">• Brgy. {rec.caseBarangay}</span>
              </div>

              {/* Detailed Directive Body */}
              <div className="bg-purple-50/40 p-3 rounded-lg border border-purple-100 text-xs text-slate-800">
                <span className="font-bold text-purple-900 block text-[11px] mb-1">
                  DILG Statutory Directive / Recommendation:
                </span>
                <p className="leading-relaxed">{rec.detailedRecommendation}</p>
              </div>

              {/* Directive Metadata */}
              <div className="text-[11px] text-slate-500 flex flex-wrap justify-between items-center gap-2 pt-1 border-t border-slate-100">
                <span>Issued by: <strong>{rec.dilgOfficer}</strong> ({rec.dilgOfficerPosition})</span>
                <span>Target Agency: <strong className="text-slate-800">{rec.targetAgency}</strong></span>
                <span className="text-rose-700 font-bold">Response Deadline: {rec.responseDeadline}</span>
              </div>

              {/* Agency Compliance Response Section */}
              {rec.agencyResponse ? (
                <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200 text-xs space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-bold text-emerald-900">
                    <span>Agency Compliance Response (Submitted by {rec.agencyActionOfficer})</span>
                    <span>{formatDate(rec.dateResponseSubmitted)}</span>
                  </div>
                  <p className="text-emerald-800">{rec.agencyResponse}</p>

                  {(currentUser.agencyType === 'LGU' || currentUser.agencyType === 'ADMIN' || currentUser.agencyType === 'DILG') && rec.status !== 'Completed' && (
                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => completeDilgRecommendation(rec.caseId, rec.id)}
                        className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-semibold cursor-pointer"
                      >
                        Verify & Close Directive
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="pt-1 flex items-center justify-between">
                  <button
                    onClick={() => setSelectedCaseId(rec.caseId)}
                    className="text-xs text-blue-600 hover:underline cursor-pointer"
                  >
                    Open Linked Case Dossier
                  </button>

                  {activeRecId === rec.id ? (
                    <div className="w-full max-w-lg space-y-2 bg-slate-50 p-3 rounded border">
                      <textarea
                        value={responseText}
                        onChange={(e) => setResponseText(e.target.value)}
                        placeholder="State action taken, resolution status, or documents submitted..."
                        rows={2}
                        className="w-full p-2 bg-white text-xs rounded border border-slate-300"
                      />
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => setActiveRecId(null)}
                          className="px-2.5 py-1 text-slate-500 hover:text-slate-700 text-xs"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleResponseSubmit(rec.caseId, rec.id)}
                          className="px-3 py-1 bg-purple-700 hover:bg-purple-800 text-white rounded text-xs font-semibold"
                        >
                          Submit Response
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setActiveRecId(rec.id)}
                      className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded text-xs font-semibold cursor-pointer shadow-sm"
                    >
                      Submit Compliance Response
                    </button>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
