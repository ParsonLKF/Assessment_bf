import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { TargetingStep } from './generator-steps';
import { useStoryLookups } from './story-fixtures';
import { useGeneratorDraft } from './use-generator-draft';

function TargetingExample() {
  const form = useGeneratorDraft();
  const lookups = useStoryLookups(form);
  return <TargetingStep form={form} lookups={lookups} />;
}

const meta = {
  title: 'Generator/TargetingStep',
  component: TargetingStep,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof TargetingStep>;

export default meta;

export const Default: StoryObj = { render: () => <TargetingExample /> };
