import type { StorybookConfig } from '@storybook/html-vite';
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";

const storybookDir = dirname(fileURLToPath(import.meta.url));

const config: StorybookConfig = {
  stories: [
    "../stories/TripComponents.stories.tsx",
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
      envDir: resolve(storybookDir, "../../.."),
      plugins: [tailwindcss(), ...(viteConfig.plugins ?? [])],
    };
  },
};

export default config;
