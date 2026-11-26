import { useQuery } from '@tanstack/react-query';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { AppQueryProvider } from './query-provider';

function ExampleQuery() {
  const { data } = useQuery({
    queryKey: ['provider-story', 'example'],
    queryFn: async () => 'Example query is ready.',
  });
  return <p role="status">{data ?? 'Loading example query…'}</p>;
}

const meta = {
  title: 'Infrastructure/AppQueryProvider',
  component: AppQueryProvider,
  parameters: { layout: 'padded' },
  args: { children: <ExampleQuery /> },
} satisfies Meta<typeof AppQueryProvider>;

export default meta;

export const LocalQuery: StoryObj<typeof meta> = {};
