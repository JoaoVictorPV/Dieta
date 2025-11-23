'use client';

import { useState, useEffect } from 'react';
import { Plus, TrendingUp, Activity, Droplets } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
import { useUser } from '@/contexts/UserContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface Measurement {
  date: string;
  weight: number;
  bodyFat: number;
  muscleMass: number;
  water: number;
  visceralFat: number;
  bmr: number;
}

export default function MeasurementsPage() {
  const { currentUser } = useUser();
  const { showToast } = useToast();
  const [showInput, setShowInput] = useState(false);
  const [history, setHistory] = useState<Measurement[]>([]);
  
  const [measurement, setMeasurement] = useState({
    weight: '',
    bodyFat: '',
    muscleMass: '',
    water: '',
    visceralFat: '',
    bmr: '',
  });

  useEffect(() => {
    if (currentUser) {
      const saved = localStorage.getItem(`fitprog_measurements_${currentUser.id}`);
      if (saved) setHistory(JSON.parse(saved));
    }
  }, [currentUser]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newMeasurement: Measurement = {
      date: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      weight: Number(measurement.weight) || 0,
      bodyFat: Number(measurement.bodyFat) || 0,
      muscleMass: Number(measurement.muscleMass) || 0,
      water: Number(measurement.water) || 0,
      visceralFat: Number(measurement.visceralFat) || 0,
      bmr: Number(measurement.bmr) || 0,
    };

    const updatedHistory = [...history, newMeasurement];
    setHistory(updatedHistory);
    localStorage.setItem(`fitprog_measurements_${currentUser?.id}`, JSON.stringify(updatedHistory));
    
    setShowInput(false);
    setMeasurement({ weight: '', bodyFat: '', muscleMass: '', water: '', visceralFat: '', bmr: '' });
    showToast('Medição salva com sucesso!');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setMeasurement(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="p-6 space-y-8 pb-32 min-h-screen bg-gray-50">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Medidas</h1>
          <p className="text-slate-500 font-medium">Acompanhe sua evolução</p>
        </div>
        <button 
          onClick={() => setShowInput(!showInput)}
          className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg hover:bg-blue-700 transition-all"
        >
          <Plus size={28} />
        </button>
      </header>

      {/* Input Form */}
      {showInput && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 space-y-6 animate-in fade-in slide-in-from-top-4">
          <h3 className="font-bold text-slate-900 text-lg">Nova Medição</h3>
          <div className="grid grid-cols-2 gap-5">
            {[
              { label: 'Peso (kg)', name: 'weight', step: '0.1' },
              { label: '% Gordura', name: 'bodyFat', step: '0.1' },
              { label: '% Músculo', name: 'muscleMass', step: '0.1' },
              { label: '% Água', name: 'water', step: '0.1' },
              { label: 'Gordura Visceral', name: 'visceralFat', step: '1' },
              { label: 'TMB (kcal)', name: 'bmr', step: '1' },
            ].map(field => (
              <div key={field.name}>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-2">{field.label}</label>
                <input 
                  name={field.name}
                  type="number" step={field.step}
                  value={measurement[field.name as keyof typeof measurement]} 
                  onChange={handleInputChange}
                  className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none font-medium text-slate-900" 
                />
              </div>
            ))}
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg shadow-md hover:bg-blue-700 transition-colors">
            Salvar Dados
          </button>
        </form>
      )}

      {/* Charts Section */}
      {history.length > 0 ? (
        <div className="space-y-6">
          
          {/* Weight Chart */}
          <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-blue-100 p-2 rounded-xl text-blue-600"><TrendingUp size={20} /></div>
              <h3 className="font-bold text-slate-900 text-lg">Peso (kg)</h3>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history}>
                  <defs>
                    <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} dy={10} />
                  <YAxis domain={['dataMin - 1', 'dataMax + 1']} axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                  <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                  <Area type="monotone" dataKey="weight" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorWeight)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Composition Chart */}
          <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-green-100 p-2 rounded-xl text-green-600"><Activity size={20} /></div>
              <h3 className="font-bold text-slate-900 text-lg">Composição (%)</h3>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} dy={10} />
                  <YAxis domain={[15, 45]} axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                  <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                  <Line name="Gordura" type="monotone" dataKey="bodyFat" stroke="#ef4444" strokeWidth={3} dot={false} />
                  <Line name="Músculo" type="monotone" dataKey="muscleMass" stroke="#22c55e" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-4 text-sm font-bold text-slate-600">
               <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500" /> Gordura</div>
               <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500" /> Músculo</div>
            </div>
          </div>

          {/* Water & Visceral */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-cyan-100 p-2 rounded-xl text-cyan-600"><Droplets size={20} /></div>
                <h3 className="font-bold text-slate-900 text-lg">Água (%)</h3>
              </div>
              <div className="h-40 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={history}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" hide />
                    <YAxis domain={['dataMin - 1', 'dataMax + 1']} hide />
                    <Tooltip />
                    <Line type="monotone" dataKey="water" stroke="#06b6d4" strokeWidth={3} dot={{r: 4, fill: '#06b6d4', strokeWidth: 2, stroke: '#fff'}} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-orange-100 p-2 rounded-xl text-orange-600"><Activity size={20} /></div>
                <h3 className="font-bold text-slate-900 text-lg">Gordura Visceral</h3>
              </div>
              <div className="h-40 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={history}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" hide />
                    <YAxis domain={[0, 15]} hide />
                    <Tooltip />
                    <Line type="step" dataKey="visceralFat" stroke="#f97316" strokeWidth={3} dot={{r: 4, fill: '#f97316', strokeWidth: 2, stroke: '#fff'}} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-3xl border-2 border-dashed border-gray-200">
          <p className="text-slate-400 font-medium text-lg">Adicione sua primeira medição para ver os gráficos.</p>
        </div>
      )}
    </div>
  );
}
