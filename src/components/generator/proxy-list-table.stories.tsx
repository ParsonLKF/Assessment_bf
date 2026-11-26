import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import { ProxyListTable } from './proxy-list-table';
import { exampleResult } from './story-fixtures';

const meta = {
  title: 'Generator/ProxyListTable',
  component: ProxyListTable,
  parameters: { layout: 'padded' },
  args: { lists: [exampleResult], onOpen: fn() },
} satisfies Meta<typeof ProxyListTable>;

export default meta;

export const Default: StoryObj<typeof meta> = {};
