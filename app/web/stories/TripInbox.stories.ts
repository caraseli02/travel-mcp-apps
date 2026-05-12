import { errorOutput, tripInboxAmsterdam } from './fixtures/travelFixtures.js';
import { renderWidget } from './renderWidget.js';
import type { Meta, StoryObj } from '@storybook/html';

interface TripInboxArgs {
  data: any;
  toolInput: Record<string, any>;
}

const meta: Meta<TripInboxArgs> = {
  title: 'Widgets/Trip Inbox',
  render: (args) =>
    renderWidget({
      url: '/trip_inbox_v2.html',
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
type Story = StoryObj<TripInboxArgs>;

export const Default: Story = {
  args: { data: tripInboxAmsterdam },
};

export const Empty: Story = {
  args: { data: { trip: { title: 'Amsterdam spring trip' }, items: [] } },
};

export const Error: Story = {
  args: { data: errorOutput },
};
