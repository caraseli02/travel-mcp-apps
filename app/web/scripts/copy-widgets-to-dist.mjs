import { copyFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const webRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const distDir = resolve(webRoot, "dist");
const widgetHtmlFiles = [
  "trip_inbox_v2.html",
  "trip_board_v3.html",
  "trip_itinerary_v3.html",
  "trip_budget_v3.html",
  "trip_clarification_v1.html",
];

mkdirSync(distDir, { recursive: true });

for (const filename of widgetHtmlFiles) {
  copyFileSync(resolve(webRoot, filename), resolve(distDir, filename));
}
