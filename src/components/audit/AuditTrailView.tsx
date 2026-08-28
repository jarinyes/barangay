import React, { useState } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  ShieldCheck, 
  Download, 
  User, 
  Building2, 
  Clock,
  Lock
} from 'lucide-react';
import { useCases } from '../../hooks/useCases';
import { formatDate, exportToCsv } from '../../utils/reportGenerators';

export const AuditTrailView: React.FC = () => {
  const { auditLogs } = useCases();
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [agencyFilter, setAgencyFilter] = useState('ALL');

  const filteredLogs = auditLogs.filter((log) => {
    if (actionFilter !== 'ALL' && log.action !== actionFilter) return false;
    if (agencyFilter !== 'ALL' && !log.userAgency.includes(agencyFilter)) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const mCase = log.caseId?.toLowerCase().includes(q);
      const mUser = log.userName.toLowerCase().includes(q);
      const mAction = log.action.toLowerCase().includes(q);
      const mDetails = log.details.toLowerCase().includes(q);
      if (!mCase && !mUser && !mAction && !mDetails) return false;
    }
    return true;
  });

  const handleExportCsv = () => {
    const headers = ['Log ID', 'Timestamp', 'Actor Name', 'Actor Role', 'Agency', 'Action', 'Case ID', 'Details', 'IP Address'];
    const rows = filteredLogs.map((l) => [
      l.id,
      l.timestamp,
      l.userName,
      l.userRole,
      l.userAgency,
      l.action,
      l.caseId || '',
      l.details,
      l.ipAddress || '127.0.0.1'
    ]);
    exportToCsv(`B-CONNECT_Audit_Trail_${new Date().toISOString().slice(0, 10)}`, headers, rows);
  };

  return (
    <div id="audit-trail-view" className="space-y-4">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-stone-900 to-slate-950 text-white rounded-xl p-5 shadow-sm border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-200 text-xs font-semibold mb-2">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Immutable Integrity Log • Chain of Custody</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">
            System Audit Trail & Accountability Logs
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Real-time, non-repudiable audit logs recording all case registrations, status transitions, delay diagnoses, inter-agency endorsements, and DILG directives.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleExportCsv}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Export Audit Log CSV
          </button>
        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search user, action, case ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-2.5 py-1.5 bg-slate-50 rounded border border-slate-300 text-xs focus:bg-white"
            />
          </div>

          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="p-1.5 bg-slate-50 rounded border border-slate-300 font-medium text-xs"
          >
            <option value="ALL">All Actions</option>
            <option value="CASE_CREATED">Case Created</option>
            <option value="STATUS_UPDATED">Status Updated</option>
            <option value="PENDING_REASON_UPDATED">Pending Reason Updated</option>
            <option value="CASE_REFERRED">Case Referred</option>
            <option value="REFERRAL_ACCEPTED">Referral Accepted</option>
            <option value="DILG_RECOMMENDATION_ISSUED">DILG Recommendation Issued</option>
            <option value="DILG_RECOMMENDATION_RESPONDED">DILG Recommendation Responded</option>
            <option value="DILG_RECOMMENDATION_COMPLETED">DILG Recommendation Completed</option>
            <option value="ATTACHMENT_ADDED">Attachment Added</option>
          </select>

          <select
            value={agencyFilter}
            onChange={(e) => setAgencyFilter(e.target.value)}
            className="p-1.5 bg-slate-50 rounded border border-slate-300 font-medium text-xs"
          >
            <option value="ALL">All Agencies</option>
            <option value="Barangay">Barangay</option>
            <option value="Police">Police</option>
            <option value="Municipal">LGU / Municipal</option>
            <option value="DILG">DILG</option>
          </select>
        </div>

        <div className="text-[11px] text-slate-500 font-medium">
          Showing <strong>{filteredLogs.length}</strong> of <strong>{auditLogs.length}</strong> recorded audit events
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs divide-y divide-slate-200">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-3">Timestamp</th>
                <th className="py-3 px-3">Actor & Agency</th>
                <th className="py-3 px-3">Action Type</th>
                <th className="py-3 px-3">Case ID</th>
                <th className="py-3 px-3">Event Details</th>
                <th className="py-3 px-3">Terminal Node</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-sans text-xs">
                    No audit log records match the search filter.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log, idx) => (
                  <tr key={log.id ? `${log.id}-${idx}` : `log-${idx}`} className="hover:bg-slate-50 transition">
                    <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">
                      {formatDate(log.timestamp)}
                    </td>

                    <td className="py-2.5 px-3 font-sans max-w-xs">
                      <div className="font-bold text-slate-900">{log.userName}</div>
                      <div className="text-[10px] text-slate-500">{log.userRole} • {log.userAgency}</div>
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800 border">
                        {log.action}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 font-bold text-blue-700 whitespace-nowrap">
                      {log.caseId || 'SYSTEM'}
                    </td>

                    <td className="py-2.5 px-3 font-sans text-slate-700 max-w-md">
                      {log.details}
                    </td>

                    <td className="py-2.5 px-3 text-slate-400 text-[10px]">
                      {log.ipAddress || '192.168.1.104'}
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
