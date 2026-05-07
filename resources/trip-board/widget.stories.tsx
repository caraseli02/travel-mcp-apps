import type { Meta, StoryObj } from "@storybook/react";
import { TripBoardLayout } from "./widget";
import type { TripBoardProps } from "@/domain/widgetTypes";

const mockTrip = {
  id: "trip-1",
  title: "Tokyo & Kyoto Adventure",
  destination: "Japan",
  start_date: "2025-10-10",
  end_date: "2025-10-24",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const mockItem = (overrides: Partial<TripBoardProps["lanes"]["booked"][number]> = {}) => ({
  id: `item-${Math.random().toString(36).slice(2)}`,
  trip_id: "trip-1",
  raw_content: "Placeholder content",
  normalized_raw_content: "placeholder content",
  item_type: "accommodation",
  status: "shortlisted",
  source_label: null,
  title: null,
  day_label: null,
  date_note: null,
  price_note: null,
  location_note: null,
  notes: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

const defaultProps: TripBoardProps = {
  trip: mockTrip,
  lanes: {
    open_decisions: [
      mockItem({ title: "Which ryokan to book in Kyoto?", item_type: "accommodation", status: "open_decision" }),
      mockItem({ title: "Bullet train or overnight bus?", item_type: "transport", status: "open_decision" }),
    ],
    shortlisted: [
      mockItem({ title: "Shibuya Sky observation deck", item_type: "activity", status: "shortlisted" }),
      mockItem({ title: "Arashiyama Bamboo Grove", item_type: "activity", status: "shortlisted" }),
    ],
    booked: [
      mockItem({ title: "ANA Flight TYO → NRT", item_type: "flight", status: "booked" }),
      mockItem({ title: "Shinjuku Washington Hotel", item_type: "accommodation", status: "booked" }),
    ],
    itinerary_draft: [
      mockItem({ title: "Day 1: Arrive & settle in", item_type: "note", status: "draft", day_label: "Day 1" }),
    ],
    missing_pieces: ["Airport transfer plan", "Travel insurance"],
  },
  counts: { total: 9, by_status: { booked: 2, shortlisted: 2 }, by_type: { flight: 1 } },
};

const meta: Meta<typeof TripBoardLayout> = {
  title: "Widgets/TripBoard",
  component: TripBoardLayout,
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof TripBoardLayout>;

export const Default: Story = {
  args: { props: defaultProps },
};

export const Empty: Story = {
  args: {
    props: {
      ...defaultProps,
      lanes: {
        open_decisions: [],
        shortlisted: [],
        booked: [],
        itinerary_draft: [],
        missing_pieces: [],
      },
      counts: { total: 0, by_status: {}, by_type: {} },
    },
  },
};
