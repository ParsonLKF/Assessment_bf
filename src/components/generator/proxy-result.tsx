import { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { rotationLabel } from '@/lib/list-rules';
import { apiErrorMessage } from '@/lib/api-errors';
import type { ProxySnapshot } from './types';

export function ProxyResult({ result, onBack }: { result: ProxySnapshot; onBack: () => void }) {
  const [feedback, setFeedback] = useState<{ text: string; error?: boolean } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  function announce(text: string, error = false) {
    if (timer.current) clearTimeout(timer.current);
    setFeedback({ text, error });
    timer.current = setTimeout(() => setFeedback(null), 3500);
  }

  async function copy(text: string, message: string) {
    try {
      await navigator.clipboard.writeText(text);
      announce(message);
    } catch {
      announce(apiErrorMessage.clipboard.failed, true);
    }
  }

  function download() {
    const file = new Blob([`${result.lines.join('\n')}\n`], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = url;
    link.download = result.filename;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    announce('Proxy list downloaded.');
  }

  const summary = [
    ['Country', result.country], ['City', result.city], ['Quantity', String(result.lines.length)],
    ['Format', result.format.toUpperCase()], ['Rotation', rotationLabel(result.rotation)],
  ];

  return (
    <>
      <header className="page-intro"><h1 data-view-heading tabIndex={-1}>{result.name}</h1><p>Copy your generated proxy URLs or download the list.</p></header>
      <Card title="Generated result" footer={<button type="button" className="button" onClick={onBack}><span aria-hidden="true">← </span>Back to Proxy list</button>}>
        <dl className="result-summary">
          {summary.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
          <div><dt>Status</dt><dd className="result-ready">Ready</dd></div>
        </dl>
        <div className="result-actions">
          <button type="button" className="button button-primary" onClick={() => void copy(result.lines.join('\n'), 'All proxy lines copied.')}>Copy all lines</button>
          <button type="button" className="button" onClick={download}>Download .txt</button>
        </div>
        <ol className="result-lines" aria-label="Generated proxy lines">
          {result.lines.map((line, index) => (
            <li key={index}>
              <code tabIndex={0}>{line}</code>
              <button type="button" className="row-action" aria-label={`Copy proxy line ${index + 1}`}
                onClick={() => void copy(line, 'Proxy line copied.')}>Copy</button>
            </li>
          ))}
        </ol>
      </Card>
      <div className="toast-region" role="status" aria-atomic="true">
        {feedback && <p className={`toast${feedback.error ? ' toast-error' : ''}`}>{feedback.text}</p>}
      </div>
    </>
  );
}
