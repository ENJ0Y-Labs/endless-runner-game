// Pure position logic for the repeating Chapter 1 streetscape. No Three.js or DOM.
export function recycleSceneryChunks(chunks, bounds, playerZ, deltaZ = 0) {
  if (!Array.isArray(chunks) || chunks.length < 2 || !bounds) return 0;
  const { maxZ, spacing } = bounds;
  if (!Number.isFinite(maxZ) || !Number.isFinite(spacing) || spacing <= 0) return 0;

  // Every streetscape piece advances by the same delta as the road.
  for (const chunk of chunks) chunk.position.z += deltaZ;

  let recycled = 0;
  for (const chunk of chunks) {
    // maxZ is the actual nearest edge of the authored scenery mesh.
    while (chunk.position.z + maxZ > playerZ) {
      const furthestSection = Math.min(
        ...chunks.filter((candidate) => candidate !== chunk).map((candidate) => candidate.position.z),
      );
      if (!Number.isFinite(furthestSection)) break;
      chunk.position.z = furthestSection - spacing;
      recycled += 1;
    }
  }
  return recycled;
}

export function resetSceneryChunks(chunks, initialPositions) {
  if (!Array.isArray(chunks) || !Array.isArray(initialPositions)) return;
  const count = Math.min(chunks.length, initialPositions.length);
  for (let i = 0; i < count; i += 1) {
    if (Number.isFinite(initialPositions[i])) chunks[i].position.z = initialPositions[i];
  }
}
