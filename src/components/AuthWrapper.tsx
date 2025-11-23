'use client';

import { useUser } from '@/contexts/UserContext';
import LoginScreen from './LoginScreen';
import BottomNav from './BottomNav';

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { currentUser, loading } = useUser();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-white text-blue-600">Carregando...</div>;
  }

  if (!currentUser) {
    return <LoginScreen />;
  }

  return (
    <>
      <main className="min-h-screen pb-20">
        {children}
      </main>
      <BottomNav />
    </>
  );
}
