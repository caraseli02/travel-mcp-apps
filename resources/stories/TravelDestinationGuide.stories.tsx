import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { IframeWidget } from "./IframeWidget";
import { destinationGuideMadrid, errorOutput } from "./fixtures/travelFixtures";

const meta: Meta<typeof IframeWidget> = {
  title: "Widgets/Travel Destination Guide (HTML)",
  component: IframeWidget,
  args: {
    url: "/travel_destination_guide_v1.html",
    height: "450px",
    toolInput: { city: "Madrid" },
  },
};

export default meta;
type Story = StoryObj<typeof IframeWidget>;

export const Default: Story = {
  args: { data: destinationGuideMadrid },
};

export const Empty: Story = {
  args: { data: { city: "Madrid", country: "Spain", tips: [], activities: [] } },
};

export const Error: Story = {
  args: { data: errorOutput },
};
