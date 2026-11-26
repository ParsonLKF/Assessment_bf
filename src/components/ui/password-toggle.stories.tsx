import { useId, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { PasswordToggle } from './password-toggle';
import { TextField } from './text-field';

function PasswordExample() {
  const id = useId();
  const [visible, setVisible] = useState(false);
  const [value, setValue] = useState('example-password');
  return <TextField id={id} label="Proxy password" type={visible ? 'text' : 'password'}
    value={value} onChange={setValue}
    trailing={<PasswordToggle visible={visible} controls={id} onToggle={() => setVisible(!visible)} />} />;
}

const meta = {
  title: 'UI/PasswordToggle',
  component: PasswordToggle,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof PasswordToggle>;

export default meta;

export const InPasswordField: StoryObj = { render: () => <PasswordExample /> };
