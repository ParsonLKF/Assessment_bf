import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { comboBoxPaginationThresholdPx } from '@/lib/constants';
import { Field, type ControlProps } from './field';
import { Icon } from './icon';

type Option<Value extends string> = { value: Value; label: string };
type Common<Value extends string> = {
  id?: string;
  label: string;
  options: readonly Option<Value>[];
  value: Value | null;
  onChange: (value: Value | null) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  help?: string;
  error?: string;
};

type Searchable<Value extends string> = Common<Value> & {
  type: 'searchable';
  query: string;
  onQueryChange: (query: string) => void;
  searchPlaceholder?: string;
  loading?: boolean;
  hasMore?: boolean;
  loadingMore?: boolean;
  onLoadMore?: () => void;
  lookupError?: string;
  onRetry?: () => void;
};

type ComboBoxProps<Value extends string> = (Common<Value> & { type: 'dropdown' }) | Searchable<Value>;

export function ComboBox<Value extends string>(props: ComboBoxProps<Value>) {
  return (
    <Field id={props.id} label={props.label} help={props.help} error={props.error} required={props.required}>
      {(control) => props.type === 'searchable' ? (
        <SearchBox {...props} control={control} />
      ) : (
        <div className="control-wrap native-select">
          <select {...control} className="control" disabled={props.disabled} value={props.value ?? ''} onChange={(event) => {
            props.onChange(props.options.find((option) => option.value === event.target.value)?.value ?? null);
          }}>
            {(props.placeholder || props.value === null) && <option value="" disabled={props.required}>{props.placeholder ?? 'Select an option'}</option>}
            {props.options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
          <span className="control-chevron"><Icon name="chevron" /></span>
        </div>
      )}
    </Field>
  );
}

function SearchBox<Value extends string>({ control, label, options, value, onChange, query, onQueryChange, placeholder,
  searchPlaceholder, disabled, required, loading, hasMore, loadingMore, onLoadMore, lookupError, onRetry }: Searchable<Value> & { control: ControlProps }) {
  const [open, setOpen] = useState(false);
  const [activeValue, setActiveValue] = useState<Value | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const listbox = useRef<HTMLUListElement>(null);
  const paginationRow = useRef<HTMLLIElement>(null);
  const listId = `${control.id}-options`;
  const activeIndex = options.findIndex((option) => option.value === activeValue);
  const visible = open && !disabled;
  const activeId = visible && activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined;
  const selected = options.find((option) => option.value === value);

  useEffect(() => {
    const root = listbox.current;
    const row = paginationRow.current;
    if (!visible || !root || !row || !hasMore || loading || loadingMore || lookupError || !onLoadMore) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) onLoadMore();
    }, { root, rootMargin: `0px 0px ${comboBoxPaginationThresholdPx}px 0px` });
    observer.observe(row);
    return () => observer.disconnect();
  }, [visible, hasMore, loading, loadingMore, lookupError, onLoadMore]);

  useEffect(() => {
    if (activeId) document.getElementById(activeId)?.scrollIntoView({ block: 'nearest' });
  }, [activeId]);

  function close() {
    setOpen(false);
    setActiveValue(null);
    onQueryChange('');
  }

  function choose(option: Option<Value>) {
    onChange(option.value);
    close();
  }

  function handleKey(event: KeyboardEvent<HTMLInputElement>) {
    if (event.nativeEvent.isComposing) return;
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowUp': {
        event.preventDefault();
        setOpen(true);
        const down = event.key === 'ArrowDown';
        const next = !visible || activeIndex < 0
          ? (down ? 0 : options.length - 1)
          : Math.max(0, Math.min(options.length - 1, activeIndex + (down ? 1 : -1)));
        setActiveValue(options[next]?.value ?? null);
        break;
      }
      case 'Enter':
        if (visible) {
          event.preventDefault();
          if (activeIndex >= 0) choose(options[activeIndex]);
        }
        break;
      case 'Escape':
        if (visible) {
          event.preventDefault();
          event.stopPropagation();
          close();
        }
        break;
    }
  }

  const errorMessage = lookupError && (
    <div className="lookup-message" role="alert">{lookupError} {onRetry && <button type="button" className="text-button" onClick={onRetry}>Retry</button>}</div>
  );

  return (
    <div onBlur={(event) => {
      if (!event.currentTarget.contains(event.relatedTarget)) close();
    }}>
      <div className="combo">
        <div className="control-wrap combo-control">
          <input
            {...control}
            required={undefined}
            ref={input}
            role="combobox"
            aria-required={required}
            aria-expanded={visible}
            aria-autocomplete="list"
            aria-controls={visible ? listId : undefined}
            aria-activedescendant={activeId}
            className="control"
            disabled={disabled}
            autoComplete="off"
            value={visible ? query : selected?.label ?? ''}
            placeholder={visible ? searchPlaceholder ?? placeholder : placeholder}
            onFocus={(event) => { if (!visible) event.currentTarget.select(); }}
            onClick={() => setOpen(true)}
            onChange={(event) => { setOpen(true); setActiveValue(null); onQueryChange(event.target.value); }}
            onKeyDown={handleKey}
          />
          <div className="combo-actions">
            {value !== null && !required && (
              <button type="button" className="icon-button" disabled={disabled} aria-label={`Clear ${label.toLowerCase()}`} onClick={() => {
                onChange(null);
                close();
                input.current?.focus();
              }}><Icon name="close" /></button>
            )}
            <button type="button" className="icon-button" tabIndex={-1} disabled={disabled} aria-label={`${visible ? 'Hide' : 'Show'} ${label.toLowerCase()} options`} onMouseDown={(event) => event.preventDefault()} onClick={() => {
              input.current?.focus();
              if (visible) close();
              else setOpen(true);
            }}><Icon name="chevron" /></button>
          </div>
        </div>
        {visible && (
          <div className="combo-popup">
            <ul ref={listbox} id={listId} role="listbox" aria-label={`${label} options`} aria-busy={loading || loadingMore}>
              {options.map((option, index) => (
                <li key={option.value} id={`${listId}-${index}`} role="option" aria-selected={option.value === value}
                  data-active={index === activeIndex || undefined} onMouseDown={(event) => event.preventDefault()} onClick={() => choose(option)}>
                  {option.label}
                  {option.value === value && <Icon name="check" />}
                </li>
              ))}
              {hasMore && (
                <li ref={paginationRow} className="combo-pagination" role="presentation" aria-hidden={!loadingMore}>
                  {loadingMore && <span className="combo-message" role="status">Loading more options…</span>}
                </li>
              )}
            </ul>
            {loading && <p className="combo-message" role="status">Loading options…</p>}
            {!loading && !lookupError && options.length === 0 && <p className="combo-message" role="status">No matching options.</p>}
            {errorMessage}
          </div>
        )}
      </div>
      {!visible && errorMessage}
    </div>
  );
}
