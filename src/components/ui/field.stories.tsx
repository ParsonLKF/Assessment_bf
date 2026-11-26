import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Field } from './field';

const meta = {
  title: 'UI/Field',
  component: Field,
  parameters: { layout: 'padded' },
  args: {
    label: 'Quantity',
    help: 'Enter a whole number from 1 to 1,000.',
    children: (control) => <input {...control} className="control" inputMode="numeric" />,
  },
} satisfies Meta<typeof Field>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithHelp: Story = {};
export const RequiredWithError: Story = {
  args: { required: true, error: 'Enter a quantity.' },
};
