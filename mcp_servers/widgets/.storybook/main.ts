import { readFile, readFileSync } from "node:fs";
import { promisify } from "node:util";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { StorybookConfig } from '@storybook/html-vite';
import type { Plugin } from 'vite';

const readFileAsync = promisify(readFile);
const widgetRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const widgetHtmlFiles = [
  "packing_checklist_v3.html",
  "travel_activity_cards_v3.html",
  "travel_destination_guide_v1.html",
  "trip_board_v3.html",
  "trip_budget_v3.html",
  "trip_inbox_v1.html",
  "trip_itinerary_v3.html",
  "weather_dashboard_v4.html",
  "weather_forecast_chart_v1.html",
  "explore_places_v1.html",
];
const widgetHtmlFileSet = new Set(widgetHtmlFiles);

const widgetHtmlPlugin: Plugin = {
  name: "travel-widget-html-files",
  configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      const pathname = new URL(req.url ?? "/", "http://storybook.local").pathname;
      const filename = decodeURIComponent(pathname).replace(/^\/+/, "");

      if (!widgetHtmlFileSet.has(filename)) {
        next();
        return;
      }

      try {
        const html = await readFileAsync(resolve(widgetRoot, filename), "utf8");
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.end(html);
      } catch (error) {
        next(error);
      }
    });
  },
  generateBundle() {
    for (const filename of widgetHtmlFiles) {
      this.emitFile({
        type: "asset",
        fileName: filename,
        source: readFileSync(resolve(widgetRoot, filename), "utf8"),
      });
    }
  },
};

const config: StorybookConfig = {
  stories: [
    "../stories/PackingChecklist.stories.ts",
    "../stories/TravelActivityCards.stories.ts",
    "../stories/TravelDestinationGuide.stories.ts",
    "../stories/TripBoard.stories.ts",
    "../stories/TripBudget.stories.ts",
    "../stories/TripInbox.stories.ts",
    "../stories/TripItinerary.stories.ts",
    "../stories/WeatherDashboard.stories.ts",
    "../stories/WeatherForecastChart.stories.ts",
    "../stories/ExplorePlaces.stories.ts",
    "../stories/chat/ChatPreview.stories.ts"
  ],
  addons: [
    "@chromatic-com/storybook",
    "@storybook/addon-docs",
    "@storybook/addon-a11y"
  ],
  framework: "@storybook/html-vite",
  async viteFinal(viteConfig) {
    return {
      ...viteConfig,
      plugins: [...(viteConfig.plugins ?? []), widgetHtmlPlugin],
    };
  },
};

export default config;
