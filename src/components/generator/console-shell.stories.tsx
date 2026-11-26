import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ConsoleShell } from './console-shell';
import type { View } from './types';

function ShellExample() {
  const [view, setView] = useState<View>('generator');
  return (
    <ConsoleShell view={view} listCount={1} onNavigate={setView}>
      <h1>{view === 'generator' ? 'Create proxy access' : 'Proxy list'}</h1>
    </ConsoleShell>
  );
}

const meta = {
  title: 'Generator/ConsoleShell',
  component: ConsoleShell,
} satisfies Meta<typeof ConsoleShell>;

export default meta;

export const NavigationAndTheme: StoryObj = { render: () => <ShellExample /> };
