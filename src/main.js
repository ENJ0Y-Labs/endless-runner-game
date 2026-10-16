import * as THREE from 'three'
import './style.css'

const app = document.querySelector('#app')
app.innerHTML = `
  <main class="game-shell">
    <header class="game-hud">
      <span class="game-brand">RELIC RUSH <b>3D</b></span>
      <div class="hud-stats"><span>SCORE <strong id="score">0</strong></span><span>RELICS <strong id="relics">0</strong></span></div>
      <button class="pause-button" id="pause-button" type="button" hidden>Pause</button>
    </header>
    <div class="scene-container" aria-label="Three-dimensional endless runner game">
      <section class="game-overlay" id="start-overlay">
        <p class="eyebrow">Start.ng game</p><h1>Relic Rush <span>3D</span></h1>
        <p>Switch lanes, dodge danger, and collect relics.</p>
        <button class="primary-button" id="play-button" type="button">Start running</button>
        <p class="overlay-hint">Keyboard: ← / → or A / D · Mobile: swipe left or right</p>
      </section>
      <section class="game-overlay" id="pause-overlay" hidden>
        <p class="eyebrow">Run paused</p><h2>Take a breather.</h2>
        <button class="primary-button" id="resume-button" type="button">Resume</button>
      </section>
      <section class="game-overlay" id="gameover-overlay" hidden>
        <p class="eyebrow">Run complete</p><h2>Game over</h2>
        <p>Final score: <strong id="final-score">0</strong> · Relics: <strong id="final-relics">0</strong></p>
        <button class="primary-button" id="restart-button" type="button">Run again</button>
      </section>
      <div class="touch-controls" aria-label="Lane controls">
        <button type="button" id="left-button" aria-label="Move left">←</button>
        <button type="button" id="right-button" aria-label="Move right">→</button>
      </div>
    </div>
    <footer class="scene-help"><span class="help-key">A</span><span class="help-key">D</span><span>Move between lanes · Swipe or use the arrows on mobile</span></footer>
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

// Temporary geometric placeholder. Start.ng appearance mapping is a later phase.
const player = new THREE.Group()
player.position.set(0, 0.16, 2.2)
scene.add(player)
const skin = new THREE.MeshStandardMaterial({ color: '#c98961', roughness: 0.82 })
const shirt = new THREE.MeshStandardMaterial({ color: '#ff7a00', roughness: 0.72 })
const trousers = new THREE.MeshStandardMaterial({ color: '#202735', roughness: 0.8 })
const shoes = new THREE.MeshStandardMaterial({ color: '#f2f2f2', roughness: 0.65 })
function addPart(geometry, material, position) {
  const mesh = new THREE.Mesh(geometry, material)
  mesh.position.set(...position)
  mesh.castShadow = true
  mesh.receiveShadow = true
  player.add(mesh)
  return mesh
}
addPart(new THREE.BoxGeometry(0.55, 0.7, 0.32), shirt, [0, 1.18, 0])
addPart(new THREE.SphereGeometry(0.25, 20, 16), skin, [0, 1.77, 0])
addPart(new THREE.BoxGeometry(0.16, 0.52, 0.18), skin, [-0.39, 1.19, 0])
addPart(new THREE.BoxGeometry(0.16, 0.52, 0.18), skin, [0.39, 1.19, 0])
addPart(new THREE.BoxGeometry(0.2, 0.58, 0.22), trousers, [-0.16, 0.55, 0])
addPart(new THREE.BoxGeometry(0.2, 0.58, 0.22), trousers, [0.16, 0.55, 0])
addPart(new THREE.BoxGeometry(0.22, 0.13, 0.36), shoes, [-0.16, 0.22, -0.04])
addPart(new THREE.BoxGeometry(0.22, 0.13, 0.36), shoes, [0.16, 0.22, -0.04])

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
const state = { mode: 'ready', lane: 1, elapsed: 0, score: 0, relics: 0, speed: 13 }
const startOverlay = app.querySelector('#start-overlay')
const pauseOverlay = app.querySelector('#pause-overlay')
const gameoverOverlay = app.querySelector('#gameover-overlay')
const pauseButton = app.querySelector('#pause-button')
const scoreElement = app.querySelector('#score')
const relicsElement = app.querySelector('#relics')
const hideOverlays = () => {
  startOverlay.hidden = true
  pauseOverlay.hidden = true
  gameoverOverlay.hidden = true
}
function updateHud() {
  scoreElement.textContent = String(state.score)
  relicsElement.textContent = String(state.relics)
}
function setMode(mode) {
  state.mode = mode
  hideOverlays()
  pauseButton.hidden = mode !== 'running'
  if (mode === 'ready') startOverlay.hidden = false
  if (mode === 'paused') pauseOverlay.hidden = false
  if (mode === 'gameover') {
    gameoverOverlay.hidden = false
    app.querySelector('#final-score').textContent = String(state.score)
    app.querySelector('#final-relics').textContent = String(state.relics)
  }
}
function moveLane(direction) {
  if (state.mode !== 'running') return
  state.lane = Math.max(0, Math.min(2, state.lane + direction))
}
function resetRun() {
  state.lane = 1
  state.elapsed = 0
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
app.querySelector('#play-button').addEventListener('click', startRun)
app.querySelector('#restart-button').addEventListener('click', startRun)
app.querySelector('#resume-button').addEventListener('click', togglePause)
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
  if (Math.abs(dx) > 35 && Math.abs(dx) > Math.abs(dy)) moveLane(dx < 0 ? -1 : 1)
  touchStart = null
}, { passive: true })
setMode('ready')
seedWorldObjects()

const clock = new THREE.Clock()
function animate() {
  const delta = Math.min(clock.getDelta(), 0.05)
  if (state.mode === 'running') {
    state.elapsed += delta
    // Speed ramps up gradually, with a sensible cap to keep late-game control possible.
    state.speed = Math.min(13 + state.elapsed * 0.22, 25)
    state.score = Math.floor(state.elapsed * 10) + state.relics * 100
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
  player.position.x += (targetX - player.position.x) * Math.min(delta * 12, 1)
  player.position.y = 0.16 + (state.mode === 'running' ? Math.sin(clock.elapsedTime * 7) * 0.035 : 0)
  camera.position.x += (player.position.x * 0.22 - camera.position.x) * Math.min(delta * 2.2, 1)
  camera.lookAt(player.position.x * 0.18, 1.15, -5)
  renderer.render(scene, camera)
  requestAnimationFrame(animate)
}
animate()
window.addEventListener('beforeunload', () => {
  resizeObserver.disconnect()
  renderer.dispose()
})
