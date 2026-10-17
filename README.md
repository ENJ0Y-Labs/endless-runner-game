# Relic Rush 3D

Relic Rush 3D is a Three.js endless runner built for Start.ng. The runner moves automatically along a three-lane track. Switch lanes to avoid obstacles, collect relics, increase your score, and compete on the Start.ng leaderboard.

## Features

- Three-dimensional track, third-person camera, and low-poly player character.
- Automatic forward movement with gradually increasing difficulty.
- Three lanes with keyboard, swipe, and on-screen touch controls.
- Obstacles, relic collection, collision-based game over, and restart.
- Score, distance, relic count, and best run display.
- Start.ng identity and shared character-style integration, with guest play and safe fallback behaviour.
- Start.ng score submission and top-10 leaderboard using the documented platform message protocol.
- Responsive interface for desktop and mobile.
- Custom leaderboard stat configuration in `startng.json`.

## Controls

| Action | Desktop | Mobile |
| --- | --- | --- |
| Move left | Left Arrow or A | Swipe left or tap the left control |
| Move right | Right Arrow or D | Swipe right or tap the right control |
| Pause / resume | Use the on-screen Pause/Resume button | Use the on-screen Pause/Resume button |
| Start / restart | Use the on-screen button | Use the on-screen button |

The character runs automatically. The aim is to avoid obstacles and collect relics. Each relic adds 100 points; distance also contributes to the score. A collision ends the current run.

## Requirements

- Node.js 20.19+ or 22.12+
- npm

## Run locally

```powershell
npm install
npm run dev
```

Open the local URL printed by Vite.

## Build and preview the production site

```powershell
npm run build
npm run preview
```

Vite writes the production site to `dist/`. Open the preview URL printed by Vite and check the browser console and Network panel for errors or missing assets.

## Start.ng submission

Start.ng hosts a static site and does not install npm dependencies or build the source. Before submitting:

1. Run `npm install` and `npm run build`.
2. Verify the production build with `npm run preview`.
3. Commit the generated `dist/` directory so the ready-built `dist/index.html` and its assets are present in the repository. The repository's `.gitignore` is configured to allow `dist/` to be committed.
4. Keep the source `cover.png` at the repository root and a 16:10 `public/cover.png`; Vite copies the latter beside `dist/index.html` for the game listing.
5. Keep `startng.json` at the repository root. Its configured leaderboard stats are `score`, `distance`, and `relics`.
6. Test identity, character styling, score saving, and leaderboard behaviour on the published `*.start.ng` game. Local preview cannot confirm live platform data or score saving.

The expected submission layout includes:

```text
index.html
startng.json
cover.png
dist/
  cover.png
  index.html
  assets/
src/
package.json
package-lock.json
README.md
```

Do not submit a build as verified until `npm run build` and the production preview have actually been tested. Live Start.ng score and leaderboard checks must be done on the published game.

## Project structure

- `src/main.js`: application entry point, gameplay loop, UI wiring, and platform event handling.
- `src/style.css`: responsive interface styling.
- `src/platform/`: Start.ng integration adapters.
- `src/game/`: gameplay configuration and systems.
- `public/`: static assets copied into the build.
- `startng.json`: leaderboard stat configuration.
- `PRD.md`: product requirements and acceptance criteria.
- `AGENT.md`: contributor instructions.

## Development commands

- `npm run dev`: start the local development server.
- `npm run build`: create the static production build.
- `npm run preview`: serve the production build locally.

There is currently no configured automated test runner. Manually test keyboard and touch controls, collision and relic collection, repeated restarts, mobile layouts, console/network errors, and Start.ng integration before release.

## License

MIT. See [LICENSE](./LICENSE).
