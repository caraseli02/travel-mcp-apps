import { currentWeatherMadrid, errorOutput } from './fixtures/travelFixtures.js';
import { renderWidget } from './renderWidget.js';

export default {
  title: 'Widgets/Weather Dashboard',
  render: (args) =>
    renderWidget({
      url: '/weather_dashboard_v4.html',
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
  args: { data: currentWeatherMadrid },
};

export const Empty = {
  args: { data: {} },
};

export const Error = {
  args: { data: errorOutput },
};
