# AGENT.md — Relic Rush 3D (endless-runner-game)

Instructions for AI coding agents working in this repository. Read this file and `PRD.md` before changing anything. `PRD.md` is the source of truth for product requirements; this file covers how to work in the codebase.

## 1. Project summary

- **Product:** Relic Rush 3D, a 3D browser endless runner (inspired by Crazy Roll 3D).
- **Platform target:** Start.ng. The game must be publishable there as a static site.
- **Gameplay:** The character runs forward automatically on a 3-lane track. The player switches lanes to dodge obstacles and collect relics. Hitting an obstacle ends the run. Score and relic count are shown, with a restart option.
- **Stack:** Three.js, vanilla JavaScript (ES modules), HTML, CSS, Vite. No framework.
- **License:** MIT.

## 2. Commands

Package manager is npm (`package-lock.json` is committed). Do not switch to yarn or pnpm.

```bash
npm install        # install dependencies
npm run dev        # Vite dev server
npm run build      # production build (output must run as a static site)
npm run preview    # serve the production build locally
```

There is currently **no test runner, linter, or formatter configured**. Do not claim tests pass. Verify changes by running `npm run build` and checking behaviour in `npm run dev` / `npm run preview`. If you add tooling (Vitest, ESLint, Prettier), say so explicitly and keep it minimal.

`package.json` has `"type": "module"`. Use ES module `import`/`export` only. No CommonJS.

## 3. Repository layout

Known top-level files: `index.html`, `package.json`, `package-lock.json`, `PRD.md`, `README.md`, `LICENSE`, `.gitignore`, `public/`, `src/`.

The contents of `src/` and `public/` were not available when this file was written. **Inspect them yourself before editing and update this section.** Target structure for new code, keeping gameplay separate from rendering and UI (a PRD requirement):

```
src/
  main.js            # entry point, wires modules together
  game/              # pure gameplay logic: state, scoring, difficulty, spawning, collision rules
  render/            # Three.js scene, camera, track, meshes, character model
  input/             # keyboard and touch (swipe) handling
  ui/                # HUD, start screen, game-over screen (HTML/CSS)
  platform/          # Start.ng integration: user, character style, score submission
public/              # static assets copied as-is
```

If the existing structure differs, follow the existing structure. Do not reorganise files unless asked.

## 4. Product rules the code must honour

From `PRD.md`:

- **Lanes:** exactly three (left, centre, right). Lane movement is clamped to those lanes.
- **Controls:** Desktop: Left/A and Right/D change lane; Space/Up jump only if jumping is implemented. Mobile: swipe left/right/up equivalents.
- **Scoring:** distance or survival time plus collected relics contribute. Never award points for uncollected relics.
- **Game over:** obstacle collision ends the run; show final score and relic count; provide a restart button.
- **Restart:** must fully reset score, relics, obstacles, speed, and difficulty. No stale state.
- **Difficulty:** increases gradually (speed, obstacle frequency).
- **UI:** start screen with Play, HUD (score, relics), game-over screen, control instructions. Must be readable on desktop and mobile.
- **Score data** must be structured so a Start.ng leaderboard can consume it later (for example `{ score, relics, distance, timestamp }`). A leaderboard itself is not required for the MVP.

Out of scope for the MVP (do not build unless asked): multiplayer, multiple levels, shops or skins, in-game purchases, complex physics, story mode, advanced animation, social sharing, power-ups, custom authentication.

## 5. Start.ng integration (read carefully)

- Use Start.ng's **documented** mechanism to identify the logged-in user and fetch character style data. **Never build a separate auth system.**
- **Do not invent the Start.ng API.** The integration docs are not in this repo. If you do not have the real documentation, stop and ask the maintainer. Put placeholder code behind a clearly named adapter in `src/platform/` and mark it `TODO`.
- Map character style properties to the 3D model where provided: body type, shirt/primary colour, trousers/skirt colour, skin colour, hair style and colour, hat, accessories.
- Appearance must come from Start.ng's shared style data. Do **not** hardcode appearance that overrides it. Hardcoded values are allowed only as fallback defaults.
- Handle missing or unsupported properties with sensible defaults. Missing data must never crash the game.
- Support **guest play** when no authenticated user exists, and never present a guest as an authenticated user.
- Platform or network failures must be caught and must not cause unhandled errors.
- Appearance changes should show up when character data is refreshed or updated.
- Never commit credentials, tokens, or private auth data.

## 6. Engineering conventions

- Vanilla JS with ES modules. Prefer small, single-purpose modules and named exports.
- Keep gameplay logic free of Three.js and DOM dependencies where practical, so it can be reasoned about and tested separately.
- **Performance matters** (mobile is a target):
  - Reuse objects (object pooling) for obstacles, relics, and track segments. Remove or recycle anything that has passed the player.
  - Do not allocate geometries, materials, or vectors inside the per-frame loop. Create them once and reuse them.
  - Dispose of geometries, materials, and textures you no longer need.
  - Drive movement from a delta-time clock, not frame count, so speed is consistent across devices.
  - Cap device pixel ratio when sizing the renderer.
- Handle window resize and orientation change (camera aspect, renderer size, UI layout).
- Use `const`/`let`, never `var`. Name constants (lane width, base speed, spawn interval) in one config module instead of scattering magic numbers.
- Comments should explain why, not what.

## 7. Build and deployment constraints

- The production build must run as a **static website** with valid asset paths. Check the Vite `base` setting if Start.ng serves the game from a sub-path.
- The game must not depend on the dev server after deployment.
- Include whatever built files Start.ng's publishing process requires. Confirm the requirement with the maintainer rather than guessing.
- Do not commit `node_modules`. Follow `.gitignore`. Decide deliberately whether `dist/` is committed, as it may be needed for Start.ng validation. Ask if unsure.

## 8. Workflow for agents

1. Read `PRD.md` and the files you will touch. Inspect `src/` first.
2. Work in the PRD's development phase order (setup, scene and track, controls, obstacles/relics/collision/difficulty, score/game-over/restart, Start.ng integration, leaderboard hooks, UI polish, testing and build, publishing). **Test each phase before starting the next.**
3. Make focused, minimal changes. Do not refactor or add dependencies unrelated to the task.
4. Before adding any dependency, explain why. Prefer what is already installed (`vite`, `three`).
5. Run `npm run build` after changes and fix any errors or warnings you introduced.
6. Use small, descriptive commits (for example `feat: add lane switching`, `fix: reset obstacles on restart`).
7. In your final summary, state what you changed, what you verified, and what you could not verify.

## 9. Do not

- Do not invent Start.ng endpoints, SDK calls, or data fields.
- Do not add features listed as out of scope.
- Do not hardcode secrets or user data.
- Do not leave the game in a state where restart does not fully reset.
- Do not claim code was tested if you only built it.
- Do not edit `package-lock.json` by hand.

## 10. Definition of done

A change is done when it builds cleanly, behaves correctly in dev and preview, matches the relevant `PRD.md` acceptance criteria, handles guest and missing-data cases, and does not regress performance on mobile-class devices.

## 11. Open items for the maintainer

- Share the Start.ng integration documentation (user identification, character style schema, publishing checklist, leaderboard).
- Confirm whether jumping is in the MVP.
- Confirm whether `dist/` must be committed for Start.ng validation.
- Add a test runner and linter if desired.
