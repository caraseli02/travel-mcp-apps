import { errorOutput, tripItineraryAmsterdam } from './fixtures/travelFixtures.js';
import { renderWidget } from './renderWidget.js';
import type { Meta, StoryObj } from '@storybook/html';

interface TripItineraryArgs {
  data: any;
  toolInput: Record<string, any>;
}

const meta: Meta<TripItineraryArgs> = {
  title: 'Widgets/Trip Itinerary',
  render: (args) =>
    renderWidget({
      url: '/trip_itinerary_v3.html',
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
type Story = StoryObj<TripItineraryArgs>;

export const Default: Story = {
  args: { data: tripItineraryAmsterdam },
};

export const Empty: Story = {
  args: { data: { trip: { title: 'Amsterdam spring trip' }, days: [], counts: { scheduled: 0 } } },
};

export const Error: Story = {
  args: { data: errorOutput },
};
