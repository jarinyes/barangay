import React from 'react';
import { 
  Settings, 
  Building2, 
  Shield, 
  Landmark, 
  CheckCircle2, 
  Users, 
  Database, 
  RotateCcw, 
  Download, 
  Server,
  Key,
  UserPlus,
  UserCheck,
  Trash2,
  Edit3
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useCases } from '../../hooks/useCases';
import { useUI } from '../../hooks/useUI';
import { AGENCIES_LIST, ROXAS_BARANGAYS } from '../../types';

export const SystemAdminView: React.FC = () => {
  const { users, currentUser, setCurrentUser, resetToDefaults, deleteUser, clearAllUsers } = useAuth();
  const { cases, auditLogs } = useCases();
  const { setIsCreateAccountModalOpen, openEditAccountModal } = useUI();

  const handleExportFullJson = () => {
    const fullBackup = {
      system: 'B-CONNECT Roxas Oriental Mindoro',
      exportDate: new Date().toISOString(),
      cases,
      auditLogs,
      users
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(fullBackup, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `B-CONNECT_Full_Backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div id="system-admin-view" className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white rounded-xl p-5 shadow-sm border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-200 text-xs font-semibold mb-2">
            <Server className="w-3.5 h-3.5 text-blue-400" />
            <span>Master Governance Node & Agency Control</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">
            System Administration & Inter-Agency Node Configuration
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Managing agency access credentials, 6 barangay master registries, graph relationship engine configs, and data retention policies for Roxas, Oriental Mindoro.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            id="btn-admin-create-account-top"
            onClick={() => setIsCreateAccountModalOpen(true)}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow transition flex items-center gap-1.5 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            Create Account
          </button>
          <button
            onClick={handleExportFullJson}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow transition flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Export System JSON Backup
          </button>
          <button
            onClick={() => {
              if (confirm('Are you sure you want to reset all data back to the default seed state?')) {
                resetToDefaults();
              }
            }}
            className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold shadow transition flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            Reset Seed Data
          </button>
        </div>
      </div>

      {/* 4 Connected Agencies Grid */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
        <h3 className="font-bold text-sm text-slate-900">
          Integrated Government Agencies (Roxas, Oriental Mindoro)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {AGENCIES_LIST.map((ag) => (
            <div key={ag.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">{ag.name}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              </div>
              <p className="text-[11px] text-slate-500">{ag.description}</p>
              <div className="pt-2 border-t border-slate-200/60 text-[10px] text-slate-600 flex justify-between">
                <span>Scope: <strong>{ag.jurisdictionScope}</strong></span>
                <span className="text-emerald-700 font-bold">Live Gateway</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Registered User Accounts */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-blue-600" />
              Authorized Multi-Agency Personnel & Officer Accounts ({(users || []).length} Active)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Role-based access credentials mapped to Philippine public safety and local governance statutes
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {users && users.length > 0 && (
              <button
                id="btn-admin-clear-all-users"
                type="button"
                onClick={() => {
                  if (confirm('Are you sure you want to delete ALL existing accounts? You can register your new officer accounts right after.')) {
                    clearAllUsers();
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold shadow-2xs transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span>Delete All Accounts</span>
              </button>
            )}

            <button
              id="btn-admin-create-account"
              onClick={() => setIsCreateAccountModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition active:scale-95 cursor-pointer self-start sm:self-auto"
            >
              <UserPlus className="w-4 h-4" />
              <span>Create New Officer Account</span>
            </button>
          </div>
        </div>

        {(!users || users.length === 0) ? (
          <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center mx-auto">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800">No Registered Accounts</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                All previous accounts have been deleted. You can create new officer accounts now or restore defaults.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setIsCreateAccountModalOpen(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Add New Account</span>
              </button>
              <button
                onClick={() => resetToDefaults()}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset Seed Accounts</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-slate-200">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">User ID</th>
                  <th className="py-2.5 px-3">Official Name</th>
                  <th className="py-2.5 px-3">Position / Designation</th>
                  <th className="py-2.5 px-3">Agency</th>
                  <th className="py-2.5 px-3">Role Tier</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(users || []).map((u) => {
                  const isActive = currentUser && u.id === currentUser.id;
                  return (
                    <tr key={u.id} className={`hover:bg-slate-50 transition ${isActive ? 'bg-blue-50/50' : ''}`}>
                      <td className="py-2.5 px-3 font-mono font-bold text-blue-700">{u.id}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900 flex items-center gap-2">
                        {u.avatarUrl ? (
                          <img src={u.avatarUrl} alt="" className="w-6 h-6 rounded-full object-cover border border-slate-200" />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[10px]">
                            {u.name.charAt(0)}
                          </div>
                        )}
                        <span>{u.name}</span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-700">{u.position}</td>
                      <td className="py-2.5 px-3 text-slate-600">
                        <span className="font-medium text-slate-800">{u.agencyName}</span>
                        {u.barangay && <span className="text-[10px] text-sky-700 block font-semibold">Brgy. {u.barangay}</span>}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px] font-bold text-purple-800">{u.role}</td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isActive ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                              Logged In
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-400 font-medium px-2 py-0.5">
                              Offline
                            </span>
                          )}
                          <button
                            id={`btn-admin-edit-${u.id}`}
                            title={`Rename / Edit account of ${u.name}`}
                            onClick={() => openEditAccountModal(u)}
                            className="p-1 rounded text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            id={`btn-admin-delete-${u.id}`}
                            title={`Delete account of ${u.name}`}
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete account: ${u.name} (${u.position})?`)) {
                                deleteUser(u.id);
                              }
                            }}
                            className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 6 Barangays Master List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-3">
        <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
          <Building2 className="w-4 h-4 text-sky-700" />
          Master Barangay Registry (6 Barangays of Roxas, Oriental Mindoro)
        </h3>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {ROXAS_BARANGAYS.map((b) => (
            <div key={b} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
              <span className="text-xs font-bold text-slate-800 block truncate">Barangay {b}</span>
              <span className="text-[10px] text-emerald-600 font-medium">● Unit Active</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

