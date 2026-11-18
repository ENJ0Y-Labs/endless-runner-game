import "./beta-feedback.css";

const MAX_SCREENSHOT_BYTES = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];

export function mountBackyardFeedback(root = document) {
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
