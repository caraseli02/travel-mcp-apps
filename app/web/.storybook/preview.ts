import type { Preview } from '@storybook/html-vite';
import "../src/index.css";

if (typeof window !== "undefined") {
  (window as any).openai = {
    callTool: async (name: string, args: any) => {
      console.log('[Storybook Mock] callTool', name, args);
      return new Promise((resolve) => setTimeout(() => resolve({ success: true }), 800));
    },
    sendFollowUpMessage: (msg: unknown) => {
      console.log('[Storybook Mock] sendFollowUpMessage', msg);
    },
    setWidgetState: (state: any) => {
      console.log('[Storybook Mock] setWidgetState', state);
    }
  };
}

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },
  },
};

export default preview;
