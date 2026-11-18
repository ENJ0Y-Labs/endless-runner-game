import "./beta-feedback.css";

const MAX_SCREENSHOT_BYTES = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];

export function mountBackyardFeedback(root = document) {
  if (!root.querySelector("#backyard-feedback-dialog")) {
    root.body.insertAdjacentHTML("beforeend", `
      <button class="backyard-feedback-launch" id="backyard-feedback-open" type="button">Report a bug</button>
      <section class="backyard-feedback-dialog" id="backyard-feedback-dialog" role="dialog" aria-modal="true" aria-labelledby="backyard-feedback-heading" hidden>
        <div class="backyard-feedback-panel">
          <div class="backyard-feedback-head">
            <div><p class="eyebrow">BACKYARD BETA</p><h2 id="backyard-feedback-heading">Report a bug</h2><p>Tell us what went wrong. Your report goes straight to the development team.</p></div>
            <button class="backyard-feedback-close" type="button" data-feedback-close aria-label="Close feedback form">×</button>
          </div>
          <form class="backyard-feedback-form" id="backyard-feedback-form">
            <label>Title
              <input id="backyard-feedback-title" name="title" type="text" minlength="5" maxlength="120" placeholder="A short summary of the problem" required>
            </label>
            <label>Description
              <textarea name="description" minlength="15" maxlength="10000" placeholder="What happened? What did you expect to happen? Include steps to reproduce it if possible." required></textarea>
            </label>
            <label>Screenshot <span class="backyard-feedback-hint">Optional · PNG, JPG or WebP · up to 5 MB</span>
              <input id="backyard-feedback-screenshot" name="screenshot" type="file" accept="image/png,image/jpeg,image/webp">
            </label>
            <div class="backyard-feedback-preview" id="backyard-feedback-preview" hidden><span>Screenshot preview</span><img id="backyard-feedback-preview-image" alt="Screenshot attached to your report"></div>
            <label class="backyard-feedback-trap" aria-hidden="true">Leave this field empty<input name="website" tabindex="-1" autocomplete="off"></label>
            <p class="backyard-feedback-status" id="backyard-feedback-status" role="status" aria-live="polite"></p>
            <button class="backyard-feedback-submit" id="backyard-feedback-submit" type="submit">Submit feedback</button>
            <button class="backyard-feedback-close" type="button" data-feedback-close>Cancel</button>
          </form>
        </div>
      </section>`);
  }
  const trigger = root.querySelector("#backyard-feedback-open");
  const dialog = root.querySelector("#backyard-feedback-dialog");
  const form = root.querySelector("#backyard-feedback-form");
  const status = root.querySelector("#backyard-feedback-status");
  const submit = root.querySelector("#backyard-feedback-submit");
  const screenshot = root.querySelector("#backyard-feedback-screenshot");
  const preview = root.querySelector("#backyard-feedback-preview");
  const previewImage = root.querySelector("#backyard-feedback-preview-image");
  const closeButtons = root.querySelectorAll("[data-feedback-close]");

  if (!trigger || !dialog || !form || !status || !submit) return;

  let previewUrl = null;
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

  screenshot?.addEventListener("change", () => {
    const file = screenshot.files?.[0];
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    previewUrl = null;
    preview.hidden = true;
    if (!file) return;
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type) || file.size > MAX_SCREENSHOT_BYTES) {
      screenshot.value = "";
      setStatus("Choose a PNG, JPG or WebP screenshot under 5 MB.", "error");
      return;
    }
    previewUrl = URL.createObjectURL(file);
    previewImage.src = previewUrl;
    preview.hidden = false;
    setStatus("");
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const endpoint = window.RELIC_RUSH_FEEDBACK_API;
    if (!endpoint) {
      setStatus("Feedback submission is not connected yet. Please try again later.", "error");
      return;
    }

    const title = form.elements.namedItem("title").value.trim();
    const description = form.elements.namedItem("description").value.trim();
    const file = screenshot?.files?.[0];
    if (title.length < 5 || description.length < 15) {
      setStatus("Add a clear title and at least 15 characters describing the issue.", "error");
      return;
    }
    if (file && (!ACCEPTED_IMAGE_TYPES.includes(file.type) || file.size > MAX_SCREENSHOT_BYTES)) {
      setStatus("Choose a PNG, JPG or WebP screenshot under 5 MB.", "error");
      return;
    }

    const payload = new FormData();
    payload.set("title", title);
    payload.set("description", description);
    payload.set("page", location.href);
    payload.set("userAgent", navigator.userAgent);
    payload.set("gameVersion", document.documentElement.dataset.gameVersion || "backyard-beta");
    payload.set("website", form.elements.namedItem("website").value); // honeypot
    if (file) payload.set("screenshot", file, file.name);

    submit.disabled = true;
    submit.textContent = "Submitting…";
    setStatus("Sending your report…");
    try {
      const response = await fetch(endpoint, { method: "POST", body: payload });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Your report could not be submitted.");
      form.reset();
      preview.hidden = true;
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      previewUrl = null;
      setStatus(result.issueNumber ? `Thanks. Report #${result.issueNumber} has been created.` : "Thanks. Your report has been submitted.", "success");
    } catch (error) {
      setStatus(error.message || "Network error. Please try again.", "error");
    } finally {
      submit.disabled = false;
      submit.textContent = "Submit feedback";
    }
  });
}
