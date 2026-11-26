import { useState, type ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import { TextField } from './text-field';

function EditableTextField(props: ComponentProps<typeof TextField>) {
  const [value, setValue] = useState(props.value);
  return <TextField {...props} value={value} onChange={(text) => {
    setValue(text);
    props.onChange(text);
  }} />;
}

const meta = {
  title: 'UI/TextField',
  component: TextField,
  parameters: { layout: 'padded' },
  args: { label: 'Proxy username', value: '', onChange: fn(), placeholder: 'e.g. demo-user' },
  render: (args) => <EditableTextField key={args.value} {...args} />,
} satisfies Meta<typeof TextField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithError: Story = {
  args: { value: 'demo user', required: true, error: 'The username must contain no whitespace.' },
};
export const Disabled: Story = { args: { value: 'demo-user', disabled: true } };
