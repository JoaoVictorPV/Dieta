'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Calendar, Utensils, Activity } from 'lucide-react';
import { clsx } from 'clsx';

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Treinos', href: '/workouts', icon: Calendar },
    { name: 'Dieta', href: '/nutrition', icon: Utensils },
    { name: 'Medidas', href: '/measurements', icon: Activity },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 pb-safe pt-3 px-2 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors duration-200',
                isActive ? 'text-blue-700' : 'text-slate-500 hover:text-slate-800'
              )}
            >
              <item.icon size={28} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-xs font-bold tracking-wide">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
