# Japa Rush: The Great Escape
## Gameplay and difficulty design specification

**Status:** Design proposal  
**Reference:** *Shangri-La Frontier*  
**Implementation constraint:** Use the existing Relic Rush game engine. This document describes proposed design work; it does not claim that these mechanics are already implemented.

---

## 1. Creative direction

Japa Rush is a grounded, fast-paced Nigerian escape adventure. The player is trying to make it from the chaos of Lagos to an international departure gate while navigating believable traffic, roadworks, paperwork queues, security checks, and airport crowds.

Use *Shangri-La Frontier* as a reference for the **quality of the challenge**, not its fantasy setting. Borrow its readable enemy patterns, escalating encounters, mastery through repetition, hidden objectives, and satisfying high-skill ranks.

**Do not introduce fantasy beasts, monsters, supernatural enemies, giant robots, or impossible hazards.** Every threat must be a believable person, vehicle, object, or situation that could exist in the chapter's location.

The player should lose because they misread a pattern, mistimed a move, or chose a risky route, not because the game generated an unavoidable obstacle.

## 2. Non-negotiable engine rule

Build this campaign on the original Relic Rush engine.

- Preserve the existing runner character and animation system.
- Preserve original movement, lane switching, jumping, sliding (if supported), physics, collision detection, camera, rendering loop, audio, input handling, pause behaviour, and responsive controls.
- Do not create a second Three.js scene, runner controller, physics loop, or parallel gameplay implementation for story mode.
- Japa Rush should be a campaign/content layer: chapter configuration, visual skins, obstacle and collectible variants, encounter patterns, objectives, progression, and results.
- Classic Mode must remain unchanged. Story-specific settings must be scoped to Story Mode and must not leak into Classic Mode.
- Reuse original engine systems wherever possible. If the engine does not support a proposed action (for example, sliding or a perfect-dodge window), document that dependency and extend the original system rather than creating a competing one.

## 3. Campaign structure and chapter encounters

Each chapter has a distinctive environment, required objective, ordinary hazards, and one memorable **set-piece encounter**. These set-pieces serve the role of boss fights: they introduce a recognisable pattern, escalate through phases, and test what the player has learned. They are not literal monsters or supernatural bosses.

### Chapter 1: Lagos Hustle

**Setting:** Busy Lagos streets leading towards the expressway.

**Story pressure:** The player is trying to get out of the neighbourhood and reach the expressway before time runs out.

**Hazards:** Danfo minibuses, okadas, potholes, road barricades, street traders' carts, parked vehicles, and sudden but signalled traffic merges.

**Set-piece: The Last Danfo**
A persistent danfo/minibus and its unpredictable driver create a moving traffic challenge.

- Phase 1, Read the road: the danfo signals or drifts towards one lane. The player learns to recognise its approach.
- Phase 2, Traffic squeeze: the danfo slows or changes lane while another ordinary traffic obstacle occupies a neighbouring lane.
- Phase 3, Expressway merge: the player must read a final sequence of lane closures and reach the exit safely.

**Required objective:** Reach the expressway exit without a collision.

**Optional objective:** Collect at least 3 of 4 Naira notes. Notes must be placed on plausible, reachable routes and must never require a collision.

### Chapter 2: The Emilokan Expressway

**Setting:** A busy intercity expressway with long vehicles, roadworks, and broken-down traffic.

**Hazards:** Tankers, commercial buses, trucks, broken-down vehicles, cones, barriers, road debris, and lane closures.

**Set-piece: The Tanker Convoy**
A large tanker and surrounding traffic create a multi-stage traffic pattern.

- Phase 1, Keep distance: the tanker occupies a lane and the player must choose a safe route around it.
- Phase 2, Narrow passage: roadworks or a stalled vehicle reduce the available lanes. Warnings show the safe opening in advance.
- Phase 3, Convoy break: two or more vehicles create a timed sequence of lane choices before the checkpoint.

**Required objective:** Collect the travel folder and reach the checkpoint without a collision.

The tanker is a traffic obstacle, not a pursuing monster. It must obey plausible vehicle movement and have visible warning cues.

### Chapter 3: The System

**Setting:** A crowded government or administrative processing centre.

**Hazards:** Queue barriers, rope stanchions, document carts, benches, misplaced files, security desks, and people moving through clearly marked paths.

**Set-piece: The Clearance Queue**
A sequence of queue-control changes and document checks creates the encounter.

- Phase 1, Find the right queue: barriers guide the player through a changing but readable route.
- Phase 2, Document rush: a document cart and queue ropes create a timed obstacle sequence.
- Phase 3, Final verification: the player must navigate the final security/verification area and collect the last required stamp.

**Required objective:** Collect all 3 clearance stamps in the intended sequence and reach the exit without a collision.

The challenge comes from route reading and timing, not hostile security staff or implausible machinery.

### Chapter 4: Japa Terminal

**Setting:** A realistic international airport departure terminal.

**Hazards:** Luggage trolleys, queue ropes, airport carts, passengers with luggage, temporary barriers, security lanes, and boarding-gate crowd flow.

**Set-piece: The Final Departure**
A time-pressured sequence through check-in, security, and the departure concourse.

- Phase 1, Check-in rush: navigate luggage carts and queue lanes.
- Phase 2, Security bottleneck: follow visible lane openings while avoiding moving airport equipment and temporary barriers.
- Phase 3, Gate closing: a faster but clearly telegraphed sequence leads to the departure gate.

**Required objective:** Collect the boarding pass and reach the departure gate without a collision.

**Final human antagonist (optional story presentation):** “The Big Man” can be a realistic, influential character who creates social or administrative pressure through dialogue, phone calls, or a brief cutscene. He must not become a supernatural boss or physically impossible pursuer. The actual gameplay challenge remains the airport route and its hazards.

## 4. Encounter design principles

Apply the following principles to every chapter encounter.

1. **Telegraph before impact.** Show an animation, lane marker, sound cue, road sign, or environmental signal before an obstacle becomes dangerous.
2. **Teach, then test.** Introduce one pattern safely, repeat it with a small variation, then combine it with a previously learned pattern.
3. **Escalate fairly.** Increase speed, pattern complexity, and decision pressure gradually. Do not simply shorten reaction time until the game becomes unreadable.
4. **Preserve a valid route.** Every generated obstacle combination must leave at least one physically reachable safe path, accounting for the player's current lane and available actions.
5. **Avoid fake warnings.** Warning indicators must accurately describe the upcoming hazard. Difficulty should test reaction and planning, not punish trust.
6. **Use controlled variation.** Build encounters from tested pattern sets with bounded variation rather than unconstrained random placement.
7. **Respect the engine's movement model.** Pattern timing and spacing must be calibrated to actual Relic Rush movement speed, lane-change duration, jump/slide behaviour, and collision bounds.

## 5. Precision movement: dodge and counter

If supported by the original engine, add a timing-based reward window around selected, clearly telegraphed hazards.

- **Standard evade:** The player avoids the obstacle using normal movement.
- **Perfect dodge:** The player clears the hazard inside a small, tested timing window.
- **Perfect-dodge reward:** A brief score multiplier, small boost, or bonus meter increase.

Do not require a perfect dodge to survive or complete a chapter. It is a mastery reward, not a mandatory mechanic. Avoid adding a combat attack unless it has a believable in-world action and fits the runner's existing controls.

## 6. Hidden challenges and optional routes

Add optional objectives for replay value. They should be discoverable through environmental clues and should not block ordinary chapter completion.

Examples:

- **Lagos Hustle:** collect all four Naira notes, or complete a difficult traffic section without changing lanes.
- **Expressway:** take a narrow but safe service-lane route, or collect a secondary travel document.
- **The System:** discover a side queue and complete an optional document task.
- **Japa Terminal:** find a quieter route to the gate or collect a secondary travel item.

Hidden objectives must be fair: give a clue, ensure the route is reachable, and make the reward clear. They can unlock cosmetic items, story details, profile badges, or challenge variants.

## 7. Unlockable abilities and progression

Progression should reward demonstrated skill without making later chapters trivial or pay-to-win.

| Demonstrated play | Possible unlock |
|---|---|
| Repeated perfect dodges | Reflex cosmetic/effect or a small score bonus |
| Consistent collision-free runs | Adrenaline score multiplier |
| Completing optional routes | Route Finder hint or cosmetic |
| Collecting all chapter items | Chapter-specific badge |
| High-rank campaign completion | Special runner outfit or title |

Any gameplay-affecting ability must be modest, optional, and tested against the campaign's difficulty. Prefer cosmetics, score bonuses, and informational assists over permanent speed or invulnerability upgrades.

## 8. Difficulty modes

Offer three tuned difficulty presets. These change obstacle pacing and pattern complexity, not the realism of the setting.

### Adventurer
- Standard Relic Rush speed or a carefully calibrated slight increase.
- Longer warning windows.
- More forgiving spacing between complex patterns.
- Checkpoint/retry support where appropriate.

### Veteran
- Faster chapter pacing.
- More combinations of previously introduced patterns.
- Shorter, but still readable, warning windows.
- Fewer recovery opportunities during set-piece encounters.

### Legend
- Highest tested speed and pattern complexity.
- No mid-encounter checkpoint during the set-piece.
- Strict collision-free performance expectations.
- All hazards remain telegraphed and every pattern remains solvable.

Difficulty must be playtested. Do not choose arbitrary speed multipliers without measuring the time needed for a player to switch lanes or use other supported actions.

## 9. Chapter ranks and campaign completion

Award a rank after each chapter based on objective completion, collisions, collectibles, and optional challenges.

| Rank | Suggested criteria |
|---|---|
| C | Complete the chapter's required objective |
| B | Complete with limited mistakes and required items |
| A | Complete with zero collisions |
| S | Zero collisions, all required items, and the chapter's hidden challenge |
| S+ | Zero collisions, all required and optional collectibles, hidden challenge, and perfect-dodge target |

Final thresholds should be tuned through playtesting. Do not make S+ depend on an unreasonably narrow timing window.

### Perfect Escape campaign challenge

The ultimate optional achievement:

- Complete all four chapters in one campaign attempt.
- Collect every mandatory item.
- Collect at least 3 of the 4 Naira notes in Chapter 1.
- Complete all four set-piece encounters.
- Finish with zero collisions.
- Complete the hidden challenge in each chapter for the S+ campaign medal.

Ordinary chapter completion must remain available to casual players. A failed Perfect Escape attempt should not erase previously unlocked chapters or permanently delete chapter progress.

## 10. Failure feedback and retry loop

Failure should teach the player what happened.

After a collision or failed objective, show:

- The obstacle or pattern that caused the failure.
- The lane or route that was unsafe.
- The warning cue that preceded the hazard.
- The objective item still missing, if applicable.
- A clear retry option.

Keep feedback concise and factual. Do not blame the player or imply that an unavoidable collision was their fault.

Retry behaviour:
- Retry the current chapter from its beginning or its explicitly designed checkpoint.
- Reset that chapter's temporary collectibles and objectives.
- Preserve previously completed chapters and campaign unlocks.
- A failed campaign-wide Perfect Escape attempt resets the challenge streak, not the player's saved chapter progress.

## 11. UI, audio, and presentation

- Give each chapter a distinct, realistic environment palette and recognisable local details.
- Use obstacle silhouettes that communicate their real-world identity at a glance.
- Use consistent warning language and iconography across all chapters.
- Give each set-piece a title card and phase indicator, but keep the play area visible.
- Use audio cues for approaching traffic, barrier movement, queue announcements, and the final gate warning.
- Keep existing Relic Rush sound effects and audio controls; add story-specific sounds as layers, not replacements.
- Ensure HUD, warnings, and controls remain readable on mobile screens.

## 12. Technical implementation guidance

Recommended architecture:

- Keep chapter metadata in a dedicated story configuration module.
- Pass a validated chapter skin/configuration into the original engine's existing initialization path.
- Reuse existing obstacle, collectible, spawn, collision, HUD, scoring, audio, and animation systems.
- Add encounter patterns as data/configuration consumed by the original spawn system.
- Add story objectives through hooks/events from existing collision and collection events.
- Keep campaign persistence separate from Classic Mode records.
- Validate saved progress and handle unavailable local storage gracefully.
- Clean up chapter-specific listeners, timers, and temporary entities using the original engine's lifecycle.

Do not:
- Add a separate gameplay renderer or animation loop.
- Duplicate player movement or collision logic.
- Change Classic Mode balance or visuals when Story Mode is not active.
- Use random patterns that can produce unavoidable collisions.
- Add fantasy creatures, supernatural attacks, or unrealistic vehicles.

## 13. Acceptance criteria

The feature is ready for release only when:

- [ ] Story Mode launches through the original Relic Rush gameplay engine.
- [ ] Classic Mode behaves exactly as before.
- [ ] Each chapter has a distinct, believable visual skin.
- [ ] Each chapter has its own tested encounter pattern and phase progression.
- [ ] Every encounter has accurate warnings and at least one reachable safe route.
- [ ] Required collectibles and chapter objectives register through the original engine's events.
- [ ] Perfect dodge rewards are optional and work consistently, if implemented.
- [ ] Hidden challenges can be discovered and completed fairly.
- [ ] Chapter ranks reflect the documented criteria.
- [ ] Failure feedback identifies the relevant hazard or missing objective.
- [ ] Retry resets the current chapter attempt without erasing prior campaign progress.
- [ ] Campaign completion and the Perfect Escape challenge save and restore correctly.
- [ ] Desktop and mobile controls, audio, pause, and responsive HUD are tested.
- [ ] No fantasy beasts, monsters, or impossible hazards appear in the campaign.

---

## Reference note

*Shangri-La Frontier* is a creative reference for encounter structure: pattern recognition, escalation, mastery, optional discoveries, and rewarding difficult achievements. Japa Rush translates those principles into a grounded Nigerian setting. It should not copy the anime's characters, monsters, names, artwork, dialogue, or story.
