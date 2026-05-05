import { activityCardsLondon, errorOutput } from './fixtures/travelFixtures.js';
import { renderWidget } from './renderWidget.js';

export default {
  title: 'Widgets/Travel Activity Cards',
  render: (args) =>
    renderWidget({
      url: '/travel_activity_cards_v3.html',
      toolOutput: args.data,
      toolInput: args.toolInput,
    }),
  argTypes: {
    data: { control: 'object' },
    toolInput: { control: 'object' },
  },
  args: {
    toolInput: { city: 'London', weather: 'rain', season: 'spring' },
  },
};

export const Default = {
  args: { data: activityCardsLondon },
};

export const Empty = {
  args: { data: { city: 'London', weather: 'rain', season: 'spring', activities: [] } },
};

export const Error = {
  args: { data: errorOutput },
};
