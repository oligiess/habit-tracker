const API_URL = "http://localhost:8000/api/health";

async function loadStatus() {
  const statusEl = document.getElementById("status");
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    statusEl.textContent = `Backend says: ${data.message} (status: ${data.status})`;
  } catch (err) {
    statusEl.textContent = `Error reaching backend: ${err.message}`;
    console.error(err);
  }
}

loadStatus();
