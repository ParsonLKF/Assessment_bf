'use client';

import { useEffect, useRef, useState } from 'react';
import { generateList } from '@/lib/api-client';
import { ConsoleShell } from './generator/console-shell';
import { ProxyGenerator } from './generator/proxy-generator';
import { ProxyList } from './generator/proxy-list';
import { ProxyResult } from './generator/proxy-result';
import type { ProxySnapshot, View } from './generator/types';
import { useGeneratorDraft } from './generator/use-generator-draft';
import { useTargetingLookups } from './generator/use-targeting-lookups';
import { apiErrorMessage } from '@/lib/api-errors';

export function Landing() {
  const [view, setView] = useState<View>('generator');
  const [lists, setLists] = useState<readonly ProxySnapshot[]>([]);
  const [selectedId, setSelectedId] = useState<number>();
  const [pending, setPending] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const submitting = useRef(false);
  const nextId = useRef(1);
  const content = useRef<HTMLDivElement>(null);
  const form = useGeneratorDraft();
  const { draft, step } = form;
  const lookups = useTargetingLookups(view === 'generator' && step === 1, form);
  const previousScreen = useRef({ view, step });
  const selected = lists.find((list) => list.id === selectedId);

  useEffect(() => {
    const previous = previousScreen.current;
    previousScreen.current = { view, step };
    if (previous.view !== view) content.current?.querySelector<HTMLElement>('[data-view-heading]')?.focus();
    else if (previous.step !== step) content.current?.querySelector<HTMLElement>('.card-head h2')?.focus();
  }, [view, step]);

  async function submit() {
    if (submitting.current) return;
    const validation = form.request();
    if (!validation.ok) {
      setSubmitError(Object.values(validation.errors)[0] ?? apiErrorMessage.request.invalidSettings);
      return;
    }
    submitting.current = true;
    setPending(true);
    setSubmitError('');

    try {
      const lines = await generateList(validation.value);
      if (lines.length === 0) {
        setSubmitError(apiErrorMessage.generation.empty);
        return;
      }
      const trimmedName = draft.name.trim();
      const filename = trimmedName.replace(/[^\p{L}\p{N}_-]+/gu, '-').replace(/^-+|-+$/g, '');
      const result: ProxySnapshot = {
        id: nextId.current++,
        name: trimmedName || 'Untitled list',
        filename: `${filename || 'residential-proxies'}.txt`,
        country: draft.country?.country_name ?? 'Any country',
        city: draft.city?.city_name ?? 'Any city',
        format: draft.format,
        rotation: draft.rotation,
        submittedAt: new Date().toISOString(),
        lines,
      };
      setLists((previous) => [result, ...previous]);
      setSelectedId(result.id);
      form.reset();
      lookups.resetQueries();
      setView('result');
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : apiErrorMessage.generation.failed);
    } finally {
      submitting.current = false;
      setPending(false);
    }
  }

  function navigate(destination: 'generator' | 'list') {
    lookups.resetQueries();
    setView(destination);
  }

  return (
    <ConsoleShell view={view} listCount={lists.length} onNavigate={navigate}>
      <div ref={content}>
        {view === 'generator' && <ProxyGenerator form={form} lookups={lookups} pending={pending} submitError={submitError} onSubmit={submit}
          onBack={() => { setSubmitError(''); form.back(); }} />}
        {view === 'list' && <ProxyList lists={lists} onGenerate={() => navigate('generator')} onOpen={(id) => {
          setSelectedId(id);
          setView('result');
        }} />}
        {view === 'result' && selected && <ProxyResult key={selected.id} result={selected} onBack={() => navigate('list')} />}
      </div>
    </ConsoleShell>
  );
}
