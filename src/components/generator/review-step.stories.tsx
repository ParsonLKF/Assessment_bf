import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ReviewStep } from './generator-steps';
import { exampleDraft } from './story-fixtures';

const meta = {
  title: 'Generator/ReviewStep',
  component: ReviewStep,
  parameters: { layout: 'padded' },
  args: { draft: exampleDraft },
} satisfies Meta<typeof ReviewStep>;

export default meta;

export const WithTargeting: StoryObj<typeof meta> = {};
export const AnyLocation: StoryObj<typeof meta> = {
  args: { draft: { ...exampleDraft, country: null, city: null, asn: null } },
};
