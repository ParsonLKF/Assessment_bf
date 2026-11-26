import type { ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Icon } from './icon';

const names = [
  'menu', 'moon', 'sun', 'generator', 'list', 'eye', 'eyeOff', 'chevron', 'close', 'check',
] satisfies ComponentProps<typeof Icon>['name'][];

const meta = {
  title: 'UI/Icon',
  component: Icon,
  parameters: { layout: 'padded' },
  args: { name: 'check' },
  argTypes: { name: { control: 'select', options: names } },
} satisfies Meta<typeof Icon>;

export default meta;

export const Default: StoryObj<typeof meta> = {};
export const Gallery: StoryObj = {
  render: () => (
    <ul className="grid grid-cols-3 gap-4">
      {names.map((name) => <li key={name} className="flex items-center gap-2"><Icon name={name} />{name}</li>)}
    </ul>
  ),
};
