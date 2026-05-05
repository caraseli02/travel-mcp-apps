import { errorOutput, forecastMadrid } from './fixtures/travelFixtures.js';
import { renderWidget } from './renderWidget.js';

export default {
  title: 'Widgets/Weather Forecast Chart',
  render: (args) =>
    renderWidget({
      url: '/weather_forecast_chart_v1.html',
      toolOutput: args.data,
      toolInput: args.toolInput,
    }),
  argTypes: {
    data: { control: 'object' },
    toolInput: { control: 'object' },
  },
  args: {
    toolInput: { city: 'Madrid', days: 5 },
  },
};

export const Default = {
  args: { data: forecastMadrid },
};

export const Empty = {
  args: { data: { city: 'Madrid', forecasts: [] } },
};

export const Error = {
  args: { data: errorOutput },
};
