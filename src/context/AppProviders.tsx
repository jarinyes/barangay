import React, { ReactNode, useContext } from 'react';
import { AuthProvider, AuthContext } from './AuthContext';
import { CaseProvider } from './CaseContext';
import { NotificationProvider } from './NotificationContext';
import { UIProvider } from './UIContext';

const InnerProviders: React.FC<{ children: ReactNode }> = ({ children }) => {
  const authContext = useContext(AuthContext);
  
  if (!authContext) {
    throw new Error('InnerProviders must be used within AuthProvider');
  }
  
  const { isAuthenticated, currentUser } = authContext;

  return (
    <CaseProvider isAuthenticated={isAuthenticated}>
      <NotificationProvider isAuthenticated={isAuthenticated}>
        <UIProvider currentUser={currentUser}>
          {children}
        </UIProvider>
      </NotificationProvider>
    </CaseProvider>
  );
};

export const AppProviders: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <AuthProvider>
      <InnerProviders>
        {children}
      </InnerProviders>
    </AuthProvider>
  );
};
