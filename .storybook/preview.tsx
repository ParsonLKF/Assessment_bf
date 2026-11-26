import type { Preview } from '@storybook/nextjs-vite';
import { AppQueryProvider } from '../src/components/query-provider';
import '../src/app/globals.css';

const preview: Preview = {
  parameters: {
    layout: 'fullscreen',
    nextjs: { appDirectory: true },
  },
  decorators: [
    (Story) => <AppQueryProvider><Story /></AppQueryProvider>,
  ],
};

export default preview;
