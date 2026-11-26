import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';
import { countries, fixtureAsns, fixtureCities } from '@/lib/lookup-fixtures';
import { Landing } from './Landing';

const meta = {
  title: 'Generator/Console',
  component: Landing,
  beforeEach() {
    const originalFetch = window.fetch;
    let submissions = 0;

    window.fetch = async (input, init) => {
      const url = new URL(input instanceof Request ? input.url : String(input), window.location.href);
      if (url.origin !== window.location.origin) return originalFetch(input, init);
      const country = url.searchParams.get('country_id') ?? '';
      const query = url.searchParams.get('q') ?? '';

      switch (url.pathname) {
        case '/api/lookup/countries':
          return Response.json({ data: countries });
        case '/api/lookup/cities':
          return Response.json({ data: fixtureCities(country, query) });
        case '/api/lookup/asns':
          return Response.json({ data: fixtureAsns(country, query) });
        case '/api/residential/list':
          if (++submissions === 1) return Response.json({ error: 'internal_server_error', message: 'Could not generate the proxy list. Try again.' }, { status: 500 });
          return Response.json({ data: ['https://demo:password@proxy.example.test:8000'] });
        default:
          return originalFetch(input, init);
      }
    };

    return () => { window.fetch = originalFetch; };
  },
} satisfies Meta<typeof Landing>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const GenerationAndRetry: Story = {
  async play({ canvasElement, userEvent }) {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText('List name (optional)'), 'UK QA');
    await userEvent.type(canvas.getByLabelText(/^Proxy username/), 'qa');
    await userEvent.type(canvas.getByLabelText(/^Proxy password/), 'secret');
    await userEvent.selectOptions(canvas.getByLabelText('Connection protocol'), 'https');
    await userEvent.click(canvas.getByRole('button', { name: 'Continue to targeting' }));
    const city = canvas.getByRole('combobox', { name: 'City' });
    await expect(city).toBeDisabled();
    const country = canvas.getByRole('combobox', { name: 'Country' });
    await userEvent.click(country);
    await userEvent.type(country, 'gb');
    await canvas.findByRole('option', { name: 'United Kingdom' });
    await userEvent.keyboard('{ArrowDown}{Enter}');
    await expect(country).toHaveValue('United Kingdom');
    await userEvent.click(city);
    await userEvent.type(city, 'lon');
    await userEvent.click(await canvas.findByRole('option', { name: 'London' }));
    await userEvent.clear(canvas.getByLabelText('Quantity'));
    await userEvent.type(canvas.getByLabelText('Quantity'), '1');
    await userEvent.click(canvas.getByRole('button', { name: 'Review access' }));
    await expect(canvas.getByText('London')).toBeVisible();
    await expect(canvas.queryByText('secret')).toBeNull();
    await userEvent.click(canvas.getByRole('button', { name: 'Create access' }));
    await expect(await canvas.findByRole('alert')).toHaveTextContent('Could not generate the proxy list.');
    await expect(canvas.getByText('UK QA')).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Create access' }));
    await expect(await canvas.findByRole('heading', { name: 'UK QA' })).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Back to Proxy list' }));
    const row = canvas.getByRole('row', { name: /UK QA/ });
    row.focus();
    await userEvent.keyboard('{Enter}');
    await expect(canvas.getByRole('heading', { name: 'Generated result' })).toBeVisible();
    if (!canvas.queryByRole('navigation', { name: 'Tool' })) {
      await userEvent.click(canvas.getByRole('button', { name: 'Open navigation' }));
    }
    const navigation = canvas.getByRole('navigation', { name: 'Tool' });
    await userEvent.click(within(navigation).getByRole('button', { name: 'Proxy generator' }));
    await expect(canvas.getByLabelText(/^Proxy username/)).toHaveValue('');
  },
};
