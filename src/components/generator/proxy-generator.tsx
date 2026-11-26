import { Card } from '@/components/ui/card';
import { StepProgress } from '@/components/ui/step-progress';
import { CredentialsStep, ReviewStep, TargetingStep } from './generator-steps';
import { steps } from './types';
import type { GeneratorDraft } from './use-generator-draft';
import type { TargetingLookups } from './use-targeting-lookups';

const panels = [
  { title: 'Connection credentials', description: 'Enter the username and password for your residential proxy user.', action: 'Continue to targeting' },
  { title: 'Targeting settings', description: 'Choose locations, a network provider, and how the proxies rotate.', action: 'Review access' },
  { title: 'Review and create', description: 'Check your settings before generating the list.', action: 'Create access' },
] as const;

export function ProxyGenerator({ form, lookups, pending, submitError, onSubmit, onBack }: {
  form: GeneratorDraft;
  lookups: TargetingLookups;
  pending: boolean;
  submitError: string;
  onSubmit: () => void;
  onBack: () => void;
}) {
  const { step, draft, continueStep } = form;
  const panel = panels[step];

  return (
    <>
      <header className="page-intro">
        <h1 data-view-heading tabIndex={-1}>Create proxy access</h1>
        <p>Generate a list of residential proxy URLs for your application.</p>
      </header>
      <div className="generator-layout">
        <StepProgress steps={steps} activeIndex={step} />
        <form noValidate onSubmit={(event) => {
          event.preventDefault();
          if (step === 2) onSubmit();
          else continueStep();
        }}>
          <Card title={panel.title} description={panel.description} footer={(
            <>
              {step > 0 ? <button type="button" className="button" onClick={onBack} disabled={pending}><span aria-hidden="true">← </span>Back</button>
                : <span className="help">Step 1 of 3 · Credentials</span>}
              <button type="submit" className="button button-primary" disabled={pending}>
                {pending ? 'Creating…' : panel.action}{!pending && step < 2 && <span aria-hidden="true"> →</span>}
              </button>
            </>
          )}>
            {step === 0 && <CredentialsStep {...form} />}
            {step === 1 && <TargetingStep form={form} lookups={lookups} />}
            {step === 2 && <ReviewStep draft={draft} />}
            {step === 2 && submitError && <p className="submission-error" role="alert">{submitError}</p>}
          </Card>
        </form>
      </div>
    </>
  );
}
