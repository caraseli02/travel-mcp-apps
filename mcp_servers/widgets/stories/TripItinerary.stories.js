import { errorOutput, tripItineraryAmsterdam } from './fixtures/travelFixtures.js';
import { renderWidget } from './renderWidget.js';

export default {
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

export const Default = {
  args: { data: tripItineraryAmsterdam },
};

export const Empty = {
  args: { data: { trip: { title: 'Amsterdam spring trip' }, days: [], counts: { scheduled: 0 } } },
};

export const Error = {
  args: { data: errorOutput },
};
