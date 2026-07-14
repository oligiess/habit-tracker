import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import * as api from "@/lib/api";
import type {
  Habit,
  WeeklyStatEntry,
  CalendarDayEntry,
  StatsSummary,
  HabitCreateInput,
  HabitPatchInput,
} from "@/lib/types";

const EMPTY_SUMMARY: StatsSummary = { active_streak: 0, best_streak: 0, month_completion_pct: 0 };

interface HabitsContextValue {
  habits: Habit[];
  weekly: WeeklyStatEntry[];
  calendarMonth: CalendarDayEntry[];
  summary: StatsSummary;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  markDone: (id: number) => Promise<void>;
  unmarkDone: (id: number) => Promise<void>;
  createHabit: (input: HabitCreateInput) => Promise<void>;
  updateHabit: (id: number, patch: HabitPatchInput) => Promise<void>;
  deleteHabit: (id: number) => Promise<void>;
}

const HabitsContext = createContext<HabitsContextValue | null>(null);

export function HabitsProvider({ children }: { children: ReactNode }) {
  const { signOut } = useAuth();
  const { toast } = useToast();

  const [habits, setHabits] = useState<Habit[]>([]);
  const [weekly, setWeekly] = useState<WeeklyStatEntry[]>([]);
  const [calendarMonth, setCalendarMonth] = useState<CalendarDayEntry[]>([]);
  const [summary, setSummary] = useState<StatsSummary>(EMPTY_SUMMARY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const [habitsData, weeklyData, calendarMonthData, summaryData] = await Promise.all([
        api.listHabits(),
        api.getWeeklyStats(),
        api.getCalendarMonth(),
        api.getSummary(),
      ]);
      setHabits(habitsData);
      setWeekly(weeklyData);
      setCalendarMonth(calendarMonthData);
      setSummary(summaryData);
      setError(null);
    } catch (e) {
      if (e instanceof api.ApiError && e.status === 401) {
        await signOut();
        return;
      }
      setError("Couldn't load your habits. Try refreshing the page.");
    } finally {
      setLoading(false);
    }
  }, [signOut]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const markDone = async (id: number) => {
    try {
      await api.markDone(id);
      await refresh();
      toast("Marked done");
    } catch {
      setError("Couldn't mark that habit done. Try again.");
    }
  };

  const unmarkDone = async (id: number) => {
    try {
      await api.unmarkDone(id);
      await refresh();
      toast("Unmarked");
    } catch {
      setError("Couldn't unmark that habit. Try again.");
    }
  };

  const createHabit = async (input: HabitCreateInput) => {
    await api.createHabit(input);
    await refresh();
    toast("Habit created");
  };

  const updateHabit = async (id: number, patch: HabitPatchInput) => {
    await api.updateHabit(id, patch);
    await refresh();
    if (patch.archived === true) toast("Habit archived");
    else if (patch.archived === false) toast("Habit unarchived");
    else toast("Habit updated");
  };

  const deleteHabit = async (id: number) => {
    await api.deleteHabit(id);
    await refresh();
    toast("Habit deleted");
  };

  return (
    <HabitsContext.Provider
      value={{
        habits,
        weekly,
        calendarMonth,
        summary,
        loading,
        error,
        refresh,
        markDone,
        unmarkDone,
        createHabit,
        updateHabit,
        deleteHabit,
      }}
    >
      {children}
    </HabitsContext.Provider>
  );
}

export function useHabits(): HabitsContextValue {
  const ctx = useContext(HabitsContext);
  if (!ctx) throw new Error("useHabits must be used within a HabitsProvider");
  return ctx;
}
