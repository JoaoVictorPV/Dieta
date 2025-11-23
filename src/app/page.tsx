'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Dumbbell, TrendingUp, Scale, LogOut, ChevronLeft, ChevronRight, Flame } from 'lucide-react';
import { clsx } from 'clsx';

interface LogEntry {
  date: string;
  programId: string;
  programName: string;
  exercisesCompleted: number;
  totalExercises: number;
  caloriesBurned: number;
}

function InfoCard({ title, children, className }: { title: string, children: React.ReactNode, className?: string }) {
  return (
    <div className={`bg-white rounded-3xl shadow-sm border border-gray-200 p-5 ${className}`}>
      <h3 className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">{title}</h3>
      {children}
    </div>
  );
}

export default function Home() {
  const { currentUser, logout } = useUser();
  const [calorieProgress, setCalorieProgress] = useState(0);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [mounted, setMounted] = useState(false);

  const today = new Date();
  const dateKey = format(today, 'yyyy-MM-dd');
  const dateStr = today.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  useEffect(() => {
    setMounted(true);
    if (currentUser) {
      // Load Calories
      const savedCal = localStorage.getItem(`fitprog_calories_${currentUser.id}_${dateKey}`);
      if (savedCal) setCalorieProgress(parseInt(savedCal));
      else setCalorieProgress(0);

      // Load Logs
      const savedLogs = localStorage.getItem(`fitprog_logs_${currentUser.id}`);
      if (savedLogs) setLogs(JSON.parse(savedLogs));
    }
  }, [currentUser, dateKey]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    setCalorieProgress(val);
    localStorage.setItem(`fitprog_calories_${currentUser?.id}_${dateKey}`, val.toString());
  };

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  const getLogsForDate = (date: Date) => {
    return logs.filter(log => isSameDay(parseISO(log.date), date));
  };

  const selectedLogs = getLogsForDate(selectedDate);

  if (!mounted) return null;

  return (
    <div className="p-6 space-y-8 pb-32">
      <header className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Olá, {currentUser?.name}</h1>
          <p className="text-slate-500 font-medium capitalize text-lg">{dateStr}</p>
        </div>
        <button onClick={logout} className="p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-red-50 hover:text-red-500 transition-colors">
          <LogOut size={20} />
        </button>
      </header>

      {/* Calorie Slider */}
      <section>
        <InfoCard title="Progresso Calórico do Dia">
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <span className="text-4xl font-black text-blue-700">{calorieProgress}</span>
              <span className="text-sm font-bold text-slate-400 mb-1">kcal ingeridas</span>
            </div>
            
            <input 
              type="range" 
              min="0" 
              max="4000" 
              step="50"
              value={calorieProgress}
              onChange={handleSliderChange}
              className="w-full h-4 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-xs font-bold text-slate-400">
              <span>0</span>
              <span>2000</span>
              <span>4000</span>
            </div>
          </div>
        </InfoCard>
      </section>

      {/* Workout History Calendar */}
      <section>
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-5">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Histórico de Treinos</h3>
            <div className="flex gap-2">
              <button onClick={handlePrevMonth} className="p-1 hover:bg-gray-100 rounded-full">
                <ChevronLeft size={20} />
              </button>
              <span className="font-bold text-slate-900 capitalize w-32 text-center">
                {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
              </span>
              <button onClick={handleNextMonth} className="p-1 hover:bg-gray-100 rounded-full">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-xs font-black text-slate-500 mb-2">
            {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, i) => (
              <div key={i}>{day}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 mb-4">
            {Array.from({ length: monthStart.getDay() }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            
            {daysInMonth.map((day) => {
              const isToday = isSameDay(day, new Date());
              const isSelected = isSameDay(day, selectedDate);
              const dayLogs = getLogsForDate(day);
              const hasWorkout = dayLogs.length > 0;

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(day)}
                  className={clsx(
                    'h-10 w-10 rounded-full flex flex-col items-center justify-center text-sm font-bold relative transition-all',
                    isSelected ? 'bg-slate-900 text-white shadow-lg scale-110 z-10' : 'text-slate-900 hover:bg-gray-100',
                    isToday && !isSelected && 'text-blue-700 border-2 border-blue-200 bg-blue-50'
                  )}
                >
                  <span>{format(day, 'd')}</span>
                  {hasWorkout && (
                    <span className={clsx(
                      "absolute bottom-1 h-1.5 w-1.5 rounded-full",
                      isSelected ? "bg-green-400" : "bg-green-500"
                    )} />
                  )}
                </button>
              );
            })}
          </div>

          {/* Selected Date Details */}
          <div className="pt-4 border-t border-gray-100 min-h-[100px]">
            <h4 className="font-bold text-slate-900 mb-3 capitalize text-sm">
              {format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
            </h4>
            
            {selectedLogs.length > 0 ? (
              <div className="space-y-3">
                {selectedLogs.map((log, idx) => (
                  <div key={idx} className="bg-white p-4 rounded-2xl border-2 border-slate-100 flex justify-between items-center shadow-sm">
                    <div>
                      <div className="font-bold text-slate-900 text-lg">{log.programName}</div>
                      <div className="text-sm font-bold text-slate-500 mt-1 flex items-center gap-1">
                        <Dumbbell size={14} />
                        {log.exercisesCompleted || 0}/{log.totalExercises || 0} exercícios
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-orange-500 font-black text-lg">
                        <Flame size={16} fill="currentColor" />
                        {log.caloriesBurned}
                      </div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase">kcal</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-slate-400 text-sm py-2">Nenhum treino registrado neste dia.</p>
            )}
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-2 gap-4">
        <InfoCard title="Peso Atual">
          <div className="flex items-end gap-1">
            <span className="text-3xl font-black text-slate-900">78.5</span>
            <span className="text-sm font-bold text-slate-500 mb-1">kg</span>
          </div>
          <div className="flex items-center gap-1 text-green-600 mt-2 font-bold text-xs">
            <TrendingUp size={14} />
            <span>-1.2kg (30d)</span>
          </div>
        </InfoCard>
        <InfoCard title="Gordura Corporal">
          <div className="flex items-end gap-1">
            <span className="text-3xl font-black text-slate-900">18.2</span>
            <span className="text-sm font-bold text-slate-500 mb-1">%</span>
          </div>
          <div className="flex items-center gap-1 text-slate-400 mt-2 font-bold text-xs">
            <Scale size={14} />
            <span>Estável</span>
          </div>
        </InfoCard>
      </section>
    </div>
  );
}
