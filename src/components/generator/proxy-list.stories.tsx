import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import { ProxyList } from './proxy-list';
import { exampleResult } from './story-fixtures';

const meta = {
  title: 'Generator/ProxyList',
  component: ProxyList,
  parameters: { layout: 'padded' },
  args: { lists: [], onOpen: fn(), onGenerate: fn() },
} satisfies Meta<typeof ProxyList>;

export default meta;

export const Empty: StoryObj<typeof meta> = {};
export const WithHistory: StoryObj<typeof meta> = { args: { lists: [exampleResult] } };
