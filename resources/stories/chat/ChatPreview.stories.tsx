import React, { useEffect, useRef } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { createChatPreview, type ChatPreviewOptions } from "./ChatPreview";

const ChatPreviewWrapper: React.FC<ChatPreviewOptions> = (props) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.innerHTML = "";
    el.appendChild(createChatPreview(props));
  }, [JSON.stringify(props)]);

  return <div ref={ref} />;
};

const meta: Meta<typeof ChatPreviewWrapper> = {
  title: "Chat Preview/Conversation",
  component: ChatPreviewWrapper,
  parameters: {
    layout: "fullscreen",
  },
  argTypes: {
    scenarioId: {
      control: { type: "select" },
      options: ["trip-planning"],
    },
    displayMode: {
      control: { type: "select" },
      options: ["inline", "pip", "fullscreen"],
    },
    theme: { control: "object" },
    widgetState: { control: "object" },
  },
  args: {
    scenarioId: "trip-planning",
    displayMode: "inline",
    theme: { colorScheme: "light", spacing: "comfortable" },
    widgetState: {},
  },
};

export default meta;
type Story = StoryObj<typeof ChatPreviewWrapper>;

export const TripPlanningWorkspace: Story = {
  args: {
    scenarioId: "trip-planning",
  },
};
