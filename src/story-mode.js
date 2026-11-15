const STORAGE_KEY = "relic-rush:japa-rush:progress:v1";
const CHAPTERS = [
  {
    id: "lagos-hustle",
    number: 1,
    title: "Lagos Hustle",
    subtitle: "One last stop before the open road.",
    description: "Leave the bus stop, navigate the city traffic, and reach the expressway exit.",
    objective: "Reach the expressway exit",
    hazards: "Danfo buses, okadas, potholes, and roadside barricades",
    image: "/assets/lagos-hustle.jpg",
  },
  {
    id: "emilokan-expressway",
    number: 2,
    title: "The Emilokan Expressway",
    subtitle: "The road gets longer. The problems get bigger.",
    description: "Survive the highway and secure the travel folder.",
    objective: "Find the travel folder and reach the checkpoint",
    hazards: "Fuel tankers, broken-down trucks, and road barriers",
    image: "/assets/expressway.jpg",
  },
  {
    id: "the-system",
    number: 3,
    title: "The System",
    subtitle: "Your documents are under review. Again.",
    description: "Navigate the fictional administrative district and collect the required clearances.",
    objective: "Collect three clearance stamps and reach the exit",
    hazards: "Queue barriers, document carts, and security barricades",
    image: "/assets/the-system.jpg",
  },
  {
    id: "japa-terminal",
    number: 4,
    title: "The Japa Terminal",
    subtitle: "Freedom is visible. Keep moving.",
    description: "Secure your boarding pass and reach the departure gate.",
    objective: "Collect the boarding pass and reach the gate",
    hazards: "Luggage trolleys, queue ropes, and terminal barriers",
    image: "/assets/japa-terminal.jpg",
  },
];

function readProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (!saved || saved.version !== 1) {
      return { version: 1, highestUnlocked: 1, completed: [] };
    }
    const completed = Array.isArray(saved.completed)
      ? saved.completed.filter((id) => CHAPTERS.some((chapter) => chapter.id === id))
      : [];
    const highestUnlocked = Math.min(
      CHAPTERS.length,
      Math.max(1, Number.isInteger(saved.highestUnlocked) ? saved.highestUnlocked : 1),
    );
    return { version: 1, highestUnlocked, completed };
  } catch {
    return { version: 1, highestUnlocked: 1, completed: [] };
  }
}

function chapterStatus(chapter, progress) {
  if (progress.completed.includes(chapter.id)) return "Completed";
  if (chapter.number <= progress.highestUnlocked) return "Available";
  return "Locked";
}

export function mountJapaRush(root) {
  if (!root) return () => {};
  const progress = readProgress();

  const renderChapters = () => {
    root.innerHTML = `
      <div class="japa-shell">
        <section class="japa-visual-hero" aria-label="Japa Rush story mode">
          <div class="japa-hero-backdrop" role="img" aria-label="Japa Rush mode selection artwork"></div>
          <div class="japa-hero-copy">
            <p class="japa-eyebrow">Relic Rush 3D presents</p>
            <h1>JAPA <span>RUSH</span></h1>
            <p class="japa-lede">One bag. One destination. A whole country standing in the way.</p>
            <p class="japa-premise">You only wanted a better life. Now the Big Man has made your departure a national emergency. Run.</p>
          </div>
          <img class="japa-big-man" src="/assets/the-big-man.jpg" alt="The Big Man, the fictional antagonist of Japa Rush" />
          <p class="japa-antagonist-label">THE BIG MAN <span>“You think you can Japa?”</span></p>
        </section>
        <div class="japa-chapter-heading">
          <div><p class="japa-eyebrow">Your journey</p><h2>Choose a chapter</h2></div>
          <a class="japa-back-link" href="./">Back to Relic Rush</a>
        </div>
        <div class="japa-chapter-grid">
          ${CHAPTERS.map((chapter) => {
            const status = chapterStatus(chapter, progress);
            const locked = status === "Locked";
            return `
              <article class="japa-chapter-card ${locked ? "is-locked" : ""} ${status === "Completed" ? "is-complete" : ""}">
                <div class="japa-chapter-image" style="background-image:linear-gradient(0deg, rgb(0 0 0 / 45%), transparent 65%),url('${chapter.image}')" role="img" aria-label="${chapter.title} environment"></div>
                <div class="japa-card-copy">
                  <p class="japa-card-status">${status}</p>
                  <h3>${chapter.number}. ${chapter.title}</h3>
                  <p>${chapter.subtitle}</p>
                  <button class="japa-select-button" type="button" data-chapter="${chapter.id}" ${locked ? "disabled" : ""}>
                    ${locked ? "Complete previous chapter" : status === "Completed" ? "Replay chapter" : "View chapter"}
                  </button>
                </div>
              </article>`;
          }).join("")}
        </div>
        <p class="japa-credit">Story concept by <strong>ambh4ck3r</strong></p>
      </div>`;
  };

  const renderIntro = (chapter) => {
    root.innerHTML = `
      <div class="japa-shell japa-intro-shell">
        <button class="japa-back-link japa-inline-back" type="button" data-action="chapters">← All chapters</button>
        <div class="japa-intro-art" style="background-image:linear-gradient(90deg, rgb(15 12 10 / 92%), rgb(15 12 10 / 15%)),url('${chapter.image}')">
          <div>
            <p class="japa-eyebrow">Chapter 0${chapter.number}</p>
            <h1>${chapter.title}</h1>
            <p class="japa-lede">${chapter.subtitle}</p>
          </div>
        </div>
        <div class="japa-objective-panel">
          <p class="japa-eyebrow">Your objective</p>
          <h2>${chapter.objective}</h2>
          <p><strong>Watch out for:</strong> ${chapter.hazards}.</p>
        </div>
        <p class="japa-launch-note">The chapter artwork is now connected. The playable 3D chapter, hazards, and objective logic are the next development milestone.</p>
        <button class="japa-primary-button" type="button" data-action="chapters">Return to chapter selection</button>
      </div>`;
  };

  const onClick = (event) => {
    const chapterButton = event.target.closest("[data-chapter]");
    if (chapterButton && root.contains(chapterButton)) {
      const chapter = CHAPTERS.find((item) => item.id === chapterButton.dataset.chapter);
      if (chapter && chapter.number <= progress.highestUnlocked) renderIntro(chapter);
      return;
    }
    const action = event.target.closest("[data-action]")?.dataset.action;
    if (action === "chapters") renderChapters();
  };

  const onChapterCompleted = (event) => {
    const chapterId = event.detail?.chapterId;
    const chapter = CHAPTERS.find((item) => item.id === chapterId);
    if (!chapter || chapter.number > progress.highestUnlocked) return;
    if (!progress.completed.includes(chapterId)) progress.completed.push(chapterId);
    progress.highestUnlocked = Math.min(
      CHAPTERS.length,
      Math.max(progress.highestUnlocked, chapter.number + 1),
    );
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // Keep the current session usable when browser storage is blocked or full.
    }
    renderChapters();
  };

  root.addEventListener("click", onClick);
  window.addEventListener("japarush:chapter-completed", onChapterCompleted);
  renderChapters();
  return () => {
    root.removeEventListener("click", onClick);
    window.removeEventListener("japarush:chapter-completed", onChapterCompleted);
  };
}
