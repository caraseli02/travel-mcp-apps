import React from "react";
import { createRoot } from "react-dom/client";
import type { Meta, StoryObj } from "@storybook/html";
import {
  TripBoard,
  TripBudget,
  TripClarification,
  TripInbox,
  TripItinerary,
  TravelCart,
  TravelComparisonCarousel,
  TravelMap,
  TravelMediaAlbum,
  TravelOptionsList,
} from "../src/trip-components";
import {
  errorOutput,
  tripBoardAmsterdam,
  tripBudgetAmsterdam,
  tripClarificationVenice,
  tripInboxAmsterdam,
  tripItineraryAmsterdam,
  travelCartAmsterdam,
  travelOptionsAmsterdam,
} from "./fixtures/travelFixtures";

type TripComponentKind =
  | "board"
  | "inbox"
  | "budget"
  | "itinerary"
  | "clarification"
  | "options-list"
  | "comparison-carousel"
  | "map"
  | "album"
  | "cart";
type TripComponentState = "default" | "empty" | "error";

interface TripComponentsArgs {
  kind: TripComponentKind;
  state: TripComponentState;
}

const dataFor = ({ kind, state }: TripComponentsArgs) => {
  if (state === "error") return errorOutput;

  if (kind === "board") {
    return state === "empty" ? { trip: { title: "Empty trip" }, lanes: {} } : tripBoardAmsterdam;
  }
  if (kind === "inbox") {
    return state === "empty" ? { trip: { title: "Empty trip" }, items: [] } : tripInboxAmsterdam;
  }
  if (kind === "budget") {
    return state === "empty" ? { trip: { title: "Empty trip" }, rows: [] } : tripBudgetAmsterdam;
  }
  if (kind === "itinerary") {
    return state === "empty" ? { trip: { title: "Empty trip" }, days: [] } : tripItineraryAmsterdam;
  }
  if (kind === "clarification") {
    return state === "empty" ? { questions: [] } : tripClarificationVenice;
  }
  if (kind === "cart") {
    return state === "empty" ? { trip: { title: "Empty trip" }, items: [] } : travelCartAmsterdam;
  }
  return state === "empty" ? { trip: { title: "Empty trip" }, options: [], media: [] } : travelOptionsAmsterdam;
};

const renderTripComponent = (args: TripComponentsArgs): HTMLDivElement => {
  const container = document.createElement("div");
  const data = dataFor(args);

  const component =
    args.kind === "board" ? (
      <TripBoard board={data as any} />
    ) : args.kind === "inbox" ? (
      <TripInbox inbox={data as any} />
    ) : args.kind === "budget" ? (
      <TripBudget budget={data as any} />
    ) : args.kind === "itinerary" ? (
      <TripItinerary itinerary={data as any} />
    ) : args.kind === "clarification" ? (
      <TripClarification clarification={data as any} />
    ) : args.kind === "options-list" ? (
      <TravelOptionsList data={data as any} />
    ) : args.kind === "comparison-carousel" ? (
      <TravelComparisonCarousel data={data as any} />
    ) : args.kind === "map" ? (
      <TravelMap data={data as any} />
    ) : args.kind === "album" ? (
      <TravelMediaAlbum data={data as any} />
    ) : (
      <TravelCart data={data as any} />
    );

  createRoot(container).render(component);
  return container;
};

const meta: Meta<TripComponentsArgs> = {
  title: "Trip Components/Apps SDK UI",
  render: renderTripComponent,
  argTypes: {
    kind: {
      control: "select",
      options: [
        "board",
        "inbox",
        "budget",
        "itinerary",
        "clarification",
        "options-list",
        "comparison-carousel",
        "map",
        "album",
        "cart",
      ],
    },
    state: {
      control: "select",
      options: ["default", "empty", "error"],
    },
  },
  args: {
    state: "default",
  },
};

export default meta;
type Story = StoryObj<TripComponentsArgs>;

export const Board: Story = {
  args: { kind: "board" },
};

export const Inbox: Story = {
  args: { kind: "inbox" },
};

export const Budget: Story = {
  args: { kind: "budget" },
};

export const Itinerary: Story = {
  args: { kind: "itinerary" },
};

export const Clarification: Story = {
  args: { kind: "clarification" },
};

export const OptionsList: Story = {
  args: { kind: "options-list" },
};

export const ComparisonCarousel: Story = {
  args: { kind: "comparison-carousel" },
};

export const Map: Story = {
  args: { kind: "map" },
};

export const Album: Story = {
  args: { kind: "album" },
};

export const Cart: Story = {
  args: { kind: "cart" },
};
