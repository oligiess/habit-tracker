import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useHabits } from "@/context/HabitsContext";
import type { Habit } from "@/lib/types";
import TopBar from "@/components/dashboard/TopBar";
import StatCards from "@/components/dashboard/StatCards";
import HabitList from "@/components/dashboard/HabitList";
import WeeklyChart from "@/components/dashboard/WeeklyChart";
import MonthHeatmap from "@/components/dashboard/MonthHeatmap";
import CreateEditHabitModal from "@/components/dashboard/CreateEditHabitModal";
import DashboardSkeleton from "@/components/dashboard/DashboardSkeleton";

export default function Dashboard() {
  const { user } = useAuth();
  const {
    habits,
    summary,
    loading,
    error,
    markDone,
    unmarkDone,
    createHabit,
    updateHabit,
    deleteHabit,
  } = useHabits();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  const openCreateModal = () => {
    setEditingHabit(null);
    setModalOpen(true);
  };

  const openEditModal = (habit: Habit) => {
    setEditingHabit(habit);
    setModalOpen(true);
  };

  const displayName = (user?.user_metadata?.display_name as string | undefined)?.trim();
  const greetingName = displayName || user?.email?.split("@")[0] || "there";

  return (
    <>
      <TopBar greetingName={greetingName} onNewHabit={openCreateModal} />

      <div className="px-8 py-6 flex flex-col gap-6">
        {error && (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {loading && <DashboardSkeleton />}

        {!loading && (
          <>
            <StatCards summary={summary} />

            <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 280px" }}>
              <HabitList
                habits={habits}
                onMarkDone={markDone}
                onUnmarkDone={unmarkDone}
                onEdit={openEditModal}
              />

              <div className="flex flex-col gap-4">
                <WeeklyChart />
                <MonthHeatmap />
              </div>
            </div>
          </>
        )}
      </div>

      <CreateEditHabitModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        habit={editingHabit}
        onCreate={createHabit}
        onUpdate={updateHabit}
        onDelete={deleteHabit}
      />
    </>
  );
}
