// Route production and beta to independent entry points.
// The production entry is copied from the approved baseline commit.
const isBackyard = window.location.pathname.replace(/\/+$/, "") === "/backyard";
if (isBackyard) {
  import("./beta-main.js");
} else {
  import("./production-main.js");
}
