import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ComboBox } from './combo-box';
import { apiErrorMessage } from '@/lib/api-errors';

const options = [
  { value: 'http', label: 'HTTP' },
  { value: 'https', label: 'HTTPS' },
  { value: 'socks5', label: 'SOCKS5' },
  { value: 'socks5h', label: 'SOCKS5H' },
];

function ComboBoxExample({ type, disabled, lookupError }: { type: 'dropdown' | 'searchable'; disabled?: boolean; lookupError?: string }) {
  const [value, setValue] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  return (
    <div style={{ width: 300, maxWidth: '100%' }}>
      {type === 'dropdown' ? (
        <ComboBox type="dropdown" label="Protocol" value={value} options={options} onChange={setValue} disabled={disabled} />
      ) : (
        <ComboBox type="searchable" label="Protocol" value={value} onChange={setValue} disabled={disabled} lookupError={lookupError}
          options={options.filter((option) => option.value === value || option.value.includes(query.toLowerCase()))}
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
export const LookupError: Story = { args: { type: 'searchable', lookupError: apiErrorMessage.network.lookupFailed } };
