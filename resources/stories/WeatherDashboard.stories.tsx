import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { IframeWidget } from "./IframeWidget";
import { currentWeatherMadrid, errorOutput } from "./fixtures/travelFixtures";

const meta: Meta<typeof IframeWidget> = {
  title: "Widgets/Weather Dashboard (HTML)",
  component: IframeWidget,
  args: {
    url: "/weather_dashboard_v4.html",
    height: "300px",
    toolInput: { city: "Madrid" },
  },
};

export default meta;
type Story = StoryObj<typeof IframeWidget>;

export const Default: Story = {
  args: { data: currentWeatherMadrid },
};

export const Empty: Story = {
  args: { data: {} },
};

export const Error: Story = {
  args: { data: errorOutput },
};
