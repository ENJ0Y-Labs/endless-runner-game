CREATE TABLE IF NOT EXISTS players (
  startng_player_id BIGINT PRIMARY KEY,
  display_name TEXT NOT NULL,
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  best_score BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS player_roles (
  startng_player_id BIGINT PRIMARY KEY REFERENCES players(startng_player_id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin')),
  granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  granted_by BIGINT NOT NULL
);

CREATE INDEX IF NOT EXISTS players_last_seen_idx ON players(last_seen_at DESC);
