const TOKEN_KEY = "habitdeck_token";

const authForm = document.getElementById("auth-form");
const emailInput = document.getElementById("email-input");
const passwordInput = document.getElementById("password-input");
const submitBtn = document.getElementById("submit-btn");
const toggleModeEl = document.getElementById("toggle-mode");
const errorBannerEl = document.getElementById("error-banner");
const errorBannerTextEl = document.getElementById("error-banner-text");
const errorBannerDismissEl = document.getElementById("error-banner-dismiss");

let mode = "login";

function showError(message) {
  errorBannerTextEl.textContent = message;
  errorBannerEl.hidden = false;
}

function hideError() {
  errorBannerEl.hidden = true;
}

errorBannerDismissEl.addEventListener("click", hideError);

if (localStorage.getItem(TOKEN_KEY)) {
  window.location.href = "index.html";
}

toggleModeEl.addEventListener("click", (event) => {
  event.preventDefault();
  mode = mode === "login" ? "signup" : "login";
  submitBtn.textContent = mode === "login" ? "Log in" : "Sign up";
  toggleModeEl.textContent =
    mode === "login" ? "Need an account? Sign up" : "Already have an account? Log in";
  hideError();
});

async function extractErrorMessage(response, fallback) {
  try {
    const data = await response.json();
    return data.error_description || data.msg || data.message || fallback;
  } catch {
    return fallback;
  }
}

authForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  hideError();

  const email = emailInput.value.trim();
  const password = passwordInput.value;
  const endpoint =
    mode === "login"
      ? `${SUPABASE_URL}/auth/v1/token?grant_type=password`
      : `${SUPABASE_URL}/auth/v1/signup`;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_PUBLISHABLE_KEY,
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(
        data.error_description || data.msg || data.message || `HTTP ${response.status}`
      );
    }

    if (data.access_token) {
      localStorage.setItem(TOKEN_KEY, data.access_token);
      window.location.href = "index.html";
    } else {
      showError("Account created — check your email to confirm, then log in.");
      mode = "login";
      submitBtn.textContent = "Log in";
      toggleModeEl.textContent = "Need an account? Sign up";
    }
  } catch (err) {
    showError(err.message);
    console.error(err);
  }
});
