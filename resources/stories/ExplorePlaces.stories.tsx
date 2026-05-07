import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { IframeWidget } from "./IframeWidget";
import {
  explorePlacesValencia,
  explorePlacesMinimal,
  errorOutput,
} from "./fixtures/travelFixtures";

const meta: Meta<typeof IframeWidget> = {
  title: "Widgets/Explore Places (HTML)",
  component: IframeWidget,
  args: {
    url: "/explore_places_v1.html",
    height: "310px",
    toolInput: { city: "Valencia", query: "explore places" },
    displayMode: "inline",
  },
};

export default meta;
type Story = StoryObj<typeof IframeWidget>;

export const Default: Story = {
  args: { data: explorePlacesValencia },
};

export const NoImages: Story = {
  args: { data: explorePlacesMinimal },
};

export const Empty: Story = {
  args: { data: { section_title: "Explore", places: [] } },
};

export const Error: Story = {
  args: { data: errorOutput },
};
