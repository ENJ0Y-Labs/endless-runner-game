import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import "./style.css";
import { mountJapaRush } from "./story-mode.js";
import { GAME_CONFIG as CFG } from "./game/config.js";
import { recycleSceneryChunks, resetSceneryChunks } from "./game/scenery-stream.js";

const app = document.querySelector("#app");

// Preserve the short-lived Start.ng game session for server-side identity checks.
const startNgSessionParams = new URLSearchParams(location.hash.slice(1));
const startNgGameSession = startNgSessionParams.get("startng_session");
if (startNgGameSession) {
  sessionStorage.setItem("relic_rush_startng_session", startNgGameSession);
  history.replaceState(null, "", location.pathname + location.search);
}
async function syncPlayerWithAdminDirectory() {
  const apiBase = window.RELIC_RUSH_ADMIN_API;
  const session = sessionStorage.getItem("relic_rush_startng_session");
  if (!apiBase || !session) return;
  try {
    const response = await fetch(`${apiBase.endsWith("/") ? apiBase.slice(0, -1) : apiBase}/api/players/sync`, {
      method: "POST",
      headers: { Authorization: `Bearer ${session}` },
    });
    if (!response.ok) return;
    const identity = await response.json();
    const adminLink = document.querySelector("#admin-nav-link");
    if (adminLink) adminLink.hidden = identity.isOwner !== true;
  } catch {
    // Admin tracking is optional and must never interrupt gameplay.
  }
}
const requestedPage = new URLSearchParams(window.location.search).get("page");
const page = ["play", "leaderboard", "story"].includes(requestedPage) ? requestedPage : "welcome";
const storyChapterId = new URLSearchParams(window.location.search).get("storyChapter");
const STORY_SKINS = {
  "lagos-hustle": { fog: "#d6a47b", skyTop: "#b77c57", skyMid: "#e6aa75", skyLow: "#ffd49a", stone: "#a66c45", stoneDark: "#70442f", stoneDeep: "#39271f", stoneBand: "#e5a94a", stoneLight: "#d49a62", gold: "#f5bd48", crate: "#e8a92d", crateBand: "#f0dcae", leafDark: "#34452d", leafMid: "#4b6337", leafLight: "#70864b" },
  "emilokan-expressway": { fog: "#899da4", skyTop: "#718b9b", skyMid: "#a9c2ce", skyLow: "#d4dfe0", stone: "#68777c", stoneDark: "#3f4c53", stoneDeep: "#28343b", stoneBand: "#d5a13a", stoneLight: "#9ba9a9", gold: "#f2b73c", crate: "#66737a", crateBand: "#d9dadd", leafDark: "#344b43", leafMid: "#4b6558", leafLight: "#789083" },
  "the-system": { fog: "#8d8988", skyTop: "#625f63", skyMid: "#a39b98", skyLow: "#c7bcb1", stone: "#77716e", stoneDark: "#494548", stoneDeep: "#29272b", stoneBand: "#b58b4d", stoneLight: "#b3a69a", gold: "#e5b95e", crate: "#b9a68f", crateBand: "#e0d3bd", leafDark: "#3f4943", leafMid: "#58645b", leafLight: "#7c8577" },
  "japa-terminal": { fog: "#91a9b5", skyTop: "#607d91", skyMid: "#a8c3d0", skyLow: "#d9e3e5", stone: "#879da5", stoneDark: "#4c626c", stoneDeep: "#293b45", stoneBand: "#d7a94c", stoneLight: "#c0d0d1", gold: "#f4c86a", crate: "#597c91", crateBand: "#d7e0e1", leafDark: "#394f52", leafMid: "#536e70", leafLight: "#829b9a" }
};
const storySkin = STORY_SKINS[storyChapterId] ?? null;
const storyChapterTitle = ({
  "lagos-hustle": "Lagos Hustle",
  "emilokan-expressway": "The Emilokan Expressway",
  "the-system": "The System",
  "japa-terminal": "The Japa Terminal",
})[storyChapterId] ?? "";
document.body.dataset.page = page;
document.body.dataset.storyChapter = storyChapterId || "";

app.innerHTML = `
  <main class="game-shell">
    <nav class="page-nav" aria-label="Main navigation">
      <a class="page-nav-brand" href="./">RELIC RUSH <b>3D</b></a>
      <div class="page-nav-links">
        <a href="./?page=play" ${page === "play" ? 'aria-current="page"' : ""}>Play</a>
        <a href="./?page=leaderboard" ${page === "leaderboard" ? 'aria-current="page"' : ""}>Leaderboard</a>
        <a href="./?page=story" ${page === "story" ? 'aria-current="page"' : ""}>Story</a>
        <a id="admin-nav-link" href="./admin/" hidden>Admin</a>
      </div>
    </nav>
    <section class="welcome-page mode-selection-page" aria-labelledby="welcome-title">
      <div class="mode-selection-backdrop" aria-hidden="true"></div>
      <div class="mode-selection-content">
        <p class="eyebrow">${storySkin ? `JAPA RUSH · ${storyChapterTitle}` : "START.NG ORIGINAL · THREE-LANE RUNNER"}</p>
        <h1 id="welcome-title" class="title-art">RELIC RUSH <span class="t-3d">3D</span></h1>
        <p class="mode-selection-intro">Two ways to run. Choose your escape.</p>
        <div class="mode-selection-grid">
          <a class="mode-choice mode-choice-classic" href="./?page=play">
            <span class="mode-choice-kicker">ENDLESS SURVIVAL</span>
            <strong>CLASSIC MODE</strong>
            <span>Run, dodge obstacles, collect relics, and chase your best score.</span>
            <span class="mode-choice-action">PLAY CLASSIC <b aria-hidden="true">→</b></span>
          </a>
          <a class="mode-choice mode-choice-story" href="./?page=story">\n            <img class="mode-choice-image" src="./assets/environment/lagos-hustle.jpg" alt="" loading="eager" onerror="this.hidden=true">
            <span class="mode-choice-kicker">THE GREAT ESCAPE</span>
            <strong>JAPA RUSH <em>STORY MODE</em></strong>
            <span>Outrun the Big Man across Lagos, the expressway, the system, and the terminal.</span>
            <span class="mode-choice-action">ENTER STORY <b aria-hidden="true">→</b></span>
          </a>
        </div>
        <a class="mode-leaderboard-link" href="./?page=leaderboard">View leaderboard</a>
      </div>
    </section>
    <header class="game-hud" id="game-hud" hidden>
      <span class="startng-hud-label">START.NG</span>
      <div class="hud-stats">
        <span>DISTANCE <strong id="distance">0 m</strong></span>
        <span>RELICS <strong id="relics">0</strong></span>
        <span>BEST <strong id="best-score">0</strong></span>
      </div>
    </header>
      <div class="scene-container" aria-label="Three-dimensional endless runner game">
      <button class="pause-button" id="pause-button" type="button" aria-label="Pause game" title="Pause game" hidden>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" aria-hidden="true" focusable="false">
          <path d="M176 96C149.5 96 128 117.5 128 144L128 496C128 522.5 149.5 544 176 544L240 544C266.5 544 288 522.5 288 496L288 144C288 117.5 266.5 96 240 96L176 96zM400 96C373.5 96 352 117.5 352 144L352 496C352 522.5 373.5 544 400 544L464 544C490.5 544 512 522.5 512 496L512 144C512 117.5 490.5 96 464 96L400 96z" />
        </svg>
      </button>
      <div class="scene-loading" id="scene-loading" role="status" aria-live="polite"><span class="loading-indicator" aria-hidden="true"></span> Preparing your track…</div>
      <section class="game-overlay ${storySkin ? "story-start-overlay" : ""}" id="start-overlay">
        <div class="pre-game-topbar">
          <button class="sound-button" id="sound-toggle" type="button" aria-label="Mute sound" aria-pressed="false">${storySkin ? "Sound on" : "SOUND ON"}</button>
          <div class="player-identity" id="player-identity" aria-live="polite">
            <span class="player-avatar" aria-hidden="true">G</span>
            <span class="player-identity-copy">
              <strong id="player-name">GUEST</strong>
              <small id="player-account" hidden>Guest player</small>
            </span>
            <button class="sign-in-button" id="player-sign-in" type="button" aria-label="Sign in to Start.ng" title="Sign in to Start.ng">T</button>
          </div>
        </div>
        ${storySkin
          ? `<h1 class="title-art story-title-art" aria-label="Japa Rush"><span class="t-line">JAPA</span><span class="t-line">RUSH</span></h1><p class="story-chapter-subtitle">${storyChapterTitle}</p>`
          : `<h1 class="title-art" aria-label="Relic Rush 3D"><span class="t-line" aria-hidden="true">Relic</span><span class="t-line" aria-hidden="true">Rush <span class="t-3d">3D</span></span></h1>`}
        <div class="instruction-grid" aria-label="How to play">
          <div class="instruction-card"><strong>Switch lanes</strong><small>Arrow keys or A/D</small></div>
          <div class="instruction-card"><strong>Jump</strong><small>Space, Up, or swipe up</small></div>
          <div class="instruction-card"><strong>${storySkin ? "Collect Naira" : "Collect relics"}</strong><small>+100 points each</small></div>
          <div class="instruction-card"><strong>${storySkin ? "Avoid hazards" : "Avoid obstacles"}</strong><small>${storySkin ? "Avoid crates and cars" : "Jump over crates"}</small></div>
        </div>
        <button class="primary-button" id="play-button" type="button">START RUNNING</button>
      </section>
      <section class="game-overlay" id="pause-overlay" hidden>
        <p class="eyebrow">Run paused</p><h2>Take a breather.</h2>
        <div class="overlay-actions pause-actions">
          <button class="primary-button" id="resume-button" type="button">Resume</button>
          <a class="secondary-button" href="./">Main menu</a>
          <button class="quiet-button" id="pause-restart-button" type="button">Restart run</button>
        </div>
      </section>
      <section class="game-overlay" id="gameover-overlay" hidden>
        <p class="eyebrow">Run complete</p><h2>Game over</h2>
        <p>Final score: <strong id="final-score">0</strong> · Distance: <strong id="final-distance">0 m</strong> · Relics: <strong id="final-relics">0</strong></p><p class="best-run-summary">Best run: <strong id="final-best-score">0</strong></p>
        <p class="startng-branding">Play more on start.ng</p>
        <div class="overlay-actions">
          <a class="secondary-button" id="share-result-button" href="https://twitter.com/intent/tweet" target="_blank" rel="noopener noreferrer">Share result on X</a>
          <button class="primary-button" id="restart-button" type="button">Run again</button>
        </div>
      </section>
      <div class="touch-controls" aria-label="Movement and jump controls">
        <button type="button" id="left-button" aria-label="Move left">←</button>
        <button type="button" id="jump-button" aria-label="Jump">↑</button>
        <button type="button" id="right-button" aria-label="Move right">→</button>
      </div>
    </div>

    <section class="story-teaser" aria-labelledby="story-teaser-title">
      <div class="story-teaser-art" aria-hidden="true">
        <span class="story-road-line"></span>
        <span class="story-suitcase">▰</span>
        <span class="story-sun"></span>
      </div>
      <div class="story-teaser-content">
        <div class="story-teaser-heading">
          <p class="eyebrow">A new adventure is on the way</p>
          <span class="coming-soon-badge"><span aria-hidden="true"></span> Coming soon</span>
        </div>
        <h2 id="story-teaser-title">Japa Rush <span>Story Mode</span></h2>
        <p class="story-hook">“You think you can Japa? The Big Man is coming for you!” One suitcase. One-way ticket. A never-ending highway. Dodge the country’s problems as they come flying at you, and try to reach the terminal before the system catches up.</p>
        <p class="story-teaser-detail">Race through Lagos Hustle, survive the Emilokan Expressway, face the system, and make a final dash for the Japa Terminal.</p>
        <a class="primary-button japa-teaser-button" href="./?page=story">Enter Japa Rush</a>
        <div class="story-credit"><span class="credit-mark" aria-hidden="true">✦</span><span><strong>Story concept by ambh4ck3r</strong><small>Fam-submitted story concept</small></span></div>
      </div>
    </section>
    <section id="japa-story-root" class="japa-story-root" hidden aria-live="polite"></section>
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
  </main>`;

const storyRoot = app.querySelector("#japa-story-root");
if (page === "story") {
  storyRoot.hidden = false;
  mountJapaRush(storyRoot);
}

if (page !== "story") {
const container = app.querySelector(".scene-container");
const LANE_X = CFG.laneX;

// ---------------------------------------------------------------------------
// Palette: sampled from the cover art (golden-hour temple ruins).
// ---------------------------------------------------------------------------
const PAL = storySkin ?? {
  fog: "#e3b070",
  skyTop: "#d6bd96",
  skyMid: "#f6d4a0",
  skyLow: "#ffc27a",
  stone: "#a98760",
  stoneDark: "#6a5039",
  stoneDeep: "#4a3626",
  stoneBand: "#c97a2c",
  stoneLight: "#d2ae7a",
  gold: "#f2b73c",
  crate: "#d4432c",
  crateBand: "#e8b25a",
  leafDark: "#2c4a2a",
  leafMid: "#3d6430",
  leafLight: "#557a35",
};

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(PAL.fog, 30, 190);

// Screen-space gradient sky (cheap: no sky dome to render or fog).
function gradientTexture(stops, width = 4, height = 256) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  for (const [offset, color] of stops) gradient.addColorStop(offset, color);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
scene.background = gradientTexture([
  [0, PAL.skyTop],
  [0.38, PAL.skyMid],
  [0.56, PAL.skyLow],
  [1, PAL.fog],
]);
const skyCanvas = scene.background.image;
const skyContext = skyCanvas.getContext("2d");

const camera = new THREE.PerspectiveCamera(56, 1, 0.1, 260);
const cameraRig = { y: 4, z: 8.4 };
let menuShift = 0; // slides the camera sideways on the start screen so the runner sits clear of the title, as on the cover
camera.position.set(0, cameraRig.y, cameraRig.z);
camera.lookAt(0, 1.9, -7);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
container.appendChild(renderer.domElement);

// Warm golden-hour light: low sun from the upper right, like the cover.
const hemisphere = new THREE.HemisphereLight("#ffe8c8", storyChapterId === "lagos-hustle" ? "#80604a" : "#5a4330", storyChapterId === "lagos-hustle" ? 2.0 : 1.55);
scene.add(hemisphere);
const sun = new THREE.DirectionalLight("#ffcf91", storyChapterId === "lagos-hustle" ? 4.1 : 3.4);
sun.position.set(9, 13, -2);
sun.target.position.set(0, 0, -8);
sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024);
sun.shadow.camera.left = -12;
sun.shadow.camera.right = 12;
sun.shadow.camera.top = 20;
sun.shadow.camera.bottom = -20;
sun.shadow.bias = -0.0004;
scene.add(sun, sun.target);

// ---------------------------------------------------------------------------
// Geometry helpers. Static decor is merged into vertex-coloured meshes so the
// whole scene stays at a few dozen draw calls, which matters on phones.
// ---------------------------------------------------------------------------
const tmpMatrix = new THREE.Matrix4();
const tmpQuat = new THREE.Quaternion();
const tmpEuler = new THREE.Euler();
const tmpPos = new THREE.Vector3();
const tmpScale = new THREE.Vector3();
const tmpColor = new THREE.Color();
function part(
  geometry,
  color,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = [1, 1, 1],
) {
  return { geometry, color, position, rotation, scale };
}
function mergeParts(parts) {
  const prepared = parts.map((entry) => {
    const geometry = entry.geometry.index
      ? entry.geometry.toNonIndexed()
      : entry.geometry.clone();
    tmpMatrix.compose(
      tmpPos.set(...entry.position),
      tmpQuat.setFromEuler(tmpEuler.set(...entry.rotation)),
      tmpScale.set(...entry.scale),
    );
    geometry.applyMatrix4(tmpMatrix);
    const count = geometry.attributes.position.count;
    const colors = new Float32Array(count * 3);
    tmpColor.set(entry.color);
    for (let i = 0; i < count; i++) {
      colors[i * 3] = tmpColor.r;
      colors[i * 3 + 1] = tmpColor.g;
      colors[i * 3 + 2] = tmpColor.b;
    }
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return geometry;
  });
  const merged = mergeGeometries(prepared);
  prepared.forEach((geometry) => geometry.dispose());
  return merged;
}
const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
const vertexMaterial = new THREE.MeshStandardMaterial({
  vertexColors: true,
  roughness: 0.92,
  flatShading: true,
});
function seeded(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------------------------------------------------------------------------
// Track: sandstone slabs that scroll under the runner, gold rails, stone curbs.
// ---------------------------------------------------------------------------
const TRACK_LENGTH = 150;
const TRACK_CENTER_Z = -60;
const SLAB_DEPTH = CFG.trackWidth / 2;

function createSlabTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  const random = seeded(7);
  ctx.fillStyle = storySkin ? "#55443a" : "#b8946a";
  ctx.fillRect(0, 0, 512, 256);
  if (storyChapterId === "lagos-hustle") {
    // Continuous asphalt with broken white lane dividers, matching the reference road.
    for (const x of [170, 342]) {
      ctx.fillStyle = "#e7d2a7";
      for (let y = 0; y < 256; y += 128) ctx.fillRect(x - 3, y + 12, 6, 62);
    }
    ctx.fillStyle = "rgba(35,25,20,.18)";
    for (let i=0;i<1800;i++) ctx.fillRect(random()*512,random()*256,1+random()*2,1+random()*2);
  } else
  // Two staggered rows of four slabs per tile, each with its own tint.
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 4; col++) {
      const x = col * 128 + (row ? 64 : 0) - 64;
      const y = row * 128;
      for (const offset of [0, 512]) {
        const shade = 168 + Math.floor(random() * 26);
        ctx.fillStyle = `rgb(${shade + 22}, ${shade}, ${shade - 38})`;
        ctx.fillRect(x + offset, y, 128, 128);
      }
    }
  }
  for (let i = 0; i < 1400; i++) {
    ctx.fillStyle = `rgba(70, 44, 20, ${random() * 0.09})`;
    ctx.fillRect(
      random() * 512,
      random() * 256,
      1 + random() * 3,
      1 + random() * 3,
    );
  }
  ctx.strokeStyle = "rgba(58, 36, 16, 0.55)";
  ctx.lineWidth = 4;
  for (let row = 0; row < 2; row++) {
    ctx.beginPath();
    ctx.moveTo(0, row * 128 + 2);
    ctx.lineTo(512, row * 128 + 2);
    ctx.stroke();
    for (let col = -1; col < 5; col++) {
      const x = col * 128 + (row ? 64 : 0);
      ctx.beginPath();
      ctx.moveTo(x + 2, row * 128);
      ctx.lineTo(x + 2, row * 128 + 128);
      ctx.stroke();
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, TRACK_LENGTH / SLAB_DEPTH);
  texture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
  return texture;
}
const slabTexture = createSlabTexture();
const trackSide = new THREE.MeshStandardMaterial({
  color: storyChapterId === "lagos-hustle" ? "#55443a" : PAL.stoneDark,
  roughness: 1,
});
const trackTop = new THREE.MeshStandardMaterial({
  map: slabTexture,
  color: "#ffffff",
  roughness: 0.96,
});
const track = new THREE.Mesh(
  new THREE.BoxGeometry(CFG.trackWidth, 0.22, TRACK_LENGTH),
  [trackSide, trackSide, trackTop, trackSide, trackSide, trackSide],
);
track.position.set(0, 0, TRACK_CENTER_Z);
track.receiveShadow = true;
scene.add(track);

const groundMaterial = new THREE.MeshStandardMaterial({
  color: storyChapterId === "lagos-hustle" ? "#b18b68" : "#5b4a2c",
  roughness: 1,
});
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(420, 420),
  groundMaterial,
);
ground.rotation.x = -Math.PI / 2;
ground.position.set(0, -0.14, -80);
ground.receiveShadow = true;
scene.add(ground);

// Gaps are dark recessed-looking overlays on the track, pooled and moved with the world.
const gapMaterial = new THREE.MeshStandardMaterial({
  color: "#100f12",
  roughness: 1,
});
const gapPool = Array.from({ length: 3 }, () => {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(CFG.trackWidth * 0.98, 0.035, 3.2),
    gapMaterial,
  );
  mesh.position.y = 0.126;
  mesh.visible = false;
  scene.add(mesh);
  return { mesh, active: false };
});

const railMaterial = new THREE.MeshStandardMaterial({
  color: PAL.gold,
  emissive: "#7a4a08",
  emissiveIntensity: 0.55,
  metalness: 0.5,
  roughness: 0.38,
});
const curbMaterial = new THREE.MeshStandardMaterial({
  color: "#9a7a52",
  roughness: 0.95,
});
const railGeometry = new THREE.BoxGeometry(0.1, 0.05, TRACK_LENGTH);
const curbGeometry = new THREE.BoxGeometry(0.6, 0.42, TRACK_LENGTH);
for (const x of [-1.23, 1.23, -3.45, 3.45]) {
  const rail = new THREE.Mesh(railGeometry, railMaterial);
  rail.position.set(x, 0.135, TRACK_CENTER_Z);
  scene.add(rail);
}
for (const x of [-(CFG.trackWidth / 2 + 0.3), CFG.trackWidth / 2 + 0.3]) {
  const curb = new THREE.Mesh(curbGeometry, curbMaterial);
  curb.position.set(x, 0.1, TRACK_CENTER_Z);
  curb.castShadow = true;
  curb.receiveShadow = true;
  scene.add(curb);
}

// ---------------------------------------------------------------------------
// Backdrop: hazy temple, sphinx and cliffs that sit inside the fog, as on the cover.
// Seasonal color variants reuse the same merged geometry to keep mobile draw calls low.
// ---------------------------------------------------------------------------
const seasonalMeshes = [];
const storyBackdropChunks = [];
const storyBackdropInitialPositions = [];
let storyBackdropBounds = null;
function registerSeasonalMesh(mesh) {
  const colors = mesh.geometry.getAttribute("color");
  if (colors) mesh.geometry.userData.baseVertexColors = colors.array.slice();
  seasonalMeshes.push(mesh);
}
function buildBackdrop() {
  if (storyChapterId === "lagos-hustle") {
    const parts = [];
    const rand = seeded(21);
    const add = (geometry, color, position, rotation = [0,0,0], scale = [1,1,1]) => parts.push(part(geometry, color, position, rotation, scale));
    const shopColors = ["#b85b35", "#d69a48", "#557b72", "#8f4d38", "#c1a06a"];
    for (const side of [-1, 1]) {
      for (let i = 0; i < 7; i++) {
        const z = -18 - i * 21, x = side * (7.5 + rand() * 1.0);
        const w = 3.8 + rand() * 1.2, h = 3.2 + rand() * 2.1;
        add(box(w,h,7.5), shopColors[i % shopColors.length], [x,h/2,z]);
        add(box(w+.35,.35,7.8), "#4b3429", [x,h+.18,z]);
        add(box(w+.4,.22,1.1), i%2 ? "#d8a34e" : "#397a78", [x,2.45,z+3.9]);
        add(box(.16,1.5,.18), "#e5d1aa", [x-w*.28,1.05,z+4]);
        add(box(.16,1.5,.18), "#e5d1aa", [x+w*.28,1.05,z+4]);
        if (i%2===0) add(new THREE.CylinderGeometry(.48,.52,1.2,8), "#687276", [x+side*1.1,h+.85,z-1]);
        if (i<4) {
          add(box(3.8,.16,2.4), "#d9b77b", [x-side*1.4,2.25,z+5.2]);
          add(box(3.3,1.1,.75), "#765039", [x-side*1.4,.75,z+6]);
        }
      }
      for (let i=0;i<5;i++) {
        const z=-18-i*27, x=side*(7.4+(i%2)*.4);
        add(new THREE.CylinderGeometry(.09,.13,8,6), "#393b39", [x,4,z]);
        add(box(3.5,.12,.12), "#393b39", [x-side*1.5,7.4,z]);
        add(box(.08,.08,2.2), "#252b2c", [x-side*.7,7.1,z+.8]);
      }
    }
    // Distant lagoon flyover and exit landmark: the reference image's main vanishing-point silhouette.
    add(box(34,.38,2.0), "#8d806f", [0,7.2,-142]);
    add(box(34,.16,2.1), "#c49a70", [0,6.94,-142]);
    add(box(.7,6.6,1.6), "#75624f", [-12.8,3.3,-142]);
    add(box(.7,6.6,1.6), "#75624f", [12.8,3.3,-142]);
    // Green overhead EXIT sign, kept as geometry so it remains legible in perspective.
    add(box(3.8,1.65,.18), "#315d39", [0,5.9,-139.8]);
    add(box(3.58,1.43,.06), "#6c9860", [0,5.9,-139.66]);
    add(box(.06,1.18,.04), "#f1e8c8", [-1.48,5.9,-139.59]);
    add(box(.06,1.18,.04), "#f1e8c8", [1.48,5.9,-139.59]);
    add(box(2.5,.06,.04), "#f1e8c8", [0,6.28,-139.56]);
    // Utility poles, crossarms and sagging-looking cable runs on both verges.
    for (const side of [-1, 1]) {
      for (let i=0;i<5;i++) {
        const z=-13-i*25;
        const x=side*(9.25+(i%2)*.25);
        add(box(.24,8.8,.24), "#493c35", [x,4.4,z]);
        add(box(2.6,.18,.2), "#493c35", [x-side*.55,8.35,z]);
        add(box(.12,.55,.12), "#302b29", [x-side*1.05,8.55,z]);
      }
      for (let i=0;i<4;i++) {
        const z=-25-i*25;
        add(box(.075,.075,25.5), "#28282a", [side*9.25,8.45,z], [0,0,side*.025]);
        add(box(.055,.055,25.5), "#3b3030", [side*8.55,8.05,z], [0,0,-side*.018]);
      }
    }
    // Roadside stall details: striped awnings, signboards and stools reinforce the busy street.
    for (const side of [-1,1]) {
      for (let i=0;i<5;i++) {
        const z=-18-i*25;
        const x=side*(8.1+(i%2)*.3);
        add(box(3.7,.22,2.1), i%2 ? "#4c8b78" : "#d5a34f", [x,3.0,z]);
        for(let stripe=0;stripe<5;stripe++) {
          add(box(.68,.24,2.12), stripe%2 ? "#e5d1a0" : "#b85a3c", [x-1.48+stripe*.74,3.02,z]);
        }
        add(box(2.6,1.5,.18), "#e7d2a3", [x,4.05,z-1.25]);
        add(box(2.35,1.22,.08), "#7a4b35", [x,4.05,z-1.13]);
        add(box(.62,.12,.62), "#6c4935", [x-side*.8,.62,z+1.5]);
        add(box(.12,.58,.12), "#59402f", [x-side*.8,.32,z+1.5]);
      }
    }
    // Parked danfos sit beyond the curb as environmental set dressing, never as surprise hitboxes.
    for (const [x,z,body] of [[-6.25,-38,"#e7b928"],[6.25,-82,"#d6a52b"]]) {
      add(box(2.55,1.65,4.9), body, [x,1.45,z]);
      add(box(2.42,.72,2.15), "#252f34", [x,2.58,z-1.02]);
      add(box(2.25,.62,1.65), "#dce1d9", [x,2.52,z+.95]);
      add(box(2.7,.22,4.95), "#202a2d", [x,.62,z]);
      add(box(2.62,.2,4.9), "#f1d7a0", [x,2.33,z]);
      for (const wx of [-1.12,1.12]) for (const wz of [-1.45,1.45])
        add(new THREE.CylinderGeometry(.34,.34,.18,10), "#202326", [x+wx,.42,z+wz], [Math.PI/2,0,0]);
    }
    // A small okada silhouette and generator complete the roadside clutter.
    for (const [x,z] of [[-5.9,-58],[6.0,-104]]) {
      add(new THREE.CylinderGeometry(.28,.28,.14,10), "#24282a", [x-.65,.34,z], [Math.PI/2,0,0]);
      add(new THREE.CylinderGeometry(.28,.28,.14,10), "#24282a", [x+.65,.34,z], [Math.PI/2,0,0]);
      add(box(1.35,.22,.3), "#b94f2d", [x,.72,z]);
      add(box(.42,.42,.42), "#343b3d", [x+.1,1.02,z-.1]);
    }
    add(box(1.5,1.1,1.1), "#4c5550", [-7.1,.55,-68]);
    add(box(.12,.16,1.25), "#d7b15e", [-7.1,1.18,-68]);
    for (const side of [-1,1]) {
      add(box(2.0,.22,130), "#c9a27a", [side*6.5,.02,-74]);
      add(box(.16,.12,130), "#e4c28e", [side*5.45,.13,-74]);
    }
    const mesh = new THREE.Mesh(mergeParts(parts), vertexMaterial);
    mesh.castShadow = false; mesh.receiveShadow = true;
    // Use the authored mesh bounds to know when the nearest edge has passed
    // the runner. The 130-unit spacing is the existing streetscape module pitch.
    mesh.geometry.computeBoundingBox();
    const localBounds = mesh.geometry.boundingBox;
    for (let i = 0; i < 3; i++) {
      const chunk = new THREE.Group();
      const copy = mesh.clone();
      copy.position.z = 0;
      chunk.add(copy);
      const initialZ = -i * 130;
      chunk.position.z = initialZ;
      storyBackdropInitialPositions.push(initialZ);
      scene.add(chunk);
      storyBackdropChunks.push(chunk);
    }
    storyBackdropBounds = {
      minZ: localBounds.min.z,
      maxZ: localBounds.max.z,
      spacing: Math.abs(storyBackdropInitialPositions[0] - storyBackdropInitialPositions[1]),
    };
    return;
  }
  const parts = [];
  const rand = seeded(21);
  const temple = [0, 0, -160];
  const at = (x, y, z) => [temple[0] + x, temple[1] + y, temple[2] + z];
  parts.push(part(box(96, 4, 40), PAL.stoneDark, at(0, 2, 0)));
  parts.push(part(box(72, 6, 30), "#8a6a48", at(0, 7, 0)));
  parts.push(part(box(46, 10, 20), PAL.stone, at(0, 15, 0)));
  parts.push(part(box(30, 6, 14), PAL.stoneLight, at(0, 23, 0)));
  parts.push(part(box(8, 13, 1.2), "#2b1b10", at(0, 12.5, 10.4)));
  for (let i = -3; i <= 3; i++) {
    parts.push(
      part(
        new THREE.CylinderGeometry(1.7, 1.9, 15, 7),
        "#b79570",
        at(i * 7.5, 11.5, 13),
      ),
    );
    parts.push(part(box(4.4, 1.2, 4.4), PAL.stoneDark, at(i * 7.5, 19.6, 13)));
  }
  parts.push(part(box(58, 3.2, 7), "#9a7850", at(0, 21.4, 13)));
  for (const side of [-1, 1]) {
    parts.push(part(box(14, 34, 14), "#8f6e4a", at(side * 44, 17, -4)));
    parts.push(part(box(16, 3, 16), PAL.stoneLight, at(side * 44, 35, -4)));
  }
  // Sphinx guarding the end of the track, facing the player.
  const sphinx = [0, 0, -128];
  const sat = (x, y, z) => [sphinx[0] + x, sphinx[1] + y, sphinx[2] + z];
  parts.push(part(box(16, 1.6, 22), PAL.stoneDark, sat(0, 0.8, 0)));
  parts.push(part(box(5.4, 3.4, 11), "#d2a96a", sat(0, 3.3, -1)));
  parts.push(part(box(1.6, 1.4, 6), "#d9b274", sat(-1.7, 2.3, 6.5)));
  parts.push(part(box(1.6, 1.4, 6), "#d9b274", sat(1.7, 2.3, 6.5)));
  parts.push(part(box(3, 3.4, 3), "#dcb678", sat(0, 6.6, 4)));
  parts.push(part(box(4.8, 3.8, 1.4), "#c9a060", sat(0, 6.6, 2.8)));
  parts.push(part(box(1.2, 4.6, 1.2), "#c9a060", sat(-2.1, 6.2, 4)));
  parts.push(part(box(1.2, 4.6, 1.2), "#c9a060", sat(2.1, 6.2, 4)));
  // Cliffs and boulders framing the valley.
  for (let i = 0; i < 16; i++) {
    const side = i % 2 ? 1 : -1;
    const size = 8 + rand() * 16;
    const x = side * (46 + rand() * 60);
    const z = -30 - rand() * 130;
    parts.push(
      part(
        new THREE.DodecahedronGeometry(1, 0),
        i % 3 ? "#8a6644" : "#9d7a52",
        [x, size * 0.35, z],
        [rand() * 3, rand() * 3, rand() * 3],
        [size, size * (0.8 + rand() * 0.8), size],
      ),
    );
  }
  const mesh = new THREE.Mesh(mergeParts(parts), vertexMaterial);
  scene.add(mesh);
  registerSeasonalMesh(mesh);
}
buildBackdrop();

// Low-poly tree lines add distinct seasonal silhouettes without external assets.
// Each season is one merged mesh; only the active backdrop is rendered.
const seasonalBackdropMeshes = [];
const seasonalTreeTrunk = new THREE.CylinderGeometry(0.28, 0.42, 1, 5);
const seasonalCanopy = new THREE.DodecahedronGeometry(1, 0);
const seasonalPine = new THREE.ConeGeometry(1, 1, 6);
const seasonalBlossom = new THREE.DodecahedronGeometry(0.5, 0);
function buildSeasonalBackdrop(kind, colors, seed) {
  const parts = [];
  const rand = seeded(seed);
  for (const side of [-1, 1]) {
    for (let i = 0; i < 5; i++) {
      const x = side * (10 + rand() * 15);
      const z = -38 - rand() * 92;
      const trunkHeight = 3.2 + rand() * 1.5;
      parts.push(
        part(
          seasonalTreeTrunk,
          colors.trunk,
          [x, trunkHeight / 2, z],
          [0, rand() * 0.25, 0],
          [1, trunkHeight, 1],
        ),
      );
      if (kind === "winter") {
        parts.push(
          part(
            seasonalPine,
            colors.foliage,
            [x, trunkHeight + 1.1, z],
            [0, 0, 0],
            [2.6, 3.4, 2.6],
          ),
        );
        parts.push(
          part(
            seasonalPine,
            colors.foliage,
            [x, trunkHeight + 2.9, z],
            [0, 0, 0],
            [2.05, 3, 2.05],
          ),
        );
        parts.push(
          part(
            seasonalPine,
            colors.foliage,
            [x, trunkHeight + 4.4, z],
            [0, 0, 0],
            [1.45, 2.4, 1.45],
          ),
        );
        parts.push(
          part(
            seasonalPine,
            colors.snow,
            [x, trunkHeight + 2.1, z],
            [0, 0, 0],
            [1.85, 0.8, 1.85],
          ),
        );
        parts.push(
          part(
            seasonalPine,
            colors.snow,
            [x, trunkHeight + 3.8, z],
            [0, 0, 0],
            [1.35, 0.65, 1.35],
          ),
        );
      } else {
        const crownY = trunkHeight + 1.25;
        parts.push(
          part(
            seasonalCanopy,
            colors.foliage,
            [x, crownY, z],
            [0, rand() * 3, 0],
            [2.4, 2.25, 2.3],
          ),
        );
        parts.push(
          part(
            seasonalCanopy,
            colors.foliage,
            [x - 1.45, crownY - 0.2, z + 0.25],
            [0, rand() * 3, 0],
            [1.65, 1.65, 1.7],
          ),
        );
        parts.push(
          part(
            seasonalCanopy,
            colors.foliage,
            [x + 1.4, crownY - 0.15, z - 0.2],
            [0, rand() * 3, 0],
            [1.7, 1.75, 1.65],
          ),
        );
        if (kind === "spring") {
          for (let blossom = 0; blossom < 5; blossom++) {
            const angle = (blossom / 5) * Math.PI * 2;
            parts.push(
              part(
                seasonalBlossom,
                colors.blossom,
                [
                  x + Math.cos(angle) * (1.2 + rand() * 0.8),
                  crownY + (rand() - 0.2) * 1.5,
                  z + Math.sin(angle) * 1.5,
                ],
                [rand(), rand() * 3, rand()],
                [0.55, 0.45, 0.5],
              ),
            );
          }
        }
      }
    }
  }
  const mesh = new THREE.Mesh(mergeParts(parts), vertexMaterial);
  mesh.visible = kind === "spring";
  mesh.castShadow = false;
  mesh.receiveShadow = false;
  scene.add(mesh);
  seasonalBackdropMeshes.push(mesh);
}
buildSeasonalBackdrop(
  "spring",
  { trunk: "#72513a", foliage: "#69a95b", blossom: "#f3bfd9" },
  410,
);
buildSeasonalBackdrop("summer", { trunk: "#6b4b30", foliage: "#347a35" }, 420);
buildSeasonalBackdrop("autumn", { trunk: "#68452f", foliage: "#d47735" }, 430);
buildSeasonalBackdrop(
  "winter",
  { trunk: "#62564e", foliage: "#31555a", snow: "#e2edf2" },
  440,
);

// Sun glow and light shafts. Additive, unfogged and cheap.
function radialTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 128;
  const ctx = canvas.getContext("2d");
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, "rgba(255, 244, 214, 1)");
  g.addColorStop(0.25, "rgba(255, 214, 140, 0.55)");
  g.addColorStop(1, "rgba(255, 190, 100, 0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
const sunGlowMaterial = new THREE.SpriteMaterial({
  map: radialTexture(),
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  fog: false,
  transparent: true,
  opacity: 0.9,
});
const sunGlow = new THREE.Sprite(sunGlowMaterial);
sunGlow.position.set(34, 40, -200);
sunGlow.scale.setScalar(120);
scene.add(sunGlow);

function shaftTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 32;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  const g = ctx.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0, "rgba(255, 226, 160, 0.0)");
  g.addColorStop(0.2, "rgba(255, 226, 160, 0.55)");
  g.addColorStop(1, "rgba(255, 226, 160, 0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 32, 256);
  const h = ctx.createLinearGradient(0, 0, 32, 0);
  h.addColorStop(0, "rgba(0,0,0,1)");
  h.addColorStop(0.5, "rgba(0,0,0,0)");
  h.addColorStop(1, "rgba(0,0,0,1)");
  ctx.globalCompositeOperation = "destination-out";
  ctx.fillStyle = h;
  ctx.fillRect(0, 0, 32, 256);
  return new THREE.CanvasTexture(canvas);
}
const shaftMaterial = new THREE.MeshBasicMaterial({
  map: shaftTexture(),
  blending: THREE.AdditiveBlending,
  transparent: true,
  depthWrite: false,
  fog: false,
  opacity: 0.2,
});
const shaftGeometry = new THREE.PlaneGeometry(1, 1);
for (const [x, y, z, width, length, tilt] of [
  [14, 14, -42, 6, 70, -0.5],
  [22, 16, -56, 9, 80, -0.55],
  [6, 15, -34, 3.5, 60, -0.45],
  [30, 18, -70, 12, 90, -0.6],
  [-4, 14, -48, 4, 66, -0.4],
]) {
  const shaft = new THREE.Mesh(shaftGeometry, shaftMaterial);
  shaft.position.set(x, y, z);
  shaft.scale.set(width, length, 1);
  shaft.rotation.z = tilt;
  shaft.renderOrder = 2;
  scene.add(shaft);
}

// ---------------------------------------------------------------------------
// Runner: blocky character rebuilt from Start.ng style data. Unknown values use safe defaults.
// The runner faces -z (away from the camera), so face details sit on FRONT and packs on the back.
// ---------------------------------------------------------------------------
const FRONT = -1;
const player = new THREE.Group();
player.position.set(0, 0.16, CFG.playerZ);
scene.add(player);
const rig = new THREE.Group(); // lean, yaw and bob live here so lane drift never fights the mesh offsets
player.add(rig);
const limbs = { armL: null, armR: null, legL: null, legR: null };

const DEFAULT_STYLE = {
  body: "male",
  primaryColor: "#f28a1f",
  secondaryColor: "#2f3e5c",
  skinColor: "#d9a07a",
  hairColor: "#2a1b14",
  hair: "short",
  hat: "none",
  accessory: "backpack",
};
const STYLE_OPTIONS = {
  body: ["female", "male"],
  hair: ["short", "afro", "braids", "bun", "ponytail", "dreads", "bald"],
  hat: ["none", "cap", "beanie", "tophat", "crown"],
  accessory: ["none", "glasses", "earrings", "beard", "scarf", "backpack"],
};
function safeColor(value, fallback) {
  return typeof value === "string" && /^#?[0-9a-f]{6}$/i.test(value.trim())
    ? `#${value.trim().replace(/^#/, "")}`
    : fallback;
}
function safeOption(value, allowed, fallback) {
  return typeof value === "string" && allowed.includes(value.toLowerCase())
    ? value.toLowerCase()
    : fallback;
}
function normalizeStyle(style) {
  const value = style && typeof style === "object" ? style : {};
  return {
    body: safeOption(value.body, STYLE_OPTIONS.body, DEFAULT_STYLE.body),
    primaryColor: safeColor(value.primaryColor, DEFAULT_STYLE.primaryColor),
    secondaryColor: safeColor(
      value.secondaryColor,
      DEFAULT_STYLE.secondaryColor,
    ),
    skinColor: safeColor(value.skinColor, DEFAULT_STYLE.skinColor),
    hairColor: safeColor(value.hairColor, DEFAULT_STYLE.hairColor),
    hair: safeOption(value.hair, STYLE_OPTIONS.hair, DEFAULT_STYLE.hair),
    hat: safeOption(value.hat, STYLE_OPTIONS.hat, DEFAULT_STYLE.hat),
    accessory: safeOption(
      value.accessory,
      STYLE_OPTIONS.accessory,
      DEFAULT_STYLE.accessory,
    ),
  };
}
function disposeChildren(group) {
  for (const child of [...group.children]) {
    group.remove(child);
    disposeChildren(child);
    child.geometry?.dispose();
    if (Array.isArray(child.material))
      child.material.forEach((material) => material.dispose());
    else child.material?.dispose();
  }
}
let appliedStyleKey = "";
function rebuildPlayer(rawStyle) {
  const style = normalizeStyle(rawStyle);
  const key = JSON.stringify(style);
  // Focus/visibility refreshes re-send the same style; skip the geometry churn.
  if (key === appliedStyleKey) return;
  appliedStyleKey = key;
  disposeChildren(rig);

  const material = (color, roughness = 0.8, metalness = 0) =>
    new THREE.MeshStandardMaterial({
      color,
      roughness,
      metalness,
      flatShading: true,
    });
  const skin = material(style.skinColor);
  const shirt = material(style.primaryColor, 0.72);
  const trousers = material(style.secondaryColor, 0.8);
  const hair = material(style.hairColor);
  const shoes = material("#6b4426", 0.7);
  const dark = material("#171a20", 0.55);
  const gold = material("#ffd45c", 0.3, 0.55);
  const pack = material("#3f6b3a", 0.85);
  const packDark = material("#2d4d2a", 0.85);
  const addBox = (parent, w, h, d, partMaterial, x, y, z) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), partMaterial);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  };
  const pivot = (x, y) => {
    const group = new THREE.Group();
    group.position.set(x, y, 0);
    rig.add(group);
    return group;
  };
  const female = style.body === "female";
  const BACK = -FRONT;

  // Torso, head, face.
  addBox(rig, female ? 0.6 : 0.72, 0.72, 0.4, shirt, 0, 1.14, 0);
  const head = new THREE.Group();
  head.position.set(0, 1.8, 0);
  rig.add(head);
  addBox(head, 0.52, 0.52, 0.52, skin, 0, 0, 0);
  addBox(head, 0.07, 0.09, 0.03, dark, -0.12, 0.03, FRONT * 0.265);
  addBox(head, 0.07, 0.09, 0.03, dark, 0.12, 0.03, FRONT * 0.265);
  addBox(head, 0.1, 0.03, 0.03, dark, 0, -0.12, FRONT * 0.265);

  // Arms swing from the shoulder, legs from the hip.
  for (const side of [-1, 1]) {
    const arm = pivot(side * (female ? 0.42 : 0.48), 1.44);
    addBox(arm, 0.24, 0.3, 0.26, shirt, 0, -0.15, 0);
    addBox(arm, 0.2, 0.4, 0.2, skin, 0, -0.5, 0);
    if (side < 0) limbs.armL = arm;
    else limbs.armR = arm;
    const leg = pivot(side * 0.17, 0.8);
    if (female) {
      addBox(leg, 0.22, 0.6, 0.24, skin, 0, -0.3, 0);
    } else {
      addBox(leg, 0.27, 0.64, 0.29, trousers, 0, -0.32, 0);
    }
    addBox(leg, 0.29, 0.16, 0.42, shoes, 0, -0.64, FRONT * 0.06);
    if (side < 0) limbs.legL = leg;
    else limbs.legR = leg;
  }
  if (female) addBox(rig, 0.7, 0.34, 0.46, trousers, 0, 0.74, 0);

  // Hair (hat styles below may cover it, which is the intended look).
  const hairTop = 2.1;
  if (style.hair !== "bald") {
    if (style.hair === "afro") {
      addBox(head, 0.82, 0.7, 0.82, hair, 0, 0.26, 0);
    } else {
      addBox(head, 0.56, 0.14, 0.56, hair, 0, hairTop - 1.8 - 0.01, 0);
      addBox(head, 0.56, 0.34, 0.12, hair, 0, 0.1, BACK * 0.22);
      addBox(head, 0.1, 0.22, 0.4, hair, -0.27, 0.12, 0);
      addBox(head, 0.1, 0.22, 0.4, hair, 0.27, 0.12, 0);
      if (style.hair === "braids" || style.hair === "dreads") {
        const length = style.hair === "dreads" ? 0.6 : 0.46;
        for (let i = -2; i <= 2; i++)
          addBox(
            head,
            0.07,
            length,
            0.07,
            hair,
            i * 0.1,
            -0.2 - length / 2 + 0.12,
            BACK * 0.27,
          );
      } else if (style.hair === "bun") {
        addBox(head, 0.22, 0.22, 0.22, hair, 0, 0.42, BACK * 0.1);
      } else if (style.hair === "ponytail") {
        addBox(head, 0.13, 0.44, 0.13, hair, 0, -0.08, BACK * 0.34);
      }
    }
  }
  if (style.hat === "cap") {
    addBox(head, 0.58, 0.16, 0.58, shirt, 0, 0.32, 0);
    addBox(head, 0.5, 0.04, 0.28, shirt, 0, 0.26, FRONT * 0.4);
  } else if (style.hat === "beanie") {
    addBox(head, 0.6, 0.26, 0.6, shirt, 0, 0.33, 0);
    addBox(head, 0.64, 0.08, 0.64, trousers, 0, 0.22, 0);
  } else if (style.hat === "tophat") {
    addBox(head, 0.34, 0.36, 0.34, dark, 0, 0.5, 0);
    addBox(head, 0.74, 0.05, 0.74, dark, 0, 0.3, 0);
  } else if (style.hat === "crown") {
    addBox(head, 0.54, 0.14, 0.54, gold, 0, 0.34, 0);
    for (const [x, z] of [
      [-0.2, -0.2],
      [0.2, -0.2],
      [-0.2, 0.2],
      [0.2, 0.2],
      [0, 0],
    ])
      addBox(head, 0.1, 0.16, 0.1, gold, x, 0.47, z);
  }
  if (style.accessory === "glasses") {
    addBox(head, 0.2, 0.12, 0.03, dark, -0.12, 0.04, FRONT * 0.285);
    addBox(head, 0.2, 0.12, 0.03, dark, 0.12, 0.04, FRONT * 0.285);
    addBox(head, 0.08, 0.03, 0.03, dark, 0, 0.06, FRONT * 0.285);
  } else if (style.accessory === "earrings") {
    addBox(head, 0.06, 0.12, 0.06, gold, -0.29, -0.14, 0);
    addBox(head, 0.06, 0.12, 0.06, gold, 0.29, -0.14, 0);
  } else if (style.accessory === "beard") {
    addBox(head, 0.44, 0.2, 0.14, hair, 0, -0.2, FRONT * 0.24);
  } else if (style.accessory === "scarf") {
    addBox(rig, 0.8, 0.14, 0.48, trousers, 0, 1.52, 0);
    addBox(rig, 0.14, 0.42, 0.06, trousers, 0.2, 1.28, BACK * 0.26);
  } else if (style.accessory === "backpack") {
    addBox(rig, 0.5, 0.58, 0.24, pack, 0, 1.2, BACK * 0.32);
    addBox(rig, 0.52, 0.2, 0.26, packDark, 0, 1.38, BACK * 0.32);
  }
}
rebuildPlayer(DEFAULT_STYLE);

// ---------------------------------------------------------------------------
// Side scenery: carved pillars, torches and jungle growth. Each segment is one merged mesh.
// ---------------------------------------------------------------------------
const SEGMENT_SPACING = 9;
const SEGMENT_COUNT = 15;
const SEGMENT_SPAN = SEGMENT_SPACING * SEGMENT_COUNT;
const scenery = [];
const flames = [];
const flameMaterial = new THREE.MeshBasicMaterial({
  color: "#ffa31f",
  fog: false,
});
const flameGeometry = new THREE.ConeGeometry(0.16, 0.5, 5);
flameGeometry.translate(0, 0.25, 0);
const bladeGeometry = new THREE.ConeGeometry(0.22, 1.5, 4);
bladeGeometry.translate(0, 0.75, 0);
const bushGeometry = new THREE.OctahedronGeometry(0.7, 0);
const pillarRand = seeded(99);
function buildSegment(side, index) {
  const rand = pillarRand;
  const parts = [];
  const height = 4.8 + rand() * 4;
  const inward = -side;
  parts.push(part(box(2, 0.5, 2), PAL.stoneDeep, [0, 0.25, 0]));
  parts.push(
    part(box(1.4, height, 1.4), PAL.stoneDark, [0, height / 2 + 0.25, 0]),
  );
  parts.push(part(box(1.52, 0.38, 1.52), PAL.stoneBand, [0, 1.5, 0]));
  parts.push(part(box(1.52, 0.38, 1.52), PAL.stoneBand, [0, height - 0.6, 0]));
  if (rand() > 0.3)
    parts.push(part(box(1.9, 0.45, 1.9), PAL.stoneDeep, [0, height + 0.45, 0]));
  // Crumbled blocks at the foot of the pillar.
  parts.push(
    part(
      box(0.8, 0.5, 0.7),
      PAL.stone,
      [inward * 1.3, 0.25, rand() * 2 - 1],
      [0, rand(), 0],
    ),
  );
  // Jungle growth: bushes and fern blades in three greens.
  const greens = [PAL.leafDark, PAL.leafMid, PAL.leafLight];
  const bushCount = 4 + Math.floor(rand() * 4);
  for (let i = 0; i < bushCount; i++) {
    const x = inward * 1.2 + side * (rand() * 8);
    const z = (rand() - 0.5) * 7;
    const s = 0.6 + rand() * 0.9;
    parts.push(
      part(
        bushGeometry,
        greens[Math.floor(rand() * 3)],
        [x, 0.35 * s, z],
        [rand(), rand() * 3, 0],
        [s, s * 0.8, s],
      ),
    );
    for (let b = 0; b < 3; b++) {
      parts.push(
        part(
          bladeGeometry,
          greens[Math.floor(rand() * 3)],
          [x + (rand() - 0.5) * 0.9, 0, z + (rand() - 0.5) * 0.9],
          [(rand() - 0.5) * 0.9, rand() * 3, (rand() - 0.5) * 0.9],
          [1, 0.6 + rand() * 0.7, 1],
        ),
      );
    }
  }
  const group = new THREE.Group();
  const mesh = new THREE.Mesh(mergeParts(parts), vertexMaterial);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  group.add(mesh);
  registerSeasonalMesh(mesh);
  if (index % 3 === 0) {
    const holder = new THREE.Mesh(
      mergeParts([
        part(box(0.16, 0.5, 0.16), PAL.stoneDeep, [inward * 0.85, 2.8, 0]),
        part(box(0.34, 0.12, 0.34), "#2b1b10", [inward * 0.85, 3.08, 0]),
      ]),
      vertexMaterial,
    );
    group.add(holder);
    const flame = new THREE.Mesh(flameGeometry, flameMaterial);
    flame.position.set(inward * 0.85, 3.12, 0);
    flame.userData.phase = rand() * 6;
    group.add(flame);
    flames.push(flame);
  }
  group.position.set(
    side * (5.7 + rand() * 0.5),
    0,
    6 - index * SEGMENT_SPACING - (side > 0 ? 3.5 : 0),
  );
  scene.add(group);
  scenery.push({ group, startZ: group.position.z });
}
if (!storySkin) {
  for (let i = 0; i < SEGMENT_COUNT; i++)
    for (const side of [-1, 1]) buildSegment(side, i);
}

// ---------------------------------------------------------------------------
// Seasonal environment. Palette changes are driven by distance, not frame count.
// Foliage vertex colors are recolored only when a season changes to protect mobile performance.
// ---------------------------------------------------------------------------
const SEASONS = [
  {
    name: "Spring",
    sky: [
      [0, "#82b9ed"],
      [0.38, "#c4e5f5"],
      [0.56, "#f5e5ce"],
      [1, "#c6d9cf"],
    ],
    fog: "#c6d9cf",
    ground: "#62864c",
    track: "#d6c29c",
    rail: "#d9b75c",
    curb: "#82956a",
    foliage: "#65a94f",
    stone: "#b5ad91",
    stoneBlend: 0.16,
    skyLight: "#dff4ff",
    groundLight: "#496443",
    hemisphereIntensity: 1.55,
    sun: "#fff0c4",
    sunIntensity: 2.6,
    glowOpacity: 0.55,
    shaftOpacity: 0.08,
  },
  {
    name: "Summer",
    sky: [
      [0, "#5aa5e8"],
      [0.38, "#a8d9f4"],
      [0.56, "#f8e3b1"],
      [1, "#b5c9b0"],
    ],
    fog: "#b5c9b0",
    ground: "#6e8d43",
    track: "#d5b47e",
    rail: "#f0c34e",
    curb: "#8d8950",
    foliage: "#39833b",
    stone: "#c3a273",
    stoneBlend: 0.12,
    skyLight: "#e3f5ff",
    groundLight: "#465c32",
    hemisphereIntensity: 1.7,
    sun: "#ffe0a0",
    sunIntensity: 3.1,
    glowOpacity: 0.8,
    shaftOpacity: 0.16,
  },
  {
    name: "Autumn",
    sky: [
      [0, "#7d91bd"],
      [0.38, "#e1b4a0"],
      [0.56, "#f2b878"],
      [1, "#b8a18b"],
    ],
    fog: "#b8a18b",
    ground: "#796044",
    track: "#b99a76",
    rail: "#d88b35",
    curb: "#8b6849",
    foliage: "#d47735",
    stone: "#9e8269",
    stoneBlend: 0.3,
    skyLight: "#f7d8bc",
    groundLight: "#594435",
    hemisphereIntensity: 1.35,
    sun: "#ffc27c",
    sunIntensity: 2.25,
    glowOpacity: 0.48,
    shaftOpacity: 0.06,
  },
  {
    name: "Winter",
    sky: [
      [0, "#789bc7"],
      [0.38, "#c9dce9"],
      [0.56, "#e5edf2"],
      [1, "#b7c9d4"],
    ],
    fog: "#b7c9d4",
    ground: "#b3c1c6",
    track: "#a9b8c2",
    rail: "#d4dce0",
    curb: "#899ca7",
    foliage: "#dce8ed",
    stone: "#aabac6",
    stoneBlend: 0.52,
    skyLight: "#eaf6ff",
    groundLight: "#667985",
    hemisphereIntensity: 1.25,
    sun: "#d9eaff",
    sunIntensity: 1.65,
    glowOpacity: 0.22,
    shaftOpacity: 0.025,
  },
];

let activeSeasonIndex = -1;
let lastSkySeasonIndex = -1;
let lastSkyBlendStep = -1;
const SKY_BLEND_STEPS = 60;
const seasonColorTarget = new THREE.Color();
const seasonColorMix = new THREE.Color();

// Build each seasonal vertex-colour variant once, before gameplay starts.
// Switching seasons then copies cached data instead of recalculating every vertex mid-run.
const seasonalVertexColors = SEASONS.map((season) => {
  const foliage = new THREE.Color(season.foliage);
  const stone = new THREE.Color(season.stone);
  return seasonalMeshes.map((mesh) => {
    const base = mesh.geometry.userData.baseVertexColors;
    if (!base) return null;
    const colors = new Float32Array(base.length);
    for (let i = 0; i < base.length; i += 3) {
      const r = base[i];
      const g = base[i + 1];
      const b = base[i + 2];
      if (g > r * 1.18 && g > b * 1.08) {
        const brightness = Math.min(1.25, Math.max(0.62, (r + g + b) / 0.36));
        colors[i] = foliage.r * brightness;
        colors[i + 1] = foliage.g * brightness;
        colors[i + 2] = foliage.b * brightness;
      } else {
        const tintAmount = season.stoneBlend;
        colors[i] = r + (stone.r - r) * tintAmount;
        colors[i + 1] = g + (stone.g - g) * tintAmount;
        colors[i + 2] = b + (stone.b - b) * tintAmount;
      }
    }
    return colors;
  });
});

function recolorSeasonalMeshes(seasonIndex) {
  for (const [meshIndex, mesh] of seasonalMeshes.entries()) {
    const colors = mesh.geometry.getAttribute("color");
    const cachedColors = seasonalVertexColors[seasonIndex][meshIndex];
    if (!colors || !cachedColors) continue;
    colors.array.set(cachedColors);
    colors.needsUpdate = true;
  }
}
function drawSeasonSky(current, next, blend) {
  const gradient = skyContext.createLinearGradient(0, 0, 0, skyCanvas.height);
  for (let index = 0; index < current.sky.length; index += 1) {
    const [offset, from] = current.sky[index];
    const to = next.sky[index][1];
    const color = seasonColorMix
      .set(from)
      .lerp(seasonColorTarget.set(to), blend)
      .getStyle();
    gradient.addColorStop(offset, color);
  }
  skyContext.fillStyle = gradient;
  skyContext.fillRect(0, 0, skyCanvas.width, skyCanvas.height);
  scene.background.needsUpdate = true;
}
let storySkinApplied = false;
function updateSeasonEnvironment(distance) {
  if (storySkin) {
    if (!storySkinApplied) {
      const gradient = skyContext.createLinearGradient(0, 0, 0, skyCanvas.height);
      gradient.addColorStop(0, PAL.skyTop);
      gradient.addColorStop(0.38, PAL.skyMid);
      gradient.addColorStop(0.62, PAL.skyLow);
      gradient.addColorStop(1, PAL.fog);
      skyContext.fillStyle = gradient;
      skyContext.fillRect(0, 0, skyCanvas.width, skyCanvas.height);
      scene.background.needsUpdate = true;
      scene.fog.color.set(PAL.fog);
      groundMaterial.color.set(PAL.stoneDeep);
      trackTop.map = null;
      trackTop.color.set(PAL.stoneDark);
      trackTop.needsUpdate = true;
      trackSide.color.set(PAL.stoneDark);
      curbMaterial.color.set(PAL.stone);
      railMaterial.color.set(PAL.gold);
      hemisphere.color.set(PAL.skyMid);
      hemisphere.groundColor.set(PAL.stoneDeep);
      sun.color.set(PAL.skyLow);
      seasonalBackdropMeshes.forEach((mesh) => { mesh.visible = false; });
      seasonalMeshes.forEach((mesh) => { mesh.visible = false; });
      storySkinApplied = true;
    }
    return;
  }
  const seasonLength = CFG.seasonLength;
  const rawIndex = Math.floor(distance / seasonLength);
  const seasonIndex = rawIndex % SEASONS.length;
  const progress = distance - rawIndex * seasonLength;
  const transitionStart = seasonLength - CFG.seasonTransitionDistance;
  const blend =
    progress > transitionStart
      ? (progress - transitionStart) / CFG.seasonTransitionDistance
      : 0;
  const nextIndex = (seasonIndex + 1) % SEASONS.length;
  const current = SEASONS[seasonIndex];
  const next = SEASONS[nextIndex];
  const mix = (key) =>
    seasonColorMix
      .set(current[key])
      .lerp(seasonColorTarget.set(next[key]), blend);
  const visualSeasonIndex = blend >= 0.5 ? nextIndex : seasonIndex;
  const skyBlendStep = Math.round(blend * SKY_BLEND_STEPS);
  if (
    skyBlendStep !== lastSkyBlendStep ||
    lastSkySeasonIndex !== seasonIndex
  ) {
    drawSeasonSky(current, next, skyBlendStep / SKY_BLEND_STEPS);
    lastSkyBlendStep = skyBlendStep;
    lastSkySeasonIndex = seasonIndex;
  }
  scene.fog.color.copy(mix("fog"));
  groundMaterial.color.copy(mix("ground"));
  trackTop.color.copy(mix("track"));
  trackSide.color.copy(mix("track"));
  curbMaterial.color.copy(mix("curb"));
  railMaterial.color.copy(mix("rail"));
  hemisphere.color.copy(mix("skyLight"));
  hemisphere.groundColor.copy(mix("groundLight"));
  hemisphere.intensity = THREE.MathUtils.lerp(
    current.hemisphereIntensity,
    next.hemisphereIntensity,
    blend,
  );
  sun.color.copy(mix("sun"));
  sun.intensity = THREE.MathUtils.lerp(
    current.sunIntensity,
    next.sunIntensity,
    blend,
  );
  sunGlowMaterial.opacity = THREE.MathUtils.lerp(
    current.glowOpacity,
    next.glowOpacity,
    blend,
  );
  shaftMaterial.opacity = THREE.MathUtils.lerp(
    current.shaftOpacity,
    next.shaftOpacity,
    blend,
  );
  if (visualSeasonIndex !== activeSeasonIndex) {
    activeSeasonIndex = visualSeasonIndex;
    recolorSeasonalMeshes(visualSeasonIndex);
    seasonalBackdropMeshes.forEach((mesh, index) => {
      mesh.visible = index === visualSeasonIndex;
    });
  }
}
updateSeasonEnvironment(0);

// ---------------------------------------------------------------------------
// Obstacles and relics: pooled, so a long run never allocates or leaks.
// ---------------------------------------------------------------------------
const crateGeometry = mergeParts(storyChapterId === "lagos-hustle" ? [
  part(box(1.2, 0.82, 1.45), PAL.crate, [0, 0.56, 0]),
  part(box(1.12, 0.32, 0.08), "#25323a", [0, 0.82, -0.74]),
  part(box(1.12, 0.28, 0.08), "#25323a", [0, 0.82, 0.74]),
  part(box(1.28, 0.12, 1.5), PAL.crateBand, [0, 0.3, 0]),
  part(box(0.16, 0.18, 0.08), "#fff0b0", [-0.42, 0.48, -0.78]),
  part(box(0.16, 0.18, 0.08), "#fff0b0", [0.42, 0.48, -0.78]),
] : storyChapterId === "emilokan-expressway" ? [
  part(new THREE.CylinderGeometry(0.48, 0.48, 1.55, 10), "#bfc5c7", [0, 0.62, 0], [Math.PI / 2, 0, 0]),
  part(box(0.82, 0.78, 0.48), "#d5a13a", [0, 0.5, -0.82]),
  part(box(0.72, 0.24, 0.08), "#293c48", [0, 0.78, -1.07]),
  part(box(0.9, 0.12, 1.7), "#3f4c53", [0, 0.18, 0]),
] : storyChapterId === "the-system" ? [
  part(box(1.8, 0.16, 0.22), PAL.crate, [0, 0.86, 0]),
  part(box(0.14, 0.88, 0.14), "#ddd0b9", [-0.78, 0.44, 0]),
  part(box(0.14, 0.88, 0.14), "#ddd0b9", [0.78, 0.44, 0]),
  part(box(0.48, 0.1, 0.24), "#b58b4d", [0, 0.58, 0]),
] : storyChapterId === "japa-terminal" ? [
  part(box(1.12, 0.7, 0.72), PAL.crate, [0, 0.66, 0]),
  part(box(1.18, 0.12, 0.82), "#d7e0e1", [0, 0.25, 0]),
  part(new THREE.CylinderGeometry(0.12, 0.12, 0.16, 10), "#202b31", [-0.48, 0.12, 0.28], [Math.PI / 2, 0, 0]),
  part(new THREE.CylinderGeometry(0.12, 0.12, 0.16, 10), "#202b31", [0.48, 0.12, 0.28], [Math.PI / 2, 0, 0]),
  part(box(0.12, 0.9, 0.12), "#d7e0e1", [0, 1.12, 0.3]),
] : [
  part(box(1, 1, 1), PAL.crate, [0, 0.5, 0]),
  part(box(1.06, 0.2, 1.06), PAL.crateBand, [0, 0.5, 0]),
  part(box(0.9, 0.06, 0.9), "#b83621", [0, 1.02, 0]),
]);
const urnGeometry = (() => {
  const profile = [
    [0, 0],
    [0.2, 0],
    [0.32, 0.12],
    [0.4, 0.4],
    [0.32, 0.72],
    [0.18, 0.88],
    [0.22, 1.0],
    [0.3, 1.04],
    [0, 1.04],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  return mergeParts([
    part(new THREE.LatheGeometry(profile, 10), PAL.gold),
    part(
      new THREE.TorusGeometry(0.2, 0.04, 4, 8),
      PAL.gold,
      [-0.4, 0.62, 0],
      [0, 0, 0],
    ),
    part(
      new THREE.TorusGeometry(0.2, 0.04, 4, 8),
      PAL.gold,
      [0.4, 0.62, 0],
      [0, 0, 0],
    ),
  ]);
})();
const coinGeometry = mergeParts(storyChapterId === "lagos-hustle" ? [
  // Naira note collectible.
  part(box(0.9, 0.055, 0.48), "#2d9b69", [0, 0, 0]),
  part(box(0.62, 0.025, 0.28), "#d6f0d9", [0, 0.04, 0]),
  part(new THREE.CylinderGeometry(0.09, 0.09, 0.025, 10), "#f1d27b", [0, 0.055, 0], [Math.PI / 2, 0, 0]),
] : storyChapterId === "emilokan-expressway" ? [
  // Travel folder.
  part(box(0.72, 0.12, 0.9), "#b87936", [0, 0, 0]),
  part(box(0.66, 0.04, 0.78), "#e6d5ae", [0, 0.08, 0]),
  part(box(0.2, 0.03, 0.08), "#d4a13d", [0, 0.105, -0.36]),
] : storyChapterId === "the-system" ? [
  // Official clearance stamp.
  part(new THREE.CylinderGeometry(0.3, 0.34, 0.18, 10), "#b34a43", [0, 0, 0]),
  part(new THREE.CylinderGeometry(0.13, 0.13, 0.34, 8), "#d8c4a1", [0, 0.24, 0]),
] : storyChapterId === "japa-terminal" ? [
  // Boarding pass.
  part(box(0.92, 0.055, 0.42), "#e9e4d5", [0, 0, 0]),
  part(box(0.56, 0.025, 0.08), "#4d8198", [0, 0.04, -0.12]),
  part(box(0.28, 0.025, 0.04), "#4d8198", [0, 0.04, 0.08]),
  part(box(0.1, 0.025, 0.26), "#d4a13d", [0.34, 0.04, 0.02]),
] : [
  part(new THREE.CylinderGeometry(0.38, 0.38, 0.12, 14), "#ffd45c", [0, 0, 0], [Math.PI / 2, 0, 0]),
  part(new THREE.TorusGeometry(0.3, 0.05, 4, 14), "#fff0a8", [0, 0, 0.07]),
]);
const relicMaterial = new THREE.MeshStandardMaterial({
  vertexColors: true,
  emissive: "#b87400",
  emissiveIntensity: 1.1,
  metalness: 0.5,
  roughness: 0.3,
  flatShading: true,
});
const obstaclePool = [];
const relicPool = [];
// Chapter 1 traffic uses believable road-vehicle proportions in world units:
// roughly 1.9m wide, 1.5m tall and 4.2m long for a compact car.
const storyCarGeometry = storySkin && storyChapterId === "lagos-hustle"
  ? mergeParts([
      part(box(1.82, 0.62, 3.65), "#b83e2e", [0, 0.78, 0]),
      part(box(1.58, 0.68, 1.62), "#b83e2e", [0, 1.38, -0.34]),
      part(box(1.46, 0.48, 1.42), "#8fb6c0", [0, 1.42, -0.34]),
      part(box(0.66, 0.42, 0.08), "#b9d2d7", [-0.39, 1.43, -1.11]),
      part(box(0.66, 0.42, 0.08), "#b9d2d7", [0.39, 1.43, -1.11]),
      part(box(0.08, 0.28, 0.08), "#24292c", [-0.88, 0.38, -1.12]),
      part(box(0.08, 0.28, 0.08), "#24292c", [0.88, 0.38, -1.12]),
      part(box(0.08, 0.28, 0.08), "#24292c", [-0.88, 0.38, 1.12]),
      part(box(0.08, 0.28, 0.08), "#24292c", [0.88, 0.38, 1.12]),
      part(box(0.18, 0.16, 0.08), "#f4e7c5", [-0.68, 0.83, -1.85]),
      part(box(0.18, 0.16, 0.08), "#f4e7c5", [0.68, 0.83, -1.85]),
      part(box(0.18, 0.16, 0.08), "#a72b22", [-0.68, 0.83, 1.85]),
      part(box(0.18, 0.16, 0.08), "#a72b22", [0.68, 0.83, 1.85]),
    ])
  : null;
function createObstacle() {
  const mesh = new THREE.Mesh(storyCarGeometry ?? crateGeometry, vertexMaterial);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.visible = false;
  scene.add(mesh);
  return {
    mesh,
    lane: 1,
    active: false,
    targetLane: 1,
    sourceLane: 1,
    moving: false,
    shiftStarted: false,
    shiftProgress: 0,
    fallVelocity: 0,
    falling: false,
    forwardSpeed: 0,
  };
}
function createRelic() {
  const group = new THREE.Group();
  const coin = new THREE.Mesh(coinGeometry, relicMaterial);
  const urn = new THREE.Mesh(urnGeometry, relicMaterial);
  urn.castShadow = true;
  group.add(coin, urn);
  group.visible = false;
  scene.add(group);
  return {
    group,
    coin,
    urn,
    lane: 1,
    active: false,
    phase: Math.random() * Math.PI * 2,
    isUrn: false,
  };
}
for (let i = 0; i < 26; i++) obstaclePool.push(createObstacle());
for (let i = 0; i < 64; i++) relicPool.push(createRelic());

function acquire(pool) {
  for (let i = 0; i < pool.length; i++) if (!pool[i].active) return pool[i];
  return null;
}
function placeObstacle(lane, z, elapsed = state.elapsed, allowMovement = true) {
  const item = acquire(obstaclePool);
  if (!item) return;
  item.lane = lane;
  item.targetLane = lane;
  item.sourceLane = lane;
  item.moving = false;
  item.shiftStarted = false;
  item.shiftProgress = 0;
  item.falling = false;
  item.fallVelocity = 0;
   // Story traffic drives forward, but slower than the runner.
   item.forwardSpeed = storyCarGeometry ? Math.min(state.speed * 0.35, 6) : 0;
  item.mesh.rotation.set(0, 0, 0);
  item.mesh.position.set(LANE_X[lane], 0.11, z);
  item.mesh.scale.setScalar(0.01);
  item.mesh.visible = true;
  item.active = true;

  // Some crates shift one lane later in a run, while they are still far away.
  const movementChance = 0.12 + 0.1 * difficulty(elapsed);
  if (allowMovement && z < CFG.playerZ - 18 && Math.random() < movementChance) {
    const safeTargets = [0, 1, 2].filter(
      (candidate) =>
        candidate !== lane &&
        !obstaclePool.some(
          (other) =>
            other !== item &&
            other.active &&
            Math.abs(other.mesh.position.z - z) < 3.5 &&
            other.lane === candidate,
        ),
    );
    if (safeTargets.length) {
      item.targetLane = safeTargets[Math.floor(Math.random() * safeTargets.length)];
      item.moving = true;
    }
  }
}
function placeRelic(lane, z, isUrn) {
  const item = acquire(relicPool);
  if (!item) return;
  item.lane = lane;
  item.isUrn = isUrn;
  item.coin.visible = !isUrn;
  item.urn.visible = isUrn;
  item.group.position.set(LANE_X[lane], isUrn ? 0.14 : 1.15, z);
  item.group.scale.setScalar(0.01);
  item.group.visible = true;
  item.active = true;
}
function hideWorldObjects() {
  for (const item of obstaclePool) {
    item.active = false;
    item.mesh.visible = false;
    item.falling = false;
    item.fallVelocity = 0;
    item.mesh.position.y = 0.11;
    item.mesh.rotation.set(0, 0, 0);
  }
  for (const item of relicPool) {
    item.active = false;
    item.group.visible = false;
  }
}

// Row spawner. Every layout is survivable from anywhere the runner could be standing:
// the next row's free lane is chosen within one lane of *all* lanes left open by the
// previous row, so no row ever demands a double lane change. A relic trail marks the safe line.
const spawn = { frontier: CFG.firstRowZ, openLanes: [1] };
const difficulty = (elapsed) =>
  Math.min(elapsed / CFG.difficultyRampSeconds, 1);
const currentGap = (elapsed) =>
  Math.max(CFG.minRowGap, CFG.maxRowGap - elapsed * CFG.rowGapShrinkPerSecond);
function spawnRow(z, gap, elapsed, attract) {
  let free = attract ? Math.floor(Math.random() * CFG.laneCount) : 1;
  if (!attract) {
    const reachable = [0, 1, 2].filter((lane) =>
      spawn.openLanes.every((open) => Math.abs(lane - open) <= 1),
    );
    const options = reachable.length ? reachable : [1];
    free = options[Math.floor(Math.random() * options.length)];
  }
  const others = [0, 1, 2].filter((lane) => lane !== free);
  let obstructed = [];
  if (attract) {
    obstructed = others;
  } else if (Math.random() < 0.1) {
    // Breather row: no obstacles, relics only.
  } else if (Math.random() < CFG.maxDoubleRowChance * difficulty(elapsed)) {
    obstructed = others;
  } else {
    obstructed = [others[Math.floor(Math.random() * others.length)]];
  }
  for (const lane of obstructed) placeObstacle(lane, z, elapsed, !attract);

  // Leave a clear approach before every gap; gaps are uncommon and span the whole track.
  if (!attract && Math.random() < 0.075) {
    const gapItem = gapPool.find((item) => !item.active);
    const rowIsClear = obstaclePool.every(
      (item) => !item.active || Math.abs(item.mesh.position.z - z) > 5,
    );
    if (gapItem && rowIsClear) {
      gapItem.active = true;
      gapItem.mesh.visible = true;
      gapItem.mesh.position.z = z;
    }
  }

  // A breather leaves the whole row open, but the runner still gets a full gap to line up.
  spawn.openLanes = obstructed.length
    ? [0, 1, 2].filter((lane) => !obstructed.includes(lane))
    : [free];
  if (Math.random() < 0.9) {
    const spacing = 2.4;
    // Keep the whole trail clear of the obstacle rows on either side of this gap.
    const count = Math.min(
      3 + Math.floor(Math.random() * 3),
      Math.floor((gap - 4) / spacing) + 1,
    );
    const startZ = z + gap / 2 + ((count - 1) * spacing) / 2;
    const urnIndex =
      Math.random() < 0.3 ? Math.floor(Math.random() * count) : -1;
    for (let i = 0; i < count; i++)
      placeRelic(free, startZ - i * spacing, i === urnIndex);
  }
}
function streamWorld(elapsed, attract) {
  for (;;) {
    const gap = currentGap(elapsed);
    if (spawn.frontier - gap <= -CFG.spawnDistance) break;
    spawn.frontier -= gap;
    spawnRow(spawn.frontier, gap, elapsed, attract);
  }
}
function resetWorldObjects(attract) {
  hideWorldObjects();
  for (const item of gapPool) {
    item.active = false;
    item.mesh.visible = false;
  }
  spawn.frontier = CFG.firstRowZ;
  spawn.openLanes = [1];
  streamWorld(0, attract);
}

// Start.ng's documented connect-page protocol. No credentials are handled by the game.
const START_NG_ORIGIN = "https://start.ng";
const START_NG_CONNECT_TIMEOUT_MS = 8000;
let startNgFramePromise;
function connectFrame() {
  if (!startNgFramePromise) {
    startNgFramePromise = new Promise((resolve, reject) => {
      const frame = document.createElement("iframe");
      // A blocked or silent iframe never fires onload/onerror, so a timer is the only way out.
      const timer = window.setTimeout(() => {
        frame.remove();
        reject(new Error("Start.ng connection timed out"));
      }, START_NG_CONNECT_TIMEOUT_MS);
      frame.src = `${START_NG_ORIGIN}/connect`;
      frame.hidden = true;
      frame.title = "Start.ng player connection";
      frame.onload = () => {
        window.clearTimeout(timer);
        resolve(frame);
      };
      frame.onerror = () => {
        window.clearTimeout(timer);
        frame.remove();
        reject(new Error("Could not load Start.ng connection"));
      };
      document.body.append(frame);
    }).catch((error) => {
      // A failed iframe must not poison every later retry for this page session.
      startNgFramePromise = undefined;
      throw error;
    });
  }
  return startNgFramePromise;
}
async function askStartNg(message, replyType, timeoutMs = 5000) {
  const frame = await connectFrame();
  return new Promise((resolve) => {
    const requestId = Math.random().toString(36).slice(2);
    let settled = false;
    const finish = (reply) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      window.removeEventListener("message", onMessage);
      resolve(reply);
    };
    const onMessage = (event) => {
      if (
        event.origin !== START_NG_ORIGIN ||
        event.source !== frame.contentWindow
      )
        return;
      if (event.data?.type === replyType && event.data.requestId === requestId)
        finish(event.data);
    };
    const timer = window.setTimeout(() => finish(null), timeoutMs);
    window.addEventListener("message", onMessage);
    frame.contentWindow.postMessage({ ...message, requestId }, START_NG_ORIGIN);
  });
}
const playerNameElement = app.querySelector("#player-name");
const playerAccountElement = app.querySelector("#player-account");
const playerSignInButton = app.querySelector("#player-sign-in");
let currentStartNgPlayer = null;
let identityRefresh = false;
let isStartNgSignedIn = false;
function applyPlayerIdentity(reply) {
  const signedInUser = reply?.user ?? null;
  isStartNgSignedIn = Boolean(signedInUser);
  const platformPlayer = signedInUser ??
    reply?.guest ?? {
      name: "Guest",
      style: DEFAULT_STYLE,
    };
  currentStartNgPlayer = platformPlayer;
  rebuildPlayer(platformPlayer.style);
  playerNameElement.textContent =
    typeof platformPlayer.name === "string" && platformPlayer.name.trim()
      ? platformPlayer.name
      : "Guest";
  playerAccountElement.textContent = signedInUser?.account
    ? `@${signedInUser.account}`
    : "Guest player";
  playerSignInButton.hidden = Boolean(signedInUser);
  app.querySelector(".player-avatar").textContent = signedInUser ? "★" : "G";
  playerSignInButton.setAttribute("aria-label", "Sign in to Start.ng");
}
async function refreshStartNgPlayer() {
  if (identityRefresh || document.visibilityState === "hidden") return;
  identityRefresh = true;
  try {
    const reply = await askStartNg({ type: "startng:whoami" }, "startng:user");
    if (reply) {
      applyPlayerIdentity(reply);
      if (reply.user) void syncPlayerWithAdminDirectory();
      void refreshLeaderboard();
    }
  } catch (error) {
    // Local previews and unavailable platform connections keep the safe guest appearance.
    console.info(
      "Start.ng player connection is not available in this context.",
    );
  } finally {
    identityRefresh = false;
  }
}
playerSignInButton.addEventListener("click", () => {
  const returnTo = `${location.origin}${location.pathname}`;
  location.href = `${START_NG_ORIGIN}/?return_to=${encodeURIComponent(returnTo)}`;
});
applyPlayerIdentity(null);
void refreshStartNgPlayer();
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") void refreshStartNgPlayer();
});
window.addEventListener("focus", () => void refreshStartNgPlayer());

const leaderboardMessage = app.querySelector("#leaderboard-message");
const scoreSaveMessage = app.querySelector("#score-save-message");
const leaderboardEntries = app.querySelector("#leaderboard-entries");
function refreshLeaderboard() {
  leaderboardMessage.textContent = "Loading Start.ng leaderboard…";
  return askStartNg(
    { type: "startng:leaderboard", limit: 10 },
    "startng:leaderboardData",
  )
    .then((reply) => {
      if (!reply?.ok || !Array.isArray(reply.entries)) {
        leaderboardEntries.replaceChildren();
        const row = document.createElement("tr");
        const cell = document.createElement("td");
        cell.colSpan = 5;
        cell.textContent = "Leaderboard is unavailable right now.";
        row.append(cell);
        leaderboardEntries.append(row);
        leaderboardMessage.textContent =
          reply?.error || "Could not load scores. Try refreshing.";
        return;
      }
      leaderboardEntries.replaceChildren();
      if (reply.entries.length === 0) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");
        cell.colSpan = 5;
        cell.textContent = "No scores yet. Be the first to finish a run!";
        row.append(cell);
        leaderboardEntries.append(row);
      }
      for (const entry of reply.entries) {
        const row = document.createElement("tr");
        if (
          isStartNgSignedIn &&
          currentStartNgPlayer?.id != null &&
          String(entry.player_id) === String(currentStartNgPlayer.id)
        ) {
          row.classList.add("current-player-row");
        }
        const values = [
          `#${Number.isInteger(entry.rank) ? entry.rank : "—"}`,
          typeof entry.name === "string" && entry.name.trim()
            ? entry.name
            : "Player",
          entry.stats?.score ?? entry.score ?? 0,
          entry.stats?.distance ?? 0,
          entry.stats?.relics ?? 0,
        ];
        for (const [index, value] of values.entries()) {
          const cell = document.createElement("td");
          cell.textContent = String(value);
          if (index === 1) cell.className = "leaderboard-player-name";
          row.append(cell);
        }
        leaderboardEntries.append(row);
      }
      leaderboardMessage.textContent = isStartNgSignedIn
        ? "Showing the top 10 best runs. Your row is highlighted when it appears."
        : "Guests can view scores. Sign in to save your own best run.";
    })
    .catch(() => {
      leaderboardMessage.textContent =
        "Could not contact Start.ng. Check your connection and try again.";
      console.info("Start.ng leaderboard is not available in this context.");
    });
}
async function saveCompletedRun(result) {
  if (result.demo) {
    scoreSaveMessage.textContent = "AI demonstration complete. Demo scores are not submitted.";
    return;
  }
  if (!isStartNgSignedIn) {
    scoreSaveMessage.textContent =
      "Guest run not saved. Sign in to Start.ng to save your best score.";
    return;
  }
  scoreSaveMessage.textContent = "Saving your completed run…";
  let saved;
  try {
    saved = await askStartNg(
      {
        type: "startng:score",
        stats: {
          score: result.score,
          distance: result.distance,
          relics: result.relics,
        },
      },
      "startng:scoreSaved",
    );
  } catch {
    scoreSaveMessage.textContent =
      "Could not contact Start.ng. Your run is complete, but the score was not confirmed.";
    return;
  }
  if (!saved) {
    scoreSaveMessage.textContent =
      "Score save timed out. Your run is still playable; try again after reconnecting.";
    return;
  }
  if (!saved.ok) {
    scoreSaveMessage.textContent =
      saved.error || "Start.ng could not save this score. Try again later.";
    if (
      typeof saved.error === "string" &&
      saved.error.toLowerCase().includes("sign in")
    ) {
      // An expired session must not leave a signed-in identity displayed as authenticated.
      applyPlayerIdentity(null);
      void refreshLeaderboard();
    }
    return;
  }
  const outcome = saved.result;
  scoreSaveMessage.textContent = outcome?.improved
    ? `New personal best! ${Number.isInteger(outcome.rank) ? `Leaderboard rank #${outcome.rank}.` : "Your score was saved."}`
    : `Run submitted. ${Number.isInteger(outcome?.rank) ? `Current leaderboard rank: #${outcome.rank}.` : "Your best score is kept on the leaderboard."}`;
  await refreshLeaderboard();
}
app
  .querySelector("#leaderboard-refresh")
  .addEventListener("click", () => void refreshLeaderboard());
window.addEventListener("relicrush:run-finished", (event) => {
  void saveCompletedRun(event.detail);
});
void refreshLeaderboard();

// ---------------------------------------------------------------------------
// Sizing. On tall, narrow screens the horizontal FOV collapses and crops the side
// lanes, so the camera pulls back and widens to keep all three lanes in view.
// ---------------------------------------------------------------------------
function fitCamera(aspect) {
  const t = Math.min(Math.max((1.45 - aspect) / 0.95, 0), 1);
  camera.fov = 56 + t * 14;
  cameraRig.y = 4 + t * 2.6;
  cameraRig.z = 8.4 + t * 8;
  camera.position.y = cameraRig.y;
  camera.position.z = cameraRig.z;
}
const resize = () => {
  const width = Math.max(container.clientWidth, 1);
  const height = Math.max(container.clientHeight, 1);
  camera.aspect = width / height;
  fitCamera(camera.aspect);
  camera.updateProjectionMatrix();
  renderer.setSize(width, height, false);
};
const resizeObserver = new ResizeObserver(resize);
resizeObserver.observe(container);
resize();

// ---------------------------------------------------------------------------
// Game state
// ---------------------------------------------------------------------------
const state = {
  mode: "ready",
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
};
let audioContext = null;
let soundMuted = false;
const soundButton = app.querySelector("#sound-toggle");
function syncSoundButton() {
  soundButton.textContent = soundMuted ? "Sound off" : "Sound on";
  soundButton.setAttribute(
    "aria-label",
    soundMuted ? "Unmute sound" : "Mute sound",
  );
  soundButton.setAttribute("aria-pressed", String(soundMuted));
}
function unlockAudio() {
  if (soundMuted) return;
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    if (!audioContext) audioContext = new AudioContextClass();
    if (audioContext.state === "suspended")
      void audioContext.resume().catch(() => {});
  } catch {
    // Audio is optional; unsupported or blocked audio must never interrupt gameplay.
  }
}
function playSound(kind) {
  if (soundMuted) return;
  unlockAudio();
  if (!audioContext || audioContext.state !== "running") return;

  const sounds = {
    lane: {
      start: 420,
      end: 590,
      duration: 0.075,
      type: "sine",
      volume: 0.045,
    },
    relic: {
      start: 740,
      end: 1180,
      duration: 0.18,
      type: "triangle",
      volume: 0.075,
    },
    crash: {
      start: 190,
      end: 55,
      duration: 0.28,
      type: "sawtooth",
      volume: 0.09,
    },
  };
  const sound = sounds[kind];
  if (!sound) return;

  try {
    const now = audioContext.currentTime;
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = sound.type;
    oscillator.frequency.setValueAtTime(sound.start, now);
    oscillator.frequency.exponentialRampToValueAtTime(
      sound.end,
      now + sound.duration,
    );
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(sound.volume, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + sound.duration);
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start(now);
    oscillator.stop(now + sound.duration + 0.01);
    oscillator.addEventListener(
      "ended",
      () => {
        oscillator.disconnect();
        gain.disconnect();
      },
      { once: true },
    );
  } catch {
    // A browser audio restriction should not break the current run.
  }
}
function triggerHaptic(kind) {
  if (
    typeof navigator === "undefined" ||
    typeof navigator.vibrate !== "function"
  )
    return;

  const patterns = {
    lane: 18,
    crash: [75, 40, 130],
  };
  const pattern = patterns[kind];
  if (pattern === undefined) return;

  try {
    navigator.vibrate(pattern);
  } catch {
    // Haptics are optional; unsupported devices must never interrupt gameplay.
  }
}
syncSoundButton();
const startOverlay = app.querySelector("#start-overlay");
const gameHud = app.querySelector("#game-hud");
const pauseOverlay = app.querySelector("#pause-overlay");
const gameoverOverlay = app.querySelector("#gameover-overlay");
const pauseButton = app.querySelector("#pause-button");
const distanceElement = app.querySelector("#distance");
const relicsElement = app.querySelector("#relics");
const bestScoreElement = app.querySelector("#best-score");
const hideOverlays = () => {
  startOverlay.hidden = true;
  pauseOverlay.hidden = true;
  gameoverOverlay.hidden = true;
};
const hud = { distance: -1, relics: -1, best: -1 };
function updateHud() {
  // Only touch the DOM when a value changed; this runs every frame.
  const distance = Math.floor(state.distance);
  const best = state.bestRun?.score ?? 0;
  if (hud.distance !== distance) {
    hud.distance = distance;
    distanceElement.textContent = `${distance} m`;
  }
  if (hud.relics !== state.relics) {
    hud.relics = state.relics;
    relicsElement.textContent = String(state.relics);
  }
  if (hud.best !== best) {
    hud.best = best;
    bestScoreElement.textContent = String(best);
  }
}
let shake = 0;
function setMode(mode) {
  const previousMode = state.mode;
  state.mode = mode;
  if (mode === "gameover" && previousMode === "running") {
    playSound("crash");
    triggerHaptic("crash");
  }
  container.dataset.mode = mode;
  gameHud.hidden = mode === "ready";
  hideOverlays();
  pauseButton.hidden = mode !== "running";
  if (mode === "ready") startOverlay.hidden = false;
  if (mode === "paused") pauseOverlay.hidden = false;
  if (mode === "gameover") {
    gameoverOverlay.hidden = false;
    if (previousMode === "running") {
      shake = 0.4;
      const result = {
        score: state.score,
        relics: state.relics,
        distance: Math.floor(state.distance),
        timestamp: new Date().toISOString(),
      };
      state.lastRun = result;
      if (!state.bestRun || result.score > state.bestRun.score)
        state.bestRun = result;
      window.dispatchEvent(
        new CustomEvent("relicrush:run-finished", {
          detail: { ...result, demo: state.aiDemo },
        }),
      );
    }
    app.querySelector("#final-score").textContent = String(state.score);
    app.querySelector("#final-distance").textContent =
      `${Math.floor(state.distance)} m`;
    app.querySelector("#final-relics").textContent = String(state.relics);
    app.querySelector("#final-best-score").textContent = String(
      state.bestRun?.score ?? state.score,
    );
    updateHud();
  }
}
function moveLane(direction) {
  if (state.mode !== "running") return;
  const nextLane = Math.max(
    0,
    Math.min(CFG.laneCount - 1, state.lane + direction),
  );
  if (nextLane === state.lane) return;
  state.lane = nextLane;
  playSound("lane");
  triggerHaptic("lane");
}
function jump() {
  // A grounded-state check prevents a second jump before landing.
  if (
    state.mode !== "running" ||
    state.jumpHeight > 0 ||
    state.jumpVelocity > 0
  )
    return;
  state.jumpVelocity = CFG.jumpInitialVelocity;
}
// The attract-mode runner follows the same lane limits and obstacle positions as a player.
function updateDemoBot() {
  const lookAhead = Math.max(10, state.speed * 1.15);
  let nextRowZ = -Infinity;
  for (const item of obstaclePool) {
    if (!item.active) continue;
    const z = item.mesh.position.z;
    const distance = CFG.playerZ - z;
    if (distance > 2.5 && distance < lookAhead && z > nextRowZ) {
      nextRowZ = z;
    }
  }
  if (!Number.isFinite(nextRowZ)) {
    return;
  }

  const blockedLanes = new Set(
    obstaclePool
      .filter((item) => item.active && Math.abs(item.mesh.position.z - nextRowZ) < 3.5)
      .map((item) => item.lane),
  );
  const safeLanes = [0, 1, 2].filter((lane) => !blockedLanes.has(lane));
  if (!safeLanes.length) return;

  const currentLane = state.lane;
  const bestLane = safeLanes.reduce((best, lane) =>
    Math.abs(lane - currentLane) < Math.abs(best - currentLane) ? lane : best,
  );
  if (bestLane !== currentLane) {
    state.lane = bestLane;
  }
}
function resetRun() {
  state.lane = 1;
  state.elapsed = 0;
  state.distance = 0;
  state.score = 0;
  state.relics = 0;
  state.speed = CFG.initialSpeed;
  state.jumpHeight = 0;
  state.jumpVelocity = 0;
  state.aiDemo = false;
  state.crashObstacle = null;
  state.crashElapsed = 0;
  state.fallIntoGap = false;
  state.fallElapsed = 0;
  player.position.x = 0;
  player.position.y = 0.16;
  camera.position.x = 0;
  menuShift = 0;
  shake = 0;
  for (const item of scenery) item.group.position.z = item.startZ;
  resetSceneryChunks(storyBackdropChunks, storyBackdropInitialPositions);
  resetWorldObjects(false);
  updateHud();
}
function startRun(aiDemo = false) {
  resetRun();
  state.aiDemo = aiDemo;
  setMode("running");
}
function togglePause() {
  if (state.mode === "running") setMode("paused");
  else if (state.mode === "paused") setMode("running");
}
// Collision systems can end a run through this explicit hook.
window.relicRushEndRun = () => {
  if (state.mode === "running") setMode("gameover");
};
// Stable result adapters for Start.ng leaderboard wiring. No platform API is assumed here.
window.relicRushGetLastRun = () =>
  state.lastRun ? { ...state.lastRun } : null;
window.relicRushGetBestRun = () =>
  state.bestRun ? { ...state.bestRun } : null;
soundButton.addEventListener("click", () => {
  soundMuted = !soundMuted;
  syncSoundButton();
  if (!soundMuted) unlockAudio();
});
window.addEventListener("pointerdown", unlockAudio);
app.querySelector("#play-button").addEventListener("click", () => startRun(false));
app.querySelector("#restart-button").addEventListener("click", () => startRun(false));
app.querySelector("#share-result-button").addEventListener("click", (event) => {
  event.preventDefault();
  const result = state.lastRun ?? {
    score: state.score,
    distance: Math.floor(state.distance),
    relics: state.relics,
  };
  const text = `I scored ${result.score} points, ran ${result.distance}m, and collected ${result.relics} relics in Relic Rush 3D!`;
  const shareUrl = new URL("https://twitter.com/intent/tweet");
  shareUrl.searchParams.set("text", text);
  shareUrl.searchParams.set("url", "https://relic-rush-3d.start.ng");
  window.open(shareUrl.toString(), "_blank", "noopener,noreferrer");
});
app.querySelector("#resume-button").addEventListener("click", togglePause);
app.querySelector("#pause-restart-button").addEventListener("click", () => startRun(false));
pauseButton.addEventListener("click", togglePause);
app.querySelector("#left-button").addEventListener("click", () => moveLane(-1));
app.querySelector("#jump-button").addEventListener("click", jump);
app.querySelector("#right-button").addEventListener("click", () => moveLane(1));
window.addEventListener("keydown", (event) => {
  unlockAudio();
  const key = event.key.toLowerCase();
  if (["arrowleft", "arrowright", "arrowup", " "].includes(key))
    event.preventDefault();
  // Held keys auto-repeat; without this guard one long press skips straight across the track.
  if (event.repeat) return;
  if (key === "arrowleft" || key === "a") moveLane(-1);
  if (key === "arrowright" || key === "d") moveLane(1);
  if ((key === "arrowup" || key === " ") && state.mode === "running") jump();
  if (key === "escape" || key === "p") togglePause();
  if (
    (key === "enter" || key === " ") &&
    (state.mode === "ready" || state.mode === "gameover")
  ) {
    // Stop the focused overlay button from also firing its own click and restarting twice.
    event.preventDefault();
    startRun();
  }
});
// Backgrounded tabs must not keep a run alive under the player.
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden" && state.mode === "running")
    setMode("paused");
});
let touchStart = null;
container.addEventListener(
  "touchstart",
  (event) => {
    if (event.changedTouches.length) {
      const touch = event.changedTouches[0];
      touchStart = { x: touch.clientX, y: touch.clientY };
    }
  },
  { passive: true },
);
container.addEventListener(
  "touchend",
  (event) => {
    if (!touchStart || !event.changedTouches.length) return;
    const touch = event.changedTouches[0];
    const dx = touch.clientX - touchStart.x;
    const dy = touch.clientY - touchStart.y;
    if (Math.abs(dy) > 35 && Math.abs(dy) > Math.abs(dx)) {
      if (dy < 0) jump();
    } else if (Math.abs(dx) > 35) {
      moveLane(dx < 0 ? -1 : 1);
    }
    touchStart = null;
  },
  { passive: true },
);
setMode("ready");
resetWorldObjects(true);

// ---------------------------------------------------------------------------
// Main loop
// ---------------------------------------------------------------------------
const clock = new THREE.Clock();
let animTime = 0;
const clamp01 = (value) => Math.min(Math.max(value, 0), 1);
function animate() {
  // Do not cap normal frame delays at 50 ms: that made the runner lose speed
  // whenever rendering dipped below 20 FPS, including during season changes.
  // Keep a larger safety cap for exceptional stalls (for example, a tab resume).
  const delta = Math.min(clock.getDelta(), 0.1);
  const running = state.mode === "running";
  const attract = state.mode === "ready";
  if (running || attract) {
    state.elapsed += delta;
    // The preview starts gently, then accelerates using the same cap as a real run.
    const startingSpeed = attract ? CFG.attractSpeed : CFG.initialSpeed;
    state.speed = Math.min(
      startingSpeed + state.elapsed * CFG.speedIncreasePerSecond,
      CFG.maximumSpeed,
    );
    state.distance += delta * state.speed;
    if (state.jumpHeight > 0 || state.jumpVelocity > 0) {
      state.jumpVelocity -= CFG.jumpGravity * delta;
      state.jumpHeight += state.jumpVelocity * delta;
      if (state.jumpHeight <= 0) {
        state.jumpHeight = 0;
        state.jumpVelocity = 0;
      }
    }
  }
  updateSeasonEnvironment(state.distance);
  // The pre-game attract mode is a real, computer-controlled run, not a static backdrop.
  const worldSpeed = running || attract ? state.speed : 0;
  const dz = delta * worldSpeed;
  if (dz > 0) {
    animTime += delta;
    slabTexture.offset.y += dz / SLAB_DEPTH;
    for (const item of scenery) {
      item.group.position.z += dz;
      if (item.group.position.z > 12) item.group.position.z -= SEGMENT_SPAN;
    }
    // Move the entire Chapter 1 streetscape with the road, then recycle it
    // behind the camera so buildings and roadside props never stay frozen.
    recycleSceneryChunks(storyBackdropChunks, storyBackdropBounds, CFG.playerZ);
    spawn.frontier += dz;
    streamWorld(attract ? 0 : state.elapsed, attract);
  }
  for (const flame of flames) {
    flame.scale.set(
      1,
      1 + Math.sin(clock.elapsedTime * 13 + flame.userData.phase) * 0.18,
      1,
    );
  }

  if (attract) updateDemoBot();
  const playerX = player.position.x;

  for (const item of gapPool) {
    if (!item.active) continue;
    item.mesh.position.z += dz;
    if (item.mesh.position.z > CFG.despawnZ) {
      item.active = false;
      item.mesh.visible = false;
      continue;
    }
    if (running && state.mode === "running") {
      const relativeZ = item.mesh.position.z - CFG.playerZ;
      const isOverGap =
        relativeZ > -1.45 &&
        relativeZ < 1.45;
      const clearsGap = state.jumpHeight > 0.42;
      if (isOverGap && !clearsGap) {
        state.jumpHeight = 0;
        state.jumpVelocity = 0;
        state.fallIntoGap = true;
        state.fallElapsed = 0;
        setMode("gameover");
      }
    }
  }

  for (const item of obstaclePool) {
    if (!item.active) continue;
    // Convert each car's forward speed into its relative motion past the runner.
    const relativeScrollSpeed = storyCarGeometry
      ? Math.max(0, worldSpeed - item.forwardSpeed)
      : worldSpeed;
    const z = (item.mesh.position.z += delta * relativeScrollSpeed);
    if (z > CFG.despawnZ) {
      item.active = false;
      item.mesh.visible = false;
      item.moving = false;
      item.shiftStarted = false;
      item.shiftProgress = 0;
      continue;
    }
    // Traffic and props fade in at their authored physical size, not by growing. 
    item.mesh.scale.setScalar(storyCarGeometry ? 1 : clamp01((z + CFG.spawnDistance) / 14));

    if (item.moving) {
      // Start shifting only once visible and still far enough away to react.
      if (!item.shiftStarted && z > -26) item.shiftStarted = true;
      if (item.shiftStarted) {
        item.shiftProgress = Math.min(item.shiftProgress + delta / 0.72, 1);
        const eased = item.shiftProgress * item.shiftProgress * (3 - 2 * item.shiftProgress);
        item.mesh.position.x =
          LANE_X[item.sourceLane] +
          (LANE_X[item.targetLane] - LANE_X[item.sourceLane]) * eased;
        if (item.shiftProgress >= 1) {
          item.lane = item.targetLane;
          item.moving = false;
        }
      }
    }

    if (running && state.mode === "running") {
      const relativeZ = z - CFG.playerZ;
      if (
        relativeZ > CFG.obstacleHitZ[0] &&
        relativeZ < CFG.obstacleHitZ[1] &&
        Math.abs(item.mesh.position.x - playerX) < CFG.obstacleHitX &&
        state.jumpHeight < CFG.jumpObstacleClearance
      ) {
        item.falling = true;
        item.fallVelocity = 1.8;
        state.crashObstacle = item;
        state.crashElapsed = 0;
        setMode("gameover");
        break;
      }
    }
    if (item.falling) {
      item.fallVelocity += 18 * delta;
      item.mesh.position.y -= item.fallVelocity * delta;
      item.mesh.rotation.z += delta * 3.8;
      item.mesh.rotation.x += delta * 1.4;
    }
  }
  if (state.crashObstacle && state.mode === "gameover") {
    state.crashElapsed += delta;
  }
  for (const item of relicPool) {
    if (!item.active) continue;
    const z = (item.group.position.z += dz);
    if (z > CFG.despawnZ) {
      item.active = false;
      item.group.visible = false;
      continue;
    }
    item.group.scale.setScalar(clamp01((z + CFG.spawnDistance) / 14));
    if (!item.isUrn) {
      item.group.rotation.y += delta * 3;
      item.group.position.y =
        1.15 + Math.sin(clock.elapsedTime * 4 + item.phase) * 0.12;
    }
    if (running || attract) {
      const relativeZ = z - CFG.playerZ;
      if (
        relativeZ > CFG.relicHitZ[0] &&
        relativeZ < CFG.relicHitZ[1] &&
        Math.abs(item.group.position.x - playerX) < CFG.relicHitX
      ) {
        item.active = false;
        item.group.visible = false;
        if (running) {
          state.relics += 1;
          playSound("relic");
        }
      }
    }
  }
  if (running) {
    // Derived every frame so score can never drift from distance and relics.
    state.score = Math.floor(state.distance) + state.relics * CFG.relicScore;
    updateHud();
  }

  const targetX = LANE_X[state.lane];
  player.position.x += (targetX - player.position.x) * Math.min(delta * 12, 1);
  const moving = running || attract;
  const stride = animTime * 11;
  const runBob =
    moving && state.jumpHeight === 0 ? Math.abs(Math.sin(stride)) * 0.07 : 0;
  player.position.y = 0.16 + state.jumpHeight + runBob;
  if (state.fallIntoGap) {
    state.fallElapsed += delta;
    player.position.y = 0.16 - Math.min(state.fallElapsed * 5.2, 2.8);
    rig.rotation.x += (0.48 - rig.rotation.x) * Math.min(delta * 5, 1);
  }
  const swing = moving ? Math.sin(stride) * 0.95 : 0;
  limbs.legL.rotation.x = swing;
  limbs.legR.rotation.x = -swing;
  limbs.armL.rotation.x = -swing * 0.9;
  limbs.armR.rotation.x = swing * 0.9;
  rig.rotation.x +=
    ((moving ? -0.14 : 0) - rig.rotation.x) * Math.min(delta * 8, 1);
  rig.rotation.y = Math.max(
    -0.45,
    Math.min(0.45, (player.position.x - targetX) * 0.22),
  );

  menuShift +=
    ((attract && camera.aspect > 1.2 ? 2.4 : 0) - menuShift) *
    Math.min(delta * 3, 1);
  camera.position.x +=
    (player.position.x * 0.22 - menuShift - camera.position.x) *
    Math.min(delta * 2.2, 1);
  let shakeX = 0;
  let shakeY = 0;
  if (shake > 0) {
    shake = Math.max(0, shake - delta);
    shakeX = (Math.random() - 0.5) * shake * 0.6;
    shakeY = (Math.random() - 0.5) * shake * 0.6;
  }
  camera.position.y = cameraRig.y + shakeY;
  camera.position.x += shakeX;
  camera.lookAt(player.position.x * 0.18 - menuShift, 1.9, -7);
  renderer.render(scene, camera);
  const loadingStatus = app.querySelector("#scene-loading");
  if (loadingStatus && !loadingStatus.hidden) loadingStatus.hidden = true;
  requestAnimationFrame(animate);
}
animate();
window.addEventListener("beforeunload", () => {
  resizeObserver.disconnect();
  renderer.dispose();
});
}
