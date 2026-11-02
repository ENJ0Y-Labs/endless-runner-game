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

## Build and publish to Start.ng

Start.ng hosts the built static game. It does **not** run `npm install` or `npm run build` for this repository, so the generated `dist/` directory must be committed and pushed to GitHub.

### 1. Build and test the game

Install Node.js 20.19+ or 22.12+ and npm, then run from the repository root:

```bash
npm install
npm run build
npm run preview
```

Open the preview URL printed by Vite. Test gameplay, mobile controls, restart, and the browser console. Stop the preview server when finished. Confirm that `dist/index.html` and its assets exist.

### 2. Commit and push the production build

Make sure `dist/` is not ignored by Git. Then run:

```bash
git add README.md startng.json cover.png public/cover.png dist/
git commit -m "build: prepare game for Start.ng"
git push origin main
```

If you are working on another branch, push that branch instead and use its name in the API request below. Resolve any Git errors before continuing. The GitHub repository must be public for Start.ng to fetch it.

Keep `cover.png` at the repository root and `public/cover.png` in the source project. Vite copies `public/cover.png` to `dist/cover.png`, next to the built `index.html`. Use a 16:10 cover image, ideally at least 640 × 400 pixels. Keep `startng.json` at the repository root.

### 3. Check the repository with Start.ng

Send a POST request to the Start.ng check endpoint with your repository URL and game name. Replace the example values if needed.

**macOS, Linux, or Termux on Android (with curl):**

```bash
curl -X POST https://api.start.ng/games/check \
  -H "Content-Type: application/json" \
  -d '{"repo_url":"https://github.com/ENJ0Y-Labs/endless-runner-game","name":"Relic Rush 3D"}'
```

**Windows PowerShell:**

```powershell
$body = @{
  repo_url = "https://github.com/ENJ0Y-Labs/endless-runner-game"
  name = "Relic Rush 3D"
} | ConvertTo-Json

Invoke-RestMethod -Method Post -Uri "https://api.start.ng/games/check" -ContentType "application/json" -Body $body
```

Read the full response. Fix all reported errors and warnings, rebuild the game, commit and push the updated `dist/`, then run the check again. Do not publish until the check passes.

To publish a non-default branch, include its branch name in the JSON body, for example `"branch":"main"`. Use the same branch in both the check and publish requests.

### 4. Publish the game

After the check passes, send a POST request to `https://api.start.ng/games/publish` with the same repository details.

**curl (including Termux on Android):**

```bash
curl -X POST https://api.start.ng/games/publish \
  -H "Content-Type: application/json" \
  -d '{"repo_url":"https://github.com/ENJ0Y-Labs/endless-runner-game","name":"Relic Rush 3D"}'
```

**Windows PowerShell:**

```powershell
Invoke-RestMethod -Method Post -Uri "https://api.start.ng/games/publish" -ContentType "application/json" -Body $body
```

If the response contains an `approve_url`, open that URL in a browser while signed in to Start.ng and approve the game. The approval link is one-time and valid for 30 days. A first publication may wait for this approval; do not assume the game is live until the process completes.

### 5. Verify the live game

Open the published game URL and test it on desktop and mobile. Check that the game loads without missing assets, controls work, the Start.ng player/character integration behaves correctly, and scores and leaderboard data are saved as expected.

Once the game is approved, later pushes to the watched branch normally update it automatically within a few minutes. You still need to build and commit the updated `dist/` before pushing; Start.ng does not build the source for you.

### Can I publish from an Android phone?

Yes, provided you can build the project and push the generated files. One option is Termux with Git, Node.js, and npm installed; run the same build commands above, then use the curl requests to check and publish. You can also use a browser-based development environment that supports Node.js and Git. Simply editing files in the GitHub mobile website will not generate the required production build.

The expected repository layout includes:

```text
index.html
startng.json
cover.png
dist/
  cover.png
  index.html
  assets/
src/
public/
  cover.png
package.json
package-lock.json
README.md
```

Do not describe the build as verified until `npm run build` and the production preview have actually been tested. Local preview cannot confirm live Start.ng score saving or leaderboard behaviour.

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
