import { renderWidget } from './renderWidget.js';
import { destinationGuideMadrid, errorOutput } from './fixtures/travelFixtures.js';
import type { Meta, StoryObj } from '@storybook/html';

interface TravelDestinationGuideArgs {
  data: any;
  toolInput: Record<string, any>;
}

const meta: Meta<TravelDestinationGuideArgs> = {
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

export default meta;
type Story = StoryObj<TravelDestinationGuideArgs>;

export const Default: Story = {
  args: { data: destinationGuideMadrid },
};

export const Empty: Story = {
  args: { data: { city: 'Madrid', country: 'Spain', tips: [], activities: [] } },
};

export const Error: Story = {
  args: { data: errorOutput },
};
