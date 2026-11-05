import express from "express";
import helmet from "helmet";
import cors from "cors";
import pg from "pg";

const { Pool } = pg;
const required = ["DATABASE_URL", "OWNER_PLAYER_ID", "GAME_ORIGIN"];
for (const key of required) {
  if (!process.env[key]) throw new Error(`Missing required environment variable: ${key}`);
}

const OWNER_PLAYER_ID = Number(process.env.OWNER_PLAYER_ID);
if (!Number.isSafeInteger(OWNER_PLAYER_ID) || OWNER_PLAYER_ID <= 0) {
  throw new Error("OWNER_PLAYER_ID must be a positive Start.ng player ID.");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.PGSSLMODE === "disable" ? false : { rejectUnauthorized: false },
});
const app = express();
app.disable("x-powered-by");
app.use(helmet());
app.use(cors({
  origin: process.env.GAME_ORIGIN.split(",").map((value) => value.trim()),
  methods: ["GET", "POST", "DELETE", "OPTIONS"],
  allowedHeaders: ["Authorization", "Content-Type"],
}));
app.use(express.json({ limit: "16kb" }));

const API = "https://api.start.ng";
const GAME = process.env.STARTNG_GAME_SLUG || "relic-rush-3d";

async function identifySession(req, res, next) {
  const authorization = req.get("authorization") || "";
  const session = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!session || session.length > 4096) {
    return res.status(401).json({ error: "Sign in with Start.ng to continue." });
  }

  try {
    const response = await fetch(`${API}/games/${GAME}/player`, {
      headers: { Authorization: `Bearer ${session}` },
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) {
      return res.status(response.status === 401 ? 401 : 502).json({
        error: response.status === 401 ? "Your Start.ng session expired. Sign in again." : "Could not verify your Start.ng session.",
      });
    }
    const player = await response.json();
    if (!Number.isSafeInteger(Number(player.id)) || !player.name) {
      return res.status(502).json({ error: "Start.ng returned an invalid player profile." });
    }
    req.player = { id: Number(player.id), name: String(player.name).slice(0, 80) };
    req.startngSession = session;
    next();
  } catch {
    return res.status(502).json({ error: "Start.ng identity verification is temporarily unavailable." });
  }
}

async function recordPlayer(player) {
  await pool.query(
    `INSERT INTO players (startng_player_id, display_name)
     VALUES ($1, $2)
     ON CONFLICT (startng_player_id)
     DO UPDATE SET display_name = EXCLUDED.display_name, last_seen_at = NOW()`,
    [player.id, player.name],
  );
}

async function requireAdmin(req, res, next) {
  try {
    await recordPlayer(req.player);
    if (req.player.id === OWNER_PLAYER_ID) return next();
    const result = await pool.query(
      "SELECT 1 FROM player_roles WHERE startng_player_id = $1 AND role = 'admin'",
      [req.player.id],
    );
    if (!result.rowCount) return res.status(403).json({ error: "Administrator access required." });
    next();
  } catch (error) {
    next(error);
  }
}

app.get("/health", (_req, res) => res.json({ ok: true }));
app.post("/api/players/sync", identifySession, async (req, res, next) => {
  try {
    await recordPlayer(req.player);
    res.json({ player: req.player, isOwner: req.player.id === OWNER_PLAYER_ID });
  } catch (error) { next(error); }
});

app.get("/api/admin/players", identifySession, requireAdmin, async (_req, res, next) => {
  try {
    const [players, leaderboardResponse] = await Promise.all([
      pool.query(`
        SELECT p.startng_player_id AS id, p.display_name AS name,
               p.first_seen_at, p.last_seen_at,
               (r.role = 'admin') AS is_admin
        FROM players p
        LEFT JOIN player_roles r ON r.startng_player_id = p.startng_player_id
        ORDER BY p.last_seen_at DESC
      `),
      fetch(`${API}/games/${GAME}/leaderboard?limit=50`, { signal: AbortSignal.timeout(8000) }),
    ]);
    let scores = [];
    if (leaderboardResponse.ok) {
      const board = await leaderboardResponse.json();
      scores = Array.isArray(board) ? board : [];
    }
    const scoreById = new Map(scores.map((entry) => [Number(entry.player_id), Number(entry.score || entry.stats?.score || 0)]));
    const rows = players.rows.map((player) => ({
      ...player,
      high_score: scoreById.get(Number(player.id)) ?? null,
      is_owner: Number(player.id) === OWNER_PLAYER_ID,
    }));
    res.json({ players: rows, leaderboard_limit: 50, note: "Directory contains players recorded by this game since admin tracking was enabled. Start.ng does not expose a complete account directory." });
  } catch (error) { next(error); }
});

app.post("/api/admin/players/:id/admin", identifySession, requireAdmin, async (req, res, next) => {
  const targetId = Number(req.params.id);
  const enabled = req.body?.enabled;
  if (!Number.isSafeInteger(targetId) || targetId <= 0 || typeof enabled !== "boolean") {
    return res.status(400).json({ error: "A valid player ID and boolean enabled value are required." });
  }
  if (targetId === OWNER_PLAYER_ID) {
    return res.status(400).json({ error: "The owner account cannot be demoted." });
  }
  try {
    const exists = await pool.query("SELECT 1 FROM players WHERE startng_player_id = $1", [targetId]);
    if (!exists.rowCount) return res.status(404).json({ error: "Player not found. They must first sign in to this game." });
    if (enabled) {
      await pool.query(
        `INSERT INTO player_roles (startng_player_id, role, granted_by)
         VALUES ($1, 'admin', $2)
         ON CONFLICT (startng_player_id)
         DO UPDATE SET role = 'admin', granted_at = NOW(), granted_by = EXCLUDED.granted_by`,
        [targetId, req.player.id],
      );
    } else {
      await pool.query("DELETE FROM player_roles WHERE startng_player_id = $1", [targetId]);
    }
    res.json({ id: targetId, is_admin: enabled });
  } catch (error) { next(error); }
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: "The admin service encountered an unexpected error." });
});

const port = Number(process.env.PORT || 3000);
app.listen(port, () => console.log(`Relic Rush admin API listening on ${port}`));
