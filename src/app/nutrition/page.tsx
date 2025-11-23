'use client';

import { useState, useEffect } from 'react';
import { foodDatabase } from '@/lib/mock-data';
import { Search, Trash2, Edit2, Check, X, Plus } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { format } from 'date-fns';

interface FoodItem {
  id: string;
  name: string;
  unit_g: number;
  calories: number;
  carbs: number;
  fats: number;
  proteins: number;
}

interface LogEntry extends FoodItem {
  amount: number;
  logId: string;
}

interface Targets {
  calories: number;
  carbs: number;
  fats: number;
  proteins: number;
}

export default function NutritionPage() {
  const { currentUser } = useUser();
  const [log, setLog] = useState<LogEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [amount, setAmount] = useState<number>(100);
  
  // Custom Food State
  const [showCreateFood, setShowCreateFood] = useState(false);
  const [newFood, setNewFood] = useState<Partial<FoodItem>>({ unit_g: 100 });
  
  // Local Food Database (Mock + Custom)
  const [localFoodDB, setLocalFoodDB] = useState<FoodItem[]>(foodDatabase);

  const [targets, setTargets] = useState<Targets>({ calories: 2200, carbs: 200, fats: 70, proteins: 150 });
  const [isEditingTargets, setIsEditingTargets] = useState(false);
  const [tempTargets, setTempTargets] = useState<Targets>(targets);

  const today = format(new Date(), 'yyyy-MM-dd');

  // Load data
  useEffect(() => {
    if (currentUser) {
      const savedTargets = localStorage.getItem(`fitprog_targets_${currentUser.id}`);
      if (savedTargets) setTargets(JSON.parse(savedTargets));

      const savedLog = localStorage.getItem(`fitprog_foodlog_${currentUser.id}_${today}`);
      if (savedLog) setLog(JSON.parse(savedLog));
      
      // Load custom foods
      const savedFoods = localStorage.getItem(`fitprog_custom_foods_${currentUser.id}`);
      if (savedFoods) {
        setLocalFoodDB([...foodDatabase, ...JSON.parse(savedFoods)]);
      }
    }
  }, [currentUser, today]);

  const saveLog = (newLog: LogEntry[]) => {
    setLog(newLog);
    localStorage.setItem(`fitprog_foodlog_${currentUser?.id}_${today}`, JSON.stringify(newLog));
  };

  const saveTargets = () => {
    setTargets(tempTargets);
    localStorage.setItem(`fitprog_targets_${currentUser?.id}`, JSON.stringify(tempTargets));
    setIsEditingTargets(false);
  };

  const handleCreateFood = () => {
    if (!newFood.name || !newFood.calories) return alert("Nome e Calorias são obrigatórios");
    
    const food: FoodItem = {
      id: `custom-${Date.now()}`,
      name: newFood.name,
      unit_g: Number(newFood.unit_g) || 100,
      calories: Number(newFood.calories),
      carbs: Number(newFood.carbs) || 0,
      fats: Number(newFood.fats) || 0,
      proteins: Number(newFood.proteins) || 0,
    };

    const updatedDB = [...localFoodDB, food];
    setLocalFoodDB(updatedDB);
    
    // Save custom foods
    const customFoods = updatedDB.filter(f => f.id.startsWith('custom-'));
    localStorage.setItem(`fitprog_custom_foods_${currentUser?.id}`, JSON.stringify(customFoods));
    
    setShowCreateFood(false);
    setNewFood({ unit_g: 100 });
    setSearchTerm(food.name); // Auto search for it
  };

  // Calculate totals
  const totals = log.reduce((acc, item) => {
    const ratio = item.amount / item.unit_g;
    return {
      calories: acc.calories + item.calories * ratio,
      carbs: acc.carbs + item.carbs * ratio,
      fats: acc.fats + item.fats * ratio,
      proteins: acc.proteins + item.proteins * ratio,
    };
  }, { calories: 0, carbs: 0, fats: 0, proteins: 0 });

  const handleAddFood = (food: FoodItem) => {
    const newEntry: LogEntry = { ...food, amount: amount, logId: Math.random().toString(36).substr(2, 9) };
    saveLog([...log, newEntry]);
    setSelectedFood(null);
    setAmount(100);
    setSearchTerm('');
  };

  const handleRemoveEntry = (logId: string) => {
    saveLog(log.filter(item => item.logId !== logId));
  };

  const filteredFoods = localFoodDB.filter((f: FoodItem) => 
    f.name.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 5);

  return (
    <div className="p-6 space-y-8 pb-32 min-h-screen bg-gray-50">
      <header className="flex justify-between items-center">
        <h1 className="text-3xl font-black text-slate-900">Dieta</h1>
        <div className="text-sm font-bold text-slate-500 bg-white px-3 py-1 rounded-lg border border-gray-200 shadow-sm">
          {format(new Date(), 'dd/MM')}
        </div>
      </header>

      {/* Targets & Progress */}
      <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-slate-900 text-lg">Metas Diárias</h3>
          {!isEditingTargets ? (
            <button onClick={() => { setTempTargets(targets); setIsEditingTargets(true); }} className="p-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100">
              <Edit2 size={18} />
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={() => setIsEditingTargets(false)} className="p-2 text-red-500 bg-red-50 rounded-lg">
                <X size={18} />
              </button>
              <button onClick={saveTargets} className="p-2 text-green-600 bg-green-50 rounded-lg">
                <Check size={18} />
              </button>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {[
            { label: 'Calorias', key: 'calories', unit: 'kcal', color: 'bg-blue-500' },
            { label: 'Carboidratos', key: 'carbs', unit: 'g', color: 'bg-green-500' },
            { label: 'Proteínas', key: 'proteins', unit: 'g', color: 'bg-purple-500' },
            { label: 'Gorduras', key: 'fats', unit: 'g', color: 'bg-orange-500' },
          ].map((item) => {
            const current = totals[item.key as keyof Targets];
            const target = targets[item.key as keyof Targets];
            const pct = Math.min((current / target) * 100, 100);

            return (
              <div key={item.key}>
                <div className="flex justify-between text-sm font-bold mb-1">
                  <span className="text-slate-700">{item.label}</span>
                  {isEditingTargets ? (
                    <input 
                      type="number" 
                      value={tempTargets[item.key as keyof Targets]} 
                      onChange={e => setTempTargets({...tempTargets, [item.key]: Number(e.target.value)})}
                      className="w-20 text-right border border-blue-200 rounded px-1 bg-blue-50 text-blue-900 font-bold"
                    />
                  ) : (
                    <span className="text-slate-500">
                      <span className="text-slate-900">{current.toFixed(0)}</span> / {target} {item.unit}
                    </span>
                  )}
                </div>
                {!isEditingTargets && (
                  <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${item.color}`} 
                      style={{ width: `${pct}%` }} 
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Add Food */}
      <section className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-slate-900 text-lg">Adicionar Alimento</h3>
          <button 
            onClick={() => setShowCreateFood(true)}
            className="text-blue-600 font-bold text-sm flex items-center gap-1 bg-blue-50 px-3 py-1 rounded-lg hover:bg-blue-100"
          >
            <Plus size={16} /> Criar Novo
          </button>
        </div>
        
        <div className="relative">
          <Search className="absolute left-4 top-4 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Buscar alimento..."
            className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border-2 border-gray-200 font-bold text-slate-900 shadow-sm focus:border-blue-500 outline-none text-lg placeholder:text-slate-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {searchTerm && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden divide-y divide-gray-100">
            {filteredFoods.map((food: FoodItem) => (
              <button
                key={food.id}
                className="w-full text-left p-4 hover:bg-blue-50 flex justify-between items-center transition-colors"
                onClick={() => setSelectedFood(food)}
              >
                <span className="font-bold text-slate-900">{food.name}</span>
                <span className="text-sm font-bold text-slate-500">{food.calories}kcal / {food.unit_g}g</span>
              </button>
            ))}
            {filteredFoods.length === 0 && (
              <div className="p-4 text-center text-slate-500 font-medium">
                Nenhum alimento encontrado.
                <button onClick={() => setShowCreateFood(true)} className="block mx-auto mt-2 text-blue-600 font-bold">Criar "{searchTerm}"</button>
              </div>
            )}
          </div>
        )}

        {selectedFood && (
          <div className="bg-slate-900 p-5 rounded-2xl text-white shadow-xl animate-in fade-in slide-in-from-top-2">
            <div className="flex justify-between font-bold text-lg mb-4">
              <span>{selectedFood.name}</span>
              <span>{(selectedFood.calories * (amount / selectedFood.unit_g)).toFixed(0)} kcal</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-slate-800 rounded-xl p-1 flex items-center border border-slate-600">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="bg-transparent w-full p-2 text-center font-bold text-xl outline-none text-white"
                />
                <span className="pr-4 text-slate-400 font-medium">g</span>
              </div>
              <button 
                onClick={() => handleAddFood(selectedFood)}
                className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg transition-colors"
              >
                Adicionar
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Create Food Modal */}
      {showCreateFood && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-slate-900">Novo Alimento</h2>
              <button onClick={() => setShowCreateFood(false)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                <X size={20} className="text-slate-900" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-900 uppercase mb-1 block">Nome</label>
                <input 
                  value={newFood.name || ''}
                  onChange={e => setNewFood({...newFood, name: e.target.value})}
                  className="w-full p-3 bg-white border-2 border-slate-200 rounded-xl font-bold text-slate-900 focus:border-blue-500 outline-none"
                  placeholder="Ex: Whey Protein"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Porção (g)</label>
                  <input 
                    type="number"
                    value={newFood.unit_g}
                    onChange={e => setNewFood({...newFood, unit_g: Number(e.target.value)})}
                    className="w-full p-3 bg-white border-2 border-slate-200 rounded-xl font-bold text-slate-900 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Calorias</label>
                  <input 
                    type="number"
                    value={newFood.calories || ''}
                    onChange={e => setNewFood({...newFood, calories: Number(e.target.value)})}
                    className="w-full p-3 bg-white border-2 border-slate-200 rounded-xl font-bold text-slate-900 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Carb</label>
                  <input 
                    type="number"
                    value={newFood.carbs || ''}
                    onChange={e => setNewFood({...newFood, carbs: Number(e.target.value)})}
                    className="w-full p-2 bg-white border-2 border-slate-200 rounded-xl font-bold text-slate-900 focus:border-blue-500 outline-none text-center"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Prot</label>
                  <input 
                    type="number"
                    value={newFood.proteins || ''}
                    onChange={e => setNewFood({...newFood, proteins: Number(e.target.value)})}
                    className="w-full p-2 bg-white border-2 border-slate-200 rounded-xl font-bold text-slate-900 focus:border-blue-500 outline-none text-center"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Gord</label>
                  <input 
                    type="number"
                    value={newFood.fats || ''}
                    onChange={e => setNewFood({...newFood, fats: Number(e.target.value)})}
                    className="w-full p-2 bg-white border-2 border-slate-200 rounded-xl font-bold text-slate-900 focus:border-blue-500 outline-none text-center"
                  />
                </div>
              </div>
              
              <button 
                onClick={handleCreateFood}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold text-lg shadow-md hover:bg-blue-700 transition-colors mt-4"
              >
                Salvar Alimento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Daily Log */}
      <section>
        <h3 className="font-bold text-slate-900 text-lg mb-4">Diário de Hoje</h3>
        <div className="space-y-3">
          {log.length === 0 ? (
            <div className="text-center p-8 bg-white rounded-2xl border-2 border-dashed border-gray-200">
              <p className="text-slate-400 font-medium">Nenhum registro hoje.</p>
            </div>
          ) : (
            log.map(item => (
              <div key={item.logId} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
                <div>
                  <div className="font-bold text-slate-900">{item.name}</div>
                  <div className="text-sm font-bold text-slate-500 mt-0.5">
                    {item.amount}g • <span className="text-blue-600">{(item.calories * (item.amount / item.unit_g)).toFixed(0)} kcal</span>
                  </div>
                </div>
                <button onClick={() => handleRemoveEntry(item.logId)} className="text-slate-300 hover:text-red-500 p-2 transition-colors">
                  <Trash2 size={20} />
                </button>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
