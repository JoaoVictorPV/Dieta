import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { Login } from './components/Login';
import { 
  Plus, 
  Trash2, 
  Check, 
  ChevronLeft, 
  ChevronRight,
  X,
  Activity,
  Flame,
  Settings2,
  Pencil,
  LogOut
} from 'lucide-react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  isToday,
  startOfWeek,
  endOfWeek
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from './lib/utils';

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // Dados
  const [exercises, setExercises] = useState([]);
  const [history, setHistory] = useState({}); // { "YYYY-MM-DD": { exerciseId: { id, calories } } }

  // Estados de Interface
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [newExerciseTitle, setNewExerciseTitle] = useState('');
  
  const [editingExerciseId, setEditingExerciseId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');

  const [caloryModal, setCaloryModal] = useState({ 
    isOpen: false, 
    exerciseId: null, 
    dateKey: null 
  });
  const [caloriesInput, setCaloriesInput] = useState('');

  // Navegação por Gesto (Touch/Mouse)
  const calendarRef = useRef(null);
  const touchStart = useRef(null);
  const touchEnd = useRef(null);
  const isDragging = useRef(false);
  const [isTouching, setIsTouching] = useState(false); // Apenas para feedback visual
  const minSwipeDistance = 30;

  // Gerenciar Sessão
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Carregar Dados
  useEffect(() => {
    if (session) {
      fetchData();
    }
  }, [session]);

  const fetchData = async () => {
    // Carregar Exercícios
    const { data: exercisesData } = await supabase
      .from('exercises')
      .select('*')
      .order('created_at');
    
    if (exercisesData) setExercises(exercisesData);

    // Carregar Histórico
    const { data: historyData } = await supabase
      .from('history')
      .select('*');

    if (historyData) {
      const historyMap = {};
      historyData.forEach(record => {
        const dateKey = record.date; // YYYY-MM-DD
        if (!historyMap[dateKey]) historyMap[dateKey] = {};
        historyMap[dateKey][record.exercise_id] = {
          id: record.id, // ID do registro no histórico para deletar depois
          calories: record.calories
        };
      });
      setHistory(historyMap);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // Adicionar exercício
  const addExercise = async (e) => {
    e.preventDefault();
    if (!newExerciseTitle.trim()) return;

    const { data, error } = await supabase
      .from('exercises')
      .insert([{ 
        title: newExerciseTitle.trim(),
        user_id: session.user.id
      }])
      .select();

    if (error) {
      console.error('Erro ao adicionar:', error);
      alert('Erro ao adicionar exercício: ' + error.message);
      return;
    }

    if (data) {
      setExercises([...exercises, data[0]]);
      setNewExerciseTitle('');
      setIsAddModalOpen(false);
    }
  };

  // Remover exercício
  const deleteExercise = async (exerciseId) => {
    await supabase.from('exercises').delete().eq('id', exerciseId);
    setExercises(exercises.filter(h => h.id !== exerciseId));
  };

  // Editar exercício
  const startEditing = (exercise) => {
    setEditingExerciseId(exercise.id);
    setEditingTitle(exercise.title);
  };

  const saveEditing = async () => {
    if (!editingTitle.trim()) return;
    
    await supabase
      .from('exercises')
      .update({ title: editingTitle.trim() })
      .eq('id', editingExerciseId);

    setExercises(exercises.map(ex => 
      ex.id === editingExerciseId ? { ...ex, title: editingTitle.trim() } : ex
    ));
    setEditingExerciseId(null);
    setEditingTitle('');
  };

  // Check / Uncheck (Lógica principal)
  const handleCheck = async (exerciseId, date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    const dayData = history[dateKey] || {};
    const record = dayData[exerciseId];
    
    if (record) {
      // Remover (Uncheck)
      await supabase.from('history').delete().eq('id', record.id);
      
      const newDayData = { ...dayData };
      delete newDayData[exerciseId];
      setHistory({
        ...history,
        [dateKey]: newDayData
      });
    } else {
      // Adicionar (Check) -> Abre modal
      setCaloriesInput('');
      setCaloryModal({
        isOpen: true,
        exerciseId,
        dateKey
      });
    }
  };

  // Confirmar inserção no histórico
  const confirmCheck = async (e) => {
    e.preventDefault();
    const { exerciseId, dateKey } = caloryModal;
    
    const { data, error } = await supabase
      .from('history')
      .insert([{
        user_id: session.user.id,
        exercise_id: exerciseId,
        date: dateKey,
        calories: caloriesInput ? Number(caloriesInput) : null
      }])
      .select();

    if (data) {
      const dayData = history[dateKey] || {};
      setHistory({
        ...history,
        [dateKey]: {
          ...dayData,
          [exerciseId]: {
            id: data[0].id,
            calories: data[0].calories
          }
        }
      });
    }

    setCaloryModal({ isOpen: false, exerciseId: null, dateKey: null });
  };

  const getDailyCalories = (date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    const dayData = history[dateKey] || {};
    return Object.values(dayData).reduce((acc, curr) => acc + (curr.calories || 0), 0);
  };

  // Listeners Nativos para Touch (Mais robusto para iPhone)
  useEffect(() => {
    const el = calendarRef.current;
    if (!el) return;

    const handleTouchStart = (e) => {
      touchEnd.current = null;
      touchStart.current = e.touches[0].clientX;
      setIsTouching(true);
    };

    const handleTouchMove = (e) => {
      touchEnd.current = e.touches[0].clientX;
    };

    const handleTouchEnd = () => {
      setIsTouching(false);
      if (!touchStart.current || !touchEnd.current) return;
      
      const distance = touchStart.current - touchEnd.current;
      
      if (distance > minSwipeDistance) {
        setCurrentMonth(prev => addMonths(prev, 1));
      } else if (distance < -minSwipeDistance) {
        setCurrentMonth(prev => subMonths(prev, 1));
      }
      
      touchStart.current = null;
      touchEnd.current = null;
    };

    // Adiciona listeners com passive: true para permitir scroll vertical suave
    el.addEventListener('touchstart', handleTouchStart, { passive: true });
    el.addEventListener('touchmove', handleTouchMove, { passive: true });
    el.addEventListener('touchend', handleTouchEnd);

    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
      el.removeEventListener('touchend', handleTouchEnd);
    };
  }, [loading]);

  // Handlers Mouse (Desktop) - Mantidos via React Props
  const onMouseDown = (e) => {
    isDragging.current = true;
    touchEnd.current = null;
    touchStart.current = e.clientX;
    setIsTouching(true);
  };

  const onMouseMove = (e) => {
    if (!isDragging.current) return;
    touchEnd.current = e.clientX;
  };

  const onMouseUp = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    setIsTouching(false);
    
    if (touchStart.current && touchEnd.current) {
      const distance = touchStart.current - touchEnd.current;
      if (distance > minSwipeDistance) {
        setCurrentMonth(prev => addMonths(prev, 1));
      } else if (distance < -minSwipeDistance) {
        setCurrentMonth(prev => subMonths(prev, 1));
      }
    }
    touchStart.current = null;
    touchEnd.current = null;
  };

  const onMouseLeave = () => {
    isDragging.current = false;
    touchStart.current = null;
    touchEnd.current = null;
    setIsTouching(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Activity className="animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20">
      <div className="max-w-xl mx-auto p-6 space-y-8">
        
        {/* Header */}
        <header className="flex items-center justify-between py-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Activity className="text-primary" size={24} />
            </div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground/90">
              Exercícios Físicos
            </h1>
          </div>
          
          <div className="flex gap-2">
             <button
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-destructive transition-all"
              title="Sair"
            >
              <LogOut size={20} />
            </button>
            <button
              onClick={() => setIsManageModalOpen(true)}
              className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-all"
              title="Gerenciar Lista"
            >
              <Settings2 size={20} />
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="p-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground transition-all shadow-sm hover:shadow-md active:scale-95"
              title="Novo Exercício"
            >
              <Plus size={20} />
            </button>
          </div>
        </header>

        <div 
          ref={calendarRef}
          style={{ touchAction: 'pan-y' }}
          className={cn(
            "space-y-4 select-none rounded-xl transition-colors p-2 -m-2",
            isTouching ? "bg-primary/10 ring-2 ring-primary/20" : ""
          )}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseLeave}
        >
          {/* Navegação Mês */}
          <div className="flex items-center justify-between px-2">
            <button 
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="p-2 hover:bg-secondary rounded-full transition-colors text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft size={20} />
            </button>
            <h2 className="text-lg font-medium capitalize">
              {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
            </h2>
            <button 
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="p-2 hover:bg-secondary rounded-full transition-colors text-muted-foreground hover:text-foreground"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Calendário */}
          <div className="grid grid-cols-7 gap-2">
            {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map(day => (
              <div key={day} className="text-xs text-muted-foreground text-center font-medium py-2">
                {day}
              </div>
            ))}

            {eachDayOfInterval({
            start: startOfWeek(startOfMonth(currentMonth)),
            end: endOfWeek(endOfMonth(currentMonth))
          }).map((date, i) => {
            const isCurrentMonth = isSameMonth(date, currentMonth);
            const isTodayDate = isToday(date);
            const dateKey = format(date, 'yyyy-MM-dd');
            const dayData = history[dateKey] || {};
            const hasActivity = Object.keys(dayData).length > 0;
            const calories = getDailyCalories(date);

            return (
              <button
                key={i}
                onClick={() => setSelectedDate(date)}
                className={cn(
                  "aspect-[4/5] rounded-xl flex flex-col items-center justify-start pt-2 gap-1 transition-all border",
                  isCurrentMonth ? "bg-card border-border/50" : "bg-card/30 border-transparent opacity-40",
                  isTodayDate && "ring-2 ring-primary ring-offset-2 ring-offset-background border-primary/50",
                  hasActivity && isCurrentMonth && "bg-secondary/50",
                  "hover:border-primary/30 hover:shadow-sm"
                )}
              >
                <span className={cn(
                  "text-sm font-medium",
                  isTodayDate && "text-primary"
                )}>
                  {format(date, 'd')}
                </span>
                
                {hasActivity && (
                  <div className="flex flex-col items-center gap-1 mt-1">
                    <div className="flex -space-x-1">
                      {Object.keys(dayData).slice(0, 3).map((_, idx) => (
                        <div key={idx} className="w-1.5 h-1.5 rounded-full bg-primary/70 ring-1 ring-card" />
                      ))}
                    </div>
                    {calories > 0 && (
                      <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                        <Flame size={8} /> {calories}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
          </div>
        </div>
      </div>

      {/* Modal do Dia */}
      {selectedDate && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4 z-40 animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-lg sm:rounded-2xl border-t sm:border border-border shadow-2xl h-[85vh] sm:h-auto flex flex-col animate-in slide-in-from-bottom-10 duration-300">
            
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div>
                <h3 className="text-xl font-semibold">
                  {format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {getDailyCalories(selectedDate)} kcal gastas no total
                </p>
              </div>
              <button 
                onClick={() => setSelectedDate(null)}
                className="p-2 hover:bg-secondary rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {exercises.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Activity size={40} className="mx-auto mb-4 opacity-20" />
                  <p>Nenhum exercício cadastrado.</p>
                  <p className="text-sm">Adicione exercícios no menu principal para começar.</p>
                </div>
              ) : (
                exercises.map(exercise => {
                  const dateKey = format(selectedDate, 'yyyy-MM-dd');
                  const dayData = history[dateKey] || {};
                  const record = dayData[exercise.id];
                  const isCompleted = !!record;

                  return (
                    <button
                      key={exercise.id}
                      onClick={() => handleCheck(exercise.id, selectedDate)}
                      className={cn(
                        "w-full group flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 text-left",
                        isCompleted 
                          ? "bg-primary/5 border-primary/20" 
                          : "bg-secondary/20 border-transparent hover:bg-secondary/40"
                      )}
                    >
                      <div className={cn(
                        "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0",
                        isCompleted 
                          ? "bg-primary border-primary text-primary-foreground" 
                          : "border-muted-foreground/30 group-hover:border-primary/50"
                      )}>
                        {isCompleted && <Check size={14} strokeWidth={3} />}
                      </div>
                      
                      <div className="flex-1">
                        <span className={cn(
                          "font-medium block",
                          isCompleted && "text-foreground/80"
                        )}>
                          {exercise.title}
                        </span>
                        {isCompleted && record.calories > 0 && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Flame size={12} /> {record.calories} kcal
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
            
            <div className="p-4 border-t border-border bg-secondary/10 sm:rounded-b-2xl">
              <button 
                onClick={() => setSelectedDate(null)}
                className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Concluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Gerenciar */}
      {isManageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-card w-full max-w-md rounded-xl p-6 shadow-xl border border-border flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Gerenciar Lista</h2>
              <button 
                onClick={() => setIsManageModalOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 -mr-2 pr-2">
              {exercises.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  A lista está vazia.
                </p>
              ) : (
                exercises.map(exercise => (
                  <div 
                    key={exercise.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 border border-border/50"
                  >
                    {editingExerciseId === exercise.id ? (
                      <div className="flex-1 flex gap-2">
                        <input
                          type="text"
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          className="flex-1 bg-background border border-primary rounded px-2 py-1 text-sm outline-none"
                          autoFocus
                          onKeyDown={(e) => e.key === 'Enter' && saveEditing()}
                        />
                        <button 
                          onClick={saveEditing}
                          className="p-1.5 bg-primary text-primary-foreground rounded hover:bg-primary/90"
                        >
                          <Check size={14} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="flex-1 font-medium text-sm truncate">
                          {exercise.title}
                        </span>
                        <div className="flex gap-1">
                          <button
                            onClick={() => startEditing(exercise)}
                            className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => deleteExercise(exercise.id)}
                            className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Calorias */}
      {caloryModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-card w-full max-w-sm rounded-xl p-6 shadow-xl border border-border animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-semibold mb-2">Atividade Realizada</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Calorias gastas (opcional):
            </p>
            
            <form onSubmit={confirmCheck}>
              <div className="relative mb-6">
                <Flame className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input
                  type="number"
                  placeholder="Ex: 350"
                  className="w-full bg-secondary/50 border border-border focus:border-primary rounded-lg py-3 pl-10 pr-4 outline-none transition-all"
                  value={caloriesInput}
                  onChange={e => setCaloriesInput(e.target.value)}
                  autoFocus
                />
              </div>
              
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setCaloryModal({ isOpen: false, exerciseId: null, dateKey: null })}
                  className="flex-1 px-4 py-2 rounded-lg border border-border hover:bg-secondary transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Adicionar */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-card w-full max-w-sm rounded-xl p-6 shadow-xl border border-border relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setIsAddModalOpen(false)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
            >
              <X size={20} />
            </button>
            
            <h2 className="text-lg font-semibold mb-4">Novo Exercício</h2>
            
            <form onSubmit={addExercise} className="space-y-4">
              <input
                type="text"
                placeholder="Nome do exercício"
                className="w-full bg-secondary/50 border border-border focus:border-primary rounded-lg p-3 outline-none transition-all"
                value={newExerciseTitle}
                onChange={e => setNewExerciseTitle(e.target.value)}
                autoFocus
              />
              
              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3 rounded-lg transition-colors"
              >
                Criar
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
