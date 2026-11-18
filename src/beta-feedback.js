import "./beta-feedback.css";

// No server involved: submitting opens a pre-filled "new issue" page on GitHub.
// Testers need a GitHub account; they can paste screenshots there.
const ISSUES_URL = "https://github.com/ENJ0Y-Labs/endless-runner-game/issues/new";

export function mountBackyardFeedback(root = document) {
  if (!root.querySelector("#backyard-feedback-dialog")) {
    root.body.insertAdjacentHTML("beforeend", `
      <button class="backyard-feedback-launch" id="backyard-feedback-open" type="button">Report a bug</button>
      <section class="backyard-feedback-dialog" id="backyard-feedback-dialog" role="dialog" aria-modal="true" aria-labelledby="backyard-feedback-heading" hidden>
        <div class="backyard-feedback-panel">
          <div class="backyard-feedback-head">
            <div><p class="eyebrow">BACKYARD BETA</p><h2 id="backyard-feedback-heading">Report a bug</h2><p>Tell us what went wrong. Submitting opens a pre-filled report on GitHub (a free GitHub account is needed). You can paste a screenshot there.</p></div>
            <button class="backyard-feedback-close" type="button" data-feedback-close aria-label="Close feedback form">×</button>
          </div>
          <form class="backyard-feedback-form" id="backyard-feedback-form">
            <label>Title
              <input id="backyard-feedback-title" name="title" type="text" minlength="5" maxlength="120" placeholder="A short summary of the problem" required>
            </label>
            <label>Description
              <textarea name="description" minlength="15" maxlength="4000" placeholder="What happened? What did you expect to happen? Include steps to reproduce it if possible." required></textarea>
            </label>
            <p class="backyard-feedback-status" id="backyard-feedback-status" role="status" aria-live="polite"></p>
            <button class="backyard-feedback-submit" id="backyard-feedback-submit" type="submit">Continue to GitHub</button>
            <button class="backyard-feedback-close" type="button" data-feedback-close>Cancel</button>
          </form>
        </div>
      </section>`);
  }
  const trigger = root.querySelector("#backyard-feedback-open");
  const dialog = root.querySelector("#backyard-feedback-dialog");
  const form = root.querySelector("#backyard-feedback-form");
  const status = root.querySelector("#backyard-feedback-status");
  const closeButtons = root.querySelectorAll("[data-feedback-close]");

  if (!trigger || !dialog || !form || !status) return;

  const setStatus = (message, kind = "") => {
    status.textContent = message;
    status.dataset.kind = kind;
  };
  const close = () => {
    dialog.hidden = true;
    trigger.focus();
  };
  const open = () => {
    dialog.hidden = false;
    setStatus("");
    dialog.querySelector("#backyard-feedback-title")?.focus();
  };

  trigger.addEventListener("click", open);
  closeButtons.forEach((button) => button.addEventListener("click", close));
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) close();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !dialog.hidden) close();
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const title = form.elements.namedItem("title").value.trim();
    const description = form.elements.namedItem("description").value.trim();
    if (title.length < 5 || description.length < 15) {
      setStatus("Add a clear title and at least 15 characters describing the issue.", "error");
      return;
    }

    const body = [
      "## Beta tester report",
      description,
      "",
      "## Environment",
      `- Page: ${location.href}`,
      `- Build: ${document.documentElement.dataset.gameVersion || "backyard-beta"}`,
      `- Browser: ${navigator.userAgent}`,
      "",
      "_Submitted from the in-game Backyard feedback form._",
    ].join("\n");

    const url = `${ISSUES_URL}?${new URLSearchParams({ title: `[Backyard Beta] ${title}`, body })}`;
    // Opened synchronously from the submit event so popup blockers allow it.
    const win = window.open(url, "_blank", "noopener,noreferrer");
    if (!win) {
      setStatus("Your browser blocked the new tab. Allow pop-ups for this site and try again.", "error");
      return;
    }
    form.reset();
    setStatus("GitHub opened in a new tab. Review the report there and press “Submit new issue”.", "success");
  });
}
