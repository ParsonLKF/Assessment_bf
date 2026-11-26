import { useId, useState } from 'react';
import { formats, listRules, rotationLabel } from '@/lib/list-rules';
import { ComboBox } from '@/components/ui/combo-box';
import { PasswordToggle } from '@/components/ui/password-toggle';
import { TextField } from '@/components/ui/text-field';
import type { Draft } from './types';
import type { GeneratorDraft } from './use-generator-draft';
import type { TargetingLookups } from './use-targeting-lookups';

const protocolOptions = formats.map((value) => ({ value, label: value.toUpperCase() }));
const rotationOptions = [
  { value: 'sticky', label: 'Sticky sessions' },
  { value: 'rotating', label: 'Rotate every request' },
] as const;

export function CredentialsStep({ draft, errors, update }: GeneratorDraft) {
  const [visible, setVisible] = useState(false);
  const passwordId = useId();

  return (
    <div className="form-grid">
      <div className="form-full">
        <TextField label="List name (optional)" value={draft.name} onChange={(value) => update('name', value)} maxLength={listRules.maxNameLength}
          placeholder="e.g. US residential — QA" help="Appears in Proxy list and in the downloaded filename." />
      </div>
      <TextField label="Proxy username" autoComplete="username" autoCapitalize="none" spellCheck={false} value={draft.username}
        onChange={(value) => update('username', value, 'proxy_user_id')} error={errors.proxy_user_id} placeholder="e.g. app-production" required />
      <TextField id={passwordId} label="Proxy password" type={visible ? 'text' : 'password'} autoComplete="current-password"
        autoCapitalize="none" spellCheck={false} value={draft.password} onChange={(value) => update('password', value, 'proxy_user_password')}
        error={errors.proxy_user_password} required placeholder="Enter your proxy password"
        trailing={<PasswordToggle visible={visible} onToggle={() => setVisible(!visible)} controls={passwordId} />} />
      <div className="form-full">
        <ComboBox type="dropdown" label="Connection protocol" options={protocolOptions} value={draft.format}
          onChange={(value) => { if (value) update('format', value, 'list_format'); }} error={errors.list_format} />
      </div>
    </div>
  );
}

export function TargetingStep({ form: { draft, errors, update }, lookups }: { form: GeneratorDraft; lookups: TargetingLookups }) {
  const { countries, cities, asns } = lookups;

  return (
    <div className="form-grid">
      <ComboBox type="searchable" label="Country" value={draft.country?.country_id ?? null} onChange={countries.select}
        options={countries.data.map((country) => ({ value: country.country_id, label: country.country_name }))}
        placeholder="Any country" searchPlaceholder="Search countries" query={countries.query} onQueryChange={countries.setQuery}
        loading={countries.loading} lookupError={countries.error} onRetry={countries.retry} error={errors.country_id} />
      <ComboBox type="searchable" label="City" value={draft.city?.city_alias ?? null} onChange={cities.select}
        options={cities.data.map((city) => ({ value: city.city_alias, label: city.city_name }))}
        placeholder="Any city" searchPlaceholder="Search cities" query={cities.query} onQueryChange={cities.setQuery}
        disabled={!draft.country} help={!draft.country ? 'Select a country to search cities.' : undefined}
        loading={cities.loading} lookupError={cities.error} onRetry={cities.retry} error={errors.city_alias} />
      <TextField label="Quantity" value={draft.count} onChange={(value) => update('count', value, 'list_count')}
        inputMode="numeric" help="1 to 1,000 proxy URLs." error={errors.list_count} />
      <ComboBox type="dropdown" label="Rotation" options={rotationOptions} value={draft.rotation}
        onChange={(value) => { if (value) update('rotation', value, 'list_session_type'); }} error={errors.list_session_type} />
      <div className="form-full">
        <ComboBox type="searchable" label="ASN" value={draft.asn ? String(draft.asn.asn_id) : null} onChange={asns.select}
          options={asns.data.map((asn) => ({ value: String(asn.asn_id), label: `${asn.asn_name} (${asn.asn_id})` }))}
          placeholder="Any ASN" searchPlaceholder="Search by provider name or ASN ID" query={asns.query} onQueryChange={asns.setQuery}
          loading={asns.loading} lookupError={asns.error} onRetry={asns.retry} error={errors.asn_id} />
      </div>
    </div>
  );
}

export function ReviewStep({ draft }: { draft: Draft }) {
  const [visible, setVisible] = useState(false);
  const passwordId = useId();
  const options = [
    ['Protocol', draft.format.toUpperCase()],
    ['Country', draft.country?.country_name ?? 'Any country'],
    ['City', draft.city?.city_name ?? 'Any city'],
    ['ASN', draft.asn ? `${draft.asn.asn_name} (${draft.asn.asn_id})` : 'Any ASN'],
    ['Quantity', String(Number(draft.count))],
    ['Rotation', rotationLabel(draft.rotation)],
  ];

  return (
    <dl className="review-summary">
      <div><dt>List name</dt><dd>{draft.name.trim() || 'Untitled list'}</dd></div>
      <div><dt>Proxy username</dt><dd>{draft.username}</dd></div>
      <div>
        <dt>Proxy password</dt>
        <dd className="review-password">
          <span id={passwordId}>{visible ? draft.password : '••••••••••••'}</span>
          <PasswordToggle visible={visible} onToggle={() => setVisible(!visible)} controls={passwordId} />
        </dd>
      </div>
      {options.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
    </dl>
  );
}
