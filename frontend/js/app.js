const API_BASE = "http://localhost:8000/api";

const statusEl = document.getElementById("status");
const habitListEl = document.getElementById("habit-list");
const addHabitForm = document.getElementById("add-habit-form");
const habitNameInput = document.getElementById("habit-name-input");

// Habit IDs marked done during this page session. Re-rendering the list
// (e.g. after adding another habit) must not lose this state. Not persisted
// across a page reload yet — that's Milestone 4's history/streak work.
const doneTodayIds = new Set();

async function loadStatus() {
  try {
    const response = await fetch(`${API_BASE}/health`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    statusEl.textContent = `Backend says: ${data.message} (status: ${data.status})`;
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
    li.textContent = `Error loading habits: ${err.message}`;
    habitListEl.appendChild(li);
    console.error(err);
  }
}

function renderHabits(habits) {
  habitListEl.innerHTML = "";

  if (habits.length === 0) {
    const li = document.createElement("li");
    li.textContent = "No habits yet — add one above.";
    habitListEl.appendChild(li);
    return;
  }

  for (const habit of habits) {
    const li = document.createElement("li");

    const nameSpan = document.createElement("span");
    nameSpan.textContent = habit.name;

    const markDoneBtn = document.createElement("button");
    const isDoneToday = doneTodayIds.has(habit.id);
    markDoneBtn.textContent = isDoneToday ? "✓ Done today" : "Mark done today";
    markDoneBtn.disabled = isDoneToday;
    markDoneBtn.addEventListener("click", () => markHabitDone(habit.id, markDoneBtn));

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", () => deleteHabit(habit.id));

    li.appendChild(nameSpan);
    li.appendChild(markDoneBtn);
    li.appendChild(deleteBtn);
    habitListEl.appendChild(li);
  }
}

async function markHabitDone(habitId, button) {
  try {
    const response = await fetch(`${API_BASE}/habits/${habitId}/completions`, {
      method: "POST",
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    doneTodayIds.add(habitId);
    button.textContent = "✓ Done today";
    button.disabled = true;
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
    doneTodayIds.delete(habitId);
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

loadStatus();
loadHabits();
