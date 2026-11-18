# Japa Rush: Zone and Encounter Content Update

> Status: Proposed content update  
> Product: Relic Rush 3D  
> Mode: Story Mode — Japa Rush  
> Applies to: Four-zone story arc  
> Last updated: 15 November 2026

## Purpose

This document records the revised four-zone setting and encounter direction supplied for Japa Rush. It expands the chapter environments and hazard roster without changing the existing three-lane runner controls, chapter objective model, Classic Mode, or implementation boundaries.

The four zones form one continuous fictional journey from Lagos streets to an international departure gate. These are game environments, not literal depictions of named institutions or claims about real people.

## Shared content and safety rules

- Keep all officials, uniforms, insignia, institutions, notices, money tokens, and political messaging fictional. Do not reproduce real agency logos, police or military insignia, party branding, identifiable officials, or real-person likenesses.
- Use neutral, non-ethnic visual descriptions for civilian characters and groups. In particular, Zone 2's cattle-crossing hazard is livestock crossing the road; do not make Fulani people or herders enemies, targets, or hostile minions.
- Human hazards must be readable, avoidable lane obstacles or checkpoint interactions. Do not depict violence against civilians or encourage targeting a protected group.
- Do not add weapons use, combat, shooting, or a health system. Armed-robbery pressure is represented through abandoned getaway vehicles, blocked lanes, warning props, and a clearly signposted escape route, not attackers to fight.
- Existing controls remain lane-left, lane-right, and jump. Do not add sliding, combat, stealth, driving, or timed missions.
- Money tokens remain fictional collectibles with no cash value. Checkpoint fees are an in-game objective interaction only and must not imply real-world payment.
- Immigration, customs, and airport staff should be represented as queue/checkpoint obstacles, document checks, or lane-control gates. The player does not attack, run over, or physically assault them.
- Every hazard needs an explicit collision class, lane footprint, movement behaviour, warning cue, and reachable alternative. Required items and money pickups must never be trapped behind an unavoidable hazard.

## Zone 1: Lagos Hustle

**Role in story:** Establish the journey and teach the player to read dense city traffic.

**Environment and landmarks**
- Busy Lagos street with danfo-style minibuses, roadside hawkers, market kiosks, streetlights, power lines, and layered urban silhouettes.
- Third Mainland Bridge visible in the distance as a recognisable route landmark. Use a stylised, non-photorealistic silhouette rather than copying a specific photograph.
- Warm golden-hour lighting, orange and mango-yellow accents, asphalt grey, dusty roadside edges, and lively but legible roadside motion.
- Keep the road horizon and bridge direction consistent as scenery recycles so the loop does not visibly reset.

**Hazards**
- Potholes: low, static, jumpable road hazards with a clear dark rim and shallow depth.
- Okada-style motorcycles: moving lane hazards with a visible drift or indicator cue before entering the player's path.
- Pedestrian crowd clusters: non-hostile, static or gently moving lane obstructions. Do not label people as “street urchins” or make poverty the joke.
- Fictional “One Chance” minibuses: tall, lane-blocking vehicles; lane avoidance only and never jumpable.
- Danfo buses may be either decorative traffic or active hazards. Decorative vehicles must be visually and collision-distinct from active hazards.

**Checkpoint minions: fictional traffic officers**
- Use fictional checkpoint attendants/traffic officers with generic clothing and no real police insignia.
- The interaction is a lane checkpoint, not combat. The player can pay a small configurable token fee from the collected in-game money to pass without a slowdown.
- If the player has insufficient tokens, apply a brief, bounded movement slowdown and clear HUD feedback. Do not deduct below zero, create a soft-lock, or add a timer/health mechanic.
- The checkpoint must leave at least one readable route through it. The slowdown must not make a previously avoidable hazard unavoidable.
- This interaction is optional to implement until the core chapter flow is stable; it must not replace the required chapter money target or make completion impossible.

**Chapter 1 objective continuity**
- Required story item: route slip or bus ticket.
- Required money target: use the chapter configuration value, not a hardcoded render-loop constant.
- Encounter: The Last Danfo, with readable multi-phase lane patterns.
- Exit: expressway on-ramp/exit marker.

## Zone 2: The Expressway

**Role in story:** Move from dense city traffic to long-distance road hazards and document checks.

**Environment and landmarks**
- Long, open highway with a clear vanishing point, shoulders, road barriers, distant overpasses, abandoned trucks, and fuel-queue silhouettes.
- Use a cooler, more muted palette than Zone 1, with heat haze and strong road perspective.
- Keep background traffic and parked vehicles decorative unless explicitly marked as active hazards.

**Hazards**
- Fuel tankers: tall, lane-blocking vehicles; lane avoidance only, never jumpable.
- Fallen containers: wide static roadblocks with clearly visible gaps; patterns must preserve at least one reachable lane.
- Cattle crossing: livestock moving across the road with a warning cue and predictable crossing direction. Do not depict Fulani herdsmen as enemies or hazards. If a human handler is shown, they are neutral scenery and never a collision target.
- Armed-robbery scenario: communicate danger through abandoned vehicles, fictional warning signs, blocked shoulders, and a staged escape corridor. No gunfire, weapons interaction, attack animation, or combat mechanics.

**Checkpoint minions: fictional customs officials**
- Generic checkpoint staff and booth silhouettes, without real uniforms, seals, flags, or agency names.
- Their gameplay role is document/route-lane inspection: barriers open and close in a readable sequence, requiring lane selection.
- They are not targets and do not chase or attack the runner.

**Chapter 2 objective continuity**
- Required story item: travel folder/document envelope.
- Required money target: configurable chapter target.
- Encounter: The Tanker Convoy.
- Exit: checkpoint beyond the expressway.

## Zone 3: Aso Rock Run

**Role in story:** The satirical pressure point of the journey, set in a fictionalised seat-of-power district.

**Environment and landmarks**
- Aso Rock-inspired monumental rock formation looming in the distance, with a stylised government-district skyline.
- Fictional propaganda billboards, oversized public notices, barricade lines, security floodlights, and broad ceremonial roads.
- Use fictional slogans and invented institutions. Do not reproduce real campaign materials, party marks, real government seals, or portray a real politician.
- The satire should target opaque systems and excessive bureaucracy, not a nationality, ethnicity, religion, or ordinary protester.

**Hazards**
- Military-style barricades: static lane blockers with obvious openings and a safe route. Use generic fictional security styling, not real insignia.
- Tear-gas clouds: environmental visibility/route hazards with strong visual boundaries and advance warning. They should not cause damage-over-time or require a new health system; contact may trigger the existing collision/failure rule only if the effect is clearly communicated.
- “No Protest Zone” signs: fictional signboards and soft breakaway lane gates that can be passed through as arcade obstacles. Avoid implying the player is attacking protesters or real public property.
- Armoured personnel carriers: large, tall, lane-blocking set pieces or slow-moving hazards; lane avoidance only, never jumpable.

**Minions / security presence**
- Soldiers with shields and armoured vehicles may appear as distant or checkpoint silhouettes. If used as active obstacles, they occupy a lane as a predictable barrier; no combat, weapon use, or targeting.
- Keep human figures non-violent and non-graphic. Their role is to create a readable checkpoint or restricted-lane encounter.

**Chapter 3 objective continuity**
- Required story items: three fictional clearance stamps collected in order.
- Required money target: configurable chapter target.
- Encounter: The Clearance Queue.
- Exit: district exit corridor.

## Zone 4: The Japa Terminal

**Role in story:** Resolve the journey at the departure gate. The plane should remain visible as a distant goal.

**Environment and landmarks**
- Airport approach transitioning into terminal forecourt and runway-side views.
- A plane visible in the distance, terminal glass, runway lights, departure boards, luggage carts, queue ropes, and a clearly marked gate destination.
- The visual mood shifts from crowded pressure to open space and anticipation.
- Airport signage and airline marks must be fictional. Do not copy real airport security layouts or imply that the game teaches players to bypass screening.

**Hazards and checkpoint interactions**
- Immigration officers: neutral staff at a document-check lane. The gameplay obstacle is the queue barrier or closed lane, not the person.
- Visa checkpoints: fictional document kiosks and lane gates with clear open/closed states and enough reaction time to choose another lane.
- “Diaspora Tax” collection points: satirical, fictional toll-style booths or token gates. Keep the label clearly in-world and avoid real government seals or claims about actual charges. The interaction may consume a configured amount of fictional game tokens only if the chapter economy explicitly supports it.
- Luggage trolleys, queue barriers, and terminal equipment may be used as conventional hazards with appropriate collision dimensions.

**Chapter 4 objective continuity**
- Required story item: boarding pass.
- Required money target: configurable chapter target, unless the final approved chapter design explicitly removes the money gate.
- Encounter: The Final Departure.
- Exit: designated departure gate, followed by the story-complete sequence.

## Shared hazard classification

| Hazard class | Typical examples | Jumpable? | Required treatment |
|---|---|---:|---|
| Low | Potholes, cones, low soft barriers | Yes, if depth is within the configured jump limit | Low profile, clear shadow/silhouette, safe jump window |
| Tall | Danfo/One Chance bus, tanker, APC, parked truck | No | Lane avoidance only; explicit `not-jumpable` metadata |
| Moving | Okada, crossing livestock, merging convoy vehicle | Depends on physical height; tall moving vehicles are no-jump | At least one second of warning for dangerous movement; predictable trajectory |
| Checkpoint | Officer booth, customs lane, immigration/visa gate | No jump interaction by default | Readable lane states; no collision with people as targets |
| Environmental | Tear-gas cloud, visibility zone | No | Strong boundary and advance cue; no hidden damage-over-time |

All authored rows must leave at least one reachable lane from every lane state still reachable after the previous row. Required collectibles must have a safe collection path.

## Implementation and scope notes

This is a content direction update, not authorisation to implement all four zones immediately. The current approved implementation scope remains mode-selection foundation, Story Mode foundation, and the complete Chapter 1 vertical slice only. Zones 2–4 are future content and may be represented as locked chapter metadata or preview art, but must not be implemented as playable chapters until separately authorised.

For the current Chapter 1 slice, prioritise the Lagos Hustle environment, route-slip objective, money target, fair hazard patterns, The Last Danfo encounter, failure/retry, and exit completion. Add the checkpoint fee/slowdown interaction only after core objective and encounter tests pass.

## Acceptance checklist

- [ ] Four zones use the names and broad environment direction in this document.
- [ ] Zone 1 includes the Lagos street/Third Mainland Bridge visual identity.
- [ ] Zone 1 active hazards distinguish low jumpable hazards from tall lane-only vehicles.
- [ ] Zone 1 checkpoint slowdown is bounded, communicated, and never creates an unavoidable collision.
- [ ] Zone 2 cattle are treated as neutral livestock, not an ethnic-group hazard.
- [ ] Zone 2 robbery tension is environmental only; no combat or weapon mechanic.
- [ ] Zone 3 uses fictional political signage and generic security styling.
- [ ] Zone 4 treats immigration/visa staff as neutral checkpoint scenery, not attack targets.
- [ ] “Diaspora Tax” is fictional in-game satire and uses no real agency branding.
- [ ] Every pattern remains solvable and every mandatory item remains reachable.
- [ ] Classic Mode visuals, hazards, state, scoring, and leaderboard behaviour remain unchanged.
- [ ] Only Zone 1 is implemented as playable in the currently approved scope.
