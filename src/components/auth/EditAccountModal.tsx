import React, { useState, useEffect } from 'react';
import { 
  X, 
  UserCheck, 
  Shield, 
  Building2, 
  Landmark, 
  CheckCircle2, 
  Mail, 
  BadgeCheck, 
  AlertCircle,
  Save,
  KeyRound,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { AgencyType, UserRole, ROXAS_BARANGAYS, User } from '../../types';

interface EditAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  userToEdit?: User | null;
}

interface PresetAvatar {
  id: string;
  label: string;
  url: string;
}

const PRESET_AVATARS: PresetAvatar[] = [
  { id: 'av1', label: 'Official 1', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80' },
  { id: 'av2', label: 'Official 2', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
  { id: 'av4', label: 'Admin 1', url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80' },
  { id: 'av6', label: 'Staff 2', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
];

const POSITION_SUGGESTIONS: Record<AgencyType, string[]> = {
  RESIDENT: [
    'Verified Resident Citizen',
    'Homeowner / Resident Complainant',
    'Barangay Youth Resident (SK)',
    'Community Representative'
  ],
  BARANGAY: [
    'Punong Barangay / Lupon Chairman',
    'Barangay Secretary',
    'Barangay Kagawad / Peace & Order Chair',
    'Barangay Treasurer',
    'Lupon Tagapamayapa Member',
    'VAWC Desk Officer',
    'Chief Barangay Tanod'
  ],
  LGU: [
    'Municipal Administrator (LGU Admin)',
    'Municipal Legal Officer',
    'Municipal Mayor / Executive Staff',
    'Public Order & Safety Office (POSO) Head',
    'Municipal Social Welfare & Development Officer (MSWDO)',
    'LGU Grievance Desk Officer'
  ],
  ADMIN: [
    'Lead Systems & Security Administrator',
    'Municipal Database Administrator',
    'Network Operations Specialist'
  ]
};

export const EditAccountModal: React.FC<EditAccountModalProps> = ({
  isOpen,
  onClose,
  userToEdit
}) => {
  const { currentUser, updateUser } = useAuth();
  const targetUser = userToEdit || currentUser;

  const [name, setName] = useState('');
  const [position, setPosition] = useState('');
  const [agencyType, setAgencyType] = useState<AgencyType>('BARANGAY');
  const [barangay, setBarangay] = useState('San Miguel');
  const [email, setEmail] = useState('');
  const [badgeOrIdNumber, setBadgeOrIdNumber] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [role, setRole] = useState<UserRole>('BARANGAY_OFFICIAL');
  const [passcode, setPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [showConfirmPasscode, setShowConfirmPasscode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (targetUser && isOpen) {
      setName(targetUser.name || '');
      setPosition(targetUser.position || '');
      setAgencyType(targetUser.agencyType || 'BARANGAY');
      setBarangay(targetUser.barangay || 'San Miguel');
      setEmail(targetUser.email || '');
      setBadgeOrIdNumber(targetUser.badgeOrIdNumber || '');
      setAvatarUrl(targetUser.avatarUrl || PRESET_AVATARS[0].url);
      setRole(targetUser.role || 'BARANGAY_OFFICIAL');
      setPasscode(targetUser.passcode || 'jarinyes');
      setConfirmPasscode(targetUser.passcode || 'jarinyes');
      setError(null);
      setSuccess(false);
    }
  }, [targetUser, isOpen]);

  if (!isOpen || !targetUser) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please provide the official account name.');
      return;
    }

    if (!position.trim()) {
      setError('Please provide the position or designation.');
      return;
    }

    if (passcode.trim() && passcode.trim().length < 4) {
      setError('Password must be at least 4 characters.');
      return;
    }

    if (passcode.trim() !== confirmPasscode.trim()) {
      setError('Hindi tugma ang password (Passwords do not match). Siguraduhing pareho ang Password at Confirm Password.');
      return;
    }

    let resolvedAgencyName = targetUser.agencyName;
    if (agencyType === 'BARANGAY') {
      resolvedAgencyName = `Barangay ${barangay} LGU`;
    } else if (agencyType === 'LGU') {
      resolvedAgencyName = 'Municipal Government of Roxas (LGU Admin)';
    } else if (agencyType === 'ADMIN') {
      resolvedAgencyName = 'B-CONNECT Municipal IT & Operations';
    }

    const updated = updateUser(targetUser.id, {
      name: name.trim(),
      position: position.trim(),
      agencyType,
      agencyName: resolvedAgencyName,
      barangay: agencyType === 'BARANGAY' ? barangay : undefined,
      email: email.trim() || `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}@roxas.gov.ph`,
      badgeOrIdNumber: badgeOrIdNumber.trim() || undefined,
      avatarUrl: avatarUrl || PRESET_AVATARS[0].url,
      role,
      passcode: passcode.trim() || targetUser.passcode || 'jarinyes'
    });

    if (updated) {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 700);
    } else {
      setError('Failed to update account. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        id="modal-edit-account"
        className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-900 to-emerald-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-800/80 border border-emerald-700/80 flex items-center justify-center text-emerald-200 shadow-inner">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
                <span>Rename / Edit Account Profile</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-800 text-emerald-200 font-mono font-bold">
                  {targetUser.id}
                </span>
              </h3>
              <p className="text-xs text-emerald-200/80 mt-0.5">
                Update account display name, designation, agency, and profile avatar
              </p>
            </div>
          </div>
          <button
            type="button"
            id="btn-close-edit-account-modal"
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-800/50 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Account details saved successfully!</span>
            </div>
          )}

          {/* 1. Agency Selection */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Agency / Department <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { type: 'BARANGAY' as AgencyType, label: 'Barangay LGU', icon: Building2, defaultRole: 'BARANGAY_OFFICIAL' as UserRole },
                { type: 'RESIDENT' as AgencyType, label: 'Resident Citizen', icon: UserCheck, defaultRole: 'RESIDENT' as UserRole },
                { type: 'LGU' as AgencyType, label: 'Municipal LGU (Admin)', icon: Landmark, defaultRole: 'LGU_ADMINISTRATOR' as UserRole },
                { type: 'ADMIN' as AgencyType, label: 'System Admin', icon: UserCheck, defaultRole: 'SYSTEM_ADMIN' as UserRole },
              ].map((ag) => {
                const isSelected = agencyType === ag.type;
                const Icon = ag.icon;
                return (
                  <button
                    key={ag.type}
                    type="button"
                    onClick={() => {
                      setAgencyType(ag.type);
                      setRole(ag.defaultRole);
                      const suggestions = POSITION_SUGGESTIONS[ag.type];
                      if (suggestions && suggestions.length > 0) {
                        setPosition(suggestions[0]);
                      }
                    }}
                    className={`p-2 rounded-xl text-left border text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-950 ring-1 ring-emerald-500'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-700' : 'text-slate-500'}`} />
                    <span className="truncate">{ag.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Barangay selector if BARANGAY is chosen */}
          {agencyType === 'BARANGAY' && (
            <div className="space-y-1 bg-emerald-50/60 p-3 rounded-2xl border border-emerald-200">
              <label className="block text-xs font-bold text-emerald-900">
                Select Barangay in Roxas:
              </label>
              <select
                value={barangay}
                onChange={(e) => setBarangay(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {ROXAS_BARANGAYS.map((b) => (
                  <option key={b} value={b}>
                    Barangay {b}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 2. Full Name and Position */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                Account / Official Name <span className="text-rose-500">*</span>
              </label>
              <input
                id="input-edit-account-name"
                type="text"
                placeholder="e.g., Dir. Antonio C. Del Rosario"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                Position / Designation <span className="text-rose-500">*</span>
              </label>
              <input
                id="input-edit-account-position"
                type="text"
                placeholder="e.g., Municipal Local Government Operations Officer"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
          </div>

          {/* Quick Suggestions for Position */}
          {POSITION_SUGGESTIONS[agencyType] && (
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Common Designations (Click to Apply):
              </span>
              <div className="flex flex-wrap gap-1">
                {POSITION_SUGGESTIONS[agencyType].map((sug) => (
                  <button
                    key={sug}
                    type="button"
                    onClick={() => setPosition(sug)}
                    className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-emerald-100 hover:text-emerald-900 border border-slate-200 text-[10px] font-medium text-slate-700 transition cursor-pointer"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 3. Email & Badge / ID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                <span>Official Email</span>
              </label>
              <input
                id="input-edit-account-email"
                type="email"
                placeholder="officer@roxas.gov.ph"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 flex items-center gap-1">
                <BadgeCheck className="w-3.5 h-3.5 text-slate-500" />
                <span>Badge / Government ID #</span>
              </label>
              <input
                id="input-edit-account-badge"
                type="text"
                placeholder="e.g., DILG-MIMAROPA-412"
                value={badgeOrIdNumber}
                onChange={(e) => setBadgeOrIdNumber(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-mono placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* 4. Password & Confirm Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 flex items-center gap-1">
                <KeyRound className="w-3.5 h-3.5 text-slate-500" />
                <span>Account Password / PIN</span>
              </label>
              <div className="relative">
                <input
                  id="input-edit-account-passcode"
                  type={showPasscode ? 'text' : 'password'}
                  placeholder="Min. 4 characters"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  className="w-full pl-3 pr-10 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPasscode(!showPasscode)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  {showPasscode ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 flex items-center gap-1">
                <KeyRound className="w-3.5 h-3.5 text-slate-500" />
                <span>Confirm Password</span>
              </label>
              <div className="relative">
                <input
                  id="input-edit-account-confirm-passcode"
                  type={showConfirmPasscode ? 'text' : 'password'}
                  placeholder="Re-type password"
                  value={confirmPasscode}
                  onChange={(e) => setConfirmPasscode(e.target.value)}
                  className={`w-full pl-3 pr-10 py-2 bg-white border rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 ${
                    confirmPasscode && passcode !== confirmPasscode
                      ? 'border-rose-300 focus:ring-rose-500 bg-rose-50/20'
                      : 'border-slate-300 focus:ring-emerald-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPasscode(!showConfirmPasscode)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  {showConfirmPasscode ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              {confirmPasscode && passcode !== confirmPasscode && (
                <p className="text-[10px] text-rose-600 font-semibold mt-0.5">
                  ⚠ Hindi tugma ang mga password
                </p>
              )}
            </div>
          </div>

          {/* 5. Avatar Selection */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Profile Avatar:
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {PRESET_AVATARS.map((av) => (
                <button
                  key={av.id}
                  type="button"
                  onClick={() => setAvatarUrl(av.url)}
                  className={`relative rounded-full p-0.5 transition cursor-pointer ${
                    avatarUrl === av.url ? 'ring-3 ring-emerald-600 scale-105' : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={av.url}
                    alt={av.label}
                    className="w-9 h-9 rounded-full object-cover border border-slate-300"
                  />
                  {avatarUrl === av.url && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-600 rounded-full border border-white flex items-center justify-center text-white">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="btn-submit-edit-account"
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md cursor-pointer active:scale-98"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Account Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
