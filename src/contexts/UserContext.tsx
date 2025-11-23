'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface UserProfile {
  id: string;
  name: string;
  pin: string;
}

interface UserContextType {
  currentUser: UserProfile | null;
  profiles: UserProfile[];
  login: (profileId: string, pin: string) => boolean;
  logout: () => void;
  createProfile: (name: string, pin: string) => void;
  loading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load profiles from localStorage
    const savedProfiles = localStorage.getItem('fitprog_profiles');
    if (savedProfiles) {
      setProfiles(JSON.parse(savedProfiles));
    }

    // Check for remembered user
    const lastUserId = localStorage.getItem('fitprog_last_user');
    if (lastUserId && savedProfiles) {
      const parsedProfiles = JSON.parse(savedProfiles);
      const user = parsedProfiles.find((p: UserProfile) => p.id === lastUserId);
      if (user) {
        setCurrentUser(user);
      }
    }
    setLoading(false);
  }, []);

  const login = (profileId: string, pin: string) => {
    const user = profiles.find(p => p.id === profileId);
    if (user && user.pin === pin) {
      setCurrentUser(user);
      localStorage.setItem('fitprog_last_user', user.id);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('fitprog_last_user');
  };

  const createProfile = (name: string, pin: string) => {
    const newProfile: UserProfile = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      pin
    };
    const updatedProfiles = [...profiles, newProfile];
    setProfiles(updatedProfiles);
    localStorage.setItem('fitprog_profiles', JSON.stringify(updatedProfiles));
    
    // Auto login on create
    setCurrentUser(newProfile);
    localStorage.setItem('fitprog_last_user', newProfile.id);
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
