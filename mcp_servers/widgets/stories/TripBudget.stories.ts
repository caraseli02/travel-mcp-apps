import { errorOutput, tripBudgetAmsterdam } from './fixtures/travelFixtures.js';
import { renderWidget } from './renderWidget.js';
import type { Meta, StoryObj } from '@storybook/html';

interface TripBudgetArgs {
  data: any;
  toolInput: Record<string, any>;
}

const meta: Meta<TripBudgetArgs> = {
  title: 'Widgets/Trip Budget',
  render: (args) =>
    renderWidget({
      url: '/trip_budget_v3.html',
      toolOutput: args.data,
      toolInput: args.toolInput,
    }),
  argTypes: {
    data: { control: 'object' },
    toolInput: { control: 'object' },
  },
  args: {
    toolInput: { trip_id: 'trip-amsterdam-2026' },
  },
};

export default meta;
type Story = StoryObj<TripBudgetArgs>;

export const Default: Story = {
  args: { data: tripBudgetAmsterdam },
};

export const Empty: Story = {
  args: { data: {} },
};

export const Error: Story = {
  args: { data: errorOutput },
};
