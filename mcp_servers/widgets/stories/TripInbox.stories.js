import { errorOutput, tripInboxAmsterdam } from './fixtures/travelFixtures.js';
import { renderWidget } from './renderWidget.js';

export default {
  title: 'Widgets/Trip Inbox',
  render: (args) =>
    renderWidget({
      url: '/trip_inbox_v1.html',
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
  args: { data: tripInboxAmsterdam },
};

export const Empty = {
  args: { data: { trip: { title: 'Amsterdam spring trip' }, items: [] } },
};

export const Error = {
  args: { data: errorOutput },
};
