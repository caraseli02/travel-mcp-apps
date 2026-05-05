import { renderWidget } from './renderWidget.js';
import { errorOutput, forecastMadrid } from './fixtures/travelFixtures.js';
import type { Meta, StoryObj } from '@storybook/html';

interface WeatherForecastChartArgs {
  data: any;
  toolInput: Record<string, any>;
}

const meta: Meta<WeatherForecastChartArgs> = {
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

export default meta;
type Story = StoryObj<WeatherForecastChartArgs>;

export const Default: Story = {
  args: { data: forecastMadrid },
};

export const Empty: Story = {
  args: { data: { city: 'Madrid', forecasts: [] } },
};

export const Error: Story = {
  args: { data: errorOutput },
};
