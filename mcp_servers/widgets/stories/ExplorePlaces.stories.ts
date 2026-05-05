import { renderWidget } from './renderWidget.js';
import {
  errorOutput,
  explorePlacesValencia,
  explorePlacesMinimal,
} from './fixtures/travelFixtures.js';
import type { Meta, StoryObj } from '@storybook/html';

interface ExplorePlacesArgs {
  data: any;
  toolInput: Record<string, any>;
  displayMode: 'inline' | 'pip' | 'fullscreen';
}

const meta: Meta<ExplorePlacesArgs> = {
  title: 'Widgets/Explore Places',
  render: (args) =>
    renderWidget({
      url: '/explore_places_v1.html',
      toolOutput: args.data,
      toolInput: args.toolInput,
      displayMode: args.displayMode,
      height: '310px',
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
    toolInput: { city: 'Valencia', query: 'explore places' },
    displayMode: 'inline',
  },
};

export default meta;
type Story = StoryObj<ExplorePlacesArgs>;

/** Full dataset: 5 places with images, title, and subtitle */
export const Default: Story = {
  args: { data: explorePlacesValencia },
};

/** Minimal dataset: 3 places without images (tests placeholder rendering) */
export const NoImages: Story = {
  args: { data: explorePlacesMinimal },
};

/** Empty places array should show a friendly empty state */
export const Empty: Story = {
  args: { data: { section_title: 'Explore', places: [] } },
};

/** Error state returned by the tool */
export const Error: Story = {
  args: { data: errorOutput },
};
