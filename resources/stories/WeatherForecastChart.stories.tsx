import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { IframeWidget } from "./IframeWidget";
import { forecastMadrid, errorOutput } from "./fixtures/travelFixtures";

const meta: Meta<typeof IframeWidget> = {
  title: "Widgets/Weather Forecast Chart (HTML)",
  component: IframeWidget,
  args: {
    url: "/weather_forecast_chart_v1.html",
    height: "350px",
    toolInput: { city: "Madrid", days: 5 },
  },
};

export default meta;
type Story = StoryObj<typeof IframeWidget>;

export const Default: Story = {
  args: { data: forecastMadrid },
};

export const Empty: Story = {
  args: { data: { city: "Madrid", forecasts: [] } },
};

export const Error: Story = {
  args: { data: errorOutput },
};
