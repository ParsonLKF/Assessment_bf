import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import { ProxyResult } from './proxy-result';
import { exampleResult } from './story-fixtures';

const meta = {
  title: 'Generator/ProxyResult',
  component: ProxyResult,
  parameters: { layout: 'padded' },
  args: { result: exampleResult, onBack: fn() },
} satisfies Meta<typeof ProxyResult>;

export default meta;

export const Ready: StoryObj<typeof meta> = {};
