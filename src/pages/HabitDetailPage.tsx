import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Flame, Trophy, CalendarDays, Pencil } from "lucide-react";
import { useHabits } from "@/context/HabitsContext";
import { habitIcon } from "@/lib/habitIcon";
import { Button } from "@/components/ui/button";
import DotStrip from "@/components/habit-detail/DotStrip";
import HistoryCalendar from "@/components/habit-detail/HistoryCalendar";
import CreateEditHabitModal from "@/components/dashboard/CreateEditHabitModal";

export default function HabitDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { habits, loading, createHabit, updateHabit, deleteHabit } = useHabits();
  const [modalOpen, setModalOpen] = useState(false);

  const habit = habits.find((h) => h.id === Number(id)) ?? null;

  if (loading) {
    return <div className="px-8 py-6 text-sm text-muted-foreground">Loading...</div>;
  }

  if (!habit) {
    return (
      <div className="px-8 py-6 flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">This habit couldn't be found.</p>
        <Link to="/" className="text-sm text-primary hover:underline w-fit">
          Back to dashboard
        </Link>
      </div>
    );
  }

  const Icon = habitIcon(habit.category);
  const isWeekly = habit.target_per_week !== null && habit.week_progress !== null;
  const createdLabel = new Date(habit.created_at).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="px-8 py-6 flex flex-col gap-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
      >
        <ArrowLeft size={14} />
        Back
      </button>

      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "color-mix(in srgb, var(--accent) 15%, transparent)" }}
          >
            <Icon size={22} className="text-accent" />
          </div>
          <div>
            <h1 className="text-xl leading-tight text-foreground" style={{ fontFamily: "'Libre Baskerville', serif" }}>
              {habit.name}
            </h1>
            <p className="text-sm mt-0.5 text-muted-foreground">
              {[habit.target, habit.category].filter(Boolean).join(" · ") || "No details set"}
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setModalOpen(true)}>
          <Pencil size={14} />
          Edit
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl px-5 py-4 border border-border bg-card flex items-center gap-4">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: "color-mix(in srgb, var(--chart-1) 15%, transparent)" }}
          >
            <Flame size={18} style={{ color: "var(--chart-1)" }} />
          </div>
          <div>
            <p className="text-2xl font-semibold leading-none text-card-foreground" style={{ fontFamily: "'DM Mono', monospace" }}>
              {isWeekly ? habit.week_progress!.current_streak : habit.current_streak}
            </p>
            <p className="text-xs mt-1 text-muted-foreground">
              Current streak {isWeekly ? "(weeks)" : "(days)"}
            </p>
          </div>
        </div>

        <div className="rounded-xl px-5 py-4 border border-border bg-card flex items-center gap-4">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: "color-mix(in srgb, var(--chart-3) 15%, transparent)" }}
          >
            <Trophy size={18} style={{ color: "var(--chart-3)" }} />
          </div>
          <div>
            <p className="text-2xl font-semibold leading-none text-card-foreground" style={{ fontFamily: "'DM Mono', monospace" }}>
              {isWeekly ? habit.week_progress!.longest_streak : habit.longest_streak}
            </p>
            <p className="text-xs mt-1 text-muted-foreground">
              Longest streak {isWeekly ? "(weeks)" : "(days)"}
            </p>
          </div>
        </div>

        <div className="rounded-xl px-5 py-4 border border-border bg-card flex items-center gap-4">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: "color-mix(in srgb, var(--chart-2) 15%, transparent)" }}
          >
            <CalendarDays size={18} style={{ color: "var(--chart-2)" }} />
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight text-card-foreground">{createdLabel}</p>
            <p className="text-xs mt-1 text-muted-foreground">Habit created</p>
          </div>
        </div>
      </div>

      {isWeekly && (
        <div className="rounded-xl border border-border bg-card px-5 py-4">
          <p className="text-sm text-card-foreground">
            {habit.week_progress!.completed}/{habit.week_progress!.target} done this week
          </p>
        </div>
      )}

      <div className="rounded-xl border border-border bg-card px-5 py-5">
        <h2 className="text-sm mb-4 text-card-foreground" style={{ fontFamily: "'Libre Baskerville', serif" }}>
          Last 14 days
        </h2>
        <DotStrip history={habit.history} days={14} />
      </div>

      <div className="rounded-xl border border-border bg-card px-5 py-5">
        <h2 className="text-sm mb-4 text-card-foreground" style={{ fontFamily: "'Libre Baskerville', serif" }}>
          This month
        </h2>
        <HistoryCalendar history={habit.history} />
      </div>

      <CreateEditHabitModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        habit={habit}
        onCreate={createHabit}
        onUpdate={updateHabit}
        onDelete={async (habitId) => {
          await deleteHabit(habitId);
          navigate("/");
        }}
      />
    </div>
  );
}
