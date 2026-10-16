# Relic Rush 3D

A 3D endless runner for Start.ng, built with JavaScript, Three.js, and Vite.

Players run automatically along a three-lane track, dodge obstacles, collect relics, and try to beat their previous score. The game is designed to use the player's existing Start.ng identity and character appearance instead of creating a separate account system.

## Project status

**Current stage:** Initial project structure.

The project is being built in small, testable phases. The starter interface is scaffolding, not finished gameplay.

## Technology

- **JavaScript** for game logic
- **Three.js** for 3D rendering
- **Vite** for local development and production builds
- **HTML and CSS** for the interface
- **Start.ng integration** for user identity and character appearance

## Getting started

### Requirements

- Node.js 20.19+ or 22.12+
- npm
- Git

### Install dependencies

```bash
npm install
npm install three
```

### Run locally

```bash
npm run dev
```

Open the local URL printed by Vite in your browser.

### Create a production build

```bash
npm run build
```

Vite writes the production site to `dist/`.

### Preview the production build

```bash
npm run preview
```

## Initial project structure

```text
endless-runner-game/
├── index.html
├── package.json
├── package-lock.json
├── PRD.md
├── README.md
├── public/
└── src/
    ├── main.js
    ├── style.css
    ├── game/
    │   └── config.js
    ├── platform/
    │   └── startng.js
    └── ui/
        └── renderStartScreen.js
```

- `src/main.js`: application entry point.
- `src/game/`: gameplay configuration and systems.
- `src/platform/`: Start.ng integration code.
- `src/ui/`: menus, HUD, and game-over interface.
- `public/`: static files copied to the production build.
- `PRD.md`: MVP scope and acceptance criteria.

## Planned MVP

1. Create the Three.js scene, camera, lighting, and three-lane track.
2. Add automatic running and lane controls.
3. Add relics, obstacles, collision detection, and increasing difficulty.
4. Add score, game-over, and restart flow.
5. Connect Start.ng identity and character appearance.
6. Polish controls and responsive UI, then test the production build.
7. Validate and publish the game on Start.ng.

Multiplayer, a skin shop, purchases, multiple worlds, and complex physics are outside the MVP.

## Testing checklist

- [ ] `npm install` completes successfully.
- [ ] `npm run dev` starts the development server.
- [ ] The app loads without browser-console errors.
- [ ] `npm run build` completes and creates `dist/`.
- [ ] The production preview works independently of the development server.

## Project requirements

See [PRD.md](./PRD.md) for the full product requirements and definition of done.
