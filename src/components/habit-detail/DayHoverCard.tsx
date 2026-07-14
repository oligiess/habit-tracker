import type { ReactNode } from "react";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";

interface DayHoverCardProps {
  date: string;
  completedAt: string | null;
  children: ReactNode;
}

function formatExactTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export default function DayHoverCard({ date, completedAt, children }: DayHoverCardProps) {
  const dayLabel = new Date(date + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <HoverCard openDelay={150} closeDelay={100}>
      <HoverCardTrigger asChild>{children}</HoverCardTrigger>
      <HoverCardContent className="w-auto">
        <p className="text-sm text-popover-foreground" style={{ fontFamily: "'Libre Baskerville', serif" }}>
          {dayLabel}
        </p>
        <p className="text-sm mt-1 text-muted-foreground">
          {completedAt ? `Completed at ${formatExactTime(completedAt)}` : "Not completed"}
        </p>
      </HoverCardContent>
    </HoverCard>
  );
}
