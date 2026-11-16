import test from "node:test";
import assert from "node:assert/strict";
import { recycleSceneryChunks, resetSceneryChunks } from "../src/game/scenery-stream.js";

function chunksAt(positions) {
  return positions.map((z) => ({ position: { z } }));
}

test("scenery sections stay at the authored pitch when a section passes the player", () => {
  const chunks = chunksAt([12, -118, -248]);
  const recycled = recycleSceneryChunks(chunks, { minZ: -143, maxZ: -9, spacing: 130 }, 2.2);
  assert.equal(recycled, 1);
  assert.deepEqual(chunks.map((chunk) => chunk.position.z), [-378, -118, -248]);
  const ordered = chunks.map((chunk) => chunk.position.z).sort((a, b) => b - a);
  assert.deepEqual(ordered, [-118, -248, -378]);
});

test("scenery is not recycled before its actual nearest bound passes the player", () => {
  const chunks = chunksAt([10, -120, -250]);
  const recycled = recycleSceneryChunks(chunks, { minZ: -143, maxZ: -9, spacing: 130 }, 2.2);
  assert.equal(recycled, 0);
  assert.deepEqual(chunks.map((chunk) => chunk.position.z), [10, -120, -250]);
});

test("large movement recycles every section that has passed the player", () => {
  const chunks = chunksAt([300, 170, 40]);
  recycleSceneryChunks(chunks, { minZ: -143, maxZ: -9, spacing: 130 }, 2.2);
  const positions = chunks.map((chunk) => chunk.position.z).sort((a, b) => b - a);
  assert.deepEqual(positions, [-90, -220, -350]);
});

test("chapter restart restores every scenery section to its initial position", () => {
  const chunks = chunksAt([-378, -118, -248]);
  resetSceneryChunks(chunks, [0, -130, -260]);
  assert.deepEqual(chunks.map((chunk) => chunk.position.z), [0, -130, -260]);
});
