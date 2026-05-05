import { errorOutput, tripBoardAmsterdam } from './fixtures/travelFixtures.js';
import { renderWidget } from './renderWidget.js';

export default {
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

export const Default = {
  args: { data: tripBoardAmsterdam },
};

export const Empty = {
  args: { data: {} },
};

export const Error = {
  args: { data: errorOutput },
};
