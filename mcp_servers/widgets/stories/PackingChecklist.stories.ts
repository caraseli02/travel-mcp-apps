import { renderWidget } from './renderWidget.js';
import {
  errorOutput,
  longPackingChecklistAmsterdam,
  packingChecklistAmsterdam,
} from './fixtures/travelFixtures.js';
import type { Meta, StoryObj } from '@storybook/html';

interface PackingChecklistArgs {
  data: any;
  toolInput: Record<string, any>;
  displayMode: 'inline' | 'pip' | 'fullscreen';
}

const meta: Meta<PackingChecklistArgs> = {
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
type Story = StoryObj<PackingChecklistArgs>;

export const Default: Story = {
  args: { data: packingChecklistAmsterdam },
};

export const LongContent: Story = {
  args: { data: longPackingChecklistAmsterdam },
};

export const Error: Story = {
  args: { data: errorOutput },
};
