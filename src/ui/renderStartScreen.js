export function renderStartScreen() {
  return `
    <main class="game-shell">
      <section class="start-panel" aria-labelledby="game-title">
        <p class="eyebrow">Start.ng game</p>
        <h1 id="game-title">Relic Rush <span>3D</span></h1>
        <p class="intro">
          Run the track, dodge obstacles, collect relics, and see how far you
          can go. The game world is being prepared.
        </p>
        <p class="status"><span class="status-dot" aria-hidden="true"></span>Initial setup in progress</p>
      </section>
    </main>
  `
}
