// Select an isolated application entry point from the URL path.
// The root route is pinned to the production baseline; /backyard runs the beta entry.
const path = window.location.pathname.replace(/\\/+$/, "") || "/";
const isBackyard = path === "/backyard" || path.endsWith("/backyard");

if (isBackyard) {
  import("./main.js");
} else {
  import("./production/main.js");
}
