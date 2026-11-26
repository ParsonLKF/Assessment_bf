import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { CredentialsStep } from './generator-steps';
import { useGeneratorDraft } from './use-generator-draft';

function CredentialsExample() {
  return <CredentialsStep {...useGeneratorDraft()} />;
}

const meta = {
  title: 'Generator/CredentialsStep',
  component: CredentialsStep,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof CredentialsStep>;

export default meta;

export const Default: StoryObj = { render: () => <CredentialsExample /> };
