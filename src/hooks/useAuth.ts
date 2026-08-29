import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { CaseContext } from '../context/CaseContext';
import { NotificationContext } from '../context/NotificationContext';
import { supabase } from '../utils/supabaseClient';
import { User, AgencyType, UserRole } from '../types';

import { SEED_USERS, SEED_CASES, SEED_AUDIT_LOGS, SEED_NOTIFICATIONS } from '../data/seedData';

export const useAuth = () => {
  const authState = useContext(AuthContext);
  const caseState = useContext(CaseContext);
  const notifState = useContext(NotificationContext);

  if (!authState) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  const { currentUser, users, setIsAuthenticated, setCurrentUserState, setUsers } = authState;

  // Helper for logging activity, duplicated logic here to avoid circular hook dependencies
  const logActivity = (action: string, caseId?: string, details?: string, previousValue?: string, newValue?: string) => {
    if (!caseState) return;
    const newLog = {
      id: `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      userId: currentUser.id,
      userName: currentUser.name,
      role: currentUser.position,
      agency: currentUser.agencyName,
      action,
      caseId,
      previousValue,
      newValue,
      details: details || `User ${currentUser.name} executed ${action}`,
      ipAddress: '192.168.1.104 (LGU-Secure-VPN)'
    };
    caseState.setAuditLogs((prev) => [newLog, ...prev]);
    supabase.from('audit_logs').insert(newLog).then(({error}) => { if (error) console.error(error) });
  };

  const triggerNotification = (
    title: string, message: string, type: any = 'system', caseId?: string, targetAgency?: string, priority: 'normal' | 'high' | 'urgent' = 'normal', options?: any
  ) => {
    if (!notifState) return;
    const uniqueId = `NOTIF-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const newNotif = {
      id: uniqueId,
      title, message, type, caseId, timestamp: new Date().toISOString(), isRead: false, targetAgency, priority, ...options
    };
    notifState.setNotifications((prev) => [newNotif, ...(prev || [])]);
    supabase.from('notifications').insert(newNotif).then(({error}) => { if (error) console.error(error) });
  };

  const login = (user: User) => {
    setCurrentUserState(user);
    setIsAuthenticated(true);
    logActivity('USER_LOGIN', undefined, `Officer ${user.name} (${user.position}, ${user.agencyName}) logged in to B-CONNECT.`);
  };

  const loginWithCredentials = async (emailOrId: string, passcode?: string): Promise<{ success: boolean; message?: string }> => {
    const cleanQuery = emailOrId.trim().toLowerCase();
    if (!cleanQuery) return { success: false, message: 'Please enter your email.' };
    if (!passcode?.trim()) return { success: false, message: 'Please enter your password / passcode.' };

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: cleanQuery,
        password: passcode.trim()
      });
      if (error) return { success: false, message: error.message };
      return { success: true };
    } catch (error) {
      return { success: false, message: 'Network error. Please try again later.' };
    }
  };

  const logout = async () => {
    logActivity('USER_LOGOUT', undefined, `Officer ${currentUser.name} logged out.`);
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
    setIsAuthenticated(false);
  };

  const registerUser = async (newUserData: Omit<User, 'id'> & { id?: string, passcode?: string }): Promise<User> => {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: newUserData.email || '',
      password: newUserData.passcode || '',
      options: { data: { name: newUserData.name, role: newUserData.role } }
    });

    if (authError) throw authError;

    const authUserId = authData.user?.id;
    const userId = authUserId || newUserData.id || `USR-${newUserData.agencyType.slice(0, 3)}-${String((users?.length || 0) + 1).padStart(2, '0')}`;
    const { passcode, ...restUserData } = newUserData as any;

    const newUser: User = { ...restUserData, id: userId };
    const { error: dbError } = await supabase.from('users').insert(newUser);

    if (dbError) throw dbError;

    setUsers((prev) => {
      const updated = [...(prev || []), newUser];
      localStorage.setItem('bconnect_roxas_users_v11', JSON.stringify(updated));
      return updated;
    });

    logActivity('ACCOUNT_CREATED', undefined, `Registered new official user account: ${newUser.name} (${newUser.position}, ${newUser.agencyName}) under role tier ${newUser.role}.`);
    triggerNotification('New Account Registered', `Officer account ${newUser.name} (${newUser.position}) has been authorized in the B-CONNECT network.`, 'system', undefined, 'ADMIN', 'normal', { targetAgencyTypes: ['ADMIN'], targetRoles: ['SYSTEM_ADMIN'] });

    return newUser;
  };

  const deleteUser = (userId: string) => {
    setUsers((prev) => {
      const updated = (prev || []).filter((u) => u.id !== userId);
      localStorage.setItem('bconnect_roxas_users_v11', JSON.stringify(updated));

      if (currentUser?.id === userId) {
        if (updated.length > 0) {
          setCurrentUserState(updated[0]);
          localStorage.setItem('bconnect_roxas_user_v11', JSON.stringify(updated[0]));
        } else {
          setIsAuthenticated(false);
          localStorage.removeItem('bconnect_roxas_user_v11');
          localStorage.setItem('bconnect_roxas_auth_status_v11', 'false');
        }
      }
      return updated;
    });
    logActivity('ACCOUNT_DELETED', undefined, `Removed user account ID ${userId}`);
  };

  const updateUser = (userId: string, updatedData: Partial<User>): User | null => {
    let resultUser: User | null = null;
    setUsers((prev) => {
      const updated = (prev || []).map((u) => {
        if (u.id === userId) {
          resultUser = { ...u, ...updatedData, id: u.id };
          return resultUser;
        }
        return u;
      });
      localStorage.setItem('bconnect_roxas_users_v11', JSON.stringify(updated));
      if (currentUser?.id === userId && resultUser) {
        setCurrentUserState(resultUser);
        localStorage.setItem('bconnect_roxas_user_v11', JSON.stringify(resultUser));
      }
      return updated;
    });
    if (resultUser) {
      logActivity('ACCOUNT_UPDATED', undefined, `Updated account information for ${(resultUser as User).name} (${(resultUser as User).position})`);
    }
    return resultUser;
  };

  const clearAllUsers = () => {
    setUsers([]);
    localStorage.setItem('bconnect_roxas_users_v11', JSON.stringify([]));
    localStorage.removeItem('bconnect_roxas_user_v11');
    localStorage.setItem('bconnect_roxas_auth_status_v11', 'false');
    setIsAuthenticated(false);
    logActivity('ACCOUNTS_CLEARED', undefined, 'All previous accounts have been deleted. Ready to register new accounts.');
  };

  const resetToDefaults = () => {
    localStorage.removeItem('bconnect_roxas_cases_v7');
    localStorage.removeItem('bconnect_roxas_logs_v7');
    localStorage.removeItem('bconnect_roxas_notifs_v7');
    localStorage.removeItem('bconnect_roxas_user_v11');
    localStorage.removeItem('bconnect_roxas_users_v11');
    
    if (caseState) {
      caseState.setCases(SEED_CASES);
      caseState.setAuditLogs(SEED_AUDIT_LOGS);
    }
    
    if (notifState) {
      notifState.setNotifications(SEED_NOTIFICATIONS);
    }
    
    setUsers(SEED_USERS);
    setCurrentUserState(SEED_USERS[0]);
    logActivity('SYSTEM_RESET', undefined, 'System state reset to original seed baseline for Roxas, Oriental Mindoro.');
  };

  return {
    ...authState,
    login,
    loginWithCredentials,
    logout,
    registerUser,
    updateUser,
    deleteUser,
    clearAllUsers,
    resetToDefaults,
    setCurrentUser: (user: User) => {
      setCurrentUserState(user);
      setIsAuthenticated(true);
      logActivity('USER_ROLE_SWITCH', undefined, `Switched active session to ${user.name} (${user.position}, ${user.agencyName})`);
    }
  };
};
