import { destinationGuideMadrid, errorOutput } from './fixtures/travelFixtures.js';
import { renderWidget } from './renderWidget.js';

export default {
  title: 'Widgets/Travel Destination Guide',
  render: (args) =>
    renderWidget({
      url: '/travel_destination_guide_v1.html',
      toolOutput: args.data,
      toolInput: args.toolInput,
    }),
  argTypes: {
    data: { control: 'object' },
    toolInput: { control: 'object' },
  },
  args: {
    toolInput: { city: 'Madrid' },
  },
};

export const Default = {
  args: { data: destinationGuideMadrid },
};

export const Empty = {
  args: { data: { city: 'Madrid', country: 'Spain', tips: [], activities: [] } },
};

export const Error = {
  args: { data: errorOutput },
};
