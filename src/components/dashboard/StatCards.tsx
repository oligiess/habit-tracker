import { Flame, Trophy, BarChart2, type LucideIcon } from "lucide-react";
import type { StatsSummary } from "@/lib/types";
import { pluralize } from "@/lib/utils";

interface StatCardsProps {
  summary: StatsSummary;
}

interface StatCardDef {
  label: string;
  value: string;
  unit: string;
  icon: LucideIcon;
  color: string;
}

export default function StatCards({ summary }: StatCardsProps) {
  const stats: StatCardDef[] = [
    {
      label: "Current streak",
      value: String(summary.active_streak),
      unit: pluralize(summary.active_streak, "day"),
      icon: Flame,
      color: "var(--chart-1)",
    },
    {
      label: "Best streak",
      value: String(summary.best_streak),
      unit: pluralize(summary.best_streak, "day"),
      icon: Trophy,
      color: "var(--chart-3)",
    },
    { label: "This month", value: String(summary.month_completion_pct), unit: "% done", icon: BarChart2, color: "var(--chart-2)" },
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      {stats.map(({ label, value, unit, icon: Icon, color }) => (
        <div
          key={label}
          className="rounded-xl px-5 py-4 border border-border bg-card flex items-center gap-4"
        >
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: `color-mix(in srgb, ${color} 15%, transparent)` }}
          >
            <Icon size={18} style={{ color }} />
          </div>
          <div>
            <p
              className="text-2xl font-semibold leading-none text-card-foreground"
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              {value}
              <span className="text-sm font-normal ml-1 text-muted-foreground">{unit}</span>
            </p>
            <p className="text-xs mt-1 text-muted-foreground">{label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
