import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { within } from 'storybook/test';
import { ComboBox } from './combo-box';
import { apiErrorMessage } from '@/lib/api-errors';

const options = [
  { value: 'http', label: 'HTTP' },
  { value: 'https', label: 'HTTPS' },
  { value: 'socks5', label: 'SOCKS5' },
  { value: 'socks5h', label: 'SOCKS5H' },
];

function ComboBoxExample({ type, disabled, initialLookupError }: { type: 'dropdown' | 'searchable'; disabled?: boolean; initialLookupError?: string }) {
  const [value, setValue] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [retried, setRetried] = useState(false);
  const lookupError = retried ? undefined : initialLookupError;
  return (
    <div style={{ width: 300, maxWidth: '100%' }}>
      {type === 'dropdown' ? (
        <ComboBox type="dropdown" label="Protocol" value={value} options={options} onChange={setValue} disabled={disabled} />
      ) : (
        <ComboBox type="searchable" label="Protocol" value={value} onChange={setValue} disabled={disabled} lookupError={lookupError}
          onRetry={lookupError ? () => setRetried(true) : undefined}
          options={lookupError ? [] : options.filter((option) => option.value === value || option.value.includes(query.toLowerCase()))}
          placeholder="Choose a protocol" searchPlaceholder="Search protocols" query={query} onQueryChange={setQuery} />
      )}
    </div>
  );
}

const meta = {
  title: 'UI/ComboBox',
  component: ComboBoxExample,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof ComboBoxExample>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Dropdown: Story = { args: { type: 'dropdown' } };
export const Searchable: Story = { args: { type: 'searchable' } };
export const Disabled: Story = { args: { type: 'searchable', disabled: true } };
const openLookupError: Story['play'] = async ({ canvasElement, userEvent }) => {
  await userEvent.click(within(canvasElement).getByRole('combobox', { name: 'Protocol' }));
};

export const InvalidParameter: Story = {
  name: '400 invalid_parameter',
  args: { type: 'searchable', initialLookupError: apiErrorMessage.request.invalidSearch },
  play: openLookupError,
};

export const NotFound: Story = {
  name: '404 not_found',
  args: { type: 'searchable', initialLookupError: apiErrorMessage.request.unknownLookup },
  play: openLookupError,
};

export const RateLimited: Story = {
  name: '429 rate_limited',
  args: { type: 'searchable', initialLookupError: apiErrorMessage.lookup.rateLimited },
  play: openLookupError,
};

export const InternalServerError: Story = {
  name: '500 internal_server_error',
  args: { type: 'searchable', initialLookupError: apiErrorMessage.lookup.failed },
  play: openLookupError,
};

export const LookupError: Story = {
  name: '502 upstream_failure',
  args: { type: 'searchable', initialLookupError: apiErrorMessage.lookup.connectionFailed },
  play: openLookupError,
};

export const MissingApiKeys: Story = {
  name: '503 missing_api_keys',
  args: { type: 'searchable', initialLookupError: apiErrorMessage.lookup.unconfigured },
  play: openLookupError,
};

export const NetworkError: Story = {
  args: { type: 'searchable', initialLookupError: apiErrorMessage.network.unavailable },
  play: openLookupError,
};

export const UnexpectedResponse: Story = {
  name: '200 Unexpected Response',
  args: { type: 'searchable', initialLookupError: apiErrorMessage.network.unexpectedResponse },
  play: openLookupError,
};
