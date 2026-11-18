const REPOSITORY = "ENJ0Y-Labs/endless-runner-game";
const MAX_BODY_BYTES = 6 * 1024 * 1024;
const MAX_SCREENSHOT_BYTES = 5 * 1024 * 1024;
const IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);

function json(data, status, origin) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "access-control-allow-origin": origin,
      "access-control-allow-methods": "POST, OPTIONS",
      "access-control-allow-headers": "Content-Type",
      "vary": "Origin",
      "cache-control": "no-store",
    },
  });
}

export default {
  async fetch(request, env) {
    const allowedOrigin = env.ALLOWED_ORIGIN;
    const origin = request.headers.get("Origin");
    if (!allowedOrigin || origin !== allowedOrigin) {
      return new Response("Forbidden", { status: 403 });
    }
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "access-control-allow-origin": allowedOrigin,
          "access-control-allow-methods": "POST, OPTIONS",
          "access-control-allow-headers": "Content-Type",
          "access-control-max-age": "86400",
          vary: "Origin",
        },
      });
    }
    if (request.method !== "POST") return json({ error: "Method not allowed." }, 405, allowedOrigin);
    if (Number(request.headers.get("Content-Length") || 0) > MAX_BODY_BYTES) {
      return json({ error: "The report is too large." }, 413, allowedOrigin);
    }
    if (!env.GITHUB_TOKEN) return json({ error: "Feedback service is not configured." }, 503, allowedOrigin);

    try {
      const form = await request.formData();
      // Quietly accept and discard bot submissions that fill the hidden field.
      if (String(form.get("website") || "").trim()) {
        return json({ ok: true }, 202, allowedOrigin);
      }

      const title = String(form.get("title") || "").trim();
      const description = String(form.get("description") || "").trim();
      const page = String(form.get("page") || "").slice(0, 500);
      const userAgent = String(form.get("userAgent") || "").slice(0, 500);
      const gameVersion = String(form.get("gameVersion") || "backyard-beta").slice(0, 80);
      if (title.length < 5 || title.length > 120 || description.length < 15 || description.length > 10000) {
        return json({ error: "Check the title (5–120 characters) and description (15–10,000 characters)." }, 400, allowedOrigin);
      }

      let screenshotMarkdown = "No screenshot attached.";
      const screenshot = form.get("screenshot");
      if (screenshot && typeof screenshot !== "string" && screenshot.size > 0) {
        if (screenshot.size > MAX_SCREENSHOT_BYTES || !IMAGE_TYPES.has(screenshot.type)) {
          return json({ error: "Screenshot must be PNG, JPG or WebP and no larger than 5 MB." }, 400, allowedOrigin);
        }
        if (!env.FEEDBACK_BUCKET || !env.R2_PUBLIC_BASE_URL) {
          return json({ error: "Screenshot storage is not configured yet. Remove the screenshot or contact the game team." }, 503, allowedOrigin);
        }
        const extension = screenshot.type === "image/png" ? "png" : screenshot.type === "image/webp" ? "webp" : "jpg";
        const key = `backyard-feedback/${crypto.randomUUID()}.${extension}`;
        await env.FEEDBACK_BUCKET.put(key, screenshot.stream(), {
          httpMetadata: { contentType: screenshot.type, cacheControl: "public, max-age=31536000, immutable" },
        });
        const base = env.R2_PUBLIC_BASE_URL.replace(/\/$/, "");
        screenshotMarkdown = `![Beta tester screenshot](${base}/${key})`;
      }

      const body = [
        "## Beta tester report",
        description,
        "",
        "## Screenshot",
        screenshotMarkdown,
        "",
        "## Environment",
        `- Page: ${page || "Not supplied"}`,
        `- Build: ${gameVersion}`,
        `- Browser: ${userAgent || "Not supplied"}`,
        "",
        "_Submitted from the in-game Backyard feedback form._",
      ].join("\n");

      const response = await fetch(`https://api.github.com/repos/${REPOSITORY}/issues`, {
        method: "POST",
        headers: {
          authorization: `Bearer ${env.GITHUB_TOKEN}`,
          accept: "application/vnd.github+json",
          "content-type": "application/json",
          "x-github-api-version": "2022-11-28",
          "user-agent": "Relic-Rush-Backyard-Feedback",
        },
        body: JSON.stringify({ title: `[Backyard Beta] ${title}`, body }),
      });
      const issue = await response.json().catch(() => ({}));
      if (!response.ok) {
        return json({ error: response.status === 401 || response.status === 403
          ? "The feedback service cannot create GitHub issues. Check its repository permission."
          : "GitHub could not create the report. Please try again later." }, 502, allowedOrigin);
      }
      return json({ ok: true, issueNumber: issue.number }, 201, allowedOrigin);
    } catch {
      return json({ error: "The report could not be processed. Please try again." }, 500, allowedOrigin);
    }
  },
};
