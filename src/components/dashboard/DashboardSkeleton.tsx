import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardSkeleton() {
  return (
    <>
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl px-5 py-4 border border-border bg-card flex items-center gap-4">
            <Skeleton className="w-10 h-10 rounded-lg flex-shrink-0" />
            <div className="flex-1 flex flex-col gap-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 280px" }}>
        <div className="rounded-xl border border-border bg-card">
          <div className="px-6 pt-5 pb-4 border-b border-border flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-3 w-10" />
            </div>
            <Skeleton className="h-2 w-full rounded-full" />
          </div>
          <div className="divide-y divide-border/60">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-3.5">
                <Skeleton className="w-5 h-5 rounded-full flex-shrink-0" />
                <Skeleton className="w-8 h-8 rounded-lg flex-shrink-0" />
                <div className="flex-1 flex flex-col gap-1.5">
                  <Skeleton className="h-3.5 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-3 w-8" />
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-border bg-card px-5 pt-5 pb-4 flex flex-col gap-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-[100px] w-full" />
          </div>
          <div className="rounded-xl border border-border bg-card px-5 pt-5 pb-5 flex flex-col gap-4">
            <Skeleton className="h-4 w-28" />
            <div className="grid gap-1.5" style={{ gridTemplateColumns: "repeat(7, 1fr)" }}>
              {Array.from({ length: 28 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-md" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
