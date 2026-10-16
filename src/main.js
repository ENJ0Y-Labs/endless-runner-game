import * as THREE from 'three'
import './style.css'

const app = document.querySelector('#app')
app.innerHTML = `
  <main class="game-shell">
    <header class="game-hud"><span class="game-brand">RELIC RUSH <b>3D</b></span><span class="phase-label">ENVIRONMENT PROTOTYPE</span></header>
    <div class="scene-container" aria-label="Three-dimensional endless runner environment"></div>
    <footer class="scene-help"><span class="help-key">A</span><span class="help-key">D</span><span>Environment preview · movement controls arrive in the next phase</span></footer>
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

const clock = new THREE.Clock()
function animate() {
  const delta = Math.min(clock.getDelta(), 0.05)
  for (const mark of markings) {
    mark.position.z += delta * 13
    if (mark.position.z > 12) mark.position.z -= 112
  }
  for (const item of scenery) {
    item.position.z += delta * 13
    if (item.position.z > 12) item.position.z -= 121
  }
  player.position.y = 0.16 + Math.sin(clock.elapsedTime * 7) * 0.035
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
