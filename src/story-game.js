import * as THREE from "three";

const LANES = [-2.35, 0, 2.35];
const CHAPTER_TUNING = {
  "lagos-hustle": { sky: "#d7a36d", road: "#4a3930", accent: "#e3a33b", speed: 15, length: 390, hazard: "DANFO / OKADA" },
  "emilokan-expressway": { sky: "#a7bac0", road: "#343d43", accent: "#e1a83b", speed: 17, length: 430, hazard: "TANKER / TRUCK" },
  "the-system": { sky: "#b5a9a0", road: "#454044", accent: "#c7a66b", speed: 16, length: 450, hazard: "QUEUE / DOCUMENT CART" },
  "japa-terminal": { sky: "#9baeb7", road: "#39464d", accent: "#e8c46d", speed: 18, length: 470, hazard: "TROLLEY / BARRIER" },
};

export class StoryRun {
  constructor(root, chapter, handlers = {}) {
    this.root = root;
    this.chapter = chapter;
    this.handlers = handlers;
    this.tuning = CHAPTER_TUNING[chapter.id];
    this.distance = 0;
    this.lane = 1;
    this.targetLane = 1;
    this.collected = 0;
    this.optional = 0;
    this.paused = false;
    this.ended = false;
    this.lastTime = 0;
    this.objects = [];
    this.frame = 0;
    this.buildScene();
    this.buildCourse();
    this.bind();
    this.animate = this.animate.bind(this);
    this.frame = requestAnimationFrame(this.animate);
  }

  buildScene() {
    const host = this.root.querySelector("[data-scene]");
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(this.tuning.sky);
    this.scene.fog = new THREE.Fog(this.tuning.sky, 24, 125);
    this.camera = new THREE.PerspectiveCamera(58, 1, 0.1, 180);
    this.camera.position.set(0, 7.2, 13);
    this.camera.lookAt(0, 1, -14);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
    this.renderer.shadowMap.enabled = false;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    host.appendChild(this.renderer.domElement);
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(host);
    this.resize();

    this.scene.add(new THREE.HemisphereLight(0xffffff, 0x65503b, 2.1));
    const sun = new THREE.DirectionalLight(0xffe2b0, 2.2);
    sun.position.set(-5, 12, 8);
    this.scene.add(sun);

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(180, 180),
      new THREE.MeshStandardMaterial({ color: this.tuning.road, roughness: 1 }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(0, -0.16, -48);
    this.scene.add(ground);

    const road = new THREE.Mesh(
      new THREE.BoxGeometry(8.1, 0.28, 150),
      new THREE.MeshStandardMaterial({ color: this.tuning.road, roughness: 0.9 }),
    );
    road.position.set(0, 0, -55);
    this.scene.add(road);

    const lineMaterial = new THREE.MeshBasicMaterial({ color: this.tuning.accent });
    for (const x of [-1.3, 1.3]) {
      const line = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.025, 150), lineMaterial);
      line.position.set(x, 0.16, -55);
      this.scene.add(line);
    }
    for (const x of [-4.3, 4.3]) {
      const rail = new THREE.Mesh(
        new THREE.BoxGeometry(0.28, 0.55, 150),
        new THREE.MeshStandardMaterial({ color: this.tuning.accent, roughness: 0.7 }),
      );
      rail.position.set(x, 0.32, -55);
      this.scene.add(rail);
    }

    this.player = new THREE.Group();
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 1.15, 0.48),
      new THREE.MeshStandardMaterial({ color: "#e98b32", roughness: 0.7 }),
    );
    body.position.y = 1.05;
    this.player.add(body);
    const head = new THREE.Mesh(
      new THREE.BoxGeometry(0.58, 0.58, 0.58),
      new THREE.MeshStandardMaterial({ color: "#bd805c", roughness: 0.8 }),
    );
    head.position.y = 1.95;
    this.player.add(head);
    const bag = new THREE.Mesh(
      new THREE.BoxGeometry(0.56, 0.72, 0.3),
      new THREE.MeshStandardMaterial({ color: "#365c3c", roughness: 0.9 }),
    );
    bag.position.set(0, 0.98, 0.38);
    this.player.add(bag);
    this.player.position.set(0, 0.16, 3.5);
    this.scene.add(this.player);
  }

  addObject(mesh, z, lane, kind) {
    mesh.position.set(LANES[lane], kind === "hazard" ? 0.75 : 0.9, z);
    this.scene.add(mesh);
    this.objects.push({ mesh, lane, kind, active: true });
  }

  buildCourse() {
    const hazardColors = {
      "lagos-hustle": "#d45a35",
      "emilokan-expressway": "#68747b",
      "the-system": "#a88e70",
      "japa-terminal": "#477d91",
    };
    const hazardMat = new THREE.MeshStandardMaterial({ color: hazardColors[this.chapter.id], roughness: 0.82 });
    const itemMat = new THREE.MeshStandardMaterial({
      color: this.tuning.accent, emissive: this.tuning.accent, emissiveIntensity: 0.28, metalness: 0.35,
    });
    const optionalMat = new THREE.MeshStandardMaterial({ color: "#f5d65e", emissive: "#8b5b08", emissiveIntensity: 0.35 });
    const hazardGeo = this.chapter.id === "emilokan-expressway"
      ? new THREE.CylinderGeometry(0.78, 0.78, 1.5, 12)
      : this.chapter.id === "the-system"
        ? new THREE.BoxGeometry(1.55, 1.1, 0.38)
        : this.chapter.id === "japa-terminal"
          ? new THREE.BoxGeometry(1.1, 1.55, 0.95)
          : new THREE.BoxGeometry(1.55, 1.3, 1.15);
    const itemGeo = new THREE.OctahedronGeometry(0.58, 0);
    const addHazardRow = (distance, lanes) => lanes.forEach((lane) => {
      const mesh = new THREE.Mesh(hazardGeo, hazardMat);
      if (this.chapter.id === "emilokan-expressway") mesh.rotation.x = Math.PI / 2;
      this.addObject(mesh, -distance, lane, "hazard");
    });
    for (let d = 45, row = 0; d < this.tuning.length - 28; d += 29, row++) {
      const patterns = [[0, 1], [1, 2], [0, 2], [0, 1], [1, 2], [0, 2]];
      addHazardRow(d, patterns[row % patterns.length]);
    }

    const addRequired = (distance, lane, label) => {
      const mesh = new THREE.Mesh(itemGeo, itemMat);
      mesh.userData.requiredLabel = label;
      this.addObject(mesh, -distance, lane, "required");
    };
    if (this.chapter.number === 2) addRequired(180, 1, "TRAVEL FOLDER");
    if (this.chapter.number === 3) {
      addRequired(115, 0, "CLEARANCE STAMP");
      addRequired(230, 2, "CLEARANCE STAMP");
      addRequired(345, 1, "CLEARANCE STAMP");
    }
    if (this.chapter.number === 4) addRequired(260, 1, "BOARDING PASS");
    if (this.chapter.number === 1) {
      [85, 165, 245, 315].forEach((d, i) => {
        const mesh = new THREE.Mesh(itemGeo, optionalMat);
        this.addObject(mesh, -d, i % 3, "optional");
      });
    }

    const gate = new THREE.Group();
    const gateMat = new THREE.MeshStandardMaterial({ color: "#f4d58a", emissive: "#6e4815", emissiveIntensity: 0.25 });
    const postGeo = new THREE.BoxGeometry(0.42, 5, 0.5);
    for (const x of [-3.1, 3.1]) {
      const post = new THREE.Mesh(postGeo, gateMat);
      post.position.set(x, 2.5, 0);
      gate.add(post);
    }
    const top = new THREE.Mesh(new THREE.BoxGeometry(6.6, 0.5, 0.55), gateMat);
    top.position.y = 5;
    gate.add(top);
    gate.position.set(0, 0, -this.tuning.length);
    this.scene.add(gate);
    this.exitGate = gate;
  }

  bind() {
    this.onKey = (event) => {
      if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") this.move(-1);
      if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") this.move(1);
      if (event.key === "Escape") this.togglePause();
    };
    this.onClick = (event) => {
      const control = event.target.closest("[data-run-action]");
      if (!control) return;
      const action = control.dataset.runAction;
      if (action === "left") this.move(-1);
      if (action === "right") this.move(1);
      if (action === "pause") this.togglePause();
    };
    window.addEventListener("keydown", this.onKey);
    this.root.addEventListener("click", this.onClick);
  }

  move(direction) {
    if (this.paused || this.ended) return;
    this.targetLane = THREE.MathUtils.clamp(this.targetLane + direction, 0, 2);
  }

  togglePause() {
    if (this.ended) return;
    this.paused = !this.paused;
    const button = this.root.querySelector('[data-run-action="pause"]');
    if (button) button.textContent = this.paused ? "RESUME" : "PAUSE";
    this.root.querySelector("[data-paused]")?.toggleAttribute("hidden", !this.paused);
  }

  updateHud() {
    const required = this.chapter.requiredCount;
    const count = this.root.querySelector("[data-objective-count]");
    if (count) count.textContent = `${this.collected} / ${required}`;
    const distance = this.root.querySelector("[data-distance]");
    if (distance) distance.textContent = `${Math.min(100, Math.floor((this.distance / this.tuning.length) * 100))}%`;
    const optional = this.root.querySelector("[data-optional-count]");
    if (optional) optional.textContent = String(this.optional);
  }

  finish(success, reason) {
    if (this.ended) return;
    this.ended = true;
    cancelAnimationFrame(this.frame);
    this.handlers.onFinish?.({ success, reason, collected: this.collected, optional: this.optional });
  }

  animate(time) {
    this.frame = requestAnimationFrame(this.animate);
    if (this.paused || this.ended) {
      this.renderer.render(this.scene, this.camera);
      return;
    }
    const delta = this.lastTime ? Math.min((time - this.lastTime) / 1000, 0.04) : 0;
    this.lastTime = time;
    const speed = this.tuning.speed;
    this.distance += speed * delta;
    this.player.position.x = THREE.MathUtils.damp(this.player.position.x, LANES[this.targetLane], 11, delta);
    this.player.position.y = 0.16 + Math.sin(time * 0.012) * 0.045;
    this.exitGate.position.z = -this.tuning.length + this.distance;

    for (const item of this.objects) {
      if (!item.active) continue;
      item.mesh.position.z += speed * delta;
      if (item.kind !== "hazard" && item.mesh.position.z > 1.5 && item.mesh.position.z < 5.2 && Math.abs(this.player.position.x - LANES[item.lane]) < 0.9) {
        item.active = false;
        item.mesh.visible = false;
        if (item.kind === "required") this.collected += 1;
        else this.optional += 1;
        this.updateHud();
      } else if (item.kind === "hazard" && item.mesh.position.z > 2.1 && item.mesh.position.z < 4.7 && Math.abs(this.player.position.x - LANES[item.lane]) < 0.9) {
        this.finish(false, "You were caught in the traffic. Your chapter objectives have been reset.");
        return;
      }
      if (item.mesh.position.z > 12) {
        item.active = false;
        item.mesh.visible = false;
      }
    }

    if (this.distance >= this.tuning.length) {
      if (this.collected >= this.chapter.requiredCount) this.finish(true, "You made it through. The next chapter is now within reach.");
      else this.finish(false, `You reached the exit without the required item. Objective: ${this.collected} / ${this.chapter.requiredCount}.`);
      return;
    }
    this.updateHud();
    this.renderer.render(this.scene, this.camera);
  }

  resize() {
    if (!this.renderer) return;
    const host = this.root.querySelector("[data-scene]");
    const width = Math.max(1, host.clientWidth);
    const height = Math.max(1, host.clientHeight);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  }

  destroy() {
    cancelAnimationFrame(this.frame);
    window.removeEventListener("keydown", this.onKey);
    this.root.removeEventListener("click", this.onClick);
    this.resizeObserver?.disconnect();
    this.scene.traverse((object) => {
      object.geometry?.dispose();
      if (Array.isArray(object.material)) object.material.forEach((m) => m.dispose());
      else object.material?.dispose();
    });
    this.renderer?.dispose();
    this.renderer?.domElement.remove();
  }
}
