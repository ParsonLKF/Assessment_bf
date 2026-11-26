import { Icon } from './icon';

export function PasswordToggle({ visible, onToggle, controls }: {
  visible: boolean;
  onToggle: () => void;
  controls: string;
}) {
  const label = visible ? 'Hide password' : 'Show password';
  return (
    <button type="button" className="icon-button password-toggle" aria-controls={controls} aria-label={label} title={label} onClick={onToggle}>
      <Icon name={visible ? 'eyeOff' : 'eye'} />
    </button>
  );
}
