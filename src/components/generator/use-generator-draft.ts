import { useState } from 'react';
import { listRules } from '@/lib/list-rules';
import type { Country } from '@/lib/targeting';
import { validateCredentials, validateListRequest, type ListErrors } from '@/lib/validators';
import type { Draft, Step } from './types';

const defaultDraft: Draft = {
  name: '',
  username: '',
  password: '',
  count: String(listRules.defaultCount),
  format: listRules.defaultFormat,
  rotation: listRules.defaultSessionType,
  country: null,
  city: null,
  asn: null,
};

export function useGeneratorDraft() {
  const [draft, setDraft] = useState(defaultDraft);
  const [step, setStep] = useState<Step>(0);
  const [errors, setErrors] = useState<ListErrors>({});

  function update<Field extends keyof Draft>(field: Field, value: Draft[Field], errorKey?: keyof ListErrors) {
    setDraft((previous) => ({ ...previous, [field]: value }));
    if (errorKey) setErrors((previous) => ({ ...previous, [errorKey]: undefined }));
  }

  function selectCountry(country: Country | null) {
    setDraft((previous) => {
      if (previous.country?.country_id === country?.country_id) return previous;
      return {
        ...previous,
        country,
        city: null,
        asn: !country || previous.asn?.country_id === country.country_id ? previous.asn : null,
      };
    });
    setErrors((previous) => ({ ...previous, country_id: undefined, city_alias: undefined, asn_id: undefined }));
  }

  function request() {
    return validateListRequest({
      proxy_user_id: draft.username,
      proxy_user_password: draft.password,
      list_count: /^\d+$/.test(draft.count) ? Number(draft.count) : NaN,
      list_format: draft.format,
      list_session_type: draft.rotation,
      country_id: draft.country?.country_id,
      city_alias: draft.city?.city_alias,
      asn_id: draft.asn?.asn_id,
    });
  }

  function continueStep() {
    if (step === 0) {
      const credentialErrors = validateCredentials(draft.username, draft.password);
      setErrors(credentialErrors);
      if (Object.keys(credentialErrors).length === 0) setStep(1);
    } else if (step === 1) {
      const validation = request();
      if (!validation.ok) {
        setErrors(validation.errors);
        return;
      }
      setErrors({});
      setStep(2);
    }
  }

  function reset() {
    setDraft(defaultDraft);
    setStep(0);
    setErrors({});
  }

  return { draft, step, errors, update, selectCountry, continueStep, request, reset, back: () => setStep(step === 2 ? 1 : 0) };
}

export type GeneratorDraft = ReturnType<typeof useGeneratorDraft>;
