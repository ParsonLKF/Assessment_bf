import { useId, type ReactNode } from 'react';

type CardProps = {
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  compact?: boolean;
};

export function Card({ title, description, children, footer, compact }: CardProps) {
  const titleId = useId();
  return (
    <section className={`card${compact ? ' card-compact' : ''}`} aria-labelledby={titleId}>
      <header className="card-head">
        <h2 id={titleId} tabIndex={-1}>{title}</h2>
        {description && <p>{description}</p>}
      </header>
      <div className="card-body">{children}</div>
      {footer && <footer className="card-footer">{footer}</footer>}
    </section>
  );
}
