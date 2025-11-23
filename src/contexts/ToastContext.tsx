'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 left-0 right-0 z-[100] flex flex-col items-center gap-2 px-4 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto min-w-[300px] max-w-md p-4 rounded-2xl shadow-lg border-2 flex items-center gap-3 animate-in slide-in-from-top-5 fade-in duration-300 ${
              toast.type === 'success'
                ? 'bg-white border-green-500 text-green-800'
                : toast.type === 'error'
                ? 'bg-white border-red-500 text-red-800'
                : 'bg-white border-blue-500 text-blue-800'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 size={24} className="text-green-500 shrink-0" />}
            {toast.type === 'error' && <AlertCircle size={24} className="text-red-500 shrink-0" />}
            {toast.type === 'info' && <AlertCircle size={24} className="text-blue-500 shrink-0" />}
            
            <p className="font-bold text-sm flex-1">{toast.message}</p>
            
            <button onClick={() => removeToast(toast.id)} className="text-slate-400 hover:text-slate-600">
              <X size={18} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
