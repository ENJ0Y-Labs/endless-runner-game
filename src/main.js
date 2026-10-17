import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import './style.css'
import { GAME_CONFIG as CFG } from './game/config.js'

const app = document.querySelector('#app')
app.innerHTML = `
  <main class="game-shell">
    <header class="game-hud">
      <span class="game-brand">RELIC RUSH <b>3D</b></span>
      <div class="player-identity" id="player-identity" aria-live="polite"><span class="player-avatar" aria-hidden="true">R</span><span class="player-identity-copy"><strong id="player-name">Guest</strong><small id="player-account">Guest player</small></span><button class="sign-in-button" id="player-sign-in" type="button">Sign in</button></div>
      <div class="hud-stats"><span>SCORE <strong id="score">0</strong></span><span>DISTANCE <strong id="distance">0 m</strong></span><span>RELICS <strong id="relics">0</strong></span><span>BEST <strong id="best-score">0</strong></span></div>
      <span class="season-indicator" id="season-indicator" aria-live="polite">SPRING</span>
      <button class="sound-button" id="sound-toggle" type="button" aria-label="Mute sound" aria-pressed="false">Sound on</button>
      <button class="pause-button" id="pause-button" type="button" hidden>Pause</button>
    </header>
    <div class="scene-container" aria-label="Three-dimensional endless runner game">
      <div class="scene-loading" id="scene-loading" role="status" aria-live="polite"><span class="loading-indicator" aria-hidden="true"></span> Preparing your track…</div>
      <section class="game-overlay" id="start-overlay">
        <p class="eyebrow">Start.ng game</p>
        <h1 class="title-art" aria-label="Relic Rush 3D"><span class="t-line" aria-hidden="true">Relic</span><span class="t-line" aria-hidden="true">Rush <span class="t-3d">3D</span></span></h1>
        <p>Switch lanes, dodge danger, and collect relics.</p>
        <div class="instruction-grid" aria-label="How to play">
          <div class="instruction-card"><span class="instruction-icon" aria-hidden="true">← →</span><strong>Switch lanes</strong><small>Arrow keys or A / D</small></div>
          <div class="instruction-card"><span class="instruction-icon" aria-hidden="true">↑</span><strong>Jump</strong><small>Space, Up Arrow, or swipe up</small></div>
          <div class="instruction-card"><span class="instruction-icon" aria-hidden="true">✦</span><strong>Collect relics</strong><small>Each relic adds 100 points</small></div>
          <div class="instruction-card"><span class="instruction-icon" aria-hidden="true">!</span><strong>Avoid obstacles</strong><small>Jump over crates</small></div>
        </div>
        <button class="primary-button" id="play-button" type="button">Start running</button>
        <p class="overlay-hint">On mobile, swipe to move or use the on-screen controls to move and jump.</p>
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
      <div class="touch-controls" aria-label="Movement and jump controls">
        <button type="button" id="left-button" aria-label="Move left">←</button>
        <button type="button" id="jump-button" aria-label="Jump">↑</button>
        <button type="button" id="right-button" aria-label="Move right">→</button>
      </div>
    </div>
    <footer class="scene-help"><span class="help-key">A</span><span class="help-key">D</span><span class="help-key">Space / ↑</span><span>Move between lanes and jump · Swipe on mobile</span></footer>
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
const LANE_X = CFG.laneX

// ---------------------------------------------------------------------------
// Palette: sampled from the cover art (golden-hour temple ruins).
// ---------------------------------------------------------------------------
const PAL = {
  fog: '#e3b070',
  skyTop: '#d6bd96',
  skyMid: '#f6d4a0',
  skyLow: '#ffc27a',
  stone: '#a98760',
  stoneDark: '#6a5039',
  stoneDeep: '#4a3626',
  stoneBand: '#c97a2c',
  stoneLight: '#d2ae7a',
  gold: '#f2b73c',
  crate: '#d4432c',
  crateBand: '#e8b25a',
  leafDark: '#2c4a2a',
  leafMid: '#3d6430',
  leafLight: '#557a35',
}

const scene = new THREE.Scene()
scene.fog = new THREE.Fog(PAL.fog, 30, 190)

// Screen-space gradient sky (cheap: no sky dome to render or fog).
function gradientTexture(stops, width = 4, height = 256) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  const gradient = ctx.createLinearGradient(0, 0, 0, height)
  for (const [offset, color] of stops) gradient.addColorStop(offset, color)
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}
scene.background = gradientTexture([[0, PAL.skyTop], [0.38, PAL.skyMid], [0.56, PAL.skyLow], [1, PAL.fog]])
const skyCanvas = scene.background.image
const skyContext = skyCanvas.getContext('2d')

const camera = new THREE.PerspectiveCamera(56, 1, 0.1, 260)
const cameraRig = { y: 4, z: 8.4 }
let menuShift = 0 // slides the camera sideways on the start screen so the runner sits clear of the title, as on the cover
camera.position.set(0, cameraRig.y, cameraRig.z)
camera.lookAt(0, 1.9, -7)

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.outputColorSpace = THREE.SRGBColorSpace
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1.05
container.appendChild(renderer.domElement)

// Warm golden-hour light: low sun from the upper right, like the cover.
const hemisphere = new THREE.HemisphereLight('#ffe2b4', '#5a4330', 1.55)
scene.add(hemisphere)
const sun = new THREE.DirectionalLight('#ffd08a', 3.4)
sun.position.set(9, 13, -2)
sun.target.position.set(0, 0, -8)
sun.castShadow = true
sun.shadow.mapSize.set(1024, 1024)
sun.shadow.camera.left = -12
sun.shadow.camera.right = 12
sun.shadow.camera.top = 20
sun.shadow.camera.bottom = -20
sun.shadow.bias = -0.0004
scene.add(sun, sun.target)

// ---------------------------------------------------------------------------
// Geometry helpers. Static decor is merged into vertex-coloured meshes so the
// whole scene stays at a few dozen draw calls, which matters on phones.
// ---------------------------------------------------------------------------
const tmpMatrix = new THREE.Matrix4()
const tmpQuat = new THREE.Quaternion()
const tmpEuler = new THREE.Euler()
const tmpPos = new THREE.Vector3()
const tmpScale = new THREE.Vector3()
const tmpColor = new THREE.Color()
function part(geometry, color, position = [0, 0, 0], rotation = [0, 0, 0], scale = [1, 1, 1]) {
  return { geometry, color, position, rotation, scale }
}
function mergeParts(parts) {
  const prepared = parts.map((entry) => {
    const geometry = entry.geometry.index ? entry.geometry.toNonIndexed() : entry.geometry.clone()
    tmpMatrix.compose(
      tmpPos.set(...entry.position),
      tmpQuat.setFromEuler(tmpEuler.set(...entry.rotation)),
      tmpScale.set(...entry.scale),
    )
    geometry.applyMatrix4(tmpMatrix)
    const count = geometry.attributes.position.count
    const colors = new Float32Array(count * 3)
    tmpColor.set(entry.color)
    for (let i = 0; i < count; i++) {
      colors[i * 3] = tmpColor.r
      colors[i * 3 + 1] = tmpColor.g
      colors[i * 3 + 2] = tmpColor.b
    }
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    return geometry
  })
  const merged = mergeGeometries(prepared)
  prepared.forEach((geometry) => geometry.dispose())
  return merged
}
const box = (w, h, d) => new THREE.BoxGeometry(w, h, d)
const vertexMaterial = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.92, flatShading: true })
function seeded(seed) {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// ---------------------------------------------------------------------------
// Track: sandstone slabs that scroll under the runner, gold rails, stone curbs.
// ---------------------------------------------------------------------------
const TRACK_LENGTH = 150
const TRACK_CENTER_Z = -60
const SLAB_DEPTH = CFG.trackWidth / 2

function createSlabTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 256
  const ctx = canvas.getContext('2d')
  const random = seeded(7)
  ctx.fillStyle = '#b8946a'
  ctx.fillRect(0, 0, 512, 256)
  // Two staggered rows of four slabs per tile, each with its own tint.
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 4; col++) {
      const x = col * 128 + (row ? 64 : 0) - 64
      const y = row * 128
      for (const offset of [0, 512]) {
        const shade = 168 + Math.floor(random() * 26)
        ctx.fillStyle = `rgb(${shade + 22}, ${shade}, ${shade - 38})`
        ctx.fillRect(x + offset, y, 128, 128)
      }
    }
  }
  for (let i = 0; i < 1400; i++) {
    ctx.fillStyle = `rgba(70, 44, 20, ${random() * 0.09})`
    ctx.fillRect(random() * 512, random() * 256, 1 + random() * 3, 1 + random() * 3)
  }
  ctx.strokeStyle = 'rgba(58, 36, 16, 0.55)'
  ctx.lineWidth = 4
  for (let row = 0; row < 2; row++) {
    ctx.beginPath()
    ctx.moveTo(0, row * 128 + 2)
    ctx.lineTo(512, row * 128 + 2)
    ctx.stroke()
    for (let col = -1; col < 5; col++) {
      const x = col * 128 + (row ? 64 : 0)
      ctx.beginPath()
      ctx.moveTo(x + 2, row * 128)
      ctx.lineTo(x + 2, row * 128 + 128)
      ctx.stroke()
    }
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(1, TRACK_LENGTH / SLAB_DEPTH)
  texture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy())
  return texture
}
const slabTexture = createSlabTexture()
const trackSide = new THREE.MeshStandardMaterial({ color: PAL.stoneDark, roughness: 1 })
const trackTop = new THREE.MeshStandardMaterial({ map: slabTexture, roughness: 0.9 })
const track = new THREE.Mesh(
  new THREE.BoxGeometry(CFG.trackWidth, 0.22, TRACK_LENGTH),
  [trackSide, trackSide, trackTop, trackSide, trackSide, trackSide],
)
track.position.set(0, 0, TRACK_CENTER_Z)
track.receiveShadow = true
scene.add(track)

const groundMaterial = new THREE.MeshStandardMaterial({ color: '#5b4a2c', roughness: 1 })
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(420, 420),
  groundMaterial,
)
ground.rotation.x = -Math.PI / 2
ground.position.set(0, -0.14, -80)
ground.receiveShadow = true
scene.add(ground)

const railMaterial = new THREE.MeshStandardMaterial({ color: PAL.gold, emissive: '#7a4a08', emissiveIntensity: 0.55, metalness: 0.5, roughness: 0.38 })
const curbMaterial = new THREE.MeshStandardMaterial({ color: '#9a7a52', roughness: 0.95 })
const railGeometry = new THREE.BoxGeometry(0.1, 0.05, TRACK_LENGTH)
const curbGeometry = new THREE.BoxGeometry(0.6, 0.42, TRACK_LENGTH)
for (const x of [-1.23, 1.23, -3.45, 3.45]) {
  const rail = new THREE.Mesh(railGeometry, railMaterial)
  rail.position.set(x, 0.135, TRACK_CENTER_Z)
  scene.add(rail)
}
for (const x of [-(CFG.trackWidth / 2 + 0.3), CFG.trackWidth / 2 + 0.3]) {
  const curb = new THREE.Mesh(curbGeometry, curbMaterial)
  curb.position.set(x, 0.1, TRACK_CENTER_Z)
  curb.castShadow = true
  curb.receiveShadow = true
  scene.add(curb)
}

// ---------------------------------------------------------------------------
// Backdrop: hazy temple, sphinx and cliffs that sit inside the fog, as on the cover.
// Seasonal color variants reuse the same merged geometry to keep mobile draw calls low.
// ---------------------------------------------------------------------------
const seasonalMeshes = []
function registerSeasonalMesh(mesh) {
  const colors = mesh.geometry.getAttribute('color')
  if (colors) mesh.geometry.userData.baseVertexColors = colors.array.slice()
  seasonalMeshes.push(mesh)
}
function buildBackdrop() {
  const parts = []
  const rand = seeded(21)
  const temple = [0, 0, -160]
  const at = (x, y, z) => [temple[0] + x, temple[1] + y, temple[2] + z]
  parts.push(part(box(96, 4, 40), PAL.stoneDark, at(0, 2, 0)))
  parts.push(part(box(72, 6, 30), '#8a6a48', at(0, 7, 0)))
  parts.push(part(box(46, 10, 20), PAL.stone, at(0, 15, 0)))
  parts.push(part(box(30, 6, 14), PAL.stoneLight, at(0, 23, 0)))
  parts.push(part(box(8, 13, 1.2), '#2b1b10', at(0, 12.5, 10.4)))
  for (let i = -3; i <= 3; i++) {
    parts.push(part(new THREE.CylinderGeometry(1.7, 1.9, 15, 7), '#b79570', at(i * 7.5, 11.5, 13)))
    parts.push(part(box(4.4, 1.2, 4.4), PAL.stoneDark, at(i * 7.5, 19.6, 13)))
  }
  parts.push(part(box(58, 3.2, 7), '#9a7850', at(0, 21.4, 13)))
  for (const side of [-1, 1]) {
    parts.push(part(box(14, 34, 14), '#8f6e4a', at(side * 44, 17, -4)))
    parts.push(part(box(16, 3, 16), PAL.stoneLight, at(side * 44, 35, -4)))
  }
  // Sphinx guarding the end of the track, facing the player.
  const sphinx = [0, 0, -128]
  const sat = (x, y, z) => [sphinx[0] + x, sphinx[1] + y, sphinx[2] + z]
  parts.push(part(box(16, 1.6, 22), PAL.stoneDark, sat(0, 0.8, 0)))
  parts.push(part(box(5.4, 3.4, 11), '#d2a96a', sat(0, 3.3, -1)))
  parts.push(part(box(1.6, 1.4, 6), '#d9b274', sat(-1.7, 2.3, 6.5)))
  parts.push(part(box(1.6, 1.4, 6), '#d9b274', sat(1.7, 2.3, 6.5)))
  parts.push(part(box(3, 3.4, 3), '#dcb678', sat(0, 6.6, 4)))
  parts.push(part(box(4.8, 3.8, 1.4), '#c9a060', sat(0, 6.6, 2.8)))
  parts.push(part(box(1.2, 4.6, 1.2), '#c9a060', sat(-2.1, 6.2, 4)))
  parts.push(part(box(1.2, 4.6, 1.2), '#c9a060', sat(2.1, 6.2, 4)))
  // Cliffs and boulders framing the valley.
  for (let i = 0; i < 16; i++) {
    const side = i % 2 ? 1 : -1
    const size = 8 + rand() * 16
    const x = side * (46 + rand() * 60)
    const z = -30 - rand() * 130
    parts.push(part(
      new THREE.DodecahedronGeometry(1, 0),
      i % 3 ? '#8a6644' : '#9d7a52',
      [x, size * 0.35, z],
      [rand() * 3, rand() * 3, rand() * 3],
      [size, size * (0.8 + rand() * 0.8), size],
    ))
  }
  const mesh = new THREE.Mesh(mergeParts(parts), vertexMaterial)
  scene.add(mesh)
  registerSeasonalMesh(mesh)
}
buildBackdrop()

// Low-poly tree lines add distinct seasonal silhouettes without external assets.
// Each season is one merged mesh; only the active backdrop is rendered.
const seasonalBackdropMeshes = []
const seasonalTreeTrunk = new THREE.CylinderGeometry(0.28, 0.42, 1, 5)
const seasonalCanopy = new THREE.DodecahedronGeometry(1, 0)
const seasonalPine = new THREE.ConeGeometry(1, 1, 6)
const seasonalBlossom = new THREE.DodecahedronGeometry(0.5, 0)
function buildSeasonalBackdrop(kind, colors, seed) {
  const parts = []
  const rand = seeded(seed)
  for (const side of [-1, 1]) {
    for (let i = 0; i < 5; i++) {
      const x = side * (10 + rand() * 15)
      const z = -38 - rand() * 92
      const trunkHeight = 3.2 + rand() * 1.5
      parts.push(part(seasonalTreeTrunk, colors.trunk, [x, trunkHeight / 2, z], [0, rand() * 0.25, 0], [1, trunkHeight, 1]))
      if (kind === 'winter') {
        parts.push(part(seasonalPine, colors.foliage, [x, trunkHeight + 1.1, z], [0, 0, 0], [2.6, 3.4, 2.6]))
        parts.push(part(seasonalPine, colors.foliage, [x, trunkHeight + 2.9, z], [0, 0, 0], [2.05, 3, 2.05]))
        parts.push(part(seasonalPine, colors.foliage, [x, trunkHeight + 4.4, z], [0, 0, 0], [1.45, 2.4, 1.45]))
        parts.push(part(seasonalPine, colors.snow, [x, trunkHeight + 2.1, z], [0, 0, 0], [1.85, 0.8, 1.85]))
        parts.push(part(seasonalPine, colors.snow, [x, trunkHeight + 3.8, z], [0, 0, 0], [1.35, 0.65, 1.35]))
      } else {
        const crownY = trunkHeight + 1.25
        parts.push(part(seasonalCanopy, colors.foliage, [x, crownY, z], [0, rand() * 3, 0], [2.4, 2.25, 2.3]))
        parts.push(part(seasonalCanopy, colors.foliage, [x - 1.45, crownY - 0.2, z + 0.25], [0, rand() * 3, 0], [1.65, 1.65, 1.7]))
        parts.push(part(seasonalCanopy, colors.foliage, [x + 1.4, crownY - 0.15, z - 0.2], [0, rand() * 3, 0], [1.7, 1.75, 1.65]))
        if (kind === 'spring') {
          for (let blossom = 0; blossom < 5; blossom++) {
            const angle = (blossom / 5) * Math.PI * 2
            parts.push(part(
              seasonalBlossom, colors.blossom,
              [x + Math.cos(angle) * (1.2 + rand() * 0.8), crownY + (rand() - 0.2) * 1.5, z + Math.sin(angle) * 1.5],
              [rand(), rand() * 3, rand()],
              [0.55, 0.45, 0.5],
            ))
          }
        }
      }
    }
  }
  const mesh = new THREE.Mesh(mergeParts(parts), vertexMaterial)
  mesh.visible = kind === 'spring'
  mesh.castShadow = false
  mesh.receiveShadow = false
  scene.add(mesh)
  seasonalBackdropMeshes.push(mesh)
}
buildSeasonalBackdrop('spring', { trunk: '#72513a', foliage: '#69a95b', blossom: '#f3bfd9' }, 410)
buildSeasonalBackdrop('summer', { trunk: '#6b4b30', foliage: '#347a35' }, 420)
buildSeasonalBackdrop('autumn', { trunk: '#68452f', foliage: '#d47735' }, 430)
buildSeasonalBackdrop('winter', { trunk: '#62564e', foliage: '#31555a', snow: '#e2edf2' }, 440)

// Sun glow and light shafts. Additive, unfogged and cheap.
function radialTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 128
  const ctx = canvas.getContext('2d')
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
  g.addColorStop(0, 'rgba(255, 244, 214, 1)')
  g.addColorStop(0.25, 'rgba(255, 214, 140, 0.55)')
  g.addColorStop(1, 'rgba(255, 190, 100, 0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 128, 128)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}
const sunGlowMaterial = new THREE.SpriteMaterial({
  map: radialTexture(), blending: THREE.AdditiveBlending, depthWrite: false, fog: false, transparent: true, opacity: 0.9,
})
const sunGlow = new THREE.Sprite(sunGlowMaterial)
sunGlow.position.set(34, 40, -200)
sunGlow.scale.setScalar(120)
scene.add(sunGlow)

function shaftTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 32
  canvas.height = 256
  const ctx = canvas.getContext('2d')
  const g = ctx.createLinearGradient(0, 0, 0, 256)
  g.addColorStop(0, 'rgba(255, 226, 160, 0.0)')
  g.addColorStop(0.2, 'rgba(255, 226, 160, 0.55)')
  g.addColorStop(1, 'rgba(255, 226, 160, 0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 32, 256)
  const h = ctx.createLinearGradient(0, 0, 32, 0)
  h.addColorStop(0, 'rgba(0,0,0,1)')
  h.addColorStop(0.5, 'rgba(0,0,0,0)')
  h.addColorStop(1, 'rgba(0,0,0,1)')
  ctx.globalCompositeOperation = 'destination-out'
  ctx.fillStyle = h
  ctx.fillRect(0, 0, 32, 256)
  return new THREE.CanvasTexture(canvas)
}
const shaftMaterial = new THREE.MeshBasicMaterial({
  map: shaftTexture(), blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, fog: false, opacity: 0.2,
})
const shaftGeometry = new THREE.PlaneGeometry(1, 1)
for (const [x, y, z, width, length, tilt] of [
  [14, 14, -42, 6, 70, -0.5], [22, 16, -56, 9, 80, -0.55], [6, 15, -34, 3.5, 60, -0.45],
  [30, 18, -70, 12, 90, -0.6], [-4, 14, -48, 4, 66, -0.4],
]) {
  const shaft = new THREE.Mesh(shaftGeometry, shaftMaterial)
  shaft.position.set(x, y, z)
  shaft.scale.set(width, length, 1)
  shaft.rotation.z = tilt
  shaft.renderOrder = 2
  scene.add(shaft)
}

// ---------------------------------------------------------------------------
// Runner: blocky character rebuilt from Start.ng style data. Unknown values use safe defaults.
// The runner faces -z (away from the camera), so face details sit on FRONT and packs on the back.
// ---------------------------------------------------------------------------
const FRONT = -1
const player = new THREE.Group()
player.position.set(0, 0.16, CFG.playerZ)
scene.add(player)
const rig = new THREE.Group() // lean, yaw and bob live here so lane drift never fights the mesh offsets
player.add(rig)
const limbs = { armL: null, armR: null, legL: null, legR: null }

const DEFAULT_STYLE = {
  body: 'male',
  primaryColor: '#f28a1f',
  secondaryColor: '#2f3e5c',
  skinColor: '#d9a07a',
  hairColor: '#2a1b14',
  hair: 'short',
  hat: 'none',
  accessory: 'backpack',
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
function disposeChildren(group) {
  for (const child of [...group.children]) {
    group.remove(child)
    disposeChildren(child)
    child.geometry?.dispose()
    if (Array.isArray(child.material)) child.material.forEach((material) => material.dispose())
    else child.material?.dispose()
  }
}
let appliedStyleKey = ''
function rebuildPlayer(rawStyle) {
  const style = normalizeStyle(rawStyle)
  const key = JSON.stringify(style)
  // Focus/visibility refreshes re-send the same style; skip the geometry churn.
  if (key === appliedStyleKey) return
  appliedStyleKey = key
  disposeChildren(rig)

  const material = (color, roughness = 0.8, metalness = 0) =>
    new THREE.MeshStandardMaterial({ color, roughness, metalness, flatShading: true })
  const skin = material(style.skinColor)
  const shirt = material(style.primaryColor, 0.72)
  const trousers = material(style.secondaryColor, 0.8)
  const hair = material(style.hairColor)
  const shoes = material('#6b4426', 0.7)
  const dark = material('#171a20', 0.55)
  const gold = material('#ffd45c', 0.3, 0.55)
  const pack = material('#3f6b3a', 0.85)
  const packDark = material('#2d4d2a', 0.85)
  const addBox = (parent, w, h, d, partMaterial, x, y, z) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), partMaterial)
    mesh.position.set(x, y, z)
    mesh.castShadow = true
    mesh.receiveShadow = true
    parent.add(mesh)
    return mesh
  }
  const pivot = (x, y) => {
    const group = new THREE.Group()
    group.position.set(x, y, 0)
    rig.add(group)
    return group
  }
  const female = style.body === 'female'
  const BACK = -FRONT

  // Torso, head, face.
  addBox(rig, female ? 0.6 : 0.72, 0.72, 0.4, shirt, 0, 1.14, 0)
  const head = new THREE.Group()
  head.position.set(0, 1.8, 0)
  rig.add(head)
  addBox(head, 0.52, 0.52, 0.52, skin, 0, 0, 0)
  addBox(head, 0.07, 0.09, 0.03, dark, -0.12, 0.03, FRONT * 0.265)
  addBox(head, 0.07, 0.09, 0.03, dark, 0.12, 0.03, FRONT * 0.265)
  addBox(head, 0.1, 0.03, 0.03, dark, 0, -0.12, FRONT * 0.265)

  // Arms swing from the shoulder, legs from the hip.
  for (const side of [-1, 1]) {
    const arm = pivot(side * (female ? 0.42 : 0.48), 1.44)
    addBox(arm, 0.24, 0.3, 0.26, shirt, 0, -0.15, 0)
    addBox(arm, 0.2, 0.4, 0.2, skin, 0, -0.5, 0)
    if (side < 0) limbs.armL = arm
    else limbs.armR = arm
    const leg = pivot(side * 0.17, 0.8)
    if (female) {
      addBox(leg, 0.22, 0.6, 0.24, skin, 0, -0.3, 0)
    } else {
      addBox(leg, 0.27, 0.64, 0.29, trousers, 0, -0.32, 0)
    }
    addBox(leg, 0.29, 0.16, 0.42, shoes, 0, -0.64, FRONT * 0.06)
    if (side < 0) limbs.legL = leg
    else limbs.legR = leg
  }
  if (female) addBox(rig, 0.7, 0.34, 0.46, trousers, 0, 0.74, 0)

  // Hair (hat styles below may cover it, which is the intended look).
  const hairTop = 2.1
  if (style.hair !== 'bald') {
    if (style.hair === 'afro') {
      addBox(head, 0.82, 0.7, 0.82, hair, 0, 0.26, 0)
    } else {
      addBox(head, 0.56, 0.14, 0.56, hair, 0, hairTop - 1.8 - 0.01, 0)
      addBox(head, 0.56, 0.34, 0.12, hair, 0, 0.1, BACK * 0.22)
      addBox(head, 0.1, 0.22, 0.4, hair, -0.27, 0.12, 0)
      addBox(head, 0.1, 0.22, 0.4, hair, 0.27, 0.12, 0)
      if (style.hair === 'braids' || style.hair === 'dreads') {
        const length = style.hair === 'dreads' ? 0.6 : 0.46
        for (let i = -2; i <= 2; i++) addBox(head, 0.07, length, 0.07, hair, i * 0.1, -0.2 - length / 2 + 0.12, BACK * 0.27)
      } else if (style.hair === 'bun') {
        addBox(head, 0.22, 0.22, 0.22, hair, 0, 0.42, BACK * 0.1)
      } else if (style.hair === 'ponytail') {
        addBox(head, 0.13, 0.44, 0.13, hair, 0, -0.08, BACK * 0.34)
      }
    }
  }
  if (style.hat === 'cap') {
    addBox(head, 0.58, 0.16, 0.58, shirt, 0, 0.32, 0)
    addBox(head, 0.5, 0.04, 0.28, shirt, 0, 0.26, FRONT * 0.4)
  } else if (style.hat === 'beanie') {
    addBox(head, 0.6, 0.26, 0.6, shirt, 0, 0.33, 0)
    addBox(head, 0.64, 0.08, 0.64, trousers, 0, 0.22, 0)
  } else if (style.hat === 'tophat') {
    addBox(head, 0.34, 0.36, 0.34, dark, 0, 0.5, 0)
    addBox(head, 0.74, 0.05, 0.74, dark, 0, 0.3, 0)
  } else if (style.hat === 'crown') {
    addBox(head, 0.54, 0.14, 0.54, gold, 0, 0.34, 0)
    for (const [x, z] of [[-0.2, -0.2], [0.2, -0.2], [-0.2, 0.2], [0.2, 0.2], [0, 0]]) addBox(head, 0.1, 0.16, 0.1, gold, x, 0.47, z)
  }
  if (style.accessory === 'glasses') {
    addBox(head, 0.2, 0.12, 0.03, dark, -0.12, 0.04, FRONT * 0.285)
    addBox(head, 0.2, 0.12, 0.03, dark, 0.12, 0.04, FRONT * 0.285)
    addBox(head, 0.08, 0.03, 0.03, dark, 0, 0.06, FRONT * 0.285)
  } else if (style.accessory === 'earrings') {
    addBox(head, 0.06, 0.12, 0.06, gold, -0.29, -0.14, 0)
    addBox(head, 0.06, 0.12, 0.06, gold, 0.29, -0.14, 0)
  } else if (style.accessory === 'beard') {
    addBox(head, 0.44, 0.2, 0.14, hair, 0, -0.2, FRONT * 0.24)
  } else if (style.accessory === 'scarf') {
    addBox(rig, 0.8, 0.14, 0.48, trousers, 0, 1.52, 0)
    addBox(rig, 0.14, 0.42, 0.06, trousers, 0.2, 1.28, BACK * 0.26)
  } else if (style.accessory === 'backpack') {
    addBox(rig, 0.5, 0.58, 0.24, pack, 0, 1.2, BACK * 0.32)
    addBox(rig, 0.52, 0.2, 0.26, packDark, 0, 1.38, BACK * 0.32)
  }
}
rebuildPlayer(DEFAULT_STYLE)

// ---------------------------------------------------------------------------
// Side scenery: carved pillars, torches and jungle growth. Each segment is one merged mesh.
// ---------------------------------------------------------------------------
const SEGMENT_SPACING = 9
const SEGMENT_COUNT = 15
const SEGMENT_SPAN = SEGMENT_SPACING * SEGMENT_COUNT
const scenery = []
const flames = []
const flameMaterial = new THREE.MeshBasicMaterial({ color: '#ffa31f', fog: false })
const flameGeometry = new THREE.ConeGeometry(0.16, 0.5, 5)
flameGeometry.translate(0, 0.25, 0)
const bladeGeometry = new THREE.ConeGeometry(0.22, 1.5, 4)
bladeGeometry.translate(0, 0.75, 0)
const bushGeometry = new THREE.OctahedronGeometry(0.7, 0)
const pillarRand = seeded(99)
function buildSegment(side, index) {
  const rand = pillarRand
  const parts = []
  const height = 4.8 + rand() * 4
  const inward = -side
  parts.push(part(box(2, 0.5, 2), PAL.stoneDeep, [0, 0.25, 0]))
  parts.push(part(box(1.4, height, 1.4), PAL.stoneDark, [0, height / 2 + 0.25, 0]))
  parts.push(part(box(1.52, 0.38, 1.52), PAL.stoneBand, [0, 1.5, 0]))
  parts.push(part(box(1.52, 0.38, 1.52), PAL.stoneBand, [0, height - 0.6, 0]))
  if (rand() > 0.3) parts.push(part(box(1.9, 0.45, 1.9), PAL.stoneDeep, [0, height + 0.45, 0]))
  // Crumbled blocks at the foot of the pillar.
  parts.push(part(box(0.8, 0.5, 0.7), PAL.stone, [inward * 1.3, 0.25, rand() * 2 - 1], [0, rand(), 0]))
  // Jungle growth: bushes and fern blades in three greens.
  const greens = [PAL.leafDark, PAL.leafMid, PAL.leafLight]
  const bushCount = 4 + Math.floor(rand() * 4)
  for (let i = 0; i < bushCount; i++) {
    const x = inward * 1.2 + side * (rand() * 8)
    const z = (rand() - 0.5) * 7
    const s = 0.6 + rand() * 0.9
    parts.push(part(bushGeometry, greens[Math.floor(rand() * 3)], [x, 0.35 * s, z], [rand(), rand() * 3, 0], [s, s * 0.8, s]))
    for (let b = 0; b < 3; b++) {
      parts.push(part(bladeGeometry, greens[Math.floor(rand() * 3)], [x + (rand() - 0.5) * 0.9, 0, z + (rand() - 0.5) * 0.9], [(rand() - 0.5) * 0.9, rand() * 3, (rand() - 0.5) * 0.9], [1, 0.6 + rand() * 0.7, 1]))
    }
  }
  const group = new THREE.Group()
  const mesh = new THREE.Mesh(mergeParts(parts), vertexMaterial)
  mesh.castShadow = true
  mesh.receiveShadow = true
  group.add(mesh)
  registerSeasonalMesh(mesh)
  if (index % 3 === 0) {
    const holder = new THREE.Mesh(mergeParts([part(box(0.16, 0.5, 0.16), PAL.stoneDeep, [inward * 0.85, 2.8, 0]), part(box(0.34, 0.12, 0.34), '#2b1b10', [inward * 0.85, 3.08, 0])]), vertexMaterial)
    group.add(holder)
    const flame = new THREE.Mesh(flameGeometry, flameMaterial)
    flame.position.set(inward * 0.85, 3.12, 0)
    flame.userData.phase = rand() * 6
    group.add(flame)
    flames.push(flame)
  }
  group.position.set(side * (5.7 + rand() * 0.5), 0, 6 - index * SEGMENT_SPACING - (side > 0 ? 3.5 : 0))
  scene.add(group)
  scenery.push({ group, startZ: group.position.z })
}
for (let i = 0; i < SEGMENT_COUNT; i++) for (const side of [-1, 1]) buildSegment(side, i)


// ---------------------------------------------------------------------------
// Seasonal environment. Palette changes are driven by distance, not frame count.
// Foliage vertex colors are recolored only when a season changes to protect mobile performance.
// ---------------------------------------------------------------------------
const SEASONS = [
  {
    name: 'Spring',
    sky: [[0, '#82b9ed'], [0.38, '#c4e5f5'], [0.56, '#f5e5ce'], [1, '#c6d9cf']],
    fog: '#c6d9cf', ground: '#62864c', track: '#d6c29c', rail: '#d9b75c', curb: '#82956a',
    foliage: '#65a94f', stone: '#b5ad91', stoneBlend: 0.16,
    skyLight: '#dff4ff', groundLight: '#496443', hemisphereIntensity: 1.55,
    sun: '#fff0c4', sunIntensity: 2.6, glowOpacity: 0.55, shaftOpacity: 0.08,
  },
  {
    name: 'Summer',
    sky: [[0, '#5aa5e8'], [0.38, '#a8d9f4'], [0.56, '#f8e3b1'], [1, '#b5c9b0']],
    fog: '#b5c9b0', ground: '#6e8d43', track: '#d5b47e', rail: '#f0c34e', curb: '#8d8950',
    foliage: '#39833b', stone: '#c3a273', stoneBlend: 0.12,
    skyLight: '#e3f5ff', groundLight: '#465c32', hemisphereIntensity: 1.7,
    sun: '#ffe0a0', sunIntensity: 3.1, glowOpacity: 0.8, shaftOpacity: 0.16,
  },
  {
    name: 'Autumn',
    sky: [[0, '#7d91bd'], [0.38, '#e1b4a0'], [0.56, '#f2b878'], [1, '#b8a18b']],
    fog: '#b8a18b', ground: '#796044', track: '#b99a76', rail: '#d88b35', curb: '#8b6849',
    foliage: '#d47735', stone: '#9e8269', stoneBlend: 0.3,
    skyLight: '#f7d8bc', groundLight: '#594435', hemisphereIntensity: 1.35,
    sun: '#ffc27c', sunIntensity: 2.25, glowOpacity: 0.48, shaftOpacity: 0.06,
  },
  {
    name: 'Winter',
    sky: [[0, '#789bc7'], [0.38, '#c9dce9'], [0.56, '#e5edf2'], [1, '#b7c9d4']],
    fog: '#b7c9d4', ground: '#b3c1c6', track: '#a9b8c2', rail: '#d4dce0', curb: '#899ca7',
    foliage: '#dce8ed', stone: '#aabac6', stoneBlend: 0.52,
    skyLight: '#eaf6ff', groundLight: '#667985', hemisphereIntensity: 1.25,
    sun: '#d9eaff', sunIntensity: 1.65, glowOpacity: 0.22, shaftOpacity: 0.025,
  },
]
const seasonIndicator = app.querySelector('#season-indicator')
let activeSeasonIndex = -1
let lastSkySeasonIndex = -1
const seasonColorTarget = new THREE.Color()
const seasonColorMix = new THREE.Color()
const seasonalColor = (from, to, amount) => new THREE.Color(from).lerp(new THREE.Color(to), amount)
function recolorSeasonalMeshes(season) {
  for (const mesh of seasonalMeshes) {
    const geometry = mesh.geometry
    const colors = geometry.getAttribute('color')
    const base = geometry.userData.baseVertexColors
    if (!colors || !base) continue
    const output = colors.array
    const foliage = new THREE.Color(season.foliage)
    const stone = new THREE.Color(season.stone)
    for (let i = 0; i < base.length; i += 3) {
      const r = base[i]
      const g = base[i + 1]
      const b = base[i + 2]
      if (g > r * 1.18 && g > b * 1.08) {
        const brightness = Math.min(1.25, Math.max(0.62, (r + g + b) / 0.36))
        output[i] = foliage.r * brightness
        output[i + 1] = foliage.g * brightness
        output[i + 2] = foliage.b * brightness
      } else {
        const tintAmount = season.stoneBlend
        output[i] = r + (stone.r - r) * tintAmount
        output[i + 1] = g + (stone.g - g) * tintAmount
        output[i + 2] = b + (stone.b - b) * tintAmount
      }
    }
    colors.needsUpdate = true
  }
}
function drawSeasonSky(stops) {
  const gradient = skyContext.createLinearGradient(0, 0, 0, skyCanvas.height)
  for (const [offset, color] of stops) gradient.addColorStop(offset, color)
  skyContext.fillStyle = gradient
  skyContext.fillRect(0, 0, skyCanvas.width, skyCanvas.height)
  scene.background.needsUpdate = true
}
function updateSeasonEnvironment(distance) {
  const seasonLength = CFG.seasonLength
  const rawIndex = Math.floor(distance / seasonLength)
  const seasonIndex = rawIndex % SEASONS.length
  const progress = distance - rawIndex * seasonLength
  const transitionStart = seasonLength - CFG.seasonTransitionDistance
  const blend = progress > transitionStart
    ? (progress - transitionStart) / CFG.seasonTransitionDistance
    : 0
  const nextIndex = (seasonIndex + 1) % SEASONS.length
  const current = SEASONS[seasonIndex]
  const next = SEASONS[nextIndex]
  const visualSeasonIndex = blend >= 0.5 ? nextIndex : seasonIndex
  const mix = (key) => seasonColorMix.set(current[key]).lerp(seasonColorTarget.set(next[key]), blend)
  const colorHex = (from, to) => `#${seasonColorMix.set(from).lerp(seasonColorTarget.set(to), blend).getHexString()}`
  const sky = current.sky.map(([offset, color], index) => [
    offset,
    colorHex(color, next.sky[index][1]),
  ])
  if (blend > 0 || lastSkySeasonIndex !== seasonIndex) {
    drawSeasonSky(sky)
    lastSkySeasonIndex = seasonIndex
  }
  scene.fog.color.copy(mix('fog'))
  groundMaterial.color.copy(mix('ground'))
  trackTop.color.copy(mix('track'))
  trackSide.color.copy(mix('track'))
  curbMaterial.color.copy(mix('curb'))
  railMaterial.color.copy(mix('rail'))
  hemisphere.color.copy(mix('skyLight'))
  hemisphere.groundColor.copy(mix('groundLight'))
  hemisphere.intensity = THREE.MathUtils.lerp(current.hemisphereIntensity, next.hemisphereIntensity, blend)
  sun.color.copy(mix('sun'))
  sun.intensity = THREE.MathUtils.lerp(current.sunIntensity, next.sunIntensity, blend)
  sunGlowMaterial.opacity = THREE.MathUtils.lerp(current.glowOpacity, next.glowOpacity, blend)
  shaftMaterial.opacity = THREE.MathUtils.lerp(current.shaftOpacity, next.shaftOpacity, blend)
  if (visualSeasonIndex !== activeSeasonIndex) {
    activeSeasonIndex = visualSeasonIndex
    const visualSeason = SEASONS[visualSeasonIndex]
    seasonIndicator.textContent = visualSeason.name.toUpperCase()
    seasonIndicator.dataset.season = visualSeason.name.toLowerCase()
    recolorSeasonalMeshes(visualSeason)
    seasonalBackdropMeshes.forEach((mesh, index) => {
      mesh.visible = index === visualSeasonIndex
    })
  }
}
updateSeasonEnvironment(0)

// ---------------------------------------------------------------------------
// Obstacles and relics: pooled, so a long run never allocates or leaks.
// ---------------------------------------------------------------------------
const crateGeometry = mergeParts([
  part(box(1, 1, 1), PAL.crate, [0, 0.5, 0]),
  part(box(1.06, 0.2, 1.06), PAL.crateBand, [0, 0.5, 0]),
  part(box(0.9, 0.06, 0.9), '#b83621', [0, 1.02, 0]),
])
const urnGeometry = (() => {
  const profile = [[0, 0], [0.2, 0], [0.32, 0.12], [0.4, 0.4], [0.32, 0.72], [0.18, 0.88], [0.22, 1.0], [0.3, 1.04], [0, 1.04]]
    .map(([x, y]) => new THREE.Vector2(x, y))
  return mergeParts([
    part(new THREE.LatheGeometry(profile, 10), PAL.gold),
    part(new THREE.TorusGeometry(0.2, 0.04, 4, 8), PAL.gold, [-0.4, 0.62, 0], [0, 0, 0]),
    part(new THREE.TorusGeometry(0.2, 0.04, 4, 8), PAL.gold, [0.4, 0.62, 0], [0, 0, 0]),
  ])
})()
const coinGeometry = mergeParts([
  part(new THREE.CylinderGeometry(0.38, 0.38, 0.12, 14), '#ffd45c', [0, 0, 0], [Math.PI / 2, 0, 0]),
  part(new THREE.TorusGeometry(0.3, 0.05, 4, 14), '#fff0a8', [0, 0, 0.07]),
])
const relicMaterial = new THREE.MeshStandardMaterial({
  vertexColors: true, emissive: '#b87400', emissiveIntensity: 1.1, metalness: 0.5, roughness: 0.3, flatShading: true,
})
const obstaclePool = []
const relicPool = []
function createObstacle() {
  const mesh = new THREE.Mesh(crateGeometry, vertexMaterial)
  mesh.castShadow = true
  mesh.receiveShadow = true
  mesh.visible = false
  scene.add(mesh)
  return { mesh, lane: 1, active: false }
}
function createRelic() {
  const group = new THREE.Group()
  const coin = new THREE.Mesh(coinGeometry, relicMaterial)
  const urn = new THREE.Mesh(urnGeometry, relicMaterial)
  urn.castShadow = true
  group.add(coin, urn)
  group.visible = false
  scene.add(group)
  return { group, coin, urn, lane: 1, active: false, phase: Math.random() * Math.PI * 2, isUrn: false }
}
for (let i = 0; i < 26; i++) obstaclePool.push(createObstacle())
for (let i = 0; i < 64; i++) relicPool.push(createRelic())

function acquire(pool) {
  for (let i = 0; i < pool.length; i++) if (!pool[i].active) return pool[i]
  return null
}
function placeObstacle(lane, z) {
  const item = acquire(obstaclePool)
  if (!item) return
  item.lane = lane
  item.mesh.position.set(LANE_X[lane], 0.11, z)
  item.mesh.scale.setScalar(0.01)
  item.mesh.visible = true
  item.active = true
}
function placeRelic(lane, z, isUrn) {
  const item = acquire(relicPool)
  if (!item) return
  item.lane = lane
  item.isUrn = isUrn
  item.coin.visible = !isUrn
  item.urn.visible = isUrn
  item.group.position.set(LANE_X[lane], isUrn ? 0.14 : 1.15, z)
  item.group.scale.setScalar(0.01)
  item.group.visible = true
  item.active = true
}
function hideWorldObjects() {
  for (const item of obstaclePool) { item.active = false; item.mesh.visible = false }
  for (const item of relicPool) { item.active = false; item.group.visible = false }
}

// Row spawner. Every layout is survivable from anywhere the runner could be standing:
// the next row's free lane is chosen within one lane of *all* lanes left open by the
// previous row, so no row ever demands a double lane change. A relic trail marks the safe line.
const spawn = { frontier: CFG.firstRowZ, openLanes: [1] }
const difficulty = (elapsed) => Math.min(elapsed / CFG.difficultyRampSeconds, 1)
const currentGap = (elapsed) => Math.max(CFG.minRowGap, CFG.maxRowGap - elapsed * CFG.rowGapShrinkPerSecond)
function spawnRow(z, gap, elapsed, attract) {
  let free = 1
  if (!attract) {
    const reachable = [0, 1, 2].filter((lane) => spawn.openLanes.every((open) => Math.abs(lane - open) <= 1))
    const options = reachable.length ? reachable : [1]
    free = options[Math.floor(Math.random() * options.length)]
  }
  const others = [0, 1, 2].filter((lane) => lane !== free)
  let obstructed = []
  if (attract) {
    obstructed = others
  } else if (Math.random() < 0.1) {
    // Breather row: no obstacles, relics only.
  } else if (Math.random() < CFG.maxDoubleRowChance * difficulty(elapsed)) {
    obstructed = others
  } else {
    obstructed = [others[Math.floor(Math.random() * others.length)]]
  }
  for (const lane of obstructed) placeObstacle(lane, z)
  // A breather leaves the whole row open, but the runner still gets a full gap to line up.
  spawn.openLanes = obstructed.length ? [0, 1, 2].filter((lane) => !obstructed.includes(lane)) : [free]
  if (Math.random() < 0.9) {
    const spacing = 2.4
    // Keep the whole trail clear of the obstacle rows on either side of this gap.
    const count = Math.min(3 + Math.floor(Math.random() * 3), Math.floor((gap - 4) / spacing) + 1)
    const startZ = z + gap / 2 + ((count - 1) * spacing) / 2
    const urnIndex = Math.random() < 0.3 ? Math.floor(Math.random() * count) : -1
    for (let i = 0; i < count; i++) placeRelic(free, startZ - i * spacing, i === urnIndex)
  }
}
function streamWorld(elapsed, attract) {
  for (;;) {
    const gap = currentGap(elapsed)
    if (spawn.frontier - gap <= -CFG.spawnDistance) break
    spawn.frontier -= gap
    spawnRow(spawn.frontier, gap, elapsed, attract)
  }
}
function resetWorldObjects(attract) {
  hideWorldObjects()
  spawn.frontier = CFG.firstRowZ
  spawn.openLanes = [1]
  streamWorld(0, attract)
}

// Start.ng's documented connect-page protocol. No credentials are handled by the game.
const START_NG_ORIGIN = 'https://start.ng'
const START_NG_CONNECT_TIMEOUT_MS = 8000
let startNgFramePromise
function connectFrame() {
  if (!startNgFramePromise) {
    startNgFramePromise = new Promise((resolve, reject) => {
      const frame = document.createElement('iframe')
      // A blocked or silent iframe never fires onload/onerror, so a timer is the only way out.
      const timer = window.setTimeout(() => {
        frame.remove()
        reject(new Error('Start.ng connection timed out'))
      }, START_NG_CONNECT_TIMEOUT_MS)
      frame.src = `${START_NG_ORIGIN}/connect`
      frame.hidden = true
      frame.title = 'Start.ng player connection'
      frame.onload = () => {
        window.clearTimeout(timer)
        resolve(frame)
      }
      frame.onerror = () => {
        window.clearTimeout(timer)
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

// ---------------------------------------------------------------------------
// Sizing. On tall, narrow screens the horizontal FOV collapses and crops the side
// lanes, so the camera pulls back and widens to keep all three lanes in view.
// ---------------------------------------------------------------------------
function fitCamera(aspect) {
  const t = Math.min(Math.max((1.45 - aspect) / 0.95, 0), 1)
  camera.fov = 56 + t * 14
  cameraRig.y = 4 + t * 2.6
  cameraRig.z = 8.4 + t * 8
  camera.position.y = cameraRig.y
  camera.position.z = cameraRig.z
}
const resize = () => {
  const width = Math.max(container.clientWidth, 1)
  const height = Math.max(container.clientHeight, 1)
  camera.aspect = width / height
  fitCamera(camera.aspect)
  camera.updateProjectionMatrix()
  renderer.setSize(width, height, false)
}
const resizeObserver = new ResizeObserver(resize)
resizeObserver.observe(container)
resize()

// ---------------------------------------------------------------------------
// Game state
// ---------------------------------------------------------------------------
const state = {
  mode: 'ready',
  lane: 1,
  elapsed: 0,
  distance: 0,
  score: 0,
  relics: 0,
  speed: CFG.initialSpeed,
  jumpHeight: 0,
  jumpVelocity: 0,
  lastRun: null,
  bestRun: null,
}
let audioContext = null
let soundMuted = false
const soundButton = app.querySelector('#sound-toggle')
function syncSoundButton() {
  soundButton.textContent = soundMuted ? 'Sound off' : 'Sound on'
  soundButton.setAttribute('aria-label', soundMuted ? 'Unmute sound' : 'Mute sound')
  soundButton.setAttribute('aria-pressed', String(soundMuted))
}
function unlockAudio() {
  if (soundMuted) return
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    if (!AudioContextClass) return
    if (!audioContext) audioContext = new AudioContextClass()
    if (audioContext.state === 'suspended') void audioContext.resume().catch(() => {})
  } catch {
    // Audio is optional; unsupported or blocked audio must never interrupt gameplay.
  }
}
function playSound(kind) {
  if (soundMuted) return
  unlockAudio()
  if (!audioContext || audioContext.state !== 'running') return

  const sounds = {
    lane: { start: 420, end: 590, duration: 0.075, type: 'sine', volume: 0.045 },
    relic: { start: 740, end: 1180, duration: 0.18, type: 'triangle', volume: 0.075 },
    crash: { start: 190, end: 55, duration: 0.28, type: 'sawtooth', volume: 0.09 },
  }
  const sound = sounds[kind]
  if (!sound) return

  try {
    const now = audioContext.currentTime
    const oscillator = audioContext.createOscillator()
    const gain = audioContext.createGain()
    oscillator.type = sound.type
    oscillator.frequency.setValueAtTime(sound.start, now)
    oscillator.frequency.exponentialRampToValueAtTime(sound.end, now + sound.duration)
    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.exponentialRampToValueAtTime(sound.volume, now + 0.012)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + sound.duration)
    oscillator.connect(gain)
    gain.connect(audioContext.destination)
    oscillator.start(now)
    oscillator.stop(now + sound.duration + 0.01)
    oscillator.addEventListener('ended', () => {
      oscillator.disconnect()
      gain.disconnect()
    }, { once: true })
  } catch {
    // A browser audio restriction should not break the current run.
  }
}
function triggerHaptic(kind) {
  if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') return

  const patterns = {
    lane: 18,
    crash: [75, 40, 130],
  }
  const pattern = patterns[kind]
  if (pattern === undefined) return

  try {
    navigator.vibrate(pattern)
  } catch {
    // Haptics are optional; unsupported devices must never interrupt gameplay.
  }
}
syncSoundButton()
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
const hud = { score: -1, distance: -1, relics: -1, best: -1 }
function updateHud() {
  // Only touch the DOM when a value changed; this runs every frame.
  const distance = Math.floor(state.distance)
  const best = state.bestRun?.score ?? 0
  if (hud.score !== state.score) { hud.score = state.score; scoreElement.textContent = String(state.score) }
  if (hud.distance !== distance) { hud.distance = distance; distanceElement.textContent = `${distance} m` }
  if (hud.relics !== state.relics) { hud.relics = state.relics; relicsElement.textContent = String(state.relics) }
  if (hud.best !== best) { hud.best = best; bestScoreElement.textContent = String(best) }
}
let shake = 0
function setMode(mode) {
  const previousMode = state.mode
  state.mode = mode
  if (mode === 'gameover' && previousMode === 'running') {
    playSound('crash')
    triggerHaptic('crash')
  }
  container.dataset.mode = mode
  hideOverlays()
  pauseButton.hidden = mode !== 'running'
  if (mode === 'ready') startOverlay.hidden = false
  if (mode === 'paused') pauseOverlay.hidden = false
  if (mode === 'gameover') {
    gameoverOverlay.hidden = false
    if (previousMode === 'running') {
      shake = 0.4
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
  const nextLane = Math.max(0, Math.min(CFG.laneCount - 1, state.lane + direction))
  if (nextLane === state.lane) return
  state.lane = nextLane
  playSound('lane')
  triggerHaptic('lane')
}
function jump() {
  // A grounded-state check prevents a second jump before landing.
  if (state.mode !== 'running' || state.jumpHeight > 0 || state.jumpVelocity > 0) return
  state.jumpVelocity = CFG.jumpInitialVelocity
}
function resetRun() {
  state.lane = 1
  state.elapsed = 0
  state.distance = 0
  state.score = 0
  state.relics = 0
  state.speed = CFG.initialSpeed
  state.jumpHeight = 0
  state.jumpVelocity = 0
  player.position.x = 0
  player.position.y = 0.16
  camera.position.x = 0
  menuShift = 0
  shake = 0
  for (const item of scenery) item.group.position.z = item.startZ
  resetWorldObjects(false)
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
// Collision systems can end a run through this explicit hook.
window.relicRushEndRun = () => {
  if (state.mode === 'running') setMode('gameover')
}
// Stable result adapters for Start.ng leaderboard wiring. No platform API is assumed here.
window.relicRushGetLastRun = () => state.lastRun ? { ...state.lastRun } : null
window.relicRushGetBestRun = () => state.bestRun ? { ...state.bestRun } : null
soundButton.addEventListener('click', () => {
  soundMuted = !soundMuted
  syncSoundButton()
  if (!soundMuted) unlockAudio()
})
window.addEventListener('pointerdown', unlockAudio)
app.querySelector('#play-button').addEventListener('click', startRun)
app.querySelector('#restart-button').addEventListener('click', startRun)
app.querySelector('#resume-button').addEventListener('click', togglePause)
app.querySelector('#pause-restart-button').addEventListener('click', startRun)
pauseButton.addEventListener('click', togglePause)
app.querySelector('#left-button').addEventListener('click', () => moveLane(-1))
app.querySelector('#jump-button').addEventListener('click', jump)
app.querySelector('#right-button').addEventListener('click', () => moveLane(1))
window.addEventListener('keydown', (event) => {
  unlockAudio()
  const key = event.key.toLowerCase()
  if (['arrowleft', 'arrowright', 'arrowup', ' '].includes(key)) event.preventDefault()
  // Held keys auto-repeat; without this guard one long press skips straight across the track.
  if (event.repeat) return
  if (key === 'arrowleft' || key === 'a') moveLane(-1)
  if (key === 'arrowright' || key === 'd') moveLane(1)
  if ((key === 'arrowup' || key === ' ') && state.mode === 'running') jump()
  if (key === 'escape' || key === 'p') togglePause()
  if ((key === 'enter' || key === ' ') && (state.mode === 'ready' || state.mode === 'gameover')) {
    // Stop the focused overlay button from also firing its own click and restarting twice.
    event.preventDefault()
    startRun()
  }
})
// Backgrounded tabs must not keep a run alive under the player.
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden' && state.mode === 'running') setMode('paused')
})
let touchStart = null
container.addEventListener('touchstart', (event) => {
  if (event.changedTouches.length) {
    const touch = event.changedTouches[0]
    touchStart = { x: touch.clientX, y: touch.clientY }
  }
}, { passive: true })
container.addEventListener('touchend', (event) => {
  if (!touchStart || !event.changedTouches.length) return
  const touch = event.changedTouches[0]
  const dx = touch.clientX - touchStart.x
  const dy = touch.clientY - touchStart.y
  if (Math.abs(dy) > 35 && Math.abs(dy) > Math.abs(dx)) {
    if (dy < 0) jump()
  } else if (Math.abs(dx) > 35) {
    moveLane(dx < 0 ? -1 : 1)
  }
  touchStart = null
}, { passive: true })
setMode('ready')
resetWorldObjects(true)

// ---------------------------------------------------------------------------
// Main loop
// ---------------------------------------------------------------------------
const clock = new THREE.Clock()
let animTime = 0
const clamp01 = (value) => Math.min(Math.max(value, 0), 1)
function animate() {
  const delta = Math.min(clock.getDelta(), 0.05)
  const running = state.mode === 'running'
  const attract = state.mode === 'ready'
  if (running) {
    state.elapsed += delta
    // Speed ramps up gradually, with a sensible cap to keep late-game control possible.
    state.speed = Math.min(CFG.initialSpeed + state.elapsed * CFG.speedIncreasePerSecond, CFG.maximumSpeed)
    state.distance += delta * state.speed
    if (state.jumpHeight > 0 || state.jumpVelocity > 0) {
      state.jumpVelocity -= CFG.jumpGravity * delta
      state.jumpHeight += state.jumpVelocity * delta
      if (state.jumpHeight <= 0) {
        state.jumpHeight = 0
        state.jumpVelocity = 0
      }
    }
  }
  updateSeasonEnvironment(state.distance)
  // The world also scrolls slowly behind the start screen; paused and game-over freeze it.
  const worldSpeed = running ? state.speed : attract ? CFG.attractSpeed : 0
  const dz = delta * worldSpeed
  if (dz > 0) {
    animTime += delta
    slabTexture.offset.y += dz / SLAB_DEPTH
    for (const item of scenery) {
      item.group.position.z += dz
      if (item.group.position.z > 12) item.group.position.z -= SEGMENT_SPAN
    }
    spawn.frontier += dz
    streamWorld(state.elapsed, attract)
  }
  for (const flame of flames) {
    flame.scale.set(1, 1 + Math.sin(clock.elapsedTime * 13 + flame.userData.phase) * 0.18, 1)
  }

  const playerX = player.position.x
  for (const item of obstaclePool) {
    if (!item.active) continue
    const z = (item.mesh.position.z += dz)
    if (z > CFG.despawnZ) {
      item.active = false
      item.mesh.visible = false
      continue
    }
    // Crates rise out of the haze instead of popping into view.
    item.mesh.scale.setScalar(clamp01((z + CFG.spawnDistance) / 14))
    if (running) {
      const relativeZ = z - CFG.playerZ
      if (relativeZ > CFG.obstacleHitZ[0] && relativeZ < CFG.obstacleHitZ[1] &&
          Math.abs(item.mesh.position.x - playerX) < CFG.obstacleHitX &&
          state.jumpHeight < CFG.jumpObstacleClearance) {
        setMode('gameover')
        break
      }
    }
  }
  for (const item of relicPool) {
    if (!item.active) continue
    const z = (item.group.position.z += dz)
    if (z > CFG.despawnZ) {
      item.active = false
      item.group.visible = false
      continue
    }
    item.group.scale.setScalar(clamp01((z + CFG.spawnDistance) / 14))
    if (!item.isUrn) {
      item.group.rotation.y += delta * 3
      item.group.position.y = 1.15 + Math.sin(clock.elapsedTime * 4 + item.phase) * 0.12
    }
    if (state.mode === 'running') {
      const relativeZ = z - CFG.playerZ
      if (relativeZ > CFG.relicHitZ[0] && relativeZ < CFG.relicHitZ[1] &&
          Math.abs(item.group.position.x - playerX) < CFG.relicHitX) {
        item.active = false
        item.group.visible = false
        state.relics += 1
        playSound('relic')
      }
    }
  }
  if (running) {
    // Derived every frame so score can never drift from distance and relics.
    state.score = Math.floor(state.distance) + state.relics * CFG.relicScore
    updateHud()
  }

  const targetX = LANE_X[state.lane]
  player.position.x += (targetX - player.position.x) * Math.min(delta * 12, 1)
  const moving = running || attract
  const stride = animTime * 11
  const runBob = moving && state.jumpHeight === 0 ? Math.abs(Math.sin(stride)) * 0.07 : 0
  player.position.y = 0.16 + state.jumpHeight + runBob
  const swing = moving ? Math.sin(stride) * 0.95 : 0
  limbs.legL.rotation.x = swing
  limbs.legR.rotation.x = -swing
  limbs.armL.rotation.x = -swing * 0.9
  limbs.armR.rotation.x = swing * 0.9
  rig.rotation.x += ((moving ? -0.14 : 0) - rig.rotation.x) * Math.min(delta * 8, 1)
  rig.rotation.y = Math.max(-0.45, Math.min(0.45, (player.position.x - targetX) * 0.22))

  menuShift += ((attract && camera.aspect > 1.2 ? 2.4 : 0) - menuShift) * Math.min(delta * 3, 1)
  camera.position.x += (player.position.x * 0.22 - menuShift - camera.position.x) * Math.min(delta * 2.2, 1)
  let shakeX = 0
  let shakeY = 0
  if (shake > 0) {
    shake = Math.max(0, shake - delta)
    shakeX = (Math.random() - 0.5) * shake * 0.6
    shakeY = (Math.random() - 0.5) * shake * 0.6
  }
  camera.position.y = cameraRig.y + shakeY
  camera.position.x += shakeX
  camera.lookAt(player.position.x * 0.18 - menuShift, 1.9, -7)
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
