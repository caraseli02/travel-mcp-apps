import { createChatPreview } from './ChatPreview.js';

export default {
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

export const WeatherActivitiesPacking = {};

export const TripPlanningWorkspace = {
  args: {
    scenarioId: 'trip-planning',
  },
};
