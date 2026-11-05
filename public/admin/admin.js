const API_BASE = (window.RELIC_RUSH_ADMIN_API || "").replace(/\/$/, "");
const START_NG = "https://start.ng";
const GAME_SESSION_KEY = "relic_rush_startng_session";
const signedOut = document.querySelector("#signed-out");
const dashboard = document.querySelector("#dashboard");
const status = document.querySelector("#status");
const tbody = document.querySelector("#players");
const search = document.querySelector("#search");
let currentPlayer = null;
let allPlayers = [];

function captureSession() {
  const params = new URLSearchParams(location.hash.slice(1));
  const session = params.get("startng_session");
  if (session) {
    sessionStorage.setItem(GAME_SESSION_KEY, session);
    history.replaceState(null, "", location.pathname + location.search);
  }
  return sessionStorage.getItem(GAME_SESSION_KEY);
}
function signIn() {
  const returnTo = location.origin + location.pathname;
  location.href = `${START_NG}/?return_to=${encodeURIComponent(returnTo)}`;
}
function setStatus(message, isError = false) {
  status.textContent = message;
  status.dataset.error = String(isError);
}
async function api(path, options = {}) {
  if (!API_BASE) throw new Error("Admin API URL is not configured. Set window.RELIC_RUSH_ADMIN_API in public/admin-config.js.");
  const session = captureSession();
  if (!session) throw new Error("Your Start.ng session is missing. Sign in again.");
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${session}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `Request failed (${response.status}).`);
  return data;
}
function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString();
}
function renderPlayers() {
  const query = search.value.trim().toLowerCase();
  const filtered = allPlayers.filter((player) =>
    String(player.name).toLowerCase().includes(query) ||
    String(player.id).includes(query)
  );
  tbody.replaceChildren();
  if (!filtered.length) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 6;
    cell.textContent = query ? "No matching players." : "No players have been recorded yet.";
    row.append(cell);
    tbody.append(row);
    return;
  }
  for (const player of filtered) {
    const row = document.createElement("tr");
    const name = document.createElement("td");
    name.textContent = player.name + (player.is_owner ? " · Super Admin" : "");
    const id = document.createElement("td");
    id.textContent = String(player.id);
    const score = document.createElement("td");
    score.textContent = player.high_score == null ? "Not on top 50" : Number(player.high_score).toLocaleString();
    const firstSeen = document.createElement("td");
    firstSeen.textContent = formatDate(player.first_seen_at);
    const lastSeen = document.createElement("td");
    lastSeen.textContent = formatDate(player.last_seen_at);
    const roleCell = document.createElement("td");
    if (player.is_owner) {
      const badge = document.createElement("span");
      badge.className = "role-badge owner";
      badge.textContent = "Super Admin";
      roleCell.append(badge);
    } else {
      const label = document.createElement("label");
      label.className = "switch";
      const toggle = document.createElement("input");
      toggle.type = "checkbox";
      toggle.checked = Boolean(player.is_admin);
      toggle.setAttribute("aria-label", `Make ${player.name} an administrator`);
      toggle.addEventListener("change", async () => {
        toggle.disabled = true;
        try {
          await api(`/api/admin/players/${encodeURIComponent(player.id)}/admin`, {
            method: "POST",
            body: JSON.stringify({ enabled: toggle.checked }),
          });
          player.is_admin = toggle.checked;
          document.querySelector("#admin-count").textContent =
            String(allPlayers.filter((item) => item.is_admin || item.is_owner).length);
          setStatus(`${player.name} is ${toggle.checked ? "now an administrator" : "no longer an administrator"}.`);
        } catch (error) {
          toggle.checked = !toggle.checked;
          setStatus(error.message, true);
        } finally {
          toggle.disabled = false;
        }
      });
      const slider = document.createElement("span");
      slider.className = "slider";
      label.append(toggle, slider);
      roleCell.append(label);
    }
    row.append(name, id, score, firstSeen, lastSeen, roleCell);
    tbody.append(row);
  }
}
async function loadDashboard() {
  setStatus("Loading player records…");
  const result = await api("/api/admin/players");
  allPlayers = result.players || [];
  document.querySelector("#player-count").textContent = String(allPlayers.length);
  document.querySelector("#admin-count").textContent =
    String(allPlayers.filter((player) => player.is_admin || player.is_owner).length);
  document.querySelector("#current-player").textContent = currentPlayer?.name || "Verified account";
  document.querySelector("#directory-note").textContent =
    result.note + " High scores are shown only when a player appears in Start.ng's top-50 leaderboard.";
  renderPlayers();
  setStatus(`Loaded ${allPlayers.length} known players.`);
}
async function boot() {
  const session = captureSession();
  if (!session) {
    signedOut.hidden = false;
    dashboard.hidden = true;
    return;
  }
  signedOut.hidden = true;
  dashboard.hidden = false;
  try {
    const me = await api("/api/players/sync", { method: "POST" });
    currentPlayer = me.player;
    await loadDashboard();
  } catch (error) {
    setStatus(error.message, true);
    if (/session|sign in/i.test(error.message)) {
      sessionStorage.removeItem(GAME_SESSION_KEY);
      signedOut.hidden = false;
      dashboard.hidden = true;
    }
  }
}
document.querySelector("#sign-in").addEventListener("click", signIn);
document.querySelector("#refresh").addEventListener("click", () => loadDashboard().catch((error) => setStatus(error.message, true)));
search.addEventListener("input", renderPlayers);
boot();
