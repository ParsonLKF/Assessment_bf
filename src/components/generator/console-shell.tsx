import Image from 'next/image';
import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import lightLogo from '@/assets/ping_logo_b83f7f9c6b.webp';
import darkLogo from '@/assets/byteful-white-logo.png';
import { Icon } from '@/components/ui/icon';
import type { View } from './types';

type Destination = Exclude<View, 'result'>;
type Navigation = { view: View; listCount: number; theme: 'light' | 'dark'; onNavigate: (view: Destination) => void };

function Rail({ view, listCount, theme, onNavigate }: Navigation) {
  return (
    <div className="console-rail">
      <div className="brand"><Image src={theme === 'light' ? lightLogo : darkLogo} alt="Byteful" width={120} priority /></div>
      <p className="rail-title">Tool</p>
      <nav className="console-nav" aria-label="Tool">
        <button type="button" aria-current={view === 'generator' ? 'page' : undefined} onClick={() => onNavigate('generator')}>
          <Icon name="generator" /> Proxy generator
        </button>
        <button type="button" aria-current={view !== 'generator' ? 'page' : undefined} onClick={() => onNavigate('list')}>
          <Icon name="list" /> Proxy list <span className="rail-count" aria-label={`${listCount} saved lists`}>{listCount}</span>
        </button>
      </nav>
      <div className="rail-note"><strong>Tool workspace</strong><p>Generated lists stay in this page session.</p></div>
    </div>
  );
}

export function ConsoleShell({ view, listCount, onNavigate, children }: Omit<Navigation, 'theme'> & { children: ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawer = useRef<HTMLDialogElement>(null);
  const menuId = useId();

  useEffect(() => {
    const desktop = window.matchMedia('(width > 720px)');
    const closeOnDesktop = (event: MediaQueryListEvent) => { if (event.matches) drawer.current?.close(); };
    desktop.addEventListener('change', closeOnDesktop);
    return () => desktop.removeEventListener('change', closeOnDesktop);
  }, []);

  const activePage = view === 'generator' ? 'Create access' : view === 'list' ? 'Proxy list' : 'List details';

  return (
    <div className="console" data-theme={theme}>
      <aside className="desktop-rail"><Rail view={view} listCount={listCount} theme={theme} onNavigate={onNavigate} /></aside>
      <dialog id={menuId} ref={drawer} className="mobile-drawer" aria-label="Tool navigation" onClose={() => setDrawerOpen(false)}
        onClick={(event) => { if (event.target === event.currentTarget) drawer.current?.close(); }}>
        <div className="drawer-panel">
          <button type="button" className="icon-button drawer-close" aria-label="Close navigation" onClick={() => drawer.current?.close()}><Icon name="close" /></button>
          <Rail view={view} listCount={listCount} theme={theme} onNavigate={(destination) => {
            drawer.current?.close();
            onNavigate(destination);
          }} />
        </div>
      </dialog>
      <main className="console-main">
        <header className="console-top">
          <button type="button" className="icon-button menu-toggle" aria-label="Open navigation" aria-haspopup="dialog" aria-controls={menuId}
            aria-expanded={drawerOpen} onClick={() => {
              drawer.current?.showModal();
              setDrawerOpen(true);
            }}><Icon name="menu" /></button>
          <p className="breadcrumb">Workspace <span aria-hidden="true">/</span> <strong>{activePage}</strong></p>
          <button type="button" className="icon-button theme-toggle" aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}><Icon name={theme === 'light' ? 'moon' : 'sun'} /></button>
        </header>
        <div className="console-content">{children}</div>
      </main>
    </div>
  );
}
