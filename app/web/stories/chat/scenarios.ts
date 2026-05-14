import {
  tripClarificationVenice,
  tripBoardAmsterdam,
  tripBudgetAmsterdam,
  tripItineraryAmsterdam,
  tripInboxAmsterdam,
  travelCartAmsterdam,
  travelOptionsAmsterdam,
} from '../fixtures/travelFixtures.js';

export type WidgetKind =
  | 'board'
  | 'inbox'
  | 'budget'
  | 'itinerary'
  | 'clarification'
  | 'options-list'
  | 'comparison-carousel'
  | 'map'
  | 'album'
  | 'cart';

export interface ChatTurn {
  role: 'user' | 'assistant' | 'tool';
  text?: string;
  label?: string;
  status?: string;
  widget?: {
    kind: WidgetKind;
    toolOutput: any;
  };
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
        kind: 'board',
        toolOutput: tripBoardAmsterdam,
      },
    },
    {
      role: 'assistant',
      text: 'Here are the raw notes that still need triage.',
    },
    {
      role: 'tool',
      label: 'list_trip_inbox',
      status: 'Inbox ready',
      widget: {
        kind: 'inbox',
        toolOutput: tripInboxAmsterdam,
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
        kind: 'budget',
        toolOutput: tripBudgetAmsterdam,
      },
    },
    {
      role: 'assistant',
      text: 'I also mapped the key places so you can see how the stay, museum, food route, and airport transfer relate.',
    },
    {
      role: 'tool',
      label: 'render_trip_map',
      status: 'Map ready',
      widget: {
        kind: 'map',
        toolOutput: travelOptionsAmsterdam,
      },
    },
    {
      role: 'assistant',
      text: 'Here are the travel options in a reviewable list before we turn them into commitments.',
    },
    {
      role: 'tool',
      label: 'render_travel_options',
      status: 'Options ready',
      widget: {
        kind: 'options-list',
        toolOutput: travelOptionsAmsterdam,
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
        kind: 'itinerary',
        toolOutput: tripItineraryAmsterdam,
      },
    },
    {
      role: 'assistant',
      text: 'Finally, this draft package collects the selected pieces without implying anything has been booked yet.',
    },
    {
      role: 'tool',
      label: 'render_trip_cart',
      status: 'Draft package ready',
      widget: {
        kind: 'cart',
        toolOutput: travelCartAmsterdam,
      },
    },
  ],
};

export const tripClarificationScenario: ChatScenario = {
  id: 'trip-clarification',
  title: 'Trip clarification',
  turns: [
    {
      role: 'user',
      text: 'I want to plan a trip to Venice.',
    },
    {
      role: 'assistant',
      text: 'I need a few details before creating the workspace.',
    },
    {
      role: 'tool',
      label: 'ask_trip_clarification',
      status: 'Questions ready',
      widget: {
        kind: 'clarification',
        toolOutput: tripClarificationVenice,
      },
    },
  ],
};

export const chatScenarios: Record<string, ChatScenario> = {
  [tripPlanningScenario.id]: tripPlanningScenario,
  [tripClarificationScenario.id]: tripClarificationScenario,
};
