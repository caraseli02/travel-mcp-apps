import type { Meta, StoryObj } from "@storybook/react";
import { TripBudgetLayout } from "./widget";
import type { TripBudgetProps } from "@/domain/widgetTypes";

const mockTrip = {
  id: "trip-1",
  title: "Tokyo & Kyoto Adventure",
  destination: "Japan",
  start_date: "2025-10-10",
  end_date: "2025-10-24",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const defaultProps: TripBudgetProps = {
  trip: mockTrip,
  target: 4000,
  spent: 2450,
  remaining: 1550,
  percent_used: 61,
  currency: "USD",
  rows: [
    { id: "1", title: "Flights (return)", item_type: "flight", status: "booked", amount: 980, currency: "USD", note: "ANA direct" },
    { id: "2", title: "Shinjuku Washington Hotel (7n)", item_type: "accommodation", status: "booked", amount: 840, currency: "USD", note: "" },
    { id: "3", title: "JR Pass (21 days)", item_type: "transport", status: "booked", amount: 360, currency: "USD", note: "" },
    { id: "4", title: "teamLab Borderless", item_type: "activity", status: "shortlisted", amount: 32, currency: "USD", note: "" },
    { id: "5", title: "Kyoto ryokan (2n)", item_type: "accommodation", status: "shortlisted", amount: 238, currency: "USD", note: "Estimated" },
  ],
  category_totals: [
    { category: "flight", amount: 980 },
    { category: "accommodation", amount: 1078 },
    { category: "transport", amount: 360 },
    { category: "activity", amount: 32 },
  ],
  counts: { priced_items: 5, tracked_categories: 4, party_size: 2, nights: 14 },
};

const meta: Meta<typeof TripBudgetLayout> = {
  title: "Widgets/TripBudget",
  component: TripBudgetLayout,
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof TripBudgetLayout>;

export const Default: Story = {
  args: { props: defaultProps },
};

export const OverBudget: Story = {
  args: {
    props: {
      ...defaultProps,
      spent: 4500,
      remaining: -500,
      percent_used: 112,
    },
  },
};

export const NoBudgetTarget: Story = {
  args: {
    props: {
      ...defaultProps,
      target: null,
      remaining: null,
    },
  },
};

export const NoItems: Story = {
  args: {
    props: {
      ...defaultProps,
      target: null,
      spent: 0,
      remaining: null,
      percent_used: 0,
      rows: [],
      category_totals: [],
      counts: { priced_items: 0, tracked_categories: 0, party_size: 2, nights: 14 },
    },
  },
};
