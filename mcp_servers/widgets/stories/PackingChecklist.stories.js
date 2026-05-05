import { renderWidget } from './renderWidget.js';
import {
  errorOutput,
  longPackingChecklistAmsterdam,
  packingChecklistAmsterdam,
} from './fixtures/travelFixtures.js';

const meta = {
  title: 'Widgets/Packing Checklist',
  render: (args) =>
    renderWidget({
      url: '/packing_checklist_v3.html',
      toolOutput: args.data,
      toolInput: args.toolInput,
      displayMode: args.displayMode,
    }),
  argTypes: {
    data: { control: 'object' },
    toolInput: { control: 'object' },
    displayMode: {
      control: { type: 'select' },
      options: ['inline', 'pip', 'fullscreen'],
    },
  },
  args: {
    toolInput: {
      destination: 'Amsterdam',
      duration_days: 5,
      weather_forecast: 'mild spring weather with rain risk',
    },
    displayMode: 'inline',
  },
};

export default meta;

export const Default = {
  args: { data: packingChecklistAmsterdam },
};

export const LongContent = {
  args: { data: longPackingChecklistAmsterdam },
};

export const Error = {
  args: { data: errorOutput },
};
