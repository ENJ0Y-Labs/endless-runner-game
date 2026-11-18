# Backyard feedback worker

The game is a static Vite site on Start.ng. This Cloudflare Worker is the small server-side bridge that holds the GitHub credential and creates issues. **Do not put a GitHub token in Vite config, `admin-config.js`, HTML, or browser JavaScript.**

## 1. Create the GitHub credential

Create a fine-grained personal access token (or GitHub App installation token) limited to:

- Repository: `ENJ0Y-Labs/endless-runner-game`
- Repository permissions: **Issues: Read and write**

Store it as a Worker secret, never as a repository file:

```sh
cd services/backyard-feedback-worker
npx wrangler secret put GITHUB_TOKEN
```

## 2. Create screenshot storage

The form accepts optional PNG/JPG/WebP screenshots up to 5 MB. The Worker stores these in Cloudflare R2 and places the public image URL in the issue body.

Create the bucket:

```sh
npx wrangler r2 bucket create relic-rush-backyard-feedback
```

Enable a public R2 custom domain for that bucket and use that exact HTTPS origin as `R2_PUBLIC_BASE_URL` in `wrangler.toml`. Do not use the R2 S3 API endpoint as the public image URL.

## 3. Configure and deploy

Edit `wrangler.toml`:

- Replace `ALLOWED_ORIGIN` with the exact origin serving the Start.ng game, including scheme and any custom hostname, with no trailing slash. Do not use a wildcard.
- Replace `R2_PUBLIC_BASE_URL` with the public R2 custom-domain base URL, with no trailing slash.

Deploy:

```sh
npx wrangler deploy
```

Copy the deployed Worker URL. In the Start.ng static site's `admin-config.js` (or a separate public runtime config loaded before the beta bundle), set:

```js
window.RELIC_RUSH_FEEDBACK_API = "https://YOUR-WORKER.YOUR-SUBDOMAIN.workers.dev";
```

This URL is public and is not a secret. The GitHub token remains only in the Worker secret.

## 4. Behaviour and safeguards

- The form is loaded only on `/backyard`; the production route does not import it.
- The Worker accepts requests only from the configured exact Origin.
- Title/description lengths, image MIME type, and file size are validated server-side.
- A hidden honeypot catches basic form spam.
- The Worker writes issues only to the fixed repository above.
- If screenshot storage is not configured, reports without screenshots can still be filed; a report with a screenshot receives a clear configuration error.

For production use, add Cloudflare rate limiting/WAF rules to the Worker route. Origin checks and a honeypot are not a substitute for rate limiting; browsers can forge Origin headers outside the normal browser context.
