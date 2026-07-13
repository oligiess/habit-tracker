import { BarChart, Bar, XAxis, ResponsiveContainer, Cell } from "recharts";
import type { WeeklyStatEntry } from "@/lib/types";

interface WeeklyChartProps {
  data: WeeklyStatEntry[];
}

export default function WeeklyChart({ data }: WeeklyChartProps) {
  const totalPossible = data.reduce((sum, d) => sum + d.total, 0);

  return (
    <div className="rounded-xl border border-border bg-card px-5 pt-5 pb-4">
      <h2 className="text-sm mb-4 text-card-foreground" style={{ fontFamily: "'Libre Baskerville', serif" }}>
        This Week
      </h2>
      <ResponsiveContainer width="100%" height={100}>
        <BarChart data={data} barSize={18} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <XAxis
            dataKey="day"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: "var(--muted-foreground)", fontFamily: "'DM Mono', monospace" }}
          />
          <Bar dataKey="completed" radius={[4, 4, 0, 0]}>
            {data.map((entry, i) => (
              <Cell
                key={i}
                fill={
                  entry.total > 0 && entry.completed === entry.total
                    ? "var(--accent)"
                    : entry.completed >= Math.ceil(entry.total * 0.6)
                      ? "var(--primary)"
                      : "var(--muted)"
                }
              />
            ))}
          </Bar>
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
