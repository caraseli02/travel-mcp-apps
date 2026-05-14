import type { StorybookConfig } from '@storybook/html-vite';
import tailwindcss from "@tailwindcss/vite";

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
      plugins: [tailwindcss(), ...(viteConfig.plugins ?? [])],
    };
  },
};

export default config;
