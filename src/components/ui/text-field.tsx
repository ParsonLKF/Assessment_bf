import type { ComponentProps, ReactNode } from 'react';
import { Field } from './field';

type TextFieldProps = Omit<ComponentProps<'input'>, 'children' | 'onChange' | 'value' | 'className'> & {
  label: string;
  value: string;
  onChange: (value: string) => void;
  help?: string;
  error?: string;
  trailing?: ReactNode;
};

export function TextField({ label, value, onChange, id, help, error, required, trailing, ...input }: TextFieldProps) {
  return (
    <Field id={id} label={label} help={help} error={error} required={required}>
      {(control) => (
        <div className={`control-wrap${trailing ? ' has-trailing' : ''}`}>
          <input {...input} {...control} className="control" value={value} onChange={(event) => onChange(event.target.value)} />
          {trailing && <span className="control-trailing">{trailing}</span>}
        </div>
      )}
    </Field>
  );
}
