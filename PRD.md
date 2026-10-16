# PRD: Start.ng 3D Endless Runner

## 1. Product Overview

**Product Name:** Relic Rush 3D  
**Product Type:** 3D browser game  
**Platform:** Start.ng  
**Technology:** Three.js, JavaScript, HTML, CSS, and Vite

Relic Rush 3D is a simple 3D endless-running game in which players automatically run along a three-lane track, avoid obstacles, and collect relics to increase their scores.

The game integrates with Start.ng's existing user system and displays each logged-in user's character using their shared Start.ng appearance settings.

The goal of the MVP is to deliver a playable, visually appealing, and functional game that satisfies Start.ng's character integration and publishing requirements.

## 2. Objectives

- Build a functional 3D endless runner using Three.js.
- Provide responsive and intuitive player controls.
- Integrate the logged-in Start.ng user's character and appearance.
- Implement collectible relics, obstacles, scoring, and restarting.
- Prepare the game for future leaderboard integration.
- Publish the completed game on Start.ng.

## 3. Target Users

- Start.ng users who want a quick, accessible browser game.
- Desktop and mobile players.
- Players who want to use their existing Start.ng character in a game.

## 4. MVP Features

### 4.1. 3D Running Track

The game must provide a 3D environment with a track divided into three lanes.

Requirements:

- The character runs forward automatically.
- Players can move between the left, centre, and right lanes.
- The track appears to move continuously as the character progresses.
- The difficulty increases gradually as the run continues.
- The camera follows the character from a third-person perspective.
- The game maintains smooth gameplay on supported desktop and mobile browsers.

### 4.2. Start.ng Character Integration

The game must use Start.ng's existing user and character system rather than implementing a separate authentication system.

Requirements:

- Identify the current logged-in user through Start.ng's documented integration mechanism.
- Retrieve the user's character style data.
- Represent the character in 3D using the available style properties.
- Support the following appearance properties where provided:
  - Body type.
  - Shirt or primary clothing colour.
  - Trousers or skirt colour.
  - Skin colour.
  - Hair style and colour.
  - Hat.
  - Accessories.
- Reflect changes made to the user's appearance on Start.ng when the character data is refreshed or updated.
- Handle missing or unsupported style properties using sensible defaults.
- Provide a suitable guest experience when no authenticated user is available.
- Allow guests to play without falsely presenting them as authenticated users.

The character's appearance must be derived from Start.ng's shared style data. Independent hardcoded appearance settings must not override the platform's settings.

### 4.3. Collectibles and Obstacles

The game must include relics that players can collect and obstacles that players must avoid.

Requirements:

- Spawn relics along the track.
- Increase the player's relic count when a relic is collected.
- Spawn obstacles across the three lanes.
- Detect collisions between the character and obstacles.
- End the current run when the character hits an obstacle.
- Gradually increase difficulty by adjusting appropriate gameplay parameters, such as movement speed or obstacle frequency.
- Remove or recycle objects that are no longer needed to maintain performance.

### 4.4. Score and Restart

The game must track and display the player's performance.

Requirements:

- Display the current score during gameplay.
- Display the number of relics collected.
- Track the distance travelled or survival time.
- Show a game-over screen when the run ends.
- Display the final score and relic count.
- Provide a restart button.
- Reset the current run's score, relic count, obstacles, and difficulty when restarting.
- Keep score data structured so it can be integrated with a Start.ng leaderboard.

### 4.5. Basic User Interface

The interface must include:

- A start screen with a Play button.
- A gameplay HUD displaying score and relic count.
- A game-over screen with the final results.
- A restart button.
- Basic control instructions.
- Keyboard controls for desktop.
- Touch controls suitable for mobile devices.

The interface must remain readable and usable across supported screen sizes.

## 5. Controls

### Desktop

- Left Arrow or A: Move one lane left.
- Right Arrow or D: Move one lane right.
- Space or Up Arrow: Jump, if jumping is implemented in the MVP.

### Mobile

- Swipe left: Move one lane left.
- Swipe right: Move one lane right.
- Swipe up: Jump, if jumping is implemented in the MVP.

Lane movement must remain within the three available lanes.

## 6. Gameplay Rules

1. The player starts a run from the start screen.
2. The character runs forward automatically.
3. The player changes lanes to avoid obstacles and collect relics.
4. Each collected relic increases the relic count and contributes to the score.
5. Distance travelled or survival time contributes to the score.
6. Hitting an obstacle ends the run.
7. The game displays the final results.
8. The player can restart and attempt another run.

The game must not award relics or points for collectibles that have not been collected.

## 7. Technical Requirements

- Use Three.js for 3D rendering and scene management.
- Use JavaScript for gameplay logic.
- Use Vite as the development server and production build tool.
- Use HTML and CSS for the interface and HUD.
- Integrate with Start.ng using its documented authentication, character, and communication mechanisms.
- Keep gameplay logic separate from rendering and interface code where practical.
- Handle unavailable platform connections gracefully.
- Avoid exposing credentials, secrets, or private authentication data.
- Ensure the production build uses valid asset paths and can run as a static website.
- Include the built files required by Start.ng's publishing process.

## 8. Non-Functional Requirements

### Performance

- Maintain responsive controls and smooth rendering on supported devices.
- Reuse or remove objects to prevent unnecessary memory growth.
- Avoid creating excessive objects during gameplay.

### Usability

- Keep controls simple and discoverable.
- Make scores and game states easy to understand.
- Provide clear feedback when a run ends.

### Reliability

- Restarting must reset all relevant gameplay state.
- Missing character style properties must not crash the game.
- Platform connection failures must not cause unhandled errors.
- Gameplay must not depend on a development server after deployment.

### Compatibility

- Support modern desktop browsers.
- Support mobile browsers with touch input.
- Adapt the interface to different screen sizes.

## 9. Out of Scope for the MVP

The following features are excluded from the initial release:

- Multiplayer gameplay.
- Multiple levels or worlds.
- Character shops and unlockable skins.
- In-game purchases.
- Complex physics simulations.
- Story mode or missions.
- Advanced character animation systems.
- Social sharing features.
- Power-ups and special abilities.
- A custom authentication system.

A persistent leaderboard is not required for the core gameplay loop, but the score data must be structured to support Start.ng leaderboard integration.

## 10. Acceptance Criteria

The MVP is considered complete when:

1. The game renders and runs as a playable Three.js browser game.
2. The track contains three lanes.
3. The character runs automatically and responds to player controls.
4. Relics can be collected and counted.
5. Obstacles trigger collisions and end the run.
6. The score and relic count update correctly.
7. The game-over screen displays the final results.
8. Restarting creates a fresh run with reset gameplay state.
9. The game identifies authenticated Start.ng users through the documented integration.
10. The character reflects the logged-in user's available Start.ng appearance properties.
11. Changes to the user's shared appearance are reflected when the character data is refreshed or updated.
12. Missing style data and guest sessions are handled gracefully.
13. The production build runs without relying on the local development server.
14. The repository contains the files required for Start.ng validation and publishing.
15. The game passes Start.ng's required checks and is successfully published.
16. The published game is tested using the live Start.ng URL.

## 11. Development Phases

1. Project setup and repository configuration.
2. Three.js scene and running track.
3. Automatic running and player controls.
4. Obstacles, relics, collision detection, and difficulty progression.
5. Score, game-over, and restart flow.
6. Start.ng user and character integration.
7. Score and optional leaderboard integration.
8. Interface polish and responsive design.
9. Testing, bug fixing, and production build.
10. GitHub preparation, Start.ng validation, publishing, and final verification.

Each phase must be tested before proceeding to the next.

## 12. Definition of Done

The MVP is done when all required acceptance criteria pass, the game is available on Start.ng, and the live version has been tested for gameplay, character styling, and production reliability.

The project must remain focused on delivering a complete and functional core experience before introducing additional features.
