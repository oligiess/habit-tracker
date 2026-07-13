import { Outlet } from "react-router-dom";
import { HabitsProvider } from "@/context/HabitsContext";
import Sidebar from "@/components/dashboard/Sidebar";

export default function AppLayout() {
  return (
    <HabitsProvider>
      <div className="size-full flex overflow-hidden" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-background">
          <Outlet />
        </main>
      </div>
    </HabitsProvider>
  );
}
