import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { IframeWidget } from "./IframeWidget";
import {
  packingChecklistAmsterdam,
  longPackingChecklistAmsterdam,
  errorOutput,
} from "./fixtures/travelFixtures";

const meta: Meta<typeof IframeWidget> = {
  title: "Widgets/Packing Checklist (HTML)",
  component: IframeWidget,
  args: {
    url: "/packing_checklist_v3.html",
    height: "500px",
    toolInput: {
      destination: "Amsterdam",
      duration_days: 5,
      weather_forecast: "mild spring weather with rain risk",
    },
    displayMode: "inline",
  },
};

export default meta;
type Story = StoryObj<typeof IframeWidget>;

export const Default: Story = {
  args: { data: packingChecklistAmsterdam },
};

export const LongContent: Story = {
  args: { data: longPackingChecklistAmsterdam },
};

export const Error: Story = {
  args: { data: errorOutput },
};
