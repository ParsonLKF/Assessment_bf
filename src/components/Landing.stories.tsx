import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';
import { countries, fixtureAsns, fixtureCities } from '@/lib/lookup-fixtures';
import { apiErrorMessage } from '@/lib/api-errors';
import { Landing } from './Landing';

const meta = {
  title: 'Generator/Console',
  component: Landing,
  beforeEach({ parameters }) {
    const originalFetch = window.fetch;
    let submissions = 0;
    let countryFailures = parameters.countryLookupFailures ?? 0;

    window.fetch = async (input, init) => {
      const url = new URL(input instanceof Request ? input.url : String(input), window.location.href);
      if (url.origin !== window.location.origin) return originalFetch(input, init);
      const country = url.searchParams.get('country_id') ?? '';
      const query = url.searchParams.get('q') ?? '';

      switch (url.pathname) {
        case '/api/lookup/countries': {
          if (countryFailures > 0) {
            countryFailures -= 1;
            return Response.json(
              { error: 'upstream_failure', message: apiErrorMessage.lookup.connectionFailed },
              { status: 502 },
            );
          }
          const term = query.toLowerCase();
          return Response.json({ data: countries.filter((item) => item.country_id === term || item.country_name.toLowerCase().includes(term)) });
        }
        case '/api/lookup/cities':
          return Response.json({ data: fixtureCities(country, query) });
        case '/api/lookup/asns':
          return Response.json({ data: fixtureAsns(country, query) });
        case '/api/residential/list':
          if (++submissions === 1) return Response.json({ error: 'internal_server_error', message: apiErrorMessage.generation.failed }, { status: 500 });
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

export const LookupErrorAndRetry: Story = {
  parameters: { countryLookupFailures: 3 },
  async play({ canvasElement, userEvent }) {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText(/^Proxy username/), 'qa');
    await userEvent.type(canvas.getByLabelText(/^Proxy password/), 'secret');
    await userEvent.click(canvas.getByRole('button', { name: 'Continue to targeting' }));
    await userEvent.click(canvas.getByRole('combobox', { name: 'Country' }));

    const alert = await canvas.findByRole('alert', {}, { timeout: 8000 });
    await expect(alert).toHaveTextContent(apiErrorMessage.lookup.connectionFailed);
    await expect(within(alert).getByRole('button', { name: 'Retry' })).toBeVisible();
  },
};

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
    await expect(await canvas.findByRole('alert')).toHaveTextContent(apiErrorMessage.generation.failed);
    await expect(canvas.getByText('UK QA')).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Create access' })).toBeEnabled();
  },
};
