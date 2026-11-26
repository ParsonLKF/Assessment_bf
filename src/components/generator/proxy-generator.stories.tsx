import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ProxyGenerator } from './proxy-generator';
import { useStoryLookups } from './story-fixtures';
import { useGeneratorDraft } from './use-generator-draft';

function GeneratorExample() {
  const form = useGeneratorDraft();
  const lookups = useStoryLookups(form);
  const [submitted, setSubmitted] = useState(false);
  return (
    <>
      <ProxyGenerator form={form} lookups={lookups} pending={false} submitError=""
        onSubmit={() => setSubmitted(true)} onBack={() => { setSubmitted(false); form.back(); }} />
      {submitted && <p role="status">Demo settings submitted.</p>}
    </>
  );
}

const meta = {
  title: 'Generator/ProxyGenerator',
  component: ProxyGenerator,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof ProxyGenerator>;

export default meta;

export const Default: StoryObj = { render: () => <GeneratorExample /> };
