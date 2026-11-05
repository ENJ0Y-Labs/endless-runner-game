import test from "node:test";
import assert from "node:assert/strict";
import { GAME_CONFIG } from "../src/game/config.js";

test("game has exactly three ordered lanes", () => {
  assert.equal(GAME_CONFIG.laneCount, 3);
  assert.equal(GAME_CONFIG.laneX.length, GAME_CONFIG.laneCount);
  assert.ok(GAME_CONFIG.laneX.every(Number.isFinite));
  assert.ok(GAME_CONFIG.laneX[0] < GAME_CONFIG.laneX[1]);
  assert.ok(GAME_CONFIG.laneX[1] < GAME_CONFIG.laneX[2]);
});

test("run speed increases gradually and has a valid cap", () => {
  assert.ok(GAME_CONFIG.initialSpeed > 0);
  assert.ok(GAME_CONFIG.maximumSpeed >= GAME_CONFIG.initialSpeed);
  assert.ok(GAME_CONFIG.speedIncreasePerSecond > 0);
  assert.ok(GAME_CONFIG.attractSpeed > 0);
});

test("relics award positive score", () => {
  assert.ok(Number.isInteger(GAME_CONFIG.relicScore));
  assert.ok(GAME_CONFIG.relicScore > 0);
});

test("obstacle spacing tightens without becoming invalid", () => {
  assert.ok(GAME_CONFIG.maxRowGap > GAME_CONFIG.minRowGap);
  assert.ok(GAME_CONFIG.minRowGap > 0);
  assert.ok(GAME_CONFIG.rowGapShrinkPerSecond > 0);
  assert.ok(GAME_CONFIG.difficultyRampSeconds > 0);
  assert.ok(GAME_CONFIG.maxDoubleRowChance >= 0);
  assert.ok(GAME_CONFIG.maxDoubleRowChance <= 1);
});

test("gameplay configuration is immutable", () => {
  assert.ok(Object.isFrozen(GAME_CONFIG));
  assert.ok(Object.isFrozen(GAME_CONFIG.laneX));
});
