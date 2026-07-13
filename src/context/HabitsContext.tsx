import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import * as api from "@/lib/api";
import type {
  Habit,
  WeeklyStatEntry,
  HeatmapEntry,
  StatsSummary,
  HabitCreateInput,
  HabitPatchInput,
} from "@/lib/types";

const EMPTY_SUMMARY: StatsSummary = { active_streak: 0, best_streak: 0, month_completion_pct: 0 };

interface HabitsContextValue {
  habits: Habit[];
  weekly: WeeklyStatEntry[];
  heatmap: HeatmapEntry[];
  summary: StatsSummary;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  markDone: (id: number) => Promise<void>;
  createHabit: (input: HabitCreateInput) => Promise<void>;
  updateHabit: (id: number, patch: HabitPatchInput) => Promise<void>;
  deleteHabit: (id: number) => Promise<void>;
}

const HabitsContext = createContext<HabitsContextValue | null>(null);

export function HabitsProvider({ children }: { children: ReactNode }) {
  const { signOut } = useAuth();

  const [habits, setHabits] = useState<Habit[]>([]);
  const [weekly, setWeekly] = useState<WeeklyStatEntry[]>([]);
  const [heatmap, setHeatmap] = useState<HeatmapEntry[]>([]);
  const [summary, setSummary] = useState<StatsSummary>(EMPTY_SUMMARY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const [habitsData, weeklyData, heatmapData, summaryData] = await Promise.all([
        api.listHabits(),
        api.getWeeklyStats(),
        api.getHeatmap(),
        api.getSummary(),
      ]);
      setHabits(habitsData);
      setWeekly(weeklyData);
      setHeatmap(heatmapData);
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
    } catch {
      setError("Couldn't mark that habit done. Try again.");
    }
  };

  const createHabit = async (input: HabitCreateInput) => {
    await api.createHabit(input);
    await refresh();
  };

  const updateHabit = async (id: number, patch: HabitPatchInput) => {
    await api.updateHabit(id, patch);
    await refresh();
  };

  const deleteHabit = async (id: number) => {
    await api.deleteHabit(id);
    await refresh();
  };

  return (
    <HabitsContext.Provider
      value={{
        habits,
        weekly,
        heatmap,
        summary,
        loading,
        error,
        refresh,
        markDone,
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
