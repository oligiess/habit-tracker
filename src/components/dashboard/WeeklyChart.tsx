import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { useHabits } from "@/context/HabitsContext";
import DayCompletionHoverCard from "@/components/calendar/DayCompletionHoverCard";
import type { Habit, WeeklyStatEntry } from "@/lib/types";

interface ChartEntry extends WeeklyStatEntry {
  pct: number;
}

interface WeeklyBarProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  payload?: ChartEntry;
}

function barFill(completed: number, total: number): string {
  return total > 0 && completed === total
    ? "var(--accent)"
    : completed >= Math.ceil(total * 0.6)
      ? "var(--primary)"
      : "var(--muted)";
}

function WeeklyBar({ props, habitsById }: { props: WeeklyBarProps; habitsById: Map<number, Habit> }) {
  const { x = 0, y = 0, width = 0, height = 0, payload } = props;
  const rect = (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      rx={3}
      ry={3}
      fill={barFill(payload?.completed ?? 0, payload?.total ?? 0)}
    />
  );

  if (!payload) {
    return rect;
  }

  return (
    <DayCompletionHoverCard entry={payload} habitsById={habitsById}>
      {rect}
    </DayCompletionHoverCard>
  );
}

export default function WeeklyChart() {
  const { weekly, habits } = useHabits();
  const habitsById = new Map(habits.map((h) => [h.id, h]));

  const totalPossible = weekly.reduce((sum, d) => sum + d.total, 0);
  const chartData: ChartEntry[] = weekly.map((d) => ({
    ...d,
    pct: d.total > 0 ? d.completed / d.total : 0,
  }));

  return (
    <div className="rounded-xl border border-border bg-card px-5 pt-5 pb-4">
      <h2 className="text-sm mb-4 text-card-foreground" style={{ fontFamily: "'Libre Baskerville', serif" }}>
        This Week
      </h2>
      <ResponsiveContainer width="100%" height={100}>
        <BarChart data={chartData} barSize={18} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <XAxis
            dataKey="day"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: "var(--muted-foreground)", fontFamily: "'DM Mono', monospace" }}
          />
          <YAxis hide domain={[0, 1]} />
          <Bar
            dataKey="pct"
            shape={(props: unknown) => {
              const { key, ...rest } = props as { key?: string } & WeeklyBarProps;
              return <WeeklyBar key={key} props={rest} habitsById={habitsById} />;
            }}
          />
        </BarChart>
      </ResponsiveContainer>
      <div className="flex items-center justify-end mt-2">
        <span className="flex items-center gap-1 text-xs text-muted-foreground/70">
          <span className="w-2 h-2 rounded-sm inline-block bg-accent" />
          Perfect
        </span>
      </div>
      {totalPossible === 0 && (
        <p className="text-xs mt-2 text-muted-foreground/70">Add a daily habit to see this chart fill in.</p>
      )}
    </div>
  );
}
