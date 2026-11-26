import { Icon } from './icon';

export function StepProgress({ steps, activeIndex }: {
  steps: readonly { label: string; description: string }[];
  activeIndex: number;
}) {
  return (
    <ol className="step-progress" aria-label="Setup progress">
      {steps.map((step, index) => (
        <li key={step.label} className="progress-step" aria-current={index === activeIndex ? 'step' : undefined}>
          <span className="step-marker" aria-hidden="true">{index < activeIndex ? <Icon name="check" /> : index + 1}</span>
          <span><span className="step-label">{step.label}</span><small>{step.description}</small></span>
        </li>
      ))}
    </ol>
  );
}
