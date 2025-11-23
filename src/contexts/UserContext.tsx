'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from './ToastContext';

interface UserProfile {
  id: string;
  name: string;
  pin: string;
}

interface UserContextType {
  currentUser: UserProfile | null;
  profiles: UserProfile[];
  login: (profileId: string, pin: string) => Promise<boolean>;
  logout: () => void;
  createProfile: (name: string, pin: string) => Promise<void>;
  loading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { showToast } = useToast();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // Initial Load
  useEffect(() => {
    const loadProfiles = async () => {
      try {
        // In real app, check session cookie/token. Here we just check localStorage for 'remembered' ID
        // But we fetch profiles from API
        const res = await fetch('/api/users');
        if (res.ok) {
          const data = await res.json();
          setProfiles(data);
          
          // Auto-login if previously remembered
          const lastUserId = localStorage.getItem('fitprog_last_user_id');
          if (lastUserId) {
            const user = data.find((p: any) => p.id === lastUserId);
            if (user) setCurrentUser(user);
          }
        }
      } catch (error) {
        console.error("Failed to load profiles", error);
        showToast("Erro ao carregar perfis", "error");
      } finally {
        setLoading(false);
      }
    };

    loadProfiles();
  }, []);

  const login = async (profileId: string, pin: string) => {
    try {
      const res = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: profileId, pin })
      });

      const data = await res.json();
      
      if (data.success) {
        setCurrentUser(data.user);
        localStorage.setItem('fitprog_last_user_id', data.user.id);
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error("Login error", error);
      return false;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('fitprog_last_user_id');
  };

  const createProfile = async (name: string, pin: string) => {
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, pin })
      });

      if (res.ok) {
        const newUser = await res.json();
        setProfiles(prev => [newUser, ...prev]);
        
        // Auto login
        setCurrentUser(newUser);
        localStorage.setItem('fitprog_last_user_id', newUser.id);
        showToast(`Bem-vindo, ${newUser.name}!`);
      } else {
        showToast("Erro ao criar perfil", "error");
      }
    } catch (error) {
      console.error("Create profile error", error);
      showToast("Erro de conexão", "error");
    }
  };

  return (
    <UserContext.Provider value={{ currentUser, profiles, login, logout, createProfile, loading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
