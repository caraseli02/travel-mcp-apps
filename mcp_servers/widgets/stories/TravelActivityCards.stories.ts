import { renderWidget } from './renderWidget.js';
import { activityCardsLondon, errorOutput } from './fixtures/travelFixtures.js';
import type { Meta, StoryObj } from '@storybook/html';

interface TravelActivityCardsArgs {
  data: any;
  toolInput: Record<string, any>;
}

const meta: Meta<TravelActivityCardsArgs> = {
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

export default meta;
type Story = StoryObj<TravelActivityCardsArgs>;

export const Default: Story = {
  args: { data: activityCardsLondon },
};

export const Empty: Story = {
  args: { data: { city: 'London', weather: 'rain', season: 'spring', activities: [] } },
};

export const Error: Story = {
  args: { data: errorOutput },
};
