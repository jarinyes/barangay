import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AuthPage } from './components/auth/AuthPage';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { BarangayDashboard } from './components/dashboards/BarangayDashboard';
import { LguDashboard } from './components/dashboards/LguDashboard';

import { TransparencyDashboard } from './components/dashboards/TransparencyDashboard';
import { CaseList } from './components/cases/CaseList';
import { CaseDetailModal } from './components/cases/CaseDetailModal';
import { NewCaseModal } from './components/cases/NewCaseModal';
import { CreateAccountModal } from './components/auth/CreateAccountModal';
import { EditAccountModal } from './components/auth/EditAccountModal';
import { GraphNetworkView } from './components/graph/GraphNetworkView';
import { GeographicBarangayMap } from './components/graph/GeographicBarangayMap';
import { AnnualNarrativeReport } from './components/reports/AnnualNarrativeReport';
import { StandardReportsView } from './components/reports/StandardReportsView';
import { AuditTrailView } from './components/audit/AuditTrailView';
import { SystemAdminView } from './components/admin/SystemAdminView';
import { ResidentPortalView } from './components/resident/ResidentPortalView';
import { EmergencyAccidentAlarmModal } from './components/common/EmergencyAccidentAlarmModal';

const AppContent: React.FC = () => {
  const { 
    isAuthenticated, 
    activeTab, 
    currentUser, 
    isEditAccountModalOpen, 
    setIsEditAccountModalOpen, 
    userToEdit 
  } = useApp();

  // If user is not authenticated, show Auth (Login & Create Account) Portal
  if (!isAuthenticated) {
    return <AuthPage />;
  }

  const renderContent = () => {
    // If logged in as resident citizen, route directly to Resident Portal
    if (currentUser.agencyType === 'RESIDENT' || currentUser.role === 'RESIDENT') {
      if (activeTab === 'submit_report') {
        return <ResidentPortalView initialTab="submit" />;
      }
      if (activeTab === 'my_reports') {
        return <ResidentPortalView initialTab="my_reports" />;
      }
      if (activeTab === 'barangay_directory') {
        return <ResidentPortalView initialTab="directory" />;
      }
      if (activeTab === 'cases') {
        return <CaseList />;
      }
      return <ResidentPortalView initialTab="overview" />;
    }

    switch (activeTab) {
      case 'resident_portal':
        return <ResidentPortalView initialTab="overview" />;
      case 'submit_report':
        return <ResidentPortalView initialTab="submit" />;
      case 'my_reports':
        return <ResidentPortalView initialTab="my_reports" />;
      case 'barangay_directory':
        return <ResidentPortalView initialTab="directory" />;
      case 'dashboard':
        switch (currentUser.agencyType) {
          case 'BARANGAY':
            return <BarangayDashboard />;
          case 'LGU':
            return <LguDashboard />;

          case 'ADMIN':
            return <SystemAdminView />;
          case 'RESIDENT':
            return <ResidentPortalView initialTab="overview" />;
          default:
            return <BarangayDashboard />;
        }
      case 'cases':
        return <CaseList />;
      case 'graph':
        return <GraphNetworkView />;
      case 'gis_map':
        return <GeographicBarangayMap />;
      case 'transparency':
        return <TransparencyDashboard />;
      case 'annual_narrative':
        return <AnnualNarrativeReport />;
      case 'standard_reports':
        return <StandardReportsView />;
      case 'audit_trail':
        return <AuditTrailView />;
      case 'admin':
        return <SystemAdminView />;
      default:
        return <CaseList />;
    }
  };

  return (
    <div className="h-screen w-full bg-[#f5fbf7] flex flex-col font-sans text-slate-900 overflow-hidden antialiased selection:bg-emerald-600 selection:text-white" style={{ backgroundColor: '#f5fbf7' }}>
      {/* Top Header */}
      <Header />

      {/* Main Workspace Area (Sidebar + Content) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar />

        {/* Dynamic Page Container */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-7 space-y-6">
            <div className="max-w-7xl mx-auto space-y-6">
              {renderContent()}
            </div>
          </main>

          {/* Light Green Balance System Footer */}
          <footer className="h-10 bg-white/90 border-t border-emerald-100 px-6 sm:px-8 flex items-center justify-between text-[10px] text-emerald-800/70 font-medium select-none flex-shrink-0 backdrop-blur-xs">
            <div className="flex items-center gap-4">
              <span>Last System Audit: 4 mins ago</span>
              <span className="text-emerald-200">|</span>
              <span className="font-mono text-emerald-900 font-semibold">Version 4.2.0-STABLE</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-emerald-900 font-medium">Roxas Municipal Information Office</span>
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
              <span className="font-semibold text-emerald-700">System Fully Encrypted</span>
            </div>
          </footer>
        </div>
      </div>

      {/* Global Modals */}
      <CaseDetailModal />
      <NewCaseModal />
      <CreateAccountModal />
      <EditAccountModal 
        isOpen={isEditAccountModalOpen} 
        onClose={() => setIsEditAccountModalOpen(false)} 
        userToEdit={userToEdit}
      />
      <EmergencyAccidentAlarmModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
