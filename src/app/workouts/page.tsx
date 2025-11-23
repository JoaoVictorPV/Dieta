'use client';

import { useState, useEffect } from 'react';
import { Plus, Dumbbell, CheckCircle2, Play, X, Save, Trash2, Edit2, AlertTriangle } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/contexts/ToastContext';

interface Exercise {
  name: string;
  notes?: string;
  completed?: boolean;
}

interface Program {
  id: string;
  name: string;
  exercises: Exercise[];
}

interface LogEntry {
  date: string;
  programId: string;
  programName: string;
  exercisesCompleted: number;
  totalExercises: number;
  caloriesBurned: number;
}

export default function WorkoutsPage() {
  const { currentUser } = useUser();
  const { showToast } = useToast();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeProgram, setActiveProgram] = useState<Program | null>(null);
  const [programToDelete, setProgramToDelete] = useState<string | null>(null);
  
  // Create/Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [programName, setProgramName] = useState('');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [editProgramId, setEditProgramId] = useState<string | null>(null);

  // Execution State
  const [executionState, setExecutionState] = useState<Exercise[]>([]);
  const [caloriesBurned, setCaloriesBurned] = useState('');

  // Load programs from API
  const loadPrograms = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/programs?userId=${currentUser.id}`);
      if (res.ok) {
        const data = await res.json();
        setPrograms(data);
      }
    } catch (error) {
      console.error("Error loading programs", error);
      showToast("Erro ao carregar treinos", "error");
    }
  };

  useEffect(() => {
    loadPrograms();
  }, [currentUser]);

  const handleOpenCreate = () => {
    setIsEditing(false);
    setProgramName('');
    setExercises([{ name: '', notes: '' }]);
    setEditProgramId(null);
    setShowCreateModal(true);
  };

  const handleOpenEdit = (e: React.MouseEvent, program: Program) => {
    e.stopPropagation();
    setIsEditing(true);
    setProgramName(program.name);
    setExercises([...program.exercises]);
    setEditProgramId(program.id);
    setShowCreateModal(true);
  };

  const confirmDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setProgramToDelete(id);
  };

  const handleDeleteProgram = async () => {
    if (programToDelete) {
      try {
        const res = await fetch(`/api/programs?id=${programToDelete}`, { method: 'DELETE' });
        if (res.ok) {
          setPrograms(programs.filter(p => p.id !== programToDelete));
          showToast('Treino excluído', 'info');
        } else {
          showToast('Erro ao excluir', 'error');
        }
      } catch (e) {
        showToast('Erro de conexão', 'error');
      }
      setProgramToDelete(null);
    }
  };

  const handleSaveProgram = async () => {
    if (!programName.trim()) {
      showToast("Nome do treino é obrigatório", 'error');
      return;
    }
    const validExercises = exercises.filter(ex => ex.name.trim());
    if (validExercises.length === 0) {
      showToast("Adicione pelo menos um exercício", 'error');
      return;
    }

    try {
      const payload = { name: programName, exercises: validExercises, userId: currentUser?.id };
      let res;
      
      if (isEditing && editProgramId) {
        res = await fetch('/api/programs', {
          method: 'PUT',
          body: JSON.stringify({ ...payload, id: editProgramId })
        });
      } else {
        res = await fetch('/api/programs', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      }

      if (res.ok) {
        showToast(isEditing ? 'Treino atualizado!' : 'Novo treino criado!');
        loadPrograms(); // Refresh
        setShowCreateModal(false);
      } else {
        showToast("Erro ao salvar", 'error');
      }
    } catch (e) {
      showToast("Erro de conexão", 'error');
    }
  };

  const handleAddExerciseRow = () => {
    setExercises([...exercises, { name: '', notes: '' }]);
  };

  const handleExerciseChange = (index: number, field: keyof Exercise, value: string) => {
    const newExercises = [...exercises];
    newExercises[index] = { ...newExercises[index], [field]: value };
    setExercises(newExercises);
  };

  const handleRemoveExerciseRow = (index: number) => {
    const newExercises = exercises.filter((_, i) => i !== index);
    setExercises(newExercises);
  };

  // Execution Logic
  const startExecution = (program: Program) => {
    setActiveProgram(program);
    setExecutionState(program.exercises.map(e => ({ ...e, completed: false })));
    setCaloriesBurned('');
  };

  const toggleExercise = (index: number) => {
    const newExec = [...executionState];
    newExec[index].completed = !newExec[index].completed;
    setExecutionState(newExec);
  };

  const finishExecution = async () => {
    if (!activeProgram || !currentUser) return;
    
    const completedCount = executionState.filter(e => e.completed).length;
    
    const log = {
      userId: currentUser.id,
      programId: activeProgram.id,
      programName: activeProgram.name,
      exercisesCompleted: completedCount,
      totalExercises: activeProgram.exercises.length,
      caloriesBurned: Number(caloriesBurned) || 0,
      date: new Date().toISOString()
    };
    
    try {
      // Save to API (Need to create logs API first, assume /api/logs)
      // For now I'll implement the API route next.
      const res = await fetch('/api/logs', {
        method: 'POST',
        body: JSON.stringify(log)
      });
      
      if (res.ok) {
        showToast("Treino registrado no histórico!");
        setActiveProgram(null);
      } else {
        showToast("Erro ao salvar log", "error");
      }
    } catch (e) {
      showToast("Erro de conexão", "error");
    }
  };

  return (
    <div className="p-6 space-y-6 pb-24 min-h-screen bg-gray-50">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Meus Treinos</h1>
          <p className="text-slate-500 font-medium">Seus programas salvos</p>
        </div>
        <button 
          onClick={handleOpenCreate}
          className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg hover:bg-blue-700 transition-all"
        >
          <Plus size={28} />
        </button>
      </header>

      {/* Programs List */}
      <div className="space-y-4">
        {programs.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border-2 border-dashed border-gray-200">
            <Dumbbell className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-gray-500 font-medium text-lg">Nenhum treino criado.</p>
            <button 
              onClick={handleOpenCreate}
              className="mt-4 text-blue-600 font-bold text-lg"
            >
              Criar Novo Treino
            </button>
          </div>
        ) : (
          programs.map(program => (
            <div key={program.id} 
              onClick={() => startExecution(program)}
              className="bg-white p-5 rounded-3xl shadow-sm border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group relative"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-700 transition-colors">{program.name}</h3>
                  <p className="text-slate-500 text-sm font-medium mt-1">{program.exercises.length} exercícios</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={(e) => handleOpenEdit(e, program)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <Edit2 size={20} />
                  </button>
                  <button onClick={(e) => confirmDelete(e, program.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-blue-600 font-bold text-sm">
                <Play size={16} fill="currentColor" />
                <span>Iniciar Treino</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {programToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xs rounded-3xl p-6 shadow-2xl text-center animate-in zoom-in-95">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="text-red-600" size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Excluir Treino?</h3>
            <p className="text-slate-500 text-sm mb-6">Esta ação não pode ser desfeita.</p>
            <div className="flex gap-3">
              <button 
                onClick={() => setProgramToDelete(null)}
                className="flex-1 py-3 rounded-xl font-bold text-slate-600 bg-gray-100 hover:bg-gray-200"
              >
                Cancelar
              </button>
              <button 
                onClick={handleDeleteProgram}
                className="flex-1 py-3 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-slate-900">
                {isEditing ? 'Editar Treino' : 'Novo Treino'}
              </h2>
              <button onClick={() => setShowCreateModal(false)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 text-slate-900">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
              <div>
                <label className="block text-xs font-bold text-slate-900 uppercase mb-1 ml-1">Nome do Programa</label>
                <input 
                  value={programName}
                  onChange={e => setProgramName(e.target.value)}
                  className="w-full p-4 bg-white rounded-2xl border-2 border-slate-300 font-bold text-lg text-slate-900 focus:border-blue-600 outline-none placeholder:text-slate-400"
                  placeholder="Ex: Treino A"
                  autoFocus
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2 px-1">
                  <label className="block text-xs font-bold text-slate-900 uppercase">Exercícios</label>
                </div>
                
                <div className="space-y-3">
                  {exercises.map((ex, idx) => (
                    <div key={idx} className="bg-white p-3 rounded-2xl border-2 border-slate-200 relative group focus-within:border-blue-400 transition-colors">
                      <button 
                        onClick={() => handleRemoveExerciseRow(idx)}
                        className="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remover"
                      >
                        <X size={14} />
                      </button>
                      <input 
                        value={ex.name}
                        onChange={e => handleExerciseChange(idx, 'name', e.target.value)}
                        placeholder="Nome do exercício"
                        className="w-full bg-transparent font-bold text-slate-900 outline-none placeholder:text-slate-400 text-base mb-1"
                      />
                      <input 
                        value={ex.notes}
                        onChange={e => handleExerciseChange(idx, 'notes', e.target.value)}
                        placeholder="Detalhes (ex: 3x12)"
                        className="w-full bg-transparent text-sm text-slate-600 outline-none placeholder:text-slate-400"
                      />
                    </div>
                  ))}
                  
                  <button 
                    onClick={handleAddExerciseRow} 
                    className="w-full py-3 border-2 border-dashed border-blue-300 text-blue-600 rounded-2xl font-bold text-sm hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus size={18} /> Adicionar Exercício
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-2 border-t border-gray-100">
              <button 
                onClick={handleSaveProgram}
                className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Save size={20} /> Salvar Treino
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Execution Modal */}
      {activeProgram && (
        <div className="fixed inset-0 bg-white z-50 overflow-y-auto pb-safe">
          <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-gray-100 p-4 flex justify-between items-center z-10">
            <button onClick={() => setActiveProgram(null)} className="p-2 hover:bg-gray-100 rounded-full">
              <X size={24} className="text-slate-500" />
            </button>
            <h2 className="text-lg font-black text-slate-900 truncate max-w-[200px]">{activeProgram.name}</h2>
            <div className="w-10" />
          </div>

          <div className="p-6 space-y-8 pb-32">
            <div className="space-y-4">
              {executionState.map((ex, idx) => (
                <div 
                  key={idx} 
                  onClick={() => toggleExercise(idx)}
                  className={`p-5 rounded-3xl border-2 transition-all cursor-pointer flex items-start gap-4 ${
                    ex.completed 
                      ? 'bg-green-50 border-green-500 shadow-none' 
                      : 'bg-white border-gray-100 shadow-sm'
                  }`}
                >
                  <div className={`mt-1 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0 ${
                    ex.completed ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 text-transparent'
                  }`}>
                    <CheckCircle2 size={20} />
                  </div>
                  <div>
                    <h4 className={`text-lg font-bold leading-tight ${ex.completed ? 'text-green-900' : 'text-slate-900'}`}>{ex.name}</h4>
                    {ex.notes && (
                      <p className={`text-sm font-medium mt-1 ${ex.completed ? 'text-green-700' : 'text-slate-500'}`}>
                        {ex.notes}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-slate-900 p-6 rounded-3xl text-white space-y-6 shadow-xl">
              <div>
                <label className="text-sm font-bold text-slate-400 mb-2 block uppercase tracking-wide">Calorias Gastas</label>
                <div className="flex items-center gap-2 bg-slate-800 rounded-2xl p-3 border border-slate-700">
                  <input 
                    type="number" 
                    value={caloriesBurned}
                    onChange={e => setCaloriesBurned(e.target.value)}
                    className="bg-transparent w-full text-3xl font-black text-center outline-none placeholder:text-slate-600"
                    placeholder="0"
                  />
                  <span className="text-slate-400 font-bold pr-4 text-lg">kcal</span>
                </div>
              </div>
              <button 
                onClick={finishExecution}
                className="w-full bg-green-500 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-green-900/20 hover:bg-green-400 transition-colors"
              >
                Concluir Treino
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
