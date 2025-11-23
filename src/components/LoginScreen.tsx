'use client';

import { useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { Plus, User, ArrowRight } from 'lucide-react';

export default function LoginScreen() {
  const { profiles, login, createProfile } = useUser();
  const [view, setView] = useState<'list' | 'create' | 'pin'>('list');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pin, setPin] = useState('');
  const [newName, setNewName] = useState('');
  const [newPin, setNewPin] = useState('');
  const [error, setError] = useState('');

  const handleProfileSelect = (id: string) => {
    setSelectedId(id);
    setView('pin');
    setPin('');
    setError('');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedId && login(selectedId, pin)) {
      // Success
    } else {
      setError('Senha incorreta');
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName && newPin) {
      createProfile(newName, newPin);
    }
  };

  if (view === 'create') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center p-6">
        <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Novo Perfil</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-1">Nome</label>
              <input 
                type="text" 
                value={newName} 
                onChange={e => setNewName(e.target.value)}
                className="w-full p-3 bg-white rounded-xl border-2 border-slate-300 font-bold text-slate-900 text-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none placeholder:text-slate-400"
                placeholder="Ex: João"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-1">Senha (PIN)</label>
              <input 
                type="password" 
                value={newPin} 
                onChange={e => setNewPin(e.target.value)}
                className="w-full p-3 bg-white rounded-xl border-2 border-slate-300 font-bold text-slate-900 text-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none placeholder:text-slate-400"
                placeholder="****"
              />
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg shadow-md hover:bg-blue-700 transition-colors">
              Criar Perfil
            </button>
            <button 
              type="button" 
              onClick={() => setView('list')}
              className="w-full text-gray-500 font-medium py-2"
            >
              Cancelar
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (view === 'pin' && selectedId) {
    const profile = profiles.find(p => p.id === selectedId);
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center p-6">
        <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 text-center">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User size={40} className="text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Olá, {profile?.name}</h2>
          <p className="text-gray-500 mb-6">Digite sua senha para entrar</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="password" 
              value={pin} 
              onChange={e => {setPin(e.target.value); setError('');}}
              className="w-full p-4 bg-white rounded-xl border-2 border-slate-300 font-black text-3xl text-slate-900 text-center tracking-[0.5em] focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none placeholder:text-slate-300 placeholder:tracking-normal"
              placeholder="PIN"
              autoFocus
            />
            {error && <p className="text-red-600 font-bold text-sm bg-red-50 p-2 rounded-lg">{error}</p>}
            
            <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg shadow-md flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors">
              Entrar <ArrowRight size={20} />
            </button>
            <button 
              type="button" 
              onClick={() => setView('list')}
              className="w-full text-gray-500 font-medium py-2"
            >
              Trocar Perfil
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center p-6">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-black text-blue-900 mb-2 tracking-tight">FitProg</h1>
        <p className="text-gray-500 font-medium text-lg">Seu organizador pessoal</p>
      </div>

      <div className="space-y-4">
        {profiles.map(profile => (
          <button
            key={profile.id}
            onClick={() => handleProfileSelect(profile.id)}
            className="w-full bg-white p-4 rounded-2xl shadow-sm border border-gray-200 flex items-center gap-4 hover:border-blue-500 hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-blue-50 transition-colors">
              <User size={24} className="text-gray-500 group-hover:text-blue-600" />
            </div>
            <span className="text-xl font-bold text-gray-800 group-hover:text-blue-900">{profile.name}</span>
            <ArrowRight size={20} className="ml-auto text-gray-300 group-hover:text-blue-500" />
          </button>
        ))}

        <button
          onClick={() => setView('create')}
          className="w-full bg-blue-50 p-4 rounded-2xl border-2 border-dashed border-blue-200 flex items-center justify-center gap-2 hover:bg-blue-100 hover:border-blue-300 transition-all text-blue-700 font-bold"
        >
          <Plus size={24} />
          Criar Novo Perfil
        </button>
      </div>
    </div>
  );
}
