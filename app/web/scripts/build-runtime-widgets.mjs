import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { build } from "vite";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distDir = path.join(root, "dist");
const runtimeTemplatesDir = path.join(root, "runtime_templates");
const intermediateDir = path.join(root, ".runtime-build");

const widgets = [
  "trip_board_v3.html",
  "trip_budget_v3.html",
  "trip_clarification_v1.html",
  "trip_inbox_v2.html",
  "trip_itinerary_v3.html",
];

const escapeScript = (source) => source.replaceAll("</script", "<\\/script");
const escapeStyle = (source) => source.replaceAll("</style", "<\\/style");
const stripSourceMapComment = (source) =>
  source.replace(/\n?\/\/# sourceMappingURL=.*$/gm, "");
const stripFontFaces = (source) => source.replace(/@font-face\s*\{[^{}]*\}/g, "");

const readBuiltAsset = async (widgetBuildDir, assetPath) => {
  const relativePath = assetPath.replace(/^\//, "");
  return readFile(path.join(widgetBuildDir, relativePath), "utf8");
};

const replaceAsync = async (source, pattern, replacement) => {
  const matches = [...source.matchAll(pattern)];
  const replacements = await Promise.all(
    matches.map((match) => replacement(...match)),
  );
  let index = 0;
  return source.replace(pattern, () => replacements[index++]);
};

const inlineTemplate = async (widgetBuildDir, filename) => {
  let html = await readFile(path.join(widgetBuildDir, "templates", filename), "utf8");

  html = html.replace(
    /\s*<link rel="modulepreload" crossorigin href="([^"]+)">/g,
    "",
  );

  html = await replaceAsync(
    html,
    /\s*<link rel="stylesheet" crossorigin href="([^"]+)">/g,
    async (_match, href) => {
      const css = stripFontFaces(await readBuiltAsset(widgetBuildDir, href));
      return `\n    <style>${escapeStyle(css)}</style>`;
    },
  );

  html = await replaceAsync(
    html,
    /\s*<script type="module" crossorigin src="([^"]+)"><\/script>/g,
    async (_match, src) => {
      const js = stripSourceMapComment(await readBuiltAsset(widgetBuildDir, src));
      return `\n    <script type="module">${escapeScript(js)}</script>`;
    },
  );

  return html;
};

await rm(distDir, { recursive: true, force: true });
await rm(runtimeTemplatesDir, { recursive: true, force: true });
await rm(intermediateDir, { recursive: true, force: true });
await mkdir(path.join(distDir, "templates"), { recursive: true });
await mkdir(runtimeTemplatesDir, { recursive: true });

for (const widget of widgets) {
  const name = path.basename(widget, ".html");
  const widgetBuildDir = path.join(intermediateDir, name);

  await build({
    root,
    configFile: false,
    plugins: [tailwindcss(), react()],
    build: {
      outDir: widgetBuildDir,
      emptyOutDir: true,
      cssCodeSplit: false,
      rollupOptions: {
        input: path.join(root, "templates", widget),
        output: {
          inlineDynamicImports: true,
          entryFileNames: "assets/[name].js",
          assetFileNames: "assets/[name].[ext]",
        },
      },
    },
    logLevel: "warn",
  });

  const html = await inlineTemplate(widgetBuildDir, widget);
  await writeFile(path.join(distDir, "templates", widget), html, "utf8");
  await writeFile(path.join(runtimeTemplatesDir, widget), html, "utf8");
}

await rm(intermediateDir, { recursive: true, force: true });
