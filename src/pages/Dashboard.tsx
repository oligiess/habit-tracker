import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import * as api from "@/lib/api";
import type { Habit, WeeklyStatEntry, HeatmapEntry, StatsSummary, HabitCreateInput, HabitPatchInput } from "@/lib/types";
import Sidebar from "@/components/dashboard/Sidebar";
import TopBar from "@/components/dashboard/TopBar";
import StatCards from "@/components/dashboard/StatCards";
import HabitList from "@/components/dashboard/HabitList";
import WeeklyChart from "@/components/dashboard/WeeklyChart";
import MonthHeatmap from "@/components/dashboard/MonthHeatmap";
import CreateEditHabitModal from "@/components/dashboard/CreateEditHabitModal";

const EMPTY_SUMMARY: StatsSummary = { active_streak: 0, best_streak: 0, month_completion_pct: 0 };

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [habits, setHabits] = useState<Habit[]>([]);
  const [weekly, setWeekly] = useState<WeeklyStatEntry[]>([]);
  const [heatmap, setHeatmap] = useState<HeatmapEntry[]>([]);
  const [summary, setSummary] = useState<StatsSummary>(EMPTY_SUMMARY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

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

  const handleMarkDone = async (id: number) => {
    try {
      await api.markDone(id);
      await refresh();
    } catch {
      setError("Couldn't mark that habit done. Try again.");
    }
  };

  const handleCreate = async (input: HabitCreateInput) => {
    await api.createHabit(input);
    await refresh();
  };

  const handleUpdate = async (id: number, patch: HabitPatchInput) => {
    await api.updateHabit(id, patch);
    await refresh();
  };

  const handleDelete = async (id: number) => {
    await api.deleteHabit(id);
    await refresh();
  };

  const openCreateModal = () => {
    setEditingHabit(null);
    setModalOpen(true);
  };

  const openEditModal = (habit: Habit) => {
    setEditingHabit(habit);
    setModalOpen(true);
  };

  const greetingName = user?.email?.split("@")[0] ?? "there";

  return (
    <div className="size-full flex overflow-hidden" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <Sidebar userEmail={user?.email ?? ""} activeStreak={summary.active_streak} onSignOut={signOut} />

      <main className="flex-1 overflow-y-auto bg-background">
        <TopBar
          greetingName={greetingName}
          theme={theme}
          onToggleTheme={toggleTheme}
          onNewHabit={openCreateModal}
        />

        <div className="px-8 py-6 flex flex-col gap-6">
          {error && (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {!loading && (
            <>
              <StatCards summary={summary} />

              <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 280px" }}>
                <HabitList habits={habits} onMarkDone={handleMarkDone} onEdit={openEditModal} />

                <div className="flex flex-col gap-4">
                  <WeeklyChart data={weekly} />
                  <MonthHeatmap data={heatmap} />
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      <CreateEditHabitModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        habit={editingHabit}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />
    </div>
  );
}
