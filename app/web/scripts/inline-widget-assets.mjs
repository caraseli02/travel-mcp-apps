import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distDir = path.join(root, "dist");
const templatesDir = path.join(distDir, "templates");
let nextModuleId = 0;

const escapeScript = (source) => source.replaceAll("</script", "<\\/script");
const escapeStyle = (source) => source.replaceAll("</style", "<\\/style");

const readDistAsset = async (assetPath) => {
  const relativePath = assetPath.replace(/^\//, "");
  return readFile(path.join(distDir, relativePath), "utf8");
};

const parseSpecifiers = (source) =>
  source.split(",").map((specifier) => {
    const [exported, local] = specifier.trim().split(/\s+as\s+/);
    return { exported, local: local ?? exported };
  });

const stripSourceMapComment = (source) =>
  source.replace(/\n?\/\/# sourceMappingURL=.*$/gm, "");

const parseAndRemoveExports = (source) => {
  const exports = new Map();
  const code = source.replace(/export\{([^}]+)\};?\s*$/m, (_match, specifiers) => {
    for (const { exported, local } of parseSpecifiers(specifiers)) {
      exports.set(local, exported);
    }
    return "";
  });
  return { code, exports };
};

const inlineImports = async (source, moduleDir) => {
  const importPattern = /import\{([^}]+)\}from"([^"]+)";/g;
  const matches = [...source.matchAll(importPattern)];
  const replacements = await Promise.all(
    matches.map(async (match) => {
      const [, specifiers, importPath] = match;
      const modulePath = path.resolve(moduleDir, importPath);
      const moduleId = `__travel_widget_module_${nextModuleId++}`;
      const module = await buildInlineModule(modulePath);
      const aliases = parseSpecifiers(specifiers)
        .map(({ exported, local }) => `const ${local}=${moduleId}[${JSON.stringify(exported)}];`)
        .join("");

      return `const ${moduleId}=(()=>{\n${module.code}\nreturn {${[...module.exports]
        .map(([local, exported]) => `${JSON.stringify(exported)}:${local}`)
        .join(",")}};\n})();${aliases}`;
    }),
  );

  let index = 0;
  return source.replace(importPattern, () => replacements[index++]);
};

const buildInlineModule = async (modulePath) => {
  const raw = await readFile(modulePath, "utf8");
  const withoutSourceMap = stripSourceMapComment(raw);
  const withInlineImports = await inlineImports(withoutSourceMap, path.dirname(modulePath));
  return parseAndRemoveExports(withInlineImports);
};

const inlineTemplate = async (filename) => {
  const templatePath = path.join(templatesDir, filename);
  let html = await readFile(templatePath, "utf8");

  html = html.replace(
    /\s*<link rel="modulepreload" crossorigin href="([^"]+)">/g,
    "",
  );

  html = await replaceAsync(
    html,
    /\s*<link rel="stylesheet" crossorigin href="([^"]+)">/g,
    async (_match, href) => {
      const css = await readDistAsset(href);
      return `\n    <style>${escapeStyle(css)}</style>`;
    },
  );

  html = await replaceAsync(
    html,
    /\s*<script type="module" crossorigin src="([^"]+)"><\/script>/g,
    async (_match, src) => {
      const js = await readDistAsset(src);
      const bundled = await inlineImports(stripSourceMapComment(js), path.dirname(path.join(distDir, src)));
      return `\n    <script type="module">${escapeScript(bundled)}</script>`;
    },
  );

  await writeFile(templatePath, html, "utf8");
};

const replaceAsync = async (source, pattern, replacement) => {
  const matches = [...source.matchAll(pattern)];
  const replacements = await Promise.all(
    matches.map((match) => replacement(...match)),
  );
  let index = 0;
  return source.replace(pattern, () => replacements[index++]);
};

const filenames = (await readdir(templatesDir)).filter((file) =>
  file.endsWith(".html"),
);

await Promise.all(filenames.map(inlineTemplate));
