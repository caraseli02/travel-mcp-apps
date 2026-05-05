import { renderWidget } from './renderWidget.js';
import { currentWeatherMadrid, errorOutput } from './fixtures/travelFixtures.js';
import type { Meta, StoryObj } from '@storybook/html';

interface WeatherDashboardArgs {
  data: any;
  toolInput: Record<string, any>;
}

const meta: Meta<WeatherDashboardArgs> = {
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

export default meta;
type Story = StoryObj<WeatherDashboardArgs>;

export const Default: Story = {
  args: { data: currentWeatherMadrid },
};

export const Empty: Story = {
  args: { data: {} },
};

export const Error: Story = {
  args: { data: errorOutput },
};
