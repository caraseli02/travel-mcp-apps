import {
  tripBoardAmsterdam,
  tripBudgetAmsterdam,
  tripItineraryAmsterdam,
} from '../fixtures/travelFixtures';

export interface WidgetConfig {
  url: string;
  height: string;
  toolInput: Record<string, any>;
  toolOutput: any;
}

export interface ChatTurn {
  role: 'user' | 'assistant' | 'tool';
  text?: string;
  label?: string;
  status?: string;
  widget?: WidgetConfig;
}

export interface ChatScenario {
  id: string;
  title: string;
  turns: ChatTurn[];
}

export const tripPlanningScenario: ChatScenario = {
  id: 'trip-planning',
  title: 'Trip planning workspace',
  turns: [
    {
      role: 'user',
      text: 'Show me the current planning state for my Amsterdam trip.',
    },
    {
      role: 'assistant',
      text: 'Here is the working board. A few decisions are still open, but the core trip is taking shape.',
    },
    {
      role: 'tool',
      label: 'render_trip_board',
      status: 'Board ready',
      widget: {
        url: '/trip_board_v3.html',
        height: '440px',
        toolInput: { trip_id: 'trip-amsterdam-2026' },
        toolOutput: tripBoardAmsterdam,
      },
    },
    {
      role: 'assistant',
      text: 'The budget still has room, mostly because food and local transit are estimates.',
    },
    {
      role: 'tool',
      label: 'get_trip_budget',
      status: 'Budget ready',
      widget: {
        url: '/trip_budget_v3.html',
        height: '360px',
        toolInput: { trip_id: 'trip-amsterdam-2026' },
        toolOutput: tripBudgetAmsterdam,
      },
    },
    {
      role: 'assistant',
      text: 'And here is the day-by-day draft so you can review the trip without opening another tab.',
    },
    {
      role: 'tool',
      label: 'get_trip_itinerary',
      status: 'Itinerary ready',
      widget: {
        url: '/trip_itinerary_v3.html',
        height: '390px',
        toolInput: { trip_id: 'trip-amsterdam-2026' },
        toolOutput: tripItineraryAmsterdam,
      },
    },
  ],
};

export const chatScenarios: Record<string, ChatScenario> = {
  [tripPlanningScenario.id]: tripPlanningScenario,
};
