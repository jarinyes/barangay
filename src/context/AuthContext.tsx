import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { supabase } from '../utils/supabaseClient';
import { SEED_USERS } from '../data/seedData';

export interface AuthState {
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  currentUser: User;
  users: User[];
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  setCurrentUserState: React.Dispatch<React.SetStateAction<User>>;
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
}

export const AuthContext = createContext<AuthState | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [currentUser, setCurrentUserState] = useState<User>(SEED_USERS[0]);
  const [users, setUsers] = useState<User[]>(SEED_USERS);

  useEffect(() => {
    const checkSession = async () => {
      setIsAuthLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        if (profile) {
          setCurrentUserState(profile as User);
          setIsAuthenticated(true);
        }
      }
      setIsAuthLoading(false);
    };
    
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        if (profile) {
          setCurrentUserState(profile as User);
          setIsAuthenticated(true);
        }
      } else {
        setIsAuthenticated(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      isAuthLoading,
      currentUser,
      users,
      setIsAuthenticated,
      setCurrentUserState,
      setUsers
    }}>
      {children}
    </AuthContext.Provider>
  );
};
