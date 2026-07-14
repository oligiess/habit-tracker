import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { localDateString } from "@/lib/date";
import type { CompletionTime } from "@/lib/types";
import DayHoverCard from "./DayHoverCard";

interface CompletionTimeChartProps {
  completionTimes?: CompletionTime[];
  days?: number;
}

interface ChartEntry {
  date: string;
  label: string;
  minutes: number | null;
  completedAt: string | null;
}

const Y_TICKS = [0, 180, 360, 540, 720, 900, 1080, 1260, 1440];

function formatHourTick(minutes: number): string {
  const hour = Math.floor(minutes / 60) % 24;
  const period = hour < 12 ? "AM" : "PM";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12} ${period}`;
}

function CompletionDot(props: { cx?: number; cy?: number; payload?: ChartEntry }) {
  const { cx, cy, payload } = props;
  if (cx == null || cy == null || !payload || payload.minutes == null || !payload.completedAt) {
    return null;
  }

  return (
    <DayHoverCard date={payload.date} completedAt={payload.completedAt}>
      <circle cx={cx} cy={cy} r={4} fill="var(--primary)" style={{ cursor: "pointer" }} />
    </DayHoverCard>
  );
}

export default function CompletionTimeChart({ completionTimes = [], days = 14 }: CompletionTimeChartProps) {
  const timesByDate = new Map(completionTimes.map((c) => [c.date, c.completed_at]));
  const today = new Date();

  const data: ChartEntry[] = Array.from({ length: days }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (days - 1 - i));
    const date = localDateString(d);
    const completedAt = timesByDate.get(date) ?? null;
    const minutes = completedAt ? new Date(completedAt).getHours() * 60 + new Date(completedAt).getMinutes() : null;
    return { date, label: d.toLocaleDateString("en-US", { weekday: "narrow" }), minutes, completedAt };
  });

  const hasAnyCompletion = data.some((d) => d.minutes != null);

  return (
    <div className="rounded-xl border border-border bg-card px-5 py-5">
      <h2 className="text-base font-semibold mb-4 text-card-foreground" style={{ fontFamily: "'Libre Baskerville', serif" }}>
        Completion times
      </h2>
      {hasAnyCompletion ? (
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tickMargin={10}
              tick={{ fontSize: 10, fill: "var(--muted-foreground)", fontFamily: "'DM Mono', monospace" }}
            />
            <YAxis
              domain={[0, 1440]}
              ticks={Y_TICKS}
              tickFormatter={formatHourTick}
              axisLine={false}
              tickLine={false}
              interval={0}
              tickMargin={8}
              width={64}
              tick={{ fontSize: 10, fill: "var(--muted-foreground)", fontFamily: "'DM Mono', monospace" }}
            />
            <Line
              dataKey="minutes"
              stroke="var(--primary)"
              strokeWidth={1.5}
              connectNulls={false}
              dot={(props: { key?: string } & Record<string, unknown>) => {
                const { key, ...rest } = props;
                return <CompletionDot key={key} {...rest} />;
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <p className="text-xs text-muted-foreground/70">No completions in the last {days} days yet.</p>
      )}
    </div>
  );
}
