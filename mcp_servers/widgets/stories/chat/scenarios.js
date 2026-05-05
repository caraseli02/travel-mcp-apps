import {
  activityCardsLondon,
  forecastMadrid,
  packingChecklistAmsterdam,
  tripBoardAmsterdam,
  tripBudgetAmsterdam,
  tripItineraryAmsterdam,
} from '../fixtures/travelFixtures.js';

export const weatherActivitiesPackingScenario = {
  id: 'weather-activities-packing',
  title: 'Weather, activities, and packing',
  turns: [
    {
      role: 'user',
      text: 'I am going to Madrid for five days. Check the weather and help me decide what to do.',
    },
    {
      role: 'assistant',
      text: 'I found a five day forecast. There is one rainy day, so outdoor plans should stay flexible.',
    },
    {
      role: 'tool',
      label: 'get_forecast',
      status: 'Results ready',
      widget: {
        url: '/weather_forecast_chart_v1.html',
        height: '420px',
        toolInput: { city: 'Madrid', days: 5 },
        toolOutput: forecastMadrid,
      },
    },
    {
      role: 'user',
      text: 'Give me some rainy day activities too.',
    },
    {
      role: 'assistant',
      text: 'For rain, I would bias toward indoor cultural stops and keep evening plans comfortable.',
    },
    {
      role: 'tool',
      label: 'recommend_activities',
      status: '2 recommendations',
      widget: {
        url: '/travel_activity_cards_v3.html',
        height: '360px',
        toolInput: { city: 'London', weather: 'rain', season: 'spring' },
        toolOutput: activityCardsLondon,
      },
    },
    {
      role: 'assistant',
      text: 'Based on that rain risk, here is the packing checklist I would use before you leave.',
    },
    {
      role: 'tool',
      label: 'generate_packing_list',
      status: 'Checklist ready',
      widget: {
        url: '/packing_checklist_v3.html',
        height: '520px',
        toolInput: {
          destination: 'Amsterdam',
          duration_days: 5,
          weather_forecast: 'mild spring weather with rain risk',
        },
        toolOutput: packingChecklistAmsterdam,
      },
    },
  ],
};

export const tripPlanningScenario = {
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
      label: 'get_trip_summary',
      status: 'Board updated',
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
      text: 'And here is the day-by-day draft so you can review the trip without opening ChatGPT.',
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

export const chatScenarios = {
  [weatherActivitiesPackingScenario.id]: weatherActivitiesPackingScenario,
  [tripPlanningScenario.id]: tripPlanningScenario,
};
