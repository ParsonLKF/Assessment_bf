import { useId, type ReactNode } from 'react';

export type ControlProps = {
  id: string;
  'aria-describedby'?: string;
  'aria-invalid'?: true;
  required?: boolean;
};

type FieldProps = {
  id?: string;
  label: string;
  help?: string;
  error?: string;
  required?: boolean;
  children: (props: ControlProps) => ReactNode;
};

export function Field({ id, label, help, error, required, children }: FieldProps) {
  const generatedId = useId();
  const controlId = id ?? generatedId;
  const helpId = `${controlId}-help`;
  const errorId = `${controlId}-error`;
  const description = [help && helpId, error && errorId].filter(Boolean).join(' ');

  return (
    <div className="field">
      <label htmlFor={controlId}>{label}{required && <span className="field-required" aria-hidden="true"> *</span>}</label>
      {children({ id: controlId, 'aria-describedby': description || undefined, 'aria-invalid': error ? true : undefined, required })}
      {help && <p id={helpId} className="help">{help}</p>}
      {error && <p id={errorId} className="field-error" role="alert">{error}</p>}
    </div>
  );
}
