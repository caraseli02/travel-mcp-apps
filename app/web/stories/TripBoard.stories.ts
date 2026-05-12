import { errorOutput, tripBoardAmsterdam } from './fixtures/travelFixtures.js';
import { renderWidget } from './renderWidget.js';
import type { Meta, StoryObj } from '@storybook/html';

interface TripBoardArgs {
  data: any;
  toolInput: Record<string, any>;
}

const meta: Meta<TripBoardArgs> = {
  title: 'Widgets/Trip Board',
  render: (args) =>
    renderWidget({
      url: '/trip_board_v3.html',
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

export default meta;
type Story = StoryObj<TripBoardArgs>;

export const Default: Story = {
  args: { data: tripBoardAmsterdam },
};

export const Empty: Story = {
  args: { data: {} },
};

export const Error: Story = {
  args: { data: errorOutput },
};
