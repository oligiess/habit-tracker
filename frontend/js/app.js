const API_BASE =
  window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:8000/api"
    : "https://habit-tracker-api-2lkb.onrender.com/api";
const DOT_STRIP_DAYS = 7;
const RING_RADIUS = 24;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

const statusEl = document.getElementById("status");
const todayEl = document.getElementById("today");
const habitListEl = document.getElementById("habit-list");
const addHabitForm = document.getElementById("add-habit-form");
const habitNameInput = document.getElementById("habit-name-input");

function formatDateISO(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getLastNDays(n) {
  const today = new Date();
  const days = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    days.push(d);
  }
  return days;
}

todayEl.textContent = new Date().toLocaleDateString(undefined, {
  weekday: "long",
  month: "short",
  day: "numeric",
});

async function loadStatus() {
  try {
    const response = await fetch(`${API_BASE}/health`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    statusEl.textContent = `Backend: ${data.message}`;
  } catch (err) {
    statusEl.textContent = `Error reaching backend: ${err.message}`;
    console.error(err);
  }
}

async function loadHabits() {
  try {
    const response = await fetch(`${API_BASE}/habits`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const habits = await response.json();
    renderHabits(habits);
  } catch (err) {
    habitListEl.innerHTML = "";
    const li = document.createElement("li");
    li.className = "empty-state";
    li.textContent = `Error loading habits: ${err.message}`;
    habitListEl.appendChild(li);
    console.error(err);
  }
}

function renderHabits(habits) {
  habitListEl.innerHTML = "";

  if (habits.length === 0) {
    const li = document.createElement("li");
    li.className = "empty-state";
    li.textContent = "No habits yet — add one above.";
    habitListEl.appendChild(li);
    return;
  }

  const days = getLastNDays(DOT_STRIP_DAYS);

  for (const habit of habits) {
    const historySet = new Set(habit.history);
    const todayStr = formatDateISO(new Date());
    const isDoneToday = historySet.has(todayStr);
    const progress = habit.longest_streak > 0 ? habit.current_streak / habit.longest_streak : 0;
    const ringOffset = RING_CIRCUMFERENCE * (1 - progress);

    const li = document.createElement("li");
    li.className = "habit-card";
    li.innerHTML = `
      <div class="card-head">
        <div>
          <p class="habit-name"></p>
          <p class="streak-caption">day ${habit.current_streak} &middot; longest streak ${habit.longest_streak}</p>
        </div>
        <div class="ring-wrap">
          <svg width="58" height="58" viewBox="0 0 58 58">
            <circle class="ring-track" cx="29" cy="29" r="${RING_RADIUS}" />
            <circle class="ring-progress" cx="29" cy="29" r="${RING_RADIUS}"
              stroke-dasharray="${RING_CIRCUMFERENCE}" stroke-dashoffset="${ringOffset}" />
          </svg>
          <div class="ring-num">${habit.current_streak}</div>
        </div>
      </div>
      <div class="stage-row">
        ${days
          .map((day) => {
            const iso = formatDateISO(day);
            const done = historySet.has(iso);
            const dow = day.toLocaleDateString(undefined, { weekday: "short" }).charAt(0);
            return `
              <div class="stage">
                <div class="stage-dot ${done ? "grown" : ""}" title="${iso}"></div>
                <span class="dow">${dow}</span>
              </div>
            `;
          })
          .join("")}
      </div>
      <div class="card-actions">
        <button class="mark-btn ${isDoneToday ? "done" : ""}">
          ${isDoneToday ? "✓ done today" : "Mark done"}
        </button>
        <button class="delete-btn">Delete</button>
      </div>
    `;

    li.querySelector(".habit-name").textContent = habit.name;

    if (!isDoneToday) {
      li.querySelector(".mark-btn").addEventListener("click", () => markHabitDone(habit.id));
    }
    li.querySelector(".delete-btn").addEventListener("click", () => deleteHabit(habit.id));

    habitListEl.appendChild(li);
  }
}

async function markHabitDone(habitId) {
  try {
    const response = await fetch(`${API_BASE}/habits/${habitId}/completions`, {
      method: "POST",
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    await loadHabits();
  } catch (err) {
    alert(`Error marking habit done: ${err.message}`);
    console.error(err);
  }
}

async function deleteHabit(habitId) {
  if (!confirm("Delete this habit? This also deletes its history.")) return;

  try {
    const response = await fetch(`${API_BASE}/habits/${habitId}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    await loadHabits();
  } catch (err) {
    alert(`Error deleting habit: ${err.message}`);
    console.error(err);
  }
}

addHabitForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const name = habitNameInput.value.trim();
  if (!name) return;

  try {
    const response = await fetch(`${API_BASE}/habits`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    habitNameInput.value = "";
    await loadHabits();
  } catch (err) {
    alert(`Error adding habit: ${err.message}`);
    console.error(err);
  }
});

const rootEl = document.documentElement;
document.getElementById("theme-toggle").addEventListener("click", () => {
  const current =
    rootEl.getAttribute("data-theme") ||
    (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  rootEl.setAttribute("data-theme", current === "dark" ? "light" : "dark");
});

loadStatus();
loadHabits();
