# Relic Rush 3D admin API

This is a separate Node.js service. Start.ng only hosts static game files, so this API must be deployed to a backend host and connected to a PostgreSQL database.

## Important identity limitation

Start.ng game sessions identify a player by Start.ng player ID and name. They do **not** expose the player's email. Therefore the owner is configured by the verified Start.ng player ID, not by putting an email address in browser code. Do not treat an email string sent by the browser as proof of identity.

To obtain the owner ID, sign in to the live game and inspect the authenticated response from `GET https://api.start.ng/games/relic-rush-3d/player` using the Start.ng game session. Set that numeric ID as `OWNER_PLAYER_ID` in the backend environment. Never commit the session token.

## Environment

- `DATABASE_URL`: PostgreSQL connection string.
- `OWNER_PLAYER_ID`: your numeric Start.ng player ID. This account is always Super Admin and cannot be demoted.
- `GAME_ORIGIN`: allowed browser origin(s), comma-separated, e.g. `https://relic-rush-3d.start.ng`.
- `STARTNG_GAME_SLUG`: optional; defaults to `relic-rush-3d`.
- `PORT`: optional; defaults to `3000`.
- `PGSSLMODE=disable`: only for a local database that does not use TLS.

Run `npm install`, apply `schema.sql` to PostgreSQL, then run `npm start`.

## API

All identity is verified server-to-server against Start.ng using the game session. Never accept a player ID or email supplied by the browser as authentication.

- `POST /api/players/sync`: bodyless; records the authenticated player.
- `GET /api/admin/players`: returns known players and best scores where present on Start.ng's public top-50 leaderboard.
- `POST /api/admin/players/:id/admin`: JSON `{ "enabled": true|false }`; only the owner or an existing admin may call it.

Send `Authorization: Bearer <start.ng game session>` with each request.

## Scope and limitations

The player directory is populated as players sign in and call the sync endpoint. It cannot enumerate all Start.ng accounts or retroactively discover every player. Start.ng's documented leaderboard endpoint returns at most 50 entries, so high scores are only available for players present in that board. The service never invents missing scores.

The API enforces role checks server-side. The browser must not decide who is an admin. An admin can promote or demote other known players; the configured owner remains Super Admin.
