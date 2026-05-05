import { createChatPreview, type ChatPreviewOptions } from './ChatPreview.js';
import type { Meta, StoryObj } from '@storybook/html';

const meta: Meta<ChatPreviewOptions> = {
  title: 'Chat Preview/Conversation',
  render: (args) => createChatPreview(args),
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    scenarioId: {
      control: { type: 'select' },
      options: ['weather-activities-packing', 'trip-planning'],
    },
    displayMode: {
      control: { type: 'select' },
      options: ['inline', 'pip', 'fullscreen'],
    },
    theme: { control: 'object' },
    widgetState: { control: 'object' },
  },
  args: {
    scenarioId: 'weather-activities-packing',
    displayMode: 'inline',
    theme: { colorScheme: 'light', spacing: 'comfortable' },
    widgetState: {},
  },
};

export default meta;
type Story = StoryObj<ChatPreviewOptions>;

export const WeatherActivitiesPacking: Story = {};

export const TripPlanningWorkspace: Story = {
  args: {
    scenarioId: 'trip-planning',
  },
};
