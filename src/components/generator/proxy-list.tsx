import { Card } from '@/components/ui/card';
import { ProxyListTable } from './proxy-list-table';
import type { ProxySnapshot } from './types';

export function ProxyList({ lists, onOpen, onGenerate }: {
  lists: readonly ProxySnapshot[];
  onOpen: (id: number) => void;
  onGenerate: () => void;
}) {
  return (
    <>
      <header className="page-intro"><h1 data-view-heading tabIndex={-1}>Proxy list</h1><p>Proxy lists generated in this page session.</p></header>
      <Card title="History of submitted proxy lists" compact={lists.length > 0}>
        {lists.length > 0 ? <ProxyListTable lists={lists} onOpen={onOpen} /> : (
          <div className="empty-history">
            <p>No proxy lists have been generated yet.</p>
            <button type="button" className="button button-primary" onClick={onGenerate}>Go to proxy generator</button>
          </div>
        )}
      </Card>
    </>
  );
}
