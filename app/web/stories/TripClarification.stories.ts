import {
  errorOutput,
  hotelClarificationParis,
  tripClarificationVenice,
} from './fixtures/travelFixtures.js';
import { renderWidget } from './renderWidget.js';
import type { Meta, StoryObj } from '@storybook/html';

interface TripClarificationArgs {
  data: any;
  toolInput: Record<string, any>;
}

const meta: Meta<TripClarificationArgs> = {
  title: 'Widgets/Trip Clarification',
  render: (args) =>
    renderWidget({
      url: '/trip_clarification_v1.html',
      toolOutput: args.data,
      toolInput: args.toolInput,
      height: '360px',
    }),
  argTypes: {
    data: { control: 'object' },
    toolInput: { control: 'object' },
  },
  args: {
    toolInput: { utterance: 'I want to plan a trip to Venice' },
  },
};

export default meta;
type Story = StoryObj<TripClarificationArgs>;

export const PlanTrip: Story = {
  args: { data: tripClarificationVenice },
};

export const BookHotel: Story = {
  args: {
    data: hotelClarificationParis,
    toolInput: { utterance: 'I want to book hotel in Paris' },
  },
};

export const Empty: Story = {
  args: { data: { ...tripClarificationVenice, total_questions: 0, questions: [] } },
};

export const Error: Story = {
  args: { data: errorOutput },
};
