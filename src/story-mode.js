import "./story-mode.css";

const STORAGE_KEY = "relic-rush:japa-rush:progress:v1";
const STORY_SEEN_KEY = "relic-rush:japa-rush:seen-intros:v1";
const CHAPTER_STORIES = {
  "lagos-hustle": "The bus stop is behind you. Your route slip is in your pocket, and the expressway is the only way out. But the Big Man has noticed your plans. Keep your eyes on the road.",
  "emilokan-expressway": "The city noise fades, but the road ahead is not empty. Your travel folder is somewhere along this stretch. The convoy is still behind you, and every kilometre feels longer.",
  "the-system": "A quiet district. Endless paperwork. Three approvals stand between you and the next road. The signs say the process is simple. The queues disagree.",
  "japa-terminal": "You can see the terminal lights now. One boarding pass, one final run, and a gate at the end of the road. The Big Man has saved his loudest announcement for last."
};
function readSeenIntros() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORY_SEEN_KEY) || "[]");
    return new Set(Array.isArray(saved) ? saved.filter((id) => typeof id === "string") : []);
  } catch {
    return new Set();
  }
}
const seenIntros = readSeenIntros();

const CHAPTERS = [
  { id: "lagos-hustle", number: 1, title: "Lagos Hustle", subtitle: "One last stop before the open road.", description: "Escape the traffic and reach the expressway exit.", objective: "Reach the expressway exit", hazards: "Danfo buses, okadas, potholes and barricades", requiredCount: 0, itemName: "No required item", image: "./assets/environment/lagos-hustle.jpg" },
  { id: "emilokan-expressway", number: 2, title: "The Emilokan Expressway", subtitle: "The road gets longer. The problems get bigger.", description: "Find your travel folder and reach the checkpoint.", objective: "Collect the travel folder and reach the checkpoint", hazards: "Fuel tankers, broken-down trucks and road barriers", requiredCount: 1, itemName: "Travel folder", image: "./assets/environment/expressway.jpg" },
  { id: "the-system", number: 3, title: "The System", subtitle: "Your documents are under review. Again.", description: "Collect three clearance stamps and get out.", objective: "Collect all three clearance stamps and reach the exit", hazards: "Queue barriers, document carts and security obstacles", requiredCount: 3, itemName: "Clearance stamps", image: "./assets/environment/the-system.jpg" },
  { id: "japa-terminal", number: 4, title: "The Japa Terminal", subtitle: "Freedom is visible. Keep moving.", description: "Secure your boarding pass and reach the departure gate.", objective: "Collect the boarding pass and reach the departure gate", hazards: "Luggage trolleys, queue ropes and terminal barriers", requiredCount: 1, itemName: "Boarding pass", image: "./assets/environment/japa-terminal.jpg" },
];

function freshProgress() {
  return { version: 1, highestUnlocked: 1, completed: [] };
}

function readProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (!saved || saved.version !== 1) return freshProgress();
    const completed = Array.isArray(saved.completed)
      ? [...new Set(saved.completed.filter((id) => CHAPTERS.some((chapter) => chapter.id === id)))]
      : [];
    const highestUnlocked = Math.min(CHAPTERS.length, Math.max(1, Number.isInteger(saved.highestUnlocked) ? saved.highestUnlocked : 1));
    return { version: 1, highestUnlocked, completed };
  } catch {
    return freshProgress();
  }
}

function saveProgress(progress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // The current session remains playable if browser storage is unavailable.
  }
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]);
}

export function mountJapaRush(root) {
  if (!root) return () => {};
  let progress = readProgress();

  const statusFor = (chapter) => progress.completed.includes(chapter.id)
    ? "Completed"
    : chapter.number <= progress.highestUnlocked ? "Available" : "Locked";

  const stopRun = () => {};

  const renderChapters = () => {
    stopRun();
    progress = readProgress();
    root.innerHTML = `
      <div class="japa-shell">
        <section class="japa-visual-hero" aria-label="Japa Rush story mode">
          <div class="japa-hero-backdrop" role="img" aria-label="Lagos Hustle streetscape"><img src="./assets/environment/lagos-hustle.jpg" alt="" onerror="this.hidden=true"></div>
          <div class="japa-hero-copy">
            <p class="japa-eyebrow">Relic Rush 3D presents</p>
            <h1>JAPA <span>RUSH</span></h1>
            <p class="japa-lede">One bag. One destination. A whole country standing in the way.</p>
            <p class="japa-premise">The Big Man has made your departure a national emergency. Keep moving.</p>
          </div>
          <div class="japa-big-man-sprite" role="img" aria-label="The Big Man"></div>
          <p class="japa-antagonist-label">THE BIG MAN <span>“You think you can Japa?”</span></p>
        </section>
        <div class="japa-chapter-heading">
          <div><p class="japa-eyebrow">Your journey</p><h2>Choose a chapter</h2><p class="japa-progress-copy">${progress.completed.length} of 4 chapters completed</p></div>
          <a class="japa-back-link" href="/backyard">Back to Relic Rush</a>
        </div>
        <div class="japa-chapter-grid">
          ${CHAPTERS.map((chapter) => {
            const status = statusFor(chapter);
            const locked = status === "Locked";
            return `
              <article class="japa-chapter-card ${locked ? "is-locked" : ""} ${status === "Completed" ? "is-complete" : ""}">
                <div class="japa-chapter-image" role="img" aria-label="${escapeHtml(chapter.title)} environment"><img src="${chapter.image}" alt="" loading="lazy" onerror="this.hidden=true"></div>
                <div class="japa-card-copy">
                  <p class="japa-card-status">${status}</p>
                  <h3>${chapter.number}. ${escapeHtml(chapter.title)}</h3>
                  <p>${escapeHtml(chapter.subtitle)}</p>
                  <button class="japa-select-button" type="button" data-chapter="${chapter.id}" ${locked ? "disabled" : ""}>
                    ${locked ? "Complete previous chapter" : status === "Completed" ? "Replay chapter" : "Enter chapter"}
                  </button>
                </div>
              </article>`;
          }).join("")}
        </div>
        ${progress.completed.includes("japa-terminal") ? '<p class="japa-campaign-stamp">CAMPAIGN COMPLETE · YOU MADE IT OUT</p>' : ""}
        <p class="japa-credit">Story concept by <strong>ambh4ck3r</strong></p>
      </div>`;
  };

  const renderIntro = (chapter) => {
    stopRun();
    const showStory = !seenIntros.has(chapter.id);
    if (showStory) {
      seenIntros.add(chapter.id);
      try { localStorage.setItem(STORY_SEEN_KEY, JSON.stringify([...seenIntros])); } catch { /* session remains playable */ }
    }
    root.innerHTML = `
      <div class="japa-shell japa-intro-shell">
        <button class="japa-back-link japa-inline-back" type="button" data-action="chapters">← All chapters</button>
        <div class="japa-intro-art" style="background-image:linear-gradient(90deg, rgb(15 12 10 / 92%), rgb(15 12 10 / 18%)),url('${chapter.image}')">
          <div><p class="japa-eyebrow">Chapter 0${chapter.number}</p><h1>${escapeHtml(chapter.title)}</h1><p class="japa-lede">${escapeHtml(chapter.subtitle)}</p></div>
        </div>
        <div class="japa-objective-panel">
          ${showStory ? `<p class="japa-eyebrow">The story so far</p><p class="japa-chapter-story">${escapeHtml(CHAPTER_STORIES[chapter.id])}</p>` : ""}
          <p class="japa-eyebrow">Mission briefing</p><h2>${escapeHtml(chapter.objective)}</h2>
          <p><strong>Watch out for:</strong> ${escapeHtml(chapter.hazards)}.</p>
          <p><strong>Controls:</strong> A / ← move left · D / → move right · use the on-screen arrows on mobile.</p>
          ${chapter.number === 1 ? '<p><strong>To pass Chapter 1:</strong> collect the route slip / bus ticket, earn at least ₦500 in Naira-note tokens, then survive all three phases of <em>The Last Danfo</em> and reach the expressway exit. The phases teach a signalling danfo merge, a go-slow squeeze around a parked vehicle or keke, and a final on-ramp merge through cones and barricades. Naira notes beyond the ₦500 target are optional bonus notes.</p><p><strong>Traffic:</strong> Keke tricycles are blue or yellow and cannot be jumped. Blue, black, green and white public buses are tall lane-avoidance hazards.</p>' : ""}
          ${chapter.number > 1 ? `<p><strong>Required:</strong> ${chapter.requiredCount} ${escapeHtml(chapter.itemName)}. The exit will not count without them.</p>` : ""}
        </div>
        <button class="japa-primary-button" type="button" data-action="start">Start chapter</button>
      </div>`;
  };

  const renderRun = (chapter) => {
    // Story chapters deliberately launch the original Relic Rush runner.
    // The chapter identifier selects its visual skin; movement and physics stay untouched.
    window.location.href = `/backyard?page=play&storyChapter=${encodeURIComponent(chapter.id)}`;
  };

  const renderResult = (chapter, result) => {
    stopRun();
    if (result.success) {
      if (!progress.completed.includes(chapter.id)) progress.completed.push(chapter.id);
      progress.highestUnlocked = Math.min(CHAPTERS.length, Math.max(progress.highestUnlocked, chapter.number + 1));
      saveProgress(progress);
    }
    const campaignComplete = result.success && chapter.number === CHAPTERS.length;
    root.innerHTML = `
      <div class="japa-shell japa-result-shell ${result.success ? "is-success" : "is-failure"}">
        <p class="japa-eyebrow">${result.success ? campaignComplete ? "THE GREAT ESCAPE" : "CHAPTER COMPLETE" : "MISSION FAILED"}</p>
        <h1>${result.success ? campaignComplete ? "YOU MADE IT OUT." : "ROAD CLEARED." : "NOT THIS TIME."}</h1>
        <p class="japa-result-copy">${escapeHtml(result.reason)}</p>
        <div class="japa-result-stats">
          <div><span>${escapeHtml(chapter.itemName)}</span><strong>${result.collected} / ${chapter.requiredCount}</strong></div>
          <div><span>Optional Naira</span><strong>${result.optional}</strong></div>
        </div>
        <div class="japa-result-actions">
          ${result.success && !campaignComplete ? '<button class="japa-primary-button" type="button" data-action="chapters">Continue journey</button>' : ""}
          ${campaignComplete ? '<button class="japa-primary-button" type="button" data-action="chapters">Replay campaign chapters</button>' : ""}
          ${!result.success ? '<button class="japa-primary-button" type="button" data-action="retry">Retry chapter</button>' : ""}
          <button class="japa-secondary-button" type="button" data-action="chapters">Chapter selection</button>
        </div>
      </div>`;
  };

  const onClick = (event) => {
    const chapterButton = event.target.closest("[data-chapter]");
    if (chapterButton && root.contains(chapterButton)) {
      const chapter = CHAPTERS.find((item) => item.id === chapterButton.dataset.chapter);
      if (chapter) renderIntro(chapter);
      return;
    }
    const action = event.target.closest("[data-action]")?.dataset.action;
    if (action === "chapters" || action === "quit") renderChapters();
    if (action === "start") {
      const chapter = CHAPTERS.find((item) => root.querySelector(".japa-intro-art h1")?.textContent === item.title);
      if (chapter) renderRun(chapter);
    }
    if (action === "retry") {
      const chapter = CHAPTERS.find((item) => item.number <= progress.highestUnlocked && root.querySelector(".japa-intro-art h1")?.textContent === item.title);
      if (chapter) renderRun(chapter);
    }
  };

  root.addEventListener("click", onClick);
  renderChapters();
  return () => {
    stopRun();
    root.removeEventListener("click", onClick);
  };
}
