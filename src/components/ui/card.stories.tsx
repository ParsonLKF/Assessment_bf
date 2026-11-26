import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Card } from './card';

const meta = {
  title: 'UI/Card',
  component: Card,
  parameters: { layout: 'padded' },
  args: { title: 'Connection settings', children: <p>Choose a protocol for your proxy list.</p> },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithFooter: Story = {
  args: {
    description: 'Review your settings before continuing.',
    footer: <button type="button" className="button button-primary">Continue</button>,
  },
};
export const Compact: Story = { args: { compact: true } };
