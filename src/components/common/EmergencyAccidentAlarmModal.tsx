import React, { useEffect, useState } from 'react';
import { 
  AlertTriangle, 
  Siren, 
  Volume2, 
  VolumeX, 
  MapPin, 
  Clock, 
  Phone, 
  User, 
  Car, 
  ShieldCheck, 
  CheckCircle2, 
  X, 
  ExternalLink,
  Ambulance,
  Radio
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { playAccidentAlarmSound, stopAccidentAlarmSound, playActionBeep } from '../../utils/alarmAudio';
import { formatDate } from '../../utils/reportGenerators';

export const EmergencyAccidentAlarmModal: React.FC = () => {
  const { 
    currentUser, 
    notifications, 
    cases, 
    setSelectedCaseId, 
    setActiveTab, 
    addCaseTimelineEvent,
    logActivity 
  } = useApp();

  const [activeAccidentNotif, setActiveAccidentNotif] = useState<any | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isDispatched, setIsDispatched] = useState(false);
  const [acknowledgedIds, setAcknowledgedIds] = useState<string[]>(() => {
    try {
      return JSON.parse(sessionStorage.getItem('acknowledged_accident_alarms') || '[]');
    } catch {
      return [];
    }
  });

  const isBarangayOfficer = currentUser?.agencyType === 'BARANGAY';
  const userBarangay = currentUser?.barangay;

  // Listen for unacknowledged accident emergency notifications for this barangay
  useEffect(() => {
    if (!isBarangayOfficer || !userBarangay) {
      stopAccidentAlarmSound();
      setActiveAccidentNotif(null);
      return;
    }

    const urgentAccidentNotif = notifications.find((n) => {
      if (acknowledgedIds.includes(n.id)) return false;

      // Check if it's an accident alert for this barangay
      const isTargetedBarangay = !n.targetBarangay || n.targetBarangay === userBarangay;
      const isAccidentFlag = 
        n.isAccidentEmergency || 
        n.title.toLowerCase().includes('accident') || 
        n.title.toLowerCase().includes('banggaan') || 
        n.title.toLowerCase().includes('vehicular') ||
        n.title.toLowerCase().includes('disgrasya') ||
        n.message.toLowerCase().includes('accident') ||
        n.message.toLowerCase().includes('vehicular') ||
        n.message.toLowerCase().includes('banggaan');

      const isUrgent = n.priority === 'urgent' || n.type === 'pending_alert';

      return isTargetedBarangay && isAccidentFlag && isUrgent;
    });

    if (urgentAccidentNotif) {
      setActiveAccidentNotif(urgentAccidentNotif);
      if (!isMuted) {
        playAccidentAlarmSound();
      }
    } else {
      setActiveAccidentNotif(null);
      stopAccidentAlarmSound();
    }

    return () => {
      stopAccidentAlarmSound();
    };
  }, [notifications, isBarangayOfficer, userBarangay, acknowledgedIds, isMuted]);

  if (!activeAccidentNotif || !isBarangayOfficer) {
    return null;
  }

  const relatedCase = activeAccidentNotif.caseId 
    ? cases.find((c) => c.id === activeAccidentNotif.caseId) 
    : undefined;

  const handleMute = () => {
    stopAccidentAlarmSound();
    setIsMuted(true);
  };

  const handleAcknowledge = () => {
    stopAccidentAlarmSound();
    playActionBeep(600, 0.2);
    const newAcknowledged = [...acknowledgedIds, activeAccidentNotif.id];
    setAcknowledgedIds(newAcknowledged);
    try {
      sessionStorage.setItem('acknowledged_accident_alarms', JSON.stringify(newAcknowledged));
    } catch {}
    setActiveAccidentNotif(null);
  };

  const handleDispatchTanod = () => {
    playActionBeep(750, 0.25);
    setIsDispatched(true);
    stopAccidentAlarmSound();

    if (relatedCase) {
      addCaseTimelineEvent(
        relatedCase.id,
        '🚨 Barangay Tanod & First Responders Dispatched',
        `Punong Barangay ${currentUser.name} ordered immediate deployment of Barangay ${userBarangay} Tanod and Peace Desk First Responders to the accident location: ${relatedCase.specificLocation || 'Accident Site'}.`,
        'Barangay Action / Lupon'
      );
    }

    logActivity(
      'EMERGENCY_DISPATCH',
      `Dispatched Barangay ${userBarangay} First Responders for accident report #${activeAccidentNotif.caseId || 'ACCIDENT'}`,
      activeAccidentNotif.caseId
    );

    setTimeout(() => {
      handleAcknowledge();
    }, 2000);
  };

  const handleViewCase = () => {
    stopAccidentAlarmSound();
    handleAcknowledge();
    if (activeAccidentNotif.caseId) {
      setSelectedCaseId(activeAccidentNotif.caseId);
      setActiveTab('cases');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in zoom-in-95 duration-200">
      <div 
        id="emergency-accident-alarm-modal"
        className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border-4 border-rose-600 overflow-hidden ring-8 ring-rose-500/30 animate-pulse-subtle"
      >
        {/* Flashing Emergency Header */}
        <div className="bg-gradient-to-r from-rose-700 via-red-600 to-rose-800 text-white p-5 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-2xl animate-bounce">
              <Siren className="w-7 h-7 text-amber-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider rounded-md">
                  LIVE EMERGENCY ALARM
                </span>
                <span className="text-xs text-rose-200 font-semibold">
                  Brgy. {userBarangay} Jurisdiction
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white leading-tight mt-0.5">
                🚨 ROAD / VEHICULAR ACCIDENT REPORTED!
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={isMuted ? () => { setIsMuted(false); playAccidentAlarmSound(); } : handleMute}
              className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition cursor-pointer"
              title={isMuted ? "Unmute Alarm Siren" : "Mute Siren Sound"}
            >
              {isMuted ? <VolumeX className="w-5 h-5 text-amber-200" /> : <Volume2 className="w-5 h-5 text-white animate-pulse" />}
            </button>
            <button
              onClick={handleAcknowledge}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              title="Acknowledge Alert"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 bg-gradient-to-b from-rose-50/40 to-white">
          {/* Main Emergency Message */}
          <div className="p-4 bg-rose-100/70 border border-rose-200 rounded-2xl">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-rose-700 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-extrabold text-sm text-rose-950">
                  {activeAccidentNotif.title}
                </h3>
                <p className="text-xs text-rose-800 mt-1 leading-relaxed">
                  {activeAccidentNotif.message}
                </p>
              </div>
            </div>
          </div>

          {/* Incident Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 text-slate-500 font-bold uppercase text-[10px]">
                <MapPin className="w-3.5 h-3.5 text-rose-600" />
                <span>Accident Location</span>
              </div>
              <p className="font-semibold text-slate-900 line-clamp-2">
                {relatedCase?.specificLocation || `Barangay ${userBarangay}, Roxas, Oriental Mindoro`}
              </p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 text-slate-500 font-bold uppercase text-[10px]">
                <Car className="w-3.5 h-3.5 text-blue-600" />
                <span>Vehicle / Hazard Type</span>
              </div>
              <p className="font-semibold text-slate-900">
                {relatedCase?.accidentVehicleDetails || relatedCase?.category || 'Motorcycle / Vehicle Collision / Road Hazard'}
              </p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 text-slate-500 font-bold uppercase text-[10px]">
                <User className="w-3.5 h-3.5 text-emerald-600" />
                <span>Reporting Resident</span>
              </div>
              <p className="font-semibold text-slate-900">
                {relatedCase?.createdBy || 'Barangay Resident Citizen'}
              </p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 text-slate-500 font-bold uppercase text-[10px]">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>Time Reported</span>
              </div>
              <p className="font-semibold text-slate-900">
                {formatDate(activeAccidentNotif.timestamp)}
              </p>
            </div>
          </div>

          {/* Quick Hotline Quick dial badges */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-blue-700 animate-bounce" />
              <span className="font-bold text-blue-950">Emergency Hotlines:</span>
            </div>
            <div className="flex items-center gap-2 text-[11px]">
              <span className="px-2 py-0.5 bg-white border border-blue-200 rounded font-mono font-bold text-blue-800">
                PNP Roxas: 0998-598-5712
              </span>
              <span className="px-2 py-0.5 bg-white border border-rose-200 rounded font-mono font-bold text-rose-800">
                RHU Ambulance: 0917-888-2628
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
            <button
              id="btn-alarm-dispatch-tanod"
              onClick={handleDispatchTanod}
              disabled={isDispatched}
              className={`w-full sm:flex-1 py-3 px-4 rounded-2xl font-black text-xs text-white shadow-lg transition flex items-center justify-center gap-2 cursor-pointer ${
                isDispatched 
                  ? 'bg-emerald-600 ring-2 ring-emerald-400' 
                  : 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 active:scale-98'
              }`}
            >
              {isDispatched ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>Tanods Dispatched! Acknowledged</span>
                </>
              ) : (
                <>
                  <Radio className="w-4 h-4 text-amber-300 animate-pulse" />
                  <span>🚨 Deploy Barangay Tanod & First Responders</span>
                </>
              )}
            </button>

            {relatedCase && (
              <button
                id="btn-alarm-view-case"
                onClick={handleViewCase}
                className="w-full sm:w-auto py-3 px-4 rounded-2xl font-bold text-xs bg-slate-900 hover:bg-slate-800 text-white shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open Docket #{relatedCase.id}</span>
              </button>
            )}

            <button
              id="btn-alarm-ack-close"
              onClick={handleAcknowledge}
              className="w-full sm:w-auto py-3 px-4 rounded-2xl font-bold text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
            >
              Acknowledge
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
