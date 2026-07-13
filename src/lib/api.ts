import { supabase } from "./supabaseClient";
import { localDateString } from "./date";
import type {
  Habit,
  HabitCreateInput,
  HabitPatchInput,
  Completion,
  WeeklyStatEntry,
  CalendarDayEntry,
  StatsSummary,
} from "./types";

const API_BASE = "/api";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const headers = new Headers(options.headers);
  headers.set("X-Client-Date", localDateString(new Date()));
  if (session?.access_token) {
    headers.set("Authorization", `Bearer ${session.access_token}`);
  }
  if (options.body) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (!response.ok) {
    let detail = response.statusText;
    try {
      const body = await response.json();
      detail = body.detail ?? detail;
    } catch {
      // response had no JSON body
    }
    throw new ApiError(response.status, detail);
  }

  if (response.status === 204) {
    return undefined as T;
  }
  return response.json();
}

export function listHabits(includeArchived = false): Promise<Habit[]> {
  return request(`/habits?include_archived=${includeArchived}`);
}

export function createHabit(input: HabitCreateInput): Promise<Habit> {
  return request("/habits", { method: "POST", body: JSON.stringify(input) });
}

export function updateHabit(id: number, patch: HabitPatchInput): Promise<Habit> {
  return request(`/habits/${id}`, { method: "PATCH", body: JSON.stringify(patch) });
}

export function deleteHabit(id: number): Promise<void> {
  return request(`/habits/${id}`, { method: "DELETE" });
}

export function markDone(id: number): Promise<Completion> {
  return request(`/habits/${id}/completions`, { method: "POST" });
}

export function unmarkDone(id: number): Promise<void> {
  return request(`/habits/${id}/completions`, { method: "DELETE" });
}

export function getWeeklyStats(): Promise<WeeklyStatEntry[]> {
  return request("/stats/weekly");
}

export function getSummary(): Promise<StatsSummary> {
  return request("/stats/summary");
}

export function getCalendarMonth(month?: string): Promise<CalendarDayEntry[]> {
  return request(`/stats/calendar${month ? `?month=${month}` : ""}`);
}
