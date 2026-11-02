# Story Mode Expansion Plan

> **Document status:** Proposed product and implementation plan  
> **Product:** Relic Rush 3D  
> **Planned mode:** Story Mode: Japa Rush  
> **Scope:** Post-MVP expansion. This document does not authorize changes to the existing Classic Mode implementation by itself.  
> **Last reviewed:** 2 November 2026

## 1. Purpose of this document

This document defines the proposed Story Mode expansion for Relic Rush 3D. It is intended to give product, design, and engineering contributors one shared reference before implementation begins.

It covers:

- The product direction and relationship between Classic Mode and Story Mode.
- The story premise, chapter structure, objectives, hazards, collectibles, and completion rules.
- Menu, HUD, pause, failure, chapter-completion, and progression experiences.
- Gameplay-state boundaries and the proposed technical approach.
- Persistence, Start.ng integration boundaries, performance, accessibility, and content guidelines.
- Implementation phases, acceptance criteria, manual test cases, risks, and decisions that still need validation.

This is a planning specification, not a description of features that already exist. Unless a requirement is explicitly marked as current behaviour, it must not be treated as implemented.

## 2. Relationship to the existing product requirements

The repository's top-level `PRD.md` defines the current MVP as a three-lane endless runner. It explicitly excludes story mode and multiple levels from that MVP. The current MVP remains the baseline and must continue to work independently.

This document defines Story Mode as a **separate post-MVP expansion**. It does not replace the product name, remove Classic Mode, or silently change the acceptance criteria for the existing MVP.

### 2.1 Product identity

- **Product name:** Relic Rush 3D
- **Existing experience:** Classic Mode
- **New experience:** Story Mode
- **Story title:** Japa Rush

The game should continue to be presented as **Relic Rush 3D**. Japa Rush is the name of the new story experience inside the game, not a replacement brand.

### 2.2 Core product principle

Classic Mode and Story Mode must feel like two experiences inside one game:

| Area | Classic Mode | Story Mode: Japa Rush |
|---|---|---|
| Main purpose | Endless survival and high scores | Complete a sequence of story chapters |
| Session structure | Continues until the player fails | Has a defined beginning and chapter exit |
| World | Existing Relic Rush 3D environments | Nigerian city, road, administrative, and airport-inspired environments |
| Main collectibles | Existing relics | Story items and optional Naira-note collectibles |
| Progression | Best run and existing leaderboard flow | Chapter unlocks, completion records, and replay |
| Failure | End the current run | Fail the current chapter and allow a retry |
| Completion | No final level | Complete the final chapter |
| Score destination | Existing Classic Mode score/leaderboard integration | Separate story records initially; no automatic Classic leaderboard submission |

**Non-negotiable:** adding Story Mode must not rename, remove, or damage Classic Mode.

## 3. Product vision

Story Mode is a short, chapter-based, satirical adventure built with the familiar three-lane runner controls.

The player follows an ordinary fictional Nigerian trying to make it from the daily chaos of the city to an international departure gate. The journey is made difficult by traffic, unpredictable roads, paperwork, queues, barriers, and a fictional powerful antagonist known as **The Big Man**.

The humour should come from exaggerated situations, familiar everyday frustrations, visual gags, and short character lines. It should not depend on naming or depicting a real politician, political party, ethnic group, religion, or identifiable private individual.

The experience should be understandable without reading a long story. Players should be able to start a chapter, understand its objective, run, collect the required story item, reach the exit, and receive clear feedback.

### 3.1 Design pillars

1. **Keep the runner familiar.** Reuse the current left/right lane movement, jump, collision, pause, and restart behaviour where it makes sense.
2. **Give every chapter a purpose.** A story chapter must have a clear objective and a clear end, not merely a different background.
3. **Make the Nigerian setting recognisable without relying on stereotypes.** Use considered environmental details, signage, traffic, architecture, sound, and dialogue.
4. **Keep the satire fictional.** The Big Man is an original fictional character, not a likeness or coded reference to a real person.
5. **Protect Classic Mode.** Story-specific objectives, collectibles, scoring, and progress must not leak into the existing endless-run system.
6. **Keep it playable on phones.** Do not design a chapter around controls or precision that the current touch interface cannot support.

## 4. Goals and non-goals

### 4.1 Goals

- Add a mode-selection screen beneath the Relic Rush 3D identity.
- Preserve the existing Classic Mode entry point and complete gameplay loop.
- Add a separate Story Mode chapter-selection experience.
- Deliver four connected story chapters as the planned initial story arc.
- Give each chapter its own environment theme, primary objective, hazards, story collectibles, and completion trigger.
- Reuse the runner's three-lane movement and existing input methods where practical.
- Save chapter unlocks and completion progress locally.
- Allow completed chapters to be replayed.
- Support both signed-in Start.ng users and guests without inventing a new authentication flow.
- Keep the production output deployable as a static site.

### 4.2 Non-goals for the first Story Mode release

The following are not part of this expansion's first release unless separately approved:

- Multiplayer or cooperative play.
- Open-world movement or free exploration.
- A branching narrative with many endings.
- Dialogue choices that change the story.
- New movement systems such as sliding, rolling, crawling, or driving.
- A custom backend, account system, or authentication provider.
- Cross-device cloud synchronisation of story progress.
- Purchasable items, real-money transactions, or redeemable currency.
- A shop, character marketplace, or paid cosmetics.
- A separate Story Mode leaderboard.
- Complex vehicle simulation or realistic crash physics.
- Voice acting or long cinematic sequences.
- A fifth chapter or an endless post-story mode.

These may be considered after the four-chapter experience is playable and tested.

## 5. Story overview

### 5.1 Working premise

The player is an ordinary person with one bag, a travel plan, and a difficult journey ahead. The route begins in a busy Nigerian city and ends at an airport departure gate.

The Big Man is a fictional source of comic pressure whose influence appears through exaggerated announcements, posters, confusing procedures, and obstacles. The character should be used sparingly. The runner should remain the focus.

### 5.2 Narrative structure

The story follows one linear journey:

1. Leave the city hustle and reach the expressway.
2. Survive the expressway and secure the travel documents.
3. Navigate a fictional administrative district and obtain the required clearance.
4. Reach the airport departure gate and complete the journey.

The ending should provide a satisfying final chapter-completion moment. It may also include a short humorous postscript, but it must not require a sequel or additional chapter to make the first story feel complete.

### 5.3 Tone and writing

- Use short, readable lines that can be understood while playing.
- Use Nigerian English expressions only where they sound natural and are clear from context.
- Avoid turning every obstacle into a joke. Give the player enough quiet space to understand the objective.
- Avoid real political names, party symbols, real official insignia, and recognisable likenesses.
- Do not use ethnicity, religion, disability, poverty, or nationality as the punchline.
- Keep important instructions literal. A joke must never obscure which direction to move or what item to collect.

## 6. Chapter design

The first planned story arc contains four chapters. The names and descriptions below are working content names and can be adjusted during art and playtesting, but the journey order should remain coherent.

### Chapter 1: Lagos Hustle

**Purpose:** Introduce the story, establish the player's destination, and teach the Story Mode objective loop.

**Environment direction:**

- A busy city street and bus-stop atmosphere.
- Roadside shops, signs, streetlights, parked vehicles, and market details.
- A road route that visually leads toward the expressway.
- A warm, lively palette that is clearly distinct from the Classic Mode temple environment.

**Candidate hazards:**

- Danfo-style minibuses or other fictional public transport vehicles.
- Okada-style motorcycles.
- Potholes or damaged sections of road.
- Roadside crates, barricades, or temporary obstructions.

**Candidate collectibles:**

- Naira-note tokens used only as fictional in-game collectibles.
- A route slip, ticket, or other small story item that introduces the journey.

**Primary objective:** Reach the expressway exit.

**Optional objective:** Collect a target number of Naira-note tokens during the run. The target and reward should be tuned through playtesting.

**Chapter completion:** The player reaches the marked expressway exit while still alive. Optional collectibles should improve the chapter result but should not unexpectedly block story progression.

**Teaching focus:** Lane switching, jumping over a clearly communicated low obstacle, collecting an item, and recognising the chapter exit.

### Chapter 2: The Expressway

**Purpose:** Increase the challenge and make the player retrieve an essential travel item.

**Environment direction:**

- A long Nigerian expressway with road shoulders, barriers, road signs, and distant roadside scenery.
- A visible sense of forward travel without requiring a large open world.
- A different palette, lighting setup, and landmark silhouette from Chapter 1.

**Candidate hazards:**

- Trucks and tankers.
- Broken-down vehicles.
- Road barriers and temporary lane closures.
- Potholes or damaged road sections.

**Candidate collectibles:**

- A travel folder or document envelope as the required story item.
- Optional route tokens or Naira-note tokens.

**Primary objective:** Collect the travel folder and reach the next checkpoint.

**Chapter completion:** The player has collected the required folder and reaches the checkpoint. If the folder is missed, the game must explain what is missing and provide a fair retry path. It must not silently complete the chapter without the required item.

**Teaching focus:** Reading obstacle patterns, planning lane changes early, and recognising a required story collectible.

### Chapter 3: The System

**Purpose:** Deliver the strongest satirical chapter while keeping gameplay readable and fair.

**Environment direction:**

- A fictional administrative or government-district setting.
- Office buildings, queue rails, notice boards, numbered windows, security barriers, and exaggerated paperwork details.
- Fictional signs and institutions. Do not reproduce real agency logos or official documents.

**Candidate hazards:**

- Queue barriers and bollards.
- Rolling document carts.
- Temporary security barriers.
- Moving obstacles that have a clearly readable movement pattern.

**Candidate collectibles:**

- Three fictional clearance stamps or approval tokens.
- Optional Naira-note tokens.

**Primary objective:** Collect the required clearance stamps and reach the district exit.

**Chapter completion:** The required stamps have been collected and the player reaches the exit marker.

**Teaching focus:** Combine lane changes and jumps with an objective that requires attention to both hazards and collectibles.

**Fairness requirement:** Do not place a mandatory collectible behind an unavoidable obstacle, outside the reachable lanes, or in a position that requires a control the game does not support.

### Chapter 4: The Japa Terminal

**Purpose:** Resolve the story and provide a clear final challenge.

**Environment direction:**

- An airport approach and terminal-inspired environment.
- Departure signs, terminal windows, queue ropes, luggage, seating, and a visible gate destination.
- A calmer visual transition near the end so the final objective is easy to identify.

**Candidate hazards:**

- Luggage trolleys.
- Queue barriers.
- Suitcases or terminal equipment in the running path.
- Clearly marked security-lane obstructions.

**Candidate collectibles:**

- A boarding pass as the required story item.
- Optional travel tokens.

**Primary objective:** Obtain the boarding pass and reach the designated departure gate.

**Chapter completion:** The player reaches the gate with the required boarding pass. The game displays the story-complete screen and recognises all four chapters as completed.

**Ending:** Show a short celebratory scene or transition and a final story summary. Do not imply that the player can bypass real airport security or immigration processes. The experience is a fictional arcade story, not a simulation of real travel procedures.

## 7. Chapter gameplay rules

### 7.1 Shared movement

Story Mode should initially use the existing controls:

| Action | Desktop | Mobile |
|---|---|---|
| Move left | Left Arrow or A | Swipe left or left on-screen control |
| Move right | Right Arrow or D | Swipe right or right on-screen control |
| Jump | Space or Up Arrow | Swipe up or jump on-screen control |
| Pause or resume | On-screen control; existing keyboard shortcut where supported | On-screen control |

Do not add a new movement action merely to make a chapter feel different. A new action would require a separate interaction design, tutorial, collision rules, accessibility review, and mobile test plan.

### 7.2 Chapter run structure

Each chapter should follow this loop:

1. Show the chapter title and one-sentence story setup.
2. Explain the primary objective before the player starts.
3. Initialise a fresh chapter run.
4. Run the player through a finite environment segment.
5. Track hazards, required story items, optional collectibles, and progress toward the exit.
6. Trigger chapter completion only when the chapter's required conditions are satisfied.
7. Show the chapter result and the next available action.

A chapter is not an endless run with a different background. It must have a defined finish condition.

### 7.3 Objective types

The first release should use only a small set of objective types:

- **Reach exit:** The player reaches a defined end marker.
- **Collect required item:** The player collects one or more specified story items.
- **Collect optional items:** The player can improve a result without being blocked from completing the chapter.

Do not introduce timed missions, escort missions, branching routes, or complex multi-stage objectives in the first release.

### 7.4 Collectible categories

| Category | Purpose | Required for progression? | Monetary value |
|---|---|---:|---|
| Story item | Advances the chapter objective | Yes, where specified | None |
| Naira-note token | Optional chapter collectible and score input | No, unless explicitly designed for a future chapter | None |
| Classic relic | Existing Classic Mode collectible | No role in Story Mode unless a later design explicitly reuses it | None |

Naira-note tokens are fictional game objects only. They have no cash value, cannot be purchased, transferred, redeemed, or represented as a real financial balance.

### 7.5 Hazard rules

Every hazard must document:

- Its visual identity.
- Which lane or lanes it occupies.
- Whether it is static or moving.
- Whether the player must change lanes or jump.
- Its collision dimensions and active collision window.
- The time and distance a player has to react.
- Whether it can appear beside or in front of a required collectible.

The player must be able to understand a hazard before reaching its collision window. Random generation must not create impossible combinations.

### 7.6 Failure and retry

- A collision follows the existing game-over pattern unless a chapter has a separately approved failure condition.
- The failure screen must identify the chapter and show a concise result.
- The player must be able to retry the current chapter.
- Retrying must reset chapter-run values, active obstacles, collectibles, temporary effects, and objective progress.
- Retrying must not erase previously completed chapters.
- A failed run must not unlock the next chapter.
- A browser refresh must not convert an incomplete run into a completed chapter.

## 8. Progression and replay

### 8.1 Unlock rules

Use linear progression for the first release:

- Chapter 1 is unlocked when Story Mode is first opened.
- Chapter 2 unlocks after Chapter 1 is completed.
- Chapter 3 unlocks after Chapter 2 is completed.
- Chapter 4 unlocks after Chapter 3 is completed.
- Completing Chapter 4 marks the Story Mode campaign as complete.

A chapter can be replayed after it has been unlocked. Replay must not remove later unlocks.

### 8.2 Chapter selection screen

The chapter selection screen should show:

- Chapter number and title.
- A short chapter description.
- A visual thumbnail or environment preview.
- Locked, available, or completed status.
- A clear indication of the next recommended chapter.
- A replay action for unlocked chapters.

Locked chapters should explain that the previous chapter must be completed. Do not make a locked chapter look like a broken button.

### 8.3 Progress persistence

**Recommended first-release approach:** store Story Mode progress in browser-local storage using a versioned, namespaced key. This avoids inventing a backend or Start.ng storage API.

The saved record should contain only what is needed to restore progression, such as:

- Save schema version.
- Highest unlocked chapter.
- Completed chapter identifiers.
- Optional best result per chapter, if that result is implemented.
- A last-updated timestamp.

Do not store authentication tokens, private profile data, or unnecessary user information in the story save.

The implementation must handle:

- No existing save.
- Invalid or malformed JSON.
- An older save schema.
- Storage being unavailable or blocked.
- A player clearing browser data.
- A save write failing.

When local storage is unavailable, the current session should remain playable. The UI should avoid claiming that progress was saved when it was not.

Local storage is device- and browser-specific. Cross-device progress synchronisation is not included in this plan.

### 8.4 Resetting progress

A reset option is not required for the first release. If one is added later, it must:

- Be clearly separated from normal chapter replay.
- Explain that it removes Story Mode unlocks and completion records.
- Require an explicit confirmation.
- Never erase Classic Mode best-run data or Start.ng leaderboard records.

## 9. Scoring and records

### 9.1 Keep score systems separate

Classic Mode already has a score formula based on distance and relics, and the repository has a Start.ng leaderboard configured for score, distance, and relics.

Story Mode must not submit its results to that existing Classic Mode leaderboard by default. Mixing different game modes in one ranking would make the results misleading.

### 9.2 Story result

A chapter result may include:

- Chapter identifier and title.
- Completion or failure status.
- Story items collected.
- Optional Naira-note tokens collected.
- Distance travelled.
- Chapter score, if a score is needed.
- Completion timestamp.

The exact score weights are a balance decision and must be stored in Story Mode configuration, not scattered through rendering code.

### 9.3 Leaderboard boundary

For the first Story Mode release:

- Keep the existing Start.ng leaderboard flow unchanged for Classic Mode.
- Do not invent a Story Mode score endpoint or message type.
- Do not send story-only fields through the current Classic Mode submission path.
- Consider a separate Story Mode leaderboard only after the Start.ng platform's documented configuration and submission support have been confirmed.

The existing Start.ng identity and character integration should be reused where appropriate. Story Mode must not implement a second login system.

## 10. User experience and screen flow

### 10.1 Proposed screen flow

The main navigation should become:

1. **Main mode selection**
   - Relic Rush 3D identity.
   - Classic Mode card.
   - Story Mode: Japa Rush card.
2. **Classic Mode**
   - Opens the existing Classic Mode experience.
   - Existing start, gameplay, pause, game-over, leaderboard, and restart behaviour remains available.
3. **Story Mode**
   - Opens the chapter selection screen.
   - Selecting an available chapter opens its intro screen.
4. **Chapter intro**
   - Chapter title.
   - One or two lines of context.
   - Primary objective.
   - Start chapter action.
5. **Story gameplay**
   - Existing core HUD plus a clear chapter objective and required-item counter.
6. **Pause**
   - Resume.
   - Restart chapter.
   - Return to chapter selection, with a clear warning if leaving will abandon the active run.
7. **Chapter complete**
   - Chapter result.
   - Story items and optional collectibles.
   - Next chapter action when unlocked.
   - Replay and chapter-selection actions.
8. **Story complete**
   - Campaign completion message.
   - Summary of completed chapters.
   - Replay campaign or return to mode selection.

### 10.2 Mode-selection content

Suggested content direction:

**Classic Mode**  
"Run endlessly. Collect relics. Beat your best score."

**Story Mode: Japa Rush**  
"One bag. One destination. A whole lot standing in the way."

These are copy suggestions, not final approved marketing text.

### 10.3 Gameplay HUD

The Story Mode HUD should prioritise:

- Current chapter name or number.
- Primary objective in a short phrase.
- Required story-item count where relevant.
- Optional collectible count.
- A simple chapter-progress indicator if it can be shown without clutter.

Do not show Classic relic counts as if they were Story Mode objectives. Do not crowd the screen with the entire story or dialogue while the player is moving.

### 10.4 Feedback and accessibility

- Use text and visual state together for required-objective feedback.
- Do not rely on colour alone to show locked, completed, or failed states.
- Provide visible focus indicators for menu buttons.
- Ensure buttons have accessible names.
- Maintain readable text over the 3D scene.
- Keep touch targets large enough for mobile use.
- Respect reduced-motion preferences where practical, especially in menu transitions.
- Provide a pause path that is reachable on mobile.
- Ensure the objective remains understandable on narrow screens.

## 11. Visual, audio, and content direction

### 11.1 Visual separation

Story Mode should have its own environment identity, but it should remain recognisably part of Relic Rush 3D.

Each chapter should have a distinct combination of:

- Environment silhouettes.
- Ground and road materials.
- Lighting and atmosphere.
- Distant landmarks.
- Signage and decorative props.
- Hazard and collectible models.

Do not replace the current Classic Mode temple and seasonal environment art with Nigerian city assets. Story Mode environment selection must be scoped to Story Mode.

### 11.2 Asset priorities

Prioritise assets in this order:

1. Readable player path and lane boundaries.
2. Hazards with distinct silhouettes.
3. Required story collectibles.
4. Chapter landmarks and exit markers.
5. Background buildings, vehicles, signs, and decorative props.
6. Optional animation and visual effects.

A decorative vehicle must never look identical to an active obstacle if the player could reasonably confuse the two.

### 11.3 Performance requirements

Follow the repository's existing performance guidance:

- Reuse and recycle obstacles, collectibles, and repeating scenery.
- Avoid creating geometries, materials, vectors, or other avoidable objects in the per-frame loop.
- Dispose of resources that are no longer needed.
- Use delta-time movement.
- Keep draw calls and shadow costs under control.
- Cap pixel ratio appropriately for mobile.
- Test resize and orientation changes.
- Avoid loading every chapter's high-cost assets at once if that harms initial load time.

## 12. Technical approach

### 12.1 Current implementation constraints

The current repository uses:

- Three.js for the 3D scene.
- Vanilla JavaScript ES modules.
- HTML and CSS for the interface.
- Vite for development and static production builds.
- `src/game/config.js` as the central gameplay tuning configuration.
- A large `src/main.js` entry point that currently owns much of the scene setup, UI markup, game state, input handling, animation loop, and Start.ng score wiring.

There is no application framework, no configured test runner, and no separate story or scene-management subsystem at the time this plan was written.

This matters: the implementation should be incremental. A full rewrite or framework migration is not justified merely to add a second game mode.

### 12.2 Separation of responsibilities

The implementation should introduce clear boundaries between:

- **Mode selection:** which experience the player wants to open.
- **Run state:** whether the current run is ready, running, paused, failed, or complete.
- **Classic rules:** endless distance, relic collection, existing difficulty progression, and Classic score submission.
- **Story rules:** active chapter, story objectives, required items, chapter exit, unlocks, and story results.
- **Shared runner mechanics:** lane movement, jump, input, collision primitives, and reusable object handling where behaviour is genuinely the same.
- **Environment presentation:** chapter-specific scenery, lighting, props, and hazard appearance.
- **Persistence:** save and restore Story Mode progression independently of Classic records.
- **Platform adapter:** existing documented Start.ng identity and leaderboard communication.

Avoid using one collection of global flags to represent every mode and every screen. Mode navigation, run state, and chapter objective state are related but distinct concerns.

### 12.3 Recommended state model

Use two related state layers rather than making every screen a gameplay mode.

**Application screen state** describes what the player is viewing:

- `mode-select`
- `classic`
- `story-chapter-select`
- `story-intro`
- `story-gameplay`
- `story-chapter-complete`
- `story-complete`

**Gameplay run state** describes the active run:

- `ready`
- `running`
- `paused`
- `failed`
- `completed`

Story chapter state should separately identify the active chapter and objective progress. These layers should have explicit transitions and reset rules.

The exact state names may be adapted to the code during implementation. The important requirement is that a Story Mode transition must not accidentally trigger Classic Mode game-over, restart, scoring, or leaderboard behaviour.

### 12.4 Candidate module boundaries

The existing source structure should be inspected before files are moved or created. The following are responsibility boundaries, not a mandate to reorganise the whole repository:

| Responsibility | Candidate location | Responsibility |
|---|---|---|
| Chapter metadata | `src/story/chapters.js` | Chapter names, descriptions, objective definitions, environment identifiers, and exit conditions |
| Story state | `src/story/story-state.js` | Active chapter, objective progress, completion and failure transitions |
| Progress storage | `src/story/progress-store.js` | Versioned local save loading, validation, and saving |
| Objective tracking | `src/story/objectives.js` | Required and optional collectible tracking and exit validation |
| Story environment data | `src/story/environments.js` | Chapter-to-environment configuration, if the renderer needs a separate mapping |
| Shared runner rules | Existing game modules, extracted only as needed | Reusable movement, collision, and object lifecycle logic |
| UI | Existing UI entry points or small focused modules | Mode selection, chapter selection, chapter intro, results, and objective HUD |

Do not create empty abstractions or move code just to match this table. Extract a responsibility when it reduces coupling or makes behaviour easier to verify.

### 12.5 Shared mechanics versus mode-specific rules

**Good candidates for sharing:**

- Three-lane coordinate system.
- Lane-change input.
- Jump input and jump physics.
- Delta-time movement.
- Basic collision checks, where hitbox behaviour is equivalent.
- Pause and resume primitives.
- Reusable obstacle and collectible lifecycle utilities.

**Must remain mode-specific:**

- Score calculation.
- Collectible meaning and required counts.
- Difficulty tuning where chapter pacing differs from endless progression.
- Chapter completion and failure rules.
- Chapter unlocks and replay.
- Story-specific HUD.
- Story result records and persistence.
- Start.ng submission decisions.

Do not force different hazards into one generic object type if their collision behaviour differs. Share the underlying mechanism only when the behaviour is genuinely the same.

### 12.6 Scene and environment handling

The Classic Mode environment must retain its current visual cycle and behaviour. Story Mode should select an explicit chapter environment.

A chapter environment should define its own visual configuration, including palette, fog or atmosphere, lighting, static scenery, road or ground appearance, landmarks, and available obstacle/collectible variants.

Do not modify the global Classic Mode palette or seasonal environment configuration as a shortcut for implementing Story Mode.

### 12.7 Start.ng integration

- Keep the existing documented Start.ng user, character-style, and leaderboard integration.
- Reuse the current identity display where it is appropriate.
- Continue to support guests.
- Do not add custom authentication.
- Do not invent platform events, endpoints, storage services, or leaderboard fields.
- Do not submit Story Mode results to the Classic Mode event listener.
- Ask for platform documentation before implementing any new Story Mode cloud save or leaderboard integration.

## 13. Data and configuration requirements

Chapter content should be data-driven where practical. A chapter definition should be able to describe:

- Stable chapter ID.
- Display title and summary.
- Chapter order.
- Environment ID.
- Intro text.
- Primary objective type and required item count.
- Optional collectible type and target.
- Exit trigger or target progress.
- Hazard set.
- Completion copy.
- Whether the chapter is available by default.

Gameplay tuning should be configuration-driven. Avoid scattering chapter distances, spawn gaps, collectible targets, score values, and collision thresholds across the animation loop.

Chapter IDs must remain stable once saves are released. Renaming a display title is acceptable; changing a stored ID requires a save migration.

## 14. Failure cases and recovery

The implementation must explicitly consider:

- The player collides before collecting a required item.
- The player reaches the exit without a required item.
- A required item spawns in an unreachable lane.
- A hazard blocks every valid path.
- The player pauses during a chapter-completion transition.
- The player refreshes or closes the tab during a run.
- A save is malformed or uses an old schema.
- Browser storage is unavailable.
- The player is a guest.
- Start.ng identity or leaderboard communication fails.
- A chapter asset fails to load.
- The viewport changes size or orientation during gameplay.

A platform failure must not make the local Story Mode campaign unplayable. An asset failure should produce a controlled fallback or a clear error rather than a blank or frozen game.

## 15. Implementation phases

Implement this expansion in small phases. Verify each phase before starting the next. Do not develop all four chapters simultaneously.

### Phase 0: Specification and baseline

**Work:**

- Review this document and the top-level `PRD.md`.
- Record the existing Classic Mode behaviour before changing it.
- Confirm the four chapter objectives and content direction.
- Capture a working baseline of the current build and manual gameplay.

**Exit criteria:**

- Scope and chapter objectives are agreed.
- Existing Classic Mode behaviour is recorded.
- No gameplay code has been changed as part of this phase.

**Test:**

- Run `npm install` if dependencies are not installed.
- Run `npm run build`.
- Run `npm run dev` and manually verify the existing Classic start, controls, pause, collision, restart, and leaderboard messaging.

### Phase 1: Mode selection

**Work:**

- Add a mode-selection entry screen.
- Add Classic Mode and Story Mode cards.
- Route Classic Mode to the existing experience without changing its gameplay.
- Route Story Mode to a chapter-selection placeholder.
- Provide a reliable way to return to mode selection.

**Exit criteria:**

- Both modes can be opened and exited.
- The Classic Mode path behaves as it did before.
- The Story Mode path does not start a Classic run or submit a Classic score.

**Test:**

- Build with `npm run build`.
- Open both mode cards on desktop and mobile.
- Verify keyboard focus, button labels, responsive layout, and returning to mode selection.
- Complete a short Classic run and verify its score flow is unchanged.

### Phase 2: Story Mode foundation

**Work:**

- Add the chapter data model.
- Add story run state and objective tracking.
- Add chapter selection, intro, pause, failure, and completion screen foundations.
- Add versioned local progress persistence.
- Implement chapter unlock rules.
- Use placeholder chapter visuals or a controlled test environment at this stage.

**Exit criteria:**

- A chapter can start, pause, fail, complete, and be replayed.
- Objective state resets correctly on retry.
- Completion unlocks the next chapter.
- Saved unlocks survive a refresh when browser storage is available.
- Invalid or unavailable storage does not crash gameplay.

**Test:**

- Build.
- Test start, pause, resume, failure, retry, completion, unlock, replay, and refresh.
- Test malformed save data and storage-disabled behaviour.
- Confirm Classic records are unaffected.

### Phase 3: Chapter 1 vertical slice

**Work:**

- Implement the Lagos Hustle environment.
- Add its hazard and collectible variants.
- Implement the exit trigger and optional collectible result.
- Add short intro and completion copy.
- Tune the chapter length and difficulty.

**Exit criteria:**

- Chapter 1 is completable from start to exit.
- Hazards are readable and avoidable.
- Optional collectibles never make the required objective unclear.
- Chapter completion is saved and Chapter 2 unlocks.

**Test:**

- Play multiple complete runs on desktop and mobile.
- Intentionally miss optional items.
- Intentionally miss the required item if one is configured.
- Verify every required item can be reached and no generated hazard pattern is impossible.
- Retry after failure and replay after completion.

### Phase 4: Chapters 2 and 3

**Work:**

- Implement the Expressway environment and required travel-folder objective.
- Implement The System environment and required clearance-stamp objective.
- Add chapter-specific hazard patterns and visual identity.
- Tune pacing so difficulty grows without becoming unfair.

**Exit criteria:**

- Both chapters have unique, understandable objectives.
- Both chapters have reliable completion and retry behaviour.
- Chapter unlock order is correct.
- Replaying an earlier chapter does not remove later unlocks.

**Test:**

- Play each chapter from its intro through completion.
- Attempt exits before required items are collected.
- Test all lane and jump combinations around mandatory items.
- Test pause and retry during each chapter.
- Verify progress after refreshing the page.

### Phase 5: Chapter 4 and story ending

**Work:**

- Implement The Japa Terminal.
- Add the required boarding-pass objective and departure-gate exit.
- Add the final chapter result and campaign-complete experience.
- Add campaign replay and return-to-mode-selection actions.

**Exit criteria:**

- The four-chapter campaign can be completed in order.
- The final state is saved.
- Campaign completion is clearly communicated.
- The player can replay chapters without losing completion status.

**Test:**

- Complete a clean campaign from Chapter 1 through Chapter 4.
- Refresh after completing the campaign.
- Replay a completed chapter.
- Confirm Classic Mode remains independent.

### Phase 6: Integration and polish

**Work:**

- Confirm guest and signed-in identity handling.
- Confirm that Story Mode does not use the Classic Mode leaderboard submission path.
- Refine sound, transitions, visual feedback, and chapter dialogue.
- Review accessibility and small-screen layouts.
- Review asset loading and memory use.

**Exit criteria:**

- Story Mode remains playable if Start.ng communication fails.
- No duplicate or incorrect score submissions occur.
- Menu and gameplay UI remain usable across supported screen sizes.
- Performance is acceptable on representative mobile hardware.

**Test:**

- Test as a guest and as a signed-in Start.ng player where the environment is available.
- Simulate or inspect platform communication failure.
- Test desktop and mobile controls.
- Inspect browser console and network errors.
- Check resize, orientation, pause, and background-tab behaviour.

### Phase 7: Release verification

**Work:**

- Run the production build.
- Run the built site through Vite preview.
- Confirm static asset paths and Start.ng publishing requirements.
- Update README documentation and screenshots if required.
- Verify the published game on its live Start.ng URL.

**Exit criteria:**

- All Story Mode acceptance criteria pass.
- All existing Classic Mode acceptance criteria still pass.
- No known blocker remains in the console or gameplay flow.
- Publishing requirements have been confirmed rather than assumed.

**Test:**

- `npm run build`
- `npm run preview`
- Full manual regression checklist in Section 17.
- Live Start.ng smoke test after publishing.

## 16. Acceptance criteria

Story Mode is ready for release only when all applicable criteria below pass.

### Product and navigation

- [ ] The product is still named Relic Rush 3D.
- [ ] The main entry experience offers Classic Mode and Story Mode.
- [ ] Story Mode is identified as Japa Rush.
- [ ] Both modes can be entered without breaking the other.
- [ ] The player can return to mode selection without corrupting progress.

### Classic Mode regression

- [ ] The existing three-lane track remains available.
- [ ] Existing keyboard, touch, and on-screen controls continue to work.
- [ ] Existing jump behaviour remains available.
- [ ] Existing relic collection and score calculation are unchanged.
- [ ] Existing obstacle collision and game-over behaviour are unchanged.
- [ ] Existing pause, resume, and restart behaviour remain correct.
- [ ] Existing best-run display and Start.ng leaderboard behaviour remain correct.
- [ ] Story Mode assets and HUD do not appear in Classic Mode.

### Story structure and objectives

- [ ] Story Mode contains four chapters in the agreed order.
- [ ] Each chapter has a title, intro, primary objective, and exit condition.
- [ ] Each chapter has a distinct environment identity.
- [ ] Each chapter uses readable and fair hazards.
- [ ] Required story items are tracked correctly.
- [ ] Optional collectibles do not accidentally block chapter completion.
- [ ] A chapter cannot complete before its required conditions are satisfied.
- [ ] Failure and retry reset the active chapter run correctly.
- [ ] Completing a chapter unlocks the next chapter.
- [ ] Completed chapters can be replayed.
- [ ] Chapter 4 completion marks the campaign complete.

### Persistence and platform boundaries

- [ ] Progress is saved using a versioned local schema.
- [ ] Invalid or unavailable browser storage does not crash the game.
- [ ] Refreshing after chapter completion restores the correct unlock state.
- [ ] Retrying or replaying does not erase earlier unlocks.
- [ ] Story Mode does not submit results to the Classic Mode leaderboard.
- [ ] No custom authentication or undocumented Start.ng API is introduced.
- [ ] Guest play remains available.

### Quality

- [ ] The game builds with `npm run build`.
- [ ] The production preview works without the development server.
- [ ] Desktop controls work.
- [ ] Mobile swipe and on-screen controls work.
- [ ] The interface remains readable on narrow screens.
- [ ] Browser console shows no new unhandled errors.
- [ ] Scene resources are reused or disposed appropriately.
- [ ] No known impossible hazard or collectible arrangement remains.

## 17. Manual regression checklist

Run this checklist before merging a Story Mode implementation and again before publishing.

### Classic Mode

- [ ] Open Classic Mode from the mode-selection screen.
- [ ] Move left and right using keyboard controls.
- [ ] Jump using the existing keyboard control.
- [ ] Use mobile swipe and on-screen controls.
- [ ] Collect relics and confirm the count and score update.
- [ ] Hit an obstacle and confirm game over.
- [ ] Pause and resume a run.
- [ ] Restart and confirm score, distance, relics, speed, obstacles, and jump state reset.
- [ ] Confirm Classic leaderboard messaging and submission still work in the supported Start.ng environment.

### Story Mode

- [ ] Open Story Mode from the mode-selection screen.
- [ ] Confirm Chapter 1 is available and later chapters are locked.
- [ ] Open a chapter intro and read its objective before starting.
- [ ] Confirm the objective HUD updates correctly.
- [ ] Collect a required item and confirm the counter updates.
- [ ] Miss a required item and confirm the exit cannot incorrectly complete the chapter.
- [ ] Collect optional items and confirm their result is separate from required progress.
- [ ] Trigger failure and retry the same chapter.
- [ ] Complete a chapter and confirm the next chapter unlocks.
- [ ] Replay a completed chapter.
- [ ] Refresh after completion and confirm progress is restored.
- [ ] Test invalid or unavailable local storage.
- [ ] Complete Chapter 4 and confirm the campaign-complete screen appears.
- [ ] Confirm Story Mode has not submitted a Classic leaderboard score.

### Cross-device and production

- [ ] Test a narrow mobile viewport.
- [ ] Test a wider desktop viewport.
- [ ] Rotate a mobile device during a chapter.
- [ ] Background and restore the browser tab.
- [ ] Run the production preview.
- [ ] Inspect console errors and failed asset requests.
- [ ] Confirm the live Start.ng build after deployment.

## 18. Risks and mitigations

| Risk | Why it matters | Mitigation |
|---|---|---|
| Classic Mode regression | Existing gameplay and leaderboard could be damaged by new state transitions | Keep mode-specific state and scoring boundaries; run Classic regression after each phase |
| Monolithic entry point becomes harder to maintain | Current gameplay, UI, rendering, and platform code are concentrated in `src/main.js` | Extract only focused responsibilities as needed; avoid a wholesale rewrite |
| Unfair chapter generation | A required item or exit may become unreachable | Validate spawn patterns and manually test repeated runs |
| Story progress is lost | Browser storage may be cleared or unavailable | Version the save, validate reads, handle failures, and explain local-only persistence |
| Start.ng integration is accidentally changed | A guessed platform API could break identity or leaderboard behaviour | Reuse the existing documented adapter and request platform docs for any new integration |
| Mobile performance declines | Additional models, effects, and environment assets can increase rendering cost | Reuse resources, pool objects, limit shadows and draw calls, and test on mobile |
| Visual confusion | Decorative vehicles may be mistaken for hazards | Give active hazards distinct silhouettes and consistent visual feedback |
| Satire becomes too specific or hostile | Real-person likenesses or stereotypes can distract from the game | Keep people and institutions fictional and review story copy before release |
| Scope grows beyond a finishable release | Extra movement systems, branching stories, and multiplayer add large costs | Deliver the four-chapter linear experience first and defer non-goals |

## 19. Open decisions

The following decisions should be confirmed during Phase 0 or the relevant implementation phase. The document provides a recommended direction, but does not pretend these items have already been tested.

| Decision | Recommended starting point | When to confirm |
|---|---|---|
| Chapter count | Four chapters | Phase 0 |
| Story title | Japa Rush under Relic Rush 3D | Phase 0 |
| Story progression | Linear unlocks with replay | Phase 0 |
| Story save location | Versioned browser-local storage | Phase 2 |
| Cloud progress sync | Excluded until documented Start.ng support is confirmed | Future scope |
| Story leaderboard | Excluded from first release | Future scope |
| Chapter length | Tune through playtesting; keep chapters short enough for a browser session | Phases 3–5 |
| Required item targets | One folder in Chapter 2, three stamps in Chapter 3, one boarding pass in Chapter 4 | Before each chapter is implemented |
| Optional Naira-note target | Start with a small optional target in Chapter 1 and tune from playtests | Phase 3 |
| Reset campaign action | Excluded from first release | Future scope |
| Dialogue and sound quantity | Short text and lightweight effects first | Phase 6 |

## 20. Definition of done

The Story Mode expansion is done when:

1. All four chapters are playable from beginning to end.
2. Each chapter has a clear objective, fair hazards, and a reliable completion trigger.
3. Chapter unlocks, replay, and local persistence work correctly.
4. The final chapter produces a clear campaign-complete state.
5. Story Mode is independently accessible from the mode-selection screen.
6. Classic Mode retains its original gameplay, score rules, and Start.ng leaderboard behaviour.
7. Guest play and existing Start.ng identity handling remain safe.
8. The production build works as a static site.
9. The manual regression checklist passes on desktop and mobile.
10. The live Start.ng deployment has been checked after publishing.

## 21. Implementation guardrails

Before making code changes:

1. Read `AGENT.md` and `PRD.md`.
2. Inspect the exact files that will be changed.
3. Compare the current Classic Mode behaviour against the baseline.
4. Implement only the current phase.
5. Run `npm run build`.
6. Manually test the phase in `npm run dev` and, where relevant, `npm run preview`.
7. Record what passed, what failed, and what could not be tested.
8. Do not start the next phase while the current phase has a known blocker.

The repository currently has no configured test runner, linter, or formatter. A successful production build is not proof that gameplay is correct. Do not report manual behaviour as tested unless it was actually played and verified.

---

## Related repository documents

- [Project instructions](../AGENT.md)
- [Current MVP product requirements](../PRD.md)
- [Project overview and local run instructions](../README.md)
