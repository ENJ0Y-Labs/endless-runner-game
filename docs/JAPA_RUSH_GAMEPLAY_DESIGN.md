# Japa Rush: The Great Escape

## Gameplay and difficulty design specification (revised)

**Status:** Design proposal, revised  
**Creative reference:** *Shangri-La Frontier* (encounter structure only)  
**Parent documents:** `PRD.md`, `docs/STORY-MODE-PLAN.md`  
**Implementation constraint:** Use the existing Relic Rush engine. This document describes proposed work. Nothing here is implemented unless it says so.

This revision replaces the earlier draft. It keeps Story Mode compatible with `STORY-MODE-PLAN.md`, makes every hazard and location grounded in real Nigerian life, and ties the design to what the engine can actually do today.

---

## 1. Creative direction

Japa Rush is a grounded, fast-paced Nigerian escape story. An ordinary person with one suitcase has to get from Lagos street traffic to an international departure gate. Every obstacle must be something you could actually meet on that journey.

**Realism rules**

1. Every hazard is a believable vehicle, object, or situation for its location. No fantasy creatures, monsters, giant machines, or supernatural events.
2. Vehicles behave like vehicles: they stay in lanes, signal before merging, brake, and stall. They do not teleport, hover, or change direction without a cue.
3. Local detail should be specific and respectful: yellow-and-black danfo minibuses, okadas, keke tricycles, roadside kiosks and hand-painted signs, go-slow traffic, generators, queue-and-ticket-number offices, airport check-in and security lines.
4. Institutions, signs, and brands are fictional. No real agency logos, airline liveries, uniforms with real insignia, politicians, or party symbols.
5. No graphic harm. A failed run ends in a stop, stumble, or blocked path, not injury.
6. People are never the joke. Use situations (queues, traffic, paperwork) rather than ethnicity, religion, disability, or poverty.

**Fairness rule:** the player should lose because they misread a pattern or mistimed a move, never because the game produced an unavoidable obstacle.

**Tone decision.** The plan and teaser use satire. This spec makes the *gameplay* grounded and keeps the humour in signage, billboards, announcements, and short dialogue. The Big Man stays a comic, believable, human presence (see 3.5). Do not mix a satirical HUD with surreal hazards.

## 2. Non-negotiable engine rule

Story Mode is a content layer on the original Relic Rush engine.

- Preserve the runner, animation, lane movement, jump, collision, camera, render loop, audio, input, pause, and responsive controls.
- Do not create a second Three.js scene, runner controller, physics loop, or parallel gameplay implementation.
- Classic Mode must not change. Story settings are scoped to Story Mode only.
- If the engine lacks something this document needs, extend the original system and document it in section 12. Do not build a competing one.

## 3. The chapter loop: three requirements

Every chapter uses the same loop, so the player always knows what is being asked.

| # | Requirement | What it means |
|---|---|---|
| 1 | **Story item** | Collect the chapter's required item (route slip, travel folder, clearance stamps, boarding pass). |
| 2 | **Money target** | Collect enough Naira-note tokens to reach the chapter's target. |
| 3 | **Boss encounter** | When requirements 1 and 2 are both complete, normal spawning stops and the chapter's set-piece encounter begins. Surviving it to the exit completes the chapter. |

"Boss" here means a recognisable, phased traffic or crowd encounter, not a monster.

### 3.1 Loop rules

- **Trigger:** the encounter starts only when the story item is collected AND the money target is met. The HUD shows both.
- **Order:** the story item is placed early enough that the money phase never feels like it is waiting on a missed item. If the item is missed, see 3.3.
- **Money is guaranteed reachable.** Notes come from an authored schedule whose total is at least **120% of the target**. A random spawner must never leave the target mathematically out of reach.
- **Money is fictional.** Naira-note tokens are generic banknote-shaped game objects with no real currency design, no cash value, and no redemption. Use "₦" only as a display symbol for in-game tokens.
- **No timers.** `STORY-MODE-PLAN.md` excludes timed missions in the first release. "Pressure" comes from speed, pattern density, and the encounter, never a countdown.
- **Notes never require a collision** and are always on a reachable route.

### 3.2 Chapter summary

Targets below are **placeholders** until the collect rate is measured in playtests. Aim for roughly 60 to 90 seconds of collecting before the encounter.

| Chapter | 1. Story item | 2. Money target (placeholder) | 3. Encounter |
|---|---|---:|---|
| 1. Lagos Hustle | Route slip / bus ticket | ₦500 | The Last Danfo |
| 2. The Expressway | Travel folder | ₦800 | The Tanker Convoy |
| 3. The System | 3 clearance stamps | ₦1,200 | The Clearance Queue |
| 4. Japa Terminal | Boarding pass | ₦1,800 | The Final Departure |

### 3.3 Missing the story item

The item must be collectible with ordinary movement and is never behind an unavoidable hazard. If the player passes it:

- The HUD says it was missed and what is required.
- Either the item **re-appears once** at a later, clearly signposted point (preferred: a second chance in the same chapter), or the run ends with a clear explanation and a retry.
- The chapter never completes without the item.

### 3.4 Boss start sequence

1. Requirements 1 and 2 are met.
2. Normal spawning stops. Rows already on screen finish scrolling off.
3. A readable warning plays (sign, announcement, siren, or horn) and the encounter title card shows. The play area stays visible.
4. The authored three-phase encounter begins.
5. Surviving the last phase reaches the exit marker and completes the chapter.

**Checkpoint at the encounter.** One-hit failure plus a long money phase is punishing. A failure *during* the encounter restarts at the encounter start with the story item and money kept. A failure *before* it restarts the chapter. The rank reflects this (section 8).

### 3.5 The Big Man

The Big Man is an original fictional character, not any real person. He is a believable, influential figure, not a supernatural chaser.

- **Where he appears:** opening cutscene, propaganda-style billboards, short phone-call lines, and a motorcade.
- **Gameplay role:** a VIP motorcade is a real traffic event. Escort vehicles with sirens push traffic aside. In Chapter 2 it can add lane-clearing pressure to the encounter. It follows normal vehicle movement and is always telegraphed by siren audio and a lane marker.
- **Tone:** funny early, more intimidating later, never physically impossible.
- **Lines** (placeholders, keep short and literal where instructions matter): "You want to Japa? Japa from this!", "Collect your renewed hope!", "Don't you know I'm a national leader?!"

## 4. Chapter design

### Chapter 1: Lagos Hustle

**Setting:** A busy Lagos commercial street at golden hour, leading to an expressway on-ramp.

**Realistic hazards:** danfo minibuses, okadas, keke tricycles, parked vehicles, potholes, roadside barricades, hawkers' carts and stalls (static objects, not people in the lane), crates and drums, traffic cones.

**Encounter: The Last Danfo**

- **Phase 1, Read the road.** One danfo signals (indicator blink and slight drift) before moving into a lane. Teaches that moving vehicles warn first.
- **Phase 2, Go-slow squeeze.** The danfo slows while a parked vehicle or keke occupies a neighbouring lane. The safe lane is visible early.
- **Phase 3, On-ramp merge.** A final sequence of cones and barricades closes lanes one at a time toward the exit sign.

**Story item:** route slip or bus ticket (placed on the first stretch, teaching collection).  
**Hidden challenge:** collect every bonus note, or clear a marked traffic section without changing lanes.

### Chapter 2: The Expressway

**Setting:** A busy intercity expressway with long vehicles, roadworks, and breakdowns.

**Realistic hazards:** tankers and trailers, commercial buses, trucks, broken-down vehicles with hazard triangles, cones, barriers, road debris, and lane closures for roadworks.

**Encounter: The Tanker Convoy**

- **Phase 1, Keep your distance.** A tanker holds a lane at steady speed. Choose a safe route around it.
- **Phase 2, Narrow passage.** Roadworks or a stalled vehicle reduce open lanes. Cones and a "lane closed ahead" sign show the opening in advance.
- **Phase 3, Convoy break.** Two or more vehicles create a short sequence of lane choices before the checkpoint. If the Big Man's motorcade appears, its siren and lane marker give advance warning.

**Story item:** travel folder.  
**Hidden challenge:** a narrow but safe service-lane route, or a secondary travel document.

The tanker is a tall traffic obstacle. It is never jumped and never chases the player.

### Chapter 3: The System

**Setting:** A crowded, fictional government processing centre: numbered windows, ticket-number displays, queue rails, noticeboards, metal benches, ceiling fans, a standby generator hum, and paperwork everywhere. Signs and institutions are invented.

**Realistic hazards:** queue barriers and rope stanchions, rolling document carts, benches, stacked files, security desks, floor-marked walkways.

**Encounter: The Clearance Queue**

- **Phase 1, Find the right queue.** Barriers redirect the route along a changing but readable path, with floor arrows as the cue.
- **Phase 2, Document rush.** A document cart moves along a visible track while queue ropes narrow the lanes.
- **Phase 3, Final verification.** Navigate the last desk area to collect the final stamp and reach the exit.

**Story item:** three clearance stamps, placed in order along the run. Collect all three.  
**Hidden challenge:** find a side queue and complete an optional document task.

The challenge is route reading and timing. There are no hostile staff and no implausible machinery.

### Chapter 4: Japa Terminal

**Setting:** An international airport departure terminal: check-in hall, security lanes, concourse, departure boards, and gate. All airlines and destinations are invented.

**Realistic hazards:** luggage trolleys, airport carts, queue ropes, passengers with luggage (rendered as static or on-path groups, not in the way of a blocked lane), temporary barriers, security-lane equipment.

**Encounter: The Final Departure**

- **Phase 1, Check-in rush.** Luggage carts and queue lanes.
- **Phase 2, Security bottleneck.** Follow visible lane openings past moving carts and temporary barriers.
- **Phase 3, Gate closing.** A faster, clearly telegraphed run to the gate, announced by the boarding-call audio.

**Story item:** boarding pass.  
**Hidden challenge:** a quieter route to the gate, or a secondary travel item.

This is a fictional arcade story. It must not imply that real airport security or immigration can be bypassed. The Big Man may appear on a phone call or billboard, never as a physical pursuer.

## 5. Hazard classification (what is realistic and what is fair)

The engine currently has one obstacle hitbox and one jump clearance. Realistic vehicles need different rules, so every hazard declares a class:

| Class | Examples | Player response |
|---|---|---|
| **Low** | cones, crates, low barricades, potholes, luggage | Jump or change lane |
| **Tall** | tanker, bus, danfo, truck, security desk | Change lane only; never jumpable |
| **Moving** | merging danfo, document cart, airport cart | Change lane; must be telegraphed |
| **Span** | road gap, closed-lane section | Jump (if low) or reach the open lane |

Never present a tall obstacle with a low-obstacle silhouette, or the reverse. A decorative vehicle must be visually distinguishable from an active one.

Each hazard definition records: lane(s) occupied, class, static or moving, collision depth and width, warning cue, and whether it may sit beside or before a required item.

## 6. Encounter design principles

1. **Telegraph before impact.** Indicator blink, siren, lane marker, sign, or announcement before danger.
2. **Teach, then test.** Introduce a pattern safely, repeat with a small change, then combine with an earlier pattern.
3. **Escalate fairly.** Raise density and complexity, not just speed.
4. **Always leave a reachable safe path**, counting the lane the player is in and the actions available.
5. **No fake warnings.** A cue must describe the real hazard.
6. **Authored patterns with bounded variation**, not unconstrained random placement.
7. **Calibrate to the real movement model** (section 7).

## 7. Calibration from the current engine

These figures come from `src/game/config.js` and `src/main.js`. They are derived, not measured. Verify them in playtests before authoring patterns.

- **Speed:** starts at 13 units/s, rises 0.22/s, caps at 25.
- **Lanes:** x = -2.46, 0, 2.46. Lane spacing 2.46 units.
- **Lane change:** the runner eases toward the target at roughly 12 per second, so a one-lane move is mostly complete in about 0.25 s. A two-lane move (edge to edge) takes noticeably longer, so avoid patterns that demand one.
- **Jump:** initial velocity 9.5, gravity 25, so about 0.76 s airtime and about 1.8 units peak height. Clearance is 1.05, so the player is above clearance for about **0.49 s**.
- **Hit window:** obstacle z-range relative to the player is -0.75 to 0.95, about 1.7 units deep.
- **Reaction distance:** rows spawn at 120 units. At 13 units/s that is about 9 s of visibility, at 25 units/s about 4.8 s.

**What this means for authors**

- Jumpable ("low") obstacles must be shallow. The jump covers roughly 6.4 units of travel at the start speed (13 × 0.49), minus the 1.7-unit hit window, so keep jumpable depth to about **3 units or less** to stay safe across the speed range. Deep or tall vehicles must be lane-avoid only.
- Telegraph a moving hazard at least **1 s** before it becomes dangerous, and more at higher speed.
- The existing spawner already guarantees a reachable lane between rows. Authored patterns must meet the same guarantee and be checked by a test (section 11).

## 8. Ranks (compatible with one-hit failure)

The engine ends the run on the first collision, so "limited mistakes" is not measurable. Ranks use things the engine can track:

| Rank | Criteria |
|---|---|
| **C** | Complete the chapter (items, money target, encounter). |
| **B** | C, plus at least half of the available bonus notes. |
| **A** | Complete in one attempt (no failed attempts and no encounter checkpoint used). |
| **S** | A, plus all bonus notes and the chapter's hidden challenge. |
| **S+** | S, plus the perfect-dodge target (if perfect dodge is implemented). |

"Bonus notes" are notes beyond the required target (the 20% buffer and extras). Thresholds are placeholders until playtested. S+ must not depend on an unreasonably narrow timing window.

### Perfect Escape challenge (optional, late phase)

Complete all four chapters in one session without a failed attempt and with the S-level conditions. A failed attempt resets the challenge streak only. It never erases chapter unlocks or saved progress.

## 9. Optional systems (later phases, not first release)

These are good ideas but are explicitly **out of the first Story Mode release**, to protect the plan's four-chapter scope.

**Perfect dodge.** The engine has no near-miss detection, but it is easy to add: when a telegraphed hazard passes the player within a small z-window and a lane change or jump was completed shortly before, award a small score bonus. It is a mastery reward, never required to finish.

**Difficulty modes (Adventurer / Veteran / Legend).** Deferred. Three modes across four chapters and three phases multiplies tuning work. Add only after a single tuned difficulty has been playtested. If added, they change speed, density, and warning length, never the realism of the setting.

**Unlockables.** Badges, titles, and story details only. Do **not** add runner outfits. `PRD.md` and `AGENT.md` require the runner's appearance to come from Start.ng style data. Do not add gameplay-affecting upgrades such as invulnerability or permanent speed.

**Health, Pure Water, Japa Forms, PVC multipliers.** Deferred. They conflict with the one-hit-failure model. Revisit only if a health system is deliberately added.

**Cosmetic exchange-rate indicator.** Optional HUD flavour that drifts downward with distance. Not a financial calculation.

## 10. Failure feedback and retry

After a failure, show a short, factual summary:

- What was hit (for example, "tanker in the centre lane").
- The warning cue that preceded it, where one existed.
- The requirement still missing (item or money).
- A clear Retry button.

Retry rules:

- Before the encounter: restart the chapter. Reset money, item, hazards, and temporary state.
- During the encounter: restart at the encounter start with the item and money kept.
- Never erase completed chapters or unlocks.
- A refresh must never convert an incomplete run into a completed chapter.
- Never blame the player for an unavoidable collision. If one is found, treat it as a bug.

## 11. Technical approach

Keep campaign content as data and let the original engine consume it.

- Chapter metadata in a story configuration module (`src/story/chapters.js`): id, title, environment id, story item, money target, bonus-note count, encounter pattern id.
- Encounter patterns as data: a list of rows, each with lane contents, hazard class, and warning cue.
- **Pattern validator as a unit test.** The repository's `npm test` script invokes Node's built-in `node --test` runner. Add deterministic tests that assert every row of every pattern leaves a reachable lane given the previous row, jumpable hazards are within the depth limit, and each money schedule totals at least 120% of its target. Confirm the CI workflow runs `npm test`; do not assume that a local script is already part of CI. This enforces "every pattern is solvable".
- Objectives through hooks on existing collect and collision events, not a second collision system.
- Story progression saved in versioned, namespaced local storage, separate from Classic Mode records. Handle missing, malformed, old-schema, and blocked storage.
- Story results do not go to the Classic leaderboard. No new Start.ng endpoints are invented.
- Clean up chapter listeners and temporary entities through the engine's lifecycle.

## 12. Engine dependencies (what the engine cannot do today)

`src/main.js` currently builds its scene, seasonal palette, spawner, and UI at load time with module-level state. There is no chapter initialisation path yet. Before Story Mode content can plug in, the following need to be added or extracted, with Classic regression checks at each step.

| Need | Today | Required change |
|---|---|---|
| Finite chapter with an exit | Endless run only | Add an exit marker and a completion trigger scoped to Story Mode |
| Authored encounter patterns | Random row spawner | A pattern-driven spawn path used only in Story Mode |
| Per-hazard hitboxes and classes | One obstacle hitbox and one jump clearance | Per-hazard collision data and a "not jumpable" flag |
| Per-chapter environments | One temple palette plus seasons | Environment config selected by chapter, without touching Classic seasons |
| Money and item objectives | Relic count only | Story-scoped collectible types and counters |
| Sliding | Not supported | Out of scope for the first release |

## 13. Phased delivery

1. **Foundation:** mode selection, story state, chapter data model, versioned save, retry. Classic unchanged.
2. **Chapter 1 vertical slice:** exit marker, authored patterns, route slip, money target, The Last Danfo, retry. Playtest the collect rate and set the real target.
3. **Chapters 2 and 3,** one at a time, each with its own patterns and validator tests.
4. **Chapter 4 and ending.**
5. **Polish:** ranks, hidden challenges, accessibility, audio layers.
6. **Later, only if playtests justify:** perfect dodge, difficulty modes, Perfect Escape.

Do not develop all four chapters at once.

## 14. UI, audio, accessibility

- Each chapter has a distinct, realistic palette and recognisable local detail.
- HUD shows: chapter name, story-item status, money progress ("₦320 / ₦500"), and an encounter phase indicator when active.
- Use text and icons together. Never rely on colour alone for warnings or required states.
- Consistent warning language and icons across chapters (indicator blink, siren, lane marker).
- Audio cues: approaching traffic, horns, sirens, queue announcements, boarding call. Keep existing Relic Rush sounds and controls and layer story audio on top.
- Keep touch targets large, HUD readable on narrow screens, and respect reduced-motion preferences.

## 15. Acceptance criteria

Story Mode is ready for release only when all of these pass.

**Engine and regression**

- [ ] Story Mode runs through the original Relic Rush engine with no second scene, loop, or controller.
- [ ] Classic Mode gameplay, score, and leaderboard behaviour are unchanged.
- [ ] Story HUD and assets never appear in Classic Mode.

**Chapter loop**

- [ ] Each chapter has a story item, a money target, and an encounter.
- [ ] The encounter starts only when both the item and the money target are complete.
- [ ] The money schedule totals at least 120% of the target, verified by a test.
- [ ] A missed story item gives a clear message and a fair second chance or retry.
- [ ] The chapter never completes without its required item.

**Fairness and realism**

- [ ] Every pattern leaves a reachable safe path, verified by a test.
- [ ] Every hazard has a class; tall hazards are never jumpable; jumpable hazards respect the depth limit.
- [ ] Every moving hazard is telegraphed at least 1 s ahead with an accurate cue.
- [ ] No fantasy creatures, supernatural events, or impossible hazards appear.
- [ ] No real logos, politicians, insignia, or currency designs appear.

**Progression and persistence**

- [ ] Ranks follow the documented criteria.
- [ ] Retry behaves as specified and never erases prior progress.
- [ ] Saved progress uses a versioned local schema and survives refresh.
- [ ] Malformed or unavailable storage does not crash the game.
- [ ] Story results are not sent to the Classic leaderboard.

**Quality**

- [ ] `npm test` and `npm run build` pass.
- [ ] Desktop and mobile controls, pause, audio, and HUD are manually tested.
- [ ] No new unhandled console errors.

---

## Reference note

*Shangri-La Frontier* is a reference for encounter structure only: readable patterns, escalation, mastery through repetition, and optional discoveries. Japa Rush must not copy its characters, monsters, names, artwork, dialogue, or story.
