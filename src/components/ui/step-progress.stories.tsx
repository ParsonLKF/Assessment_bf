import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { steps } from '../generator/types';
import { StepProgress } from './step-progress';

const meta = {
  title: 'UI/StepProgress',
  component: StepProgress,
  parameters: { layout: 'padded', controls: { include: ['activeIndex'] } },
  argTypes: { activeIndex: { control: 'select', options: [0, 1, 2] } },
  args: { steps, activeIndex: 0 },
  decorators: [
    (Story) => (
      <div className="console" style={{ display: 'block', minHeight: 0, padding: 16 }}>
        <div className="generator-layout">
          <Story />
        </div>
      </div>
    ),
  ],
} satisfies Meta<typeof StepProgress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Credentials: Story = {};
export const Targeting: Story = { args: { activeIndex: 1 } };
export const Review: Story = { args: { activeIndex: 2 } };
