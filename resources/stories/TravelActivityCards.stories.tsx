import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { IframeWidget } from "./IframeWidget";
import { activityCardsLondon, errorOutput } from "./fixtures/travelFixtures";

const meta: Meta<typeof IframeWidget> = {
  title: "Widgets/Travel Activity Cards (HTML)",
  component: IframeWidget,
  args: {
    url: "/travel_activity_cards_v3.html",
    height: "400px",
    toolInput: { city: "London", weather: "rain", season: "spring" },
  },
};

export default meta;
type Story = StoryObj<typeof IframeWidget>;

export const Default: Story = {
  args: { data: activityCardsLondon },
};

export const Empty: Story = {
  args: { data: { city: "London", weather: "rain", season: "spring", activities: [] } },
};

export const Error: Story = {
  args: { data: errorOutput },
};
