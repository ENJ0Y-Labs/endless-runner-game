import * as THREE from 'three'
import './style.css'

const app = document.querySelector('#app')
app.innerHTML = `
  <main class="game-shell">
    <header class="game-hud">
      <span class="game-brand">RELIC RUSH <b>3D</b></span>
      <div class="player-identity" id="player-identity" aria-live="polite"><span class="player-avatar" aria-hidden="true">R</span><span class="player-identity-copy"><strong id="player-name">Guest</strong><small id="player-account">Guest player</small></span><button class="sign-in-button" id="player-sign-in" type="button">Sign in</button></div>
      <div class="hud-stats"><span>SCORE <strong id="score">0</strong></span><span>DISTANCE <strong id="distance">0 m</strong></span><span>RELICS <strong id="relics">0</strong></span><span>BEST <strong id="best-score">0</strong></span></div>
      <button class="pause-button" id="pause-button" type="button" hidden>Pause</button>
    </header>
    <div class="scene-container" aria-label="Three-dimensional endless runner game">
      <div class="scene-loading" id="scene-loading" role="status" aria-live="polite"><span class="loading-indicator" aria-hidden="true"></span> Preparing your track…</div>
      <section class="game-overlay" id="start-overlay">
        <p class="eyebrow">Start.ng game</p><h1>Relic Rush <span>3D</span></h1>
        <p>Switch lanes, dodge danger, and collect relics.</p>
        <div class="instruction-grid" aria-label="How to play">
          <div class="instruction-card"><span class="instruction-icon" aria-hidden="true">← →</span><strong>Switch lanes</strong><small>Arrow keys or A / D</small></div>
          <div class="instruction-card"><span class="instruction-icon" aria-hidden="true">✦</span><strong>Collect relics</strong><small>Each relic adds 100 points</small></div>
          <div class="instruction-card"><span class="instruction-icon" aria-hidden="true">!</span><strong>Avoid obstacles</strong><small>One collision ends the run</small></div>
        </div>
        <button class="primary-button" id="play-button" type="button">Start running</button>
        <p class="overlay-hint">On mobile, swipe left or right or use the on-screen arrows.</p>
      </section>
      <section class="game-overlay" id="pause-overlay" hidden>
        <p class="eyebrow">Run paused</p><h2>Take a breather.</h2>
        <div class="overlay-actions">
          <button class="primary-button" id="resume-button" type="button">Resume</button>
          <button class="secondary-button" id="pause-restart-button" type="button">Restart run</button>
        </div>
      </section>
      <section class="game-overlay" id="gameover-overlay" hidden>
        <p class="eyebrow">Run complete</p><h2>Game over</h2>
        <p>Final score: <strong id="final-score">0</strong> · Distance: <strong id="final-distance">0 m</strong> · Relics: <strong id="final-relics">0</strong></p><p class="best-run-summary">Best run: <strong id="final-best-score">0</strong></p>
        <button class="primary-button" id="restart-button" type="button">Run again</button>
      </section>
      <div class="touch-controls" aria-label="Lane controls">
        <button type="button" id="left-button" aria-label="Move left">←</button>
        <button type="button" id="right-button" aria-label="Move right">→</button>
      </div>
    </div>
    <footer class="scene-help"><span class="help-key">A</span><span class="help-key">D</span><span>Move between lanes · Swipe or use the arrows on mobile</span></footer>
    <section class="leaderboard-panel" aria-labelledby="leaderboard-title">
      <div class="leaderboard-heading">
        <div><p class="eyebrow">Community best runs</p><h2 id="leaderboard-title">Leaderboard</h2></div>
        <button class="secondary-button leaderboard-refresh" id="leaderboard-refresh" type="button">Refresh</button>
      </div>
      <p id="leaderboard-message" class="leaderboard-message" role="status" aria-live="polite">Loading Start.ng leaderboard…</p>
      <p id="score-save-message" class="score-save-message" role="status" aria-live="polite">Finish a run to submit your score.</p>
      <div class="leaderboard-table-wrap">
        <table class="leaderboard-table">
          <thead><tr><th scope="col">Rank</th><th scope="col">Player</th><th scope="col">Score</th><th scope="col">Distance</th><th scope="col">Relics</th></tr></thead>
          <tbody id="leaderboard-entries"><tr><td colspan="5">Loading scores…</td></tr></tbody>
        </table>
      </div>
      <p class="leaderboard-note">Ranked by score, then distance and relics. Start.ng stores each signed-in player’s best run.</p>
    </section>
  </main>`

const container = app.querySelector('.scene-container')
const scene = new THREE.Scene()
scene.background = new THREE.Color('#101820')
scene.fog = new THREE.Fog('#101820', 24, 115)

const camera = new THREE.PerspectiveCamera(58, 1, 0.1, 180)
camera.position.set(0, 5.3, 10.5)
camera.lookAt(0, 1.2, -5)

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.outputColorSpace = THREE.SRGBColorSpace
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1.15
container.appendChild(renderer.domElement)

scene.add(new THREE.HemisphereLight('#c9e7ff', '#26303a', 2.1))
const sun = new THREE.DirectionalLight('#fff0d5', 3.2)
sun.position.set(-7, 14, 5)
sun.castShadow = true
sun.shadow.mapSize.set(1024, 1024)
sun.shadow.camera.left = -12
sun.shadow.camera.right = 12
sun.shadow.camera.top = 18
sun.shadow.camera.bottom = -18
scene.add(sun)

const ground = new THREE.Mesh(new THREE.PlaneGeometry(180, 180), new THREE.MeshStandardMaterial({ color: '#17232b', roughness: 0.95 }))
ground.rotation.x = -Math.PI / 2
ground.position.set(0, -0.13, -30)
ground.receiveShadow = true
scene.add(ground)

const track = new THREE.Mesh(new THREE.BoxGeometry(7.4, 0.22, 120), new THREE.MeshStandardMaterial({ color: '#303b46', roughness: 0.9 }))
track.position.set(0, 0, -42)
track.receiveShadow = true
scene.add(track)

const edgeMaterial = new THREE.MeshStandardMaterial({ color: '#ff7a00', emissive: '#6b2b00', emissiveIntensity: 0.6 })
for (const x of [-3.62, 3.62]) {
  const edge = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.035, 120), edgeMaterial)
  edge.position.set(x, 0.135, -42)
  scene.add(edge)
}
const markings = []
const markingMaterial = new THREE.MeshStandardMaterial({ color: '#9caab5', roughness: 0.8 })
for (const x of [-1.23, 1.23]) {
  for (let i = 0; i < 20; i++) {
    const mark = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.018, 2.1), markingMaterial)
    mark.position.set(x, 0.125, 10 - i * 5.6)
    scene.add(mark)
    markings.push(mark)
  }
}

// Character geometry is rebuilt from Start.ng style data; unknown values use safe defaults.
const player = new THREE.Group()
player.position.set(0, 0.16, 2.2)
scene.add(player)

const DEFAULT_STYLE = {
  body: 'male',
  primaryColor: '#ff7a00',
  secondaryColor: '#202735',
  skinColor: '#c98961',
  hairColor: '#17120f',
  hair: 'short',
  hat: 'none',
  accessory: 'none',
}
const STYLE_OPTIONS = {
  body: ['female', 'male'],
  hair: ['short', 'afro', 'braids', 'bun', 'ponytail', 'dreads', 'bald'],
  hat: ['none', 'cap', 'beanie', 'tophat', 'crown'],
  accessory: ['none', 'glasses', 'earrings', 'beard', 'scarf', 'backpack'],
}
function safeColor(value, fallback) {
  return typeof value === 'string' && /^#?[0-9a-f]{6}$/i.test(value.trim())
    ? `#${value.trim().replace(/^#/, '')}`
    : fallback
}
function safeOption(value, allowed, fallback) {
  return typeof value === 'string' && allowed.includes(value.toLowerCase()) ? value.toLowerCase() : fallback
}
function normalizeStyle(style) {
  const value = style && typeof style === 'object' ? style : {}
  return {
    body: safeOption(value.body, STYLE_OPTIONS.body, DEFAULT_STYLE.body),
    primaryColor: safeColor(value.primaryColor, DEFAULT_STYLE.primaryColor),
    secondaryColor: safeColor(value.secondaryColor, DEFAULT_STYLE.secondaryColor),
    skinColor: safeColor(value.skinColor, DEFAULT_STYLE.skinColor),
    hairColor: safeColor(value.hairColor, DEFAULT_STYLE.hairColor),
    hair: safeOption(value.hair, STYLE_OPTIONS.hair, DEFAULT_STYLE.hair),
    hat: safeOption(value.hat, STYLE_OPTIONS.hat, DEFAULT_STYLE.hat),
    accessory: safeOption(value.accessory, STYLE_OPTIONS.accessory, DEFAULT_STYLE.accessory),
  }
}
function rebuildPlayer(rawStyle) {
  const style = normalizeStyle(rawStyle)
  for (const child of [...player.children]) {
    player.remove(child)
    child.geometry?.dispose()
    if (Array.isArray(child.material)) child.material.forEach((material) => material.dispose())
    else child.material?.dispose()
  }
  const material = (color, roughness = 0.78, metalness = 0) =>
    new THREE.MeshStandardMaterial({ color, roughness, metalness })
  const skin = material(style.skinColor)
  const shirt = material(style.primaryColor, 0.72)
  const trousers = material(style.secondaryColor, 0.8)
  const hair = material(style.hairColor)
  const shoes = material('#f2f2f2', 0.65)
  const dark = material('#171a20', 0.55)
  const gold = material('#ffd45c', 0.3, 0.55)
  const addPart = (geometry, partMaterial, position, scale) => {
    const mesh = new THREE.Mesh(geometry, partMaterial)
    mesh.position.set(...position)
    if (scale) mesh.scale.set(...scale)
    mesh.castShadow = true
    mesh.receiveShadow = true
    player.add(mesh)
    return mesh
  }
  const female = style.body === 'female'
  addPart(new THREE.BoxGeometry(female ? 0.48 : 0.57, 0.68, 0.32), shirt, [0, 1.18, 0])
  addPart(new THREE.SphereGeometry(0.245, 8, 6), skin, [0, 1.77, 0])
  addPart(new THREE.BoxGeometry(0.15, 0.5, 0.17), skin, [-0.37, 1.18, 0])
  addPart(new THREE.BoxGeometry(0.15, 0.5, 0.17), skin, [0.37, 1.18, 0])
  if (female) {
    addPart(new THREE.CylinderGeometry(0.22, 0.37, 0.42, 7), trousers, [0, 0.68, 0])
    addPart(new THREE.BoxGeometry(0.17, 0.42, 0.19), skin, [-0.14, 0.31, 0])
    addPart(new THREE.BoxGeometry(0.17, 0.42, 0.19), skin, [0.14, 0.31, 0])
  } else {
    addPart(new THREE.BoxGeometry(0.2, 0.58, 0.22), trousers, [-0.16, 0.55, 0])
    addPart(new THREE.BoxGeometry(0.2, 0.58, 0.22), trousers, [0.16, 0.55, 0])
  }
  addPart(new THREE.BoxGeometry(0.22, 0.13, 0.36), shoes, [-0.16, 0.22, -0.04])
  addPart(new THREE.BoxGeometry(0.22, 0.13, 0.36), shoes, [0.16, 0.22, -0.04])

  if (style.hair !== 'bald') {
    if (style.hair === 'afro') {
      addPart(new THREE.SphereGeometry(0.3, 8, 6), hair, [0, 1.94, -0.015])
    } else {
      addPart(new THREE.SphereGeometry(0.255, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), hair, [0, 1.83, 0])
      if (style.hair === 'braids' || style.hair === 'dreads') {
        for (let i = -2; i <= 2; i++) {
          addPart(new THREE.CylinderGeometry(0.035, 0.045, style.hair === 'dreads' ? 0.5 : 0.42, 5), hair, [i * 0.075, 1.62, -0.03])
        }
      } else if (style.hair === 'bun') {
        addPart(new THREE.SphereGeometry(0.11, 7, 5), hair, [0, 2.02, -0.13])
      } else if (style.hair === 'ponytail') {
        addPart(new THREE.CylinderGeometry(0.045, 0.06, 0.42, 5), hair, [0, 1.62, -0.2], [1, 1, 0.8])
      }
    }
  }
  if (style.hat === 'cap') {
    addPart(new THREE.SphereGeometry(0.27, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), shirt, [0, 1.96, 0])
    addPart(new THREE.BoxGeometry(0.3, 0.035, 0.2), shirt, [0, 1.9, 0.18])
  } else if (style.hat === 'beanie') {
    addPart(new THREE.SphereGeometry(0.265, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), shirt, [0, 1.94, 0])
    addPart(new THREE.CylinderGeometry(0.24, 0.24, 0.08, 8), shirt, [0, 1.86, 0])
  } else if (style.hat === 'tophat') {
    addPart(new THREE.CylinderGeometry(0.16, 0.16, 0.28, 8), dark, [0, 2.04, 0])
    addPart(new THREE.CylinderGeometry(0.26, 0.26, 0.045, 8), dark, [0, 1.9, 0])
  } else if (style.hat === 'crown') {
    addPart(new THREE.CylinderGeometry(0.2, 0.23, 0.13, 5), gold, [0, 1.98, 0])
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2
      addPart(new THREE.ConeGeometry(0.045, 0.13, 4), gold, [Math.cos(angle) * 0.17, 2.09, Math.sin(angle) * 0.17])
    }
  }
  if (style.accessory === 'glasses') {
    addPart(new THREE.BoxGeometry(0.18, 0.1, 0.035), dark, [-0.105, 1.79, 0.225])
    addPart(new THREE.BoxGeometry(0.18, 0.1, 0.035), dark, [0.105, 1.79, 0.225])
    addPart(new THREE.BoxGeometry(0.07, 0.025, 0.035), dark, [0, 1.8, 0.225])
  } else if (style.accessory === 'earrings') {
    addPart(new THREE.TorusGeometry(0.055, 0.018, 5, 8), gold, [-0.24, 1.68, 0.08])
    addPart(new THREE.TorusGeometry(0.055, 0.018, 5, 8), gold, [0.24, 1.68, 0.08])
  } else if (style.accessory === 'beard') {
    addPart(new THREE.SphereGeometry(0.15, 7, 5), hair, [0, 1.61, 0.12], [1, 0.7, 0.65])
  } else if (style.accessory === 'scarf') {
    addPart(new THREE.TorusGeometry(0.18, 0.065, 5, 8), trousers, [0, 1.48, 0])
    addPart(new THREE.BoxGeometry(0.1, 0.3, 0.08), trousers, [0.13, 1.31, 0.19])
  } else if (style.accessory === 'backpack') {
    addPart(new THREE.BoxGeometry(0.32, 0.42, 0.15), trousers, [0, 1.15, -0.24])
  }
}
rebuildPlayer(DEFAULT_STYLE)

const scenery = []
const trunkMaterial = new THREE.MeshStandardMaterial({ color: '#62452f', roughness: 1 })
const leafMaterials = [
  new THREE.MeshStandardMaterial({ color: '#286653', roughness: 1 }),
  new THREE.MeshStandardMaterial({ color: '#34765d', roughness: 1 }),
]
for (let i = 0; i < 18; i++) {
  for (const side of [-1, 1]) {
    const group = new THREE.Group()
    group.position.set(side * (5.5 + (i % 3) * 0.7), 0, -i * 6.7 - 5)
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.2, 1.35, 6), trunkMaterial)
    trunk.position.y = 0.68
    trunk.castShadow = true
    group.add(trunk)
    const leaves = new THREE.Mesh(new THREE.ConeGeometry(0.85, 1.9, 7), leafMaterials[i % leafMaterials.length])
    leaves.position.y = 1.95
    leaves.castShadow = true
    group.add(leaves)
    scene.add(group)
    scenery.push(group)
  }
}

// Reusable obstacle and relic pools keep the scene bounded during long runs.
const obstaclePool = []
const relicPool = []
const obstacleMaterial = new THREE.MeshStandardMaterial({ color: '#d94b35', roughness: 0.75 })
const obstacleStripeMaterial = new THREE.MeshStandardMaterial({ color: '#ffb15c', roughness: 0.6 })
const relicMaterial = new THREE.MeshStandardMaterial({ color: '#ffd45c', emissive: '#a66a00', emissiveIntensity: 1.15, metalness: 0.55, roughness: 0.28 })
function createObstacle() {
  const group = new THREE.Group()
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.95, 0.7), obstacleMaterial)
  body.position.y = 0.6
  body.castShadow = true
  body.receiveShadow = true
  group.add(body)
  const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.94, 0.13, 0.72), obstacleStripeMaterial)
  stripe.position.y = 0.68
  stripe.castShadow = true
  group.add(stripe)
  group.visible = false
  scene.add(group)
  return { group, lane: 1, active: false }
}
function createRelic() {
  const mesh = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.11, 8, 16), relicMaterial)
  mesh.position.y = 1.15
  mesh.rotation.x = Math.PI / 2
  mesh.castShadow = true
  mesh.visible = false
  scene.add(mesh)
  return { mesh, lane: 1, active: false, phase: Math.random() * Math.PI * 2 }
}
for (let i = 0; i < 7; i++) obstaclePool.push(createObstacle())
for (let i = 0; i < 12; i++) relicPool.push(createRelic())

function placeObstacle(item, z) {
  item.lane = Math.floor(Math.random() * 3)
  item.group.position.set(LANE_X[item.lane], 0.12, z)
  item.group.visible = true
  item.active = true
}
function placeRelic(item, z, lane = Math.floor(Math.random() * 3)) {
  item.lane = lane
  item.mesh.position.set(LANE_X[lane], 1.15, z)
  item.mesh.visible = true
  item.active = true
}
function hideWorldObjects() {
  for (const item of obstaclePool) { item.active = false; item.group.visible = false }
  for (const item of relicPool) { item.active = false; item.mesh.visible = false }
}
function seedWorldObjects() {
  hideWorldObjects()
  obstaclePool.forEach((item, i) => placeObstacle(item, -28 - i * 15))
  relicPool.forEach((item, i) => placeRelic(item, -20 - i * 8, i % 3))
}
function resetWorldObjects() {
  seedWorldObjects()
}

// Start.ng's documented connect-page protocol. No credentials are handled by the game.
const START_NG_ORIGIN = 'https://start.ng'
let startNgFramePromise
function connectFrame() {
  if (!startNgFramePromise) {
    startNgFramePromise = new Promise((resolve, reject) => {
      const frame = document.createElement('iframe')
      frame.src = `${START_NG_ORIGIN}/connect`
      frame.hidden = true
      frame.title = 'Start.ng player connection'
      frame.onload = () => resolve(frame)
      frame.onerror = () => {
        frame.remove()
        reject(new Error('Could not load Start.ng connection'))
      }
      document.body.append(frame)
    }).catch((error) => {
      // A failed iframe must not poison every later retry for this page session.
      startNgFramePromise = undefined
      throw error
    })
  }
  return startNgFramePromise
}
async function askStartNg(message, replyType, timeoutMs = 5000) {
  const frame = await connectFrame()
  return new Promise((resolve) => {
    const requestId = Math.random().toString(36).slice(2)
    let settled = false
    const finish = (reply) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      window.removeEventListener('message', onMessage)
      resolve(reply)
    }
    const onMessage = (event) => {
      if (event.origin !== START_NG_ORIGIN || event.source !== frame.contentWindow) return
      if (event.data?.type === replyType && event.data.requestId === requestId) finish(event.data)
    }
    const timer = window.setTimeout(() => finish(null), timeoutMs)
    window.addEventListener('message', onMessage)
    frame.contentWindow.postMessage({ ...message, requestId }, START_NG_ORIGIN)
  })
}
const playerNameElement = app.querySelector('#player-name')
const playerAccountElement = app.querySelector('#player-account')
const playerSignInButton = app.querySelector('#player-sign-in')
let currentStartNgPlayer = null
let identityRefresh = false
let isStartNgSignedIn = false
function applyPlayerIdentity(reply) {
  const signedInUser = reply?.user ?? null
  isStartNgSignedIn = Boolean(signedInUser)
  const platformPlayer = signedInUser ?? reply?.guest ?? {
    name: 'Guest',
    style: DEFAULT_STYLE,
  }
  currentStartNgPlayer = platformPlayer
  rebuildPlayer(platformPlayer.style)
  playerNameElement.textContent = typeof platformPlayer.name === 'string' && platformPlayer.name.trim()
    ? platformPlayer.name
    : 'Guest'
  playerAccountElement.textContent = signedInUser?.account
    ? `@${signedInUser.account}`
    : 'Guest player'
  playerSignInButton.hidden = Boolean(signedInUser)
  app.querySelector('.player-avatar').textContent = signedInUser ? '★' : 'G'
  playerSignInButton.setAttribute('aria-label', 'Sign in to Start.ng')
}
async function refreshStartNgPlayer() {
  if (identityRefresh || document.visibilityState === 'hidden') return
  identityRefresh = true
  try {
    const reply = await askStartNg({ type: 'startng:whoami' }, 'startng:user')
    if (reply) {
      applyPlayerIdentity(reply)
      void refreshLeaderboard()
    }
  } catch (error) {
    // Local previews and unavailable platform connections keep the safe guest appearance.
    console.info('Start.ng player connection is not available in this context.')
  } finally {
    identityRefresh = false
  }
}
playerSignInButton.addEventListener('click', () => {
  const returnTo = `${location.origin}${location.pathname}`
  location.href = `${START_NG_ORIGIN}/?return_to=${encodeURIComponent(returnTo)}`
})
applyPlayerIdentity(null)
void refreshStartNgPlayer()
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') void refreshStartNgPlayer()
})
window.addEventListener('focus', () => void refreshStartNgPlayer())

const leaderboardMessage = app.querySelector('#leaderboard-message')
const scoreSaveMessage = app.querySelector('#score-save-message')
const leaderboardEntries = app.querySelector('#leaderboard-entries')
function refreshLeaderboard() {
  leaderboardMessage.textContent = 'Loading Start.ng leaderboard…'
  return askStartNg({ type: 'startng:leaderboard', limit: 10 }, 'startng:leaderboardData')
    .then((reply) => {
      if (!reply?.ok || !Array.isArray(reply.entries)) {
        leaderboardEntries.replaceChildren()
        const row = document.createElement('tr')
        const cell = document.createElement('td')
        cell.colSpan = 5
        cell.textContent = 'Leaderboard is unavailable right now.'
        row.append(cell)
        leaderboardEntries.append(row)
        leaderboardMessage.textContent = reply?.error || 'Could not load scores. Try refreshing.'
        return
      }
      leaderboardEntries.replaceChildren()
      if (reply.entries.length === 0) {
        const row = document.createElement('tr')
        const cell = document.createElement('td')
        cell.colSpan = 5
        cell.textContent = 'No scores yet. Be the first to finish a run!'
        row.append(cell)
        leaderboardEntries.append(row)
      }
      for (const entry of reply.entries) {
        const row = document.createElement('tr')
        if (isStartNgSignedIn && currentStartNgPlayer?.id != null &&
            String(entry.player_id) === String(currentStartNgPlayer.id)) {
          row.classList.add('current-player-row')
        }
        const values = [
          `#${Number.isInteger(entry.rank) ? entry.rank : '—'}`,
          typeof entry.name === 'string' && entry.name.trim() ? entry.name : 'Player',
          entry.stats?.score ?? entry.score ?? 0,
          entry.stats?.distance ?? 0,
          entry.stats?.relics ?? 0,
        ]
        for (const [index, value] of values.entries()) {
          const cell = document.createElement('td')
          cell.textContent = String(value)
          if (index === 1) cell.className = 'leaderboard-player-name'
          row.append(cell)
        }
        leaderboardEntries.append(row)
      }
      leaderboardMessage.textContent = isStartNgSignedIn
        ? 'Showing the top 10 best runs. Your row is highlighted when it appears.'
        : 'Guests can view scores. Sign in to save your own best run.'
    })
    .catch(() => {
      leaderboardMessage.textContent = 'Could not contact Start.ng. Check your connection and try again.'
      console.info('Start.ng leaderboard is not available in this context.')
    })
}
async function saveCompletedRun(result) {
  if (!isStartNgSignedIn) {
    scoreSaveMessage.textContent = 'Guest run not saved. Sign in to Start.ng to save your best score.'
    return
  }
  scoreSaveMessage.textContent = 'Saving your completed run…'
  let saved
  try {
    saved = await askStartNg({
      type: 'startng:score',
      stats: { score: result.score, distance: result.distance, relics: result.relics },
    }, 'startng:scoreSaved')
  } catch {
    scoreSaveMessage.textContent = 'Could not contact Start.ng. Your run is complete, but the score was not confirmed.'
    return
  }
  if (!saved) {
    scoreSaveMessage.textContent = 'Score save timed out. Your run is still playable; try again after reconnecting.'
    return
  }
  if (!saved.ok) {
    scoreSaveMessage.textContent = saved.error || 'Start.ng could not save this score. Try again later.'
    if (typeof saved.error === 'string' && saved.error.toLowerCase().includes('sign in')) {
      // An expired session must not leave a signed-in identity displayed as authenticated.
      applyPlayerIdentity(null)
      void refreshLeaderboard()
    }
    return
  }
  const outcome = saved.result
  scoreSaveMessage.textContent = outcome?.improved
    ? `New personal best! ${Number.isInteger(outcome.rank) ? `Leaderboard rank #${outcome.rank}.` : 'Your score was saved.'}`
    : `Run submitted. ${Number.isInteger(outcome?.rank) ? `Current leaderboard rank: #${outcome.rank}.` : 'Your best score is kept on the leaderboard.'}`
  await refreshLeaderboard()
}
app.querySelector('#leaderboard-refresh').addEventListener('click', () => void refreshLeaderboard())
window.addEventListener('relicrush:run-finished', (event) => {
  void saveCompletedRun(event.detail)
})
void refreshLeaderboard()

const resize = () => {
  const width = Math.max(container.clientWidth, 1)
  const height = Math.max(container.clientHeight, 1)
  camera.aspect = width / height
  camera.updateProjectionMatrix()
  renderer.setSize(width, height, false)
}
const resizeObserver = new ResizeObserver(resize)
resizeObserver.observe(container)
resize()

const LANE_X = [-2.46, 0, 2.46]
const state = { mode: 'ready', lane: 1, elapsed: 0, distance: 0, score: 0, relics: 0, speed: 13, lastRun: null, bestRun: null }
const startOverlay = app.querySelector('#start-overlay')
const pauseOverlay = app.querySelector('#pause-overlay')
const gameoverOverlay = app.querySelector('#gameover-overlay')
const pauseButton = app.querySelector('#pause-button')
const scoreElement = app.querySelector('#score')
const distanceElement = app.querySelector('#distance')
const relicsElement = app.querySelector('#relics')
const bestScoreElement = app.querySelector('#best-score')
const hideOverlays = () => {
  startOverlay.hidden = true
  pauseOverlay.hidden = true
  gameoverOverlay.hidden = true
}
function updateHud() {
  scoreElement.textContent = String(state.score)
  distanceElement.textContent = `${Math.floor(state.distance)} m`
  relicsElement.textContent = String(state.relics)
  bestScoreElement.textContent = String(state.bestRun?.score ?? 0)
}
function setMode(mode) {
  const previousMode = state.mode
  state.mode = mode
  container.dataset.mode = mode
  hideOverlays()
  pauseButton.hidden = mode !== 'running'
  if (mode === 'ready') startOverlay.hidden = false
  if (mode === 'paused') pauseOverlay.hidden = false
  if (mode === 'gameover') {
    gameoverOverlay.hidden = false
    if (previousMode === 'running') {
      const result = {
        score: state.score,
        relics: state.relics,
        distance: Math.floor(state.distance),
        timestamp: new Date().toISOString(),
      }
      state.lastRun = result
      if (!state.bestRun || result.score > state.bestRun.score) state.bestRun = result
      window.dispatchEvent(new CustomEvent('relicrush:run-finished', { detail: { ...result } }))
    }
    app.querySelector('#final-score').textContent = String(state.score)
    app.querySelector('#final-distance').textContent = `${Math.floor(state.distance)} m`
    app.querySelector('#final-relics').textContent = String(state.relics)
    app.querySelector('#final-best-score').textContent = String(state.bestRun?.score ?? state.score)
    updateHud()
  }
}
function moveLane(direction) {
  if (state.mode !== 'running') return
  state.lane = Math.max(0, Math.min(2, state.lane + direction))
}
function resetRun() {
  state.lane = 1
  state.elapsed = 0
  state.distance = 0
  state.score = 0
  state.relics = 0
  state.speed = 13
  player.position.x = 0
  player.position.y = 0.16
  camera.position.x = 0
  for (let i = 0; i < markings.length; i++) markings[i].position.z = 10 - i % 20 * 5.6
  for (let i = 0; i < scenery.length; i++) scenery[i].position.z = -Math.floor(i / 2) * 6.7 - 5
  resetWorldObjects()
  updateHud()
}
function startRun() {
  resetRun()
  setMode('running')
}
function togglePause() {
  if (state.mode === 'running') setMode('paused')
  else if (state.mode === 'paused') setMode('running')
}
// Collision systems in the next phase can end a run through this explicit hook.
window.relicRushEndRun = () => {
  if (state.mode === 'running') setMode('gameover')
}
// Stable result adapters for future Start.ng leaderboard wiring. No platform API is assumed here.
window.relicRushGetLastRun = () => state.lastRun ? { ...state.lastRun } : null
window.relicRushGetBestRun = () => state.bestRun ? { ...state.bestRun } : null
app.querySelector('#play-button').addEventListener('click', startRun)
app.querySelector('#restart-button').addEventListener('click', startRun)
app.querySelector('#resume-button').addEventListener('click', togglePause)
app.querySelector('#pause-restart-button').addEventListener('click', startRun)
pauseButton.addEventListener('click', togglePause)
app.querySelector('#left-button').addEventListener('click', () => moveLane(-1))
app.querySelector('#right-button').addEventListener('click', () => moveLane(1))
window.addEventListener('keydown', (event) => {
  const key = event.key.toLowerCase()
  if (['arrowleft', 'arrowright', ' '].includes(key)) event.preventDefault()
  if (key === 'arrowleft' || key === 'a') moveLane(-1)
  if (key === 'arrowright' || key === 'd') moveLane(1)
  if (key === 'escape' || key === 'p') togglePause()
  if ((key === 'enter' || key === ' ') && state.mode === 'ready') startRun()
  if ((key === 'enter' || key === ' ') && state.mode === 'gameover') startRun()
})
let swipeStart = null
container.addEventListener('pointerdown', (event) => {
  if (!event.isPrimary || event.button !== 0) return
  swipeStart = {
    pointerId: event.pointerId,
    x: event.clientX,
    y: event.clientY,
    handled: false,
  }
})
container.addEventListener('pointermove', (event) => {
  if (!swipeStart || swipeStart.pointerId !== event.pointerId || swipeStart.handled) return

  const dx = event.clientX - swipeStart.x
  const dy = event.clientY - swipeStart.y
  const horizontalDistance = Math.abs(dx)
  const verticalDistance = Math.abs(dy)

  // React as soon as the gesture is clearly horizontal; let vertical page scrolling work normally.
  if (horizontalDistance < 24 || horizontalDistance <= verticalDistance * 1.25) return

  swipeStart.handled = true
  moveLane(dx < 0 ? -1 : 1)
})
const clearSwipe = (event) => {
  if (swipeStart?.pointerId === event.pointerId) swipeStart = null
}
container.addEventListener('pointerup', clearSwipe)
container.addEventListener('pointercancel', clearSwipe)
setMode('ready')
seedWorldObjects()

const clock = new THREE.Clock()
function animate() {
  const delta = Math.min(clock.getDelta(), 0.05)
  if (state.mode === 'running') {
    state.elapsed += delta
    // Speed ramps up gradually, with a sensible cap to keep late-game control possible.
    state.speed = Math.min(13 + state.elapsed * 0.22, 25)
    state.distance += delta * state.speed
    state.score = Math.floor(state.distance) + state.relics * 100
    for (const mark of markings) {
      mark.position.z += delta * state.speed
      if (mark.position.z > 12) mark.position.z -= 112
    }
    for (const item of scenery) {
      item.position.z += delta * state.speed
      if (item.position.z > 12) item.position.z -= 121
    }

    for (const item of obstaclePool) {
      if (!item.active) continue
      item.group.position.z += delta * state.speed
      if (item.group.position.z > 8) {
        placeObstacle(item, -90 - Math.random() * 35)
      } else if (item.lane === state.lane && item.group.position.z > 1.45 && item.group.position.z < 3.15) {
        setMode('gameover')
        break
      }
    }
    if (state.mode === 'running') {
      for (const item of relicPool) {
        if (!item.active) continue
        item.mesh.position.z += delta * state.speed
        item.mesh.rotation.z += delta * 2.5
        item.mesh.position.y = 1.15 + Math.sin(clock.elapsedTime * 4 + item.phase) * 0.12
        // Relics are finite per run: missed relics disappear instead of respawning.
        if (item.mesh.position.z > 8) {
          item.active = false
          item.mesh.visible = false
        } else if (item.lane === state.lane && item.mesh.position.z > 1.25 && item.mesh.position.z < 3.2) {
          item.active = false
          item.mesh.visible = false
          state.relics += 1
          state.score += 100
        }
      }
    }
    updateHud()
  }
  const targetX = LANE_X[state.lane]
  // Shorten lane-transition easing so the character catches up to input sooner.
  player.position.x += (targetX - player.position.x) * Math.min(delta * 18, 1)
  player.position.y = 0.16 + (state.mode === 'running' ? Math.sin(clock.elapsedTime * 7) * 0.035 : 0)
  camera.position.x += (player.position.x * 0.22 - camera.position.x) * Math.min(delta * 2.2, 1)
  camera.lookAt(player.position.x * 0.18, 1.15, -5)
  renderer.render(scene, camera)
  const loadingStatus = app.querySelector('#scene-loading')
  if (loadingStatus && !loadingStatus.hidden) loadingStatus.hidden = true
  requestAnimationFrame(animate)
}
animate()
window.addEventListener('beforeunload', () => {
  resizeObserver.disconnect()
  renderer.dispose()
})
