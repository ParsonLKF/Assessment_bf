import { rotationLabel } from '@/lib/list-rules';
import type { ProxySnapshot } from './types';

const submittedFormat = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' });

export function ProxyListTable({ lists, onOpen }: { lists: readonly ProxySnapshot[]; onOpen: (id: number) => void }) {
  return (
    <div className="table-scroll" role="region" aria-label="Submitted proxy lists" tabIndex={0}>
      <table className="proxy-table">
        <thead><tr>
          {['Proxy list', 'Country', 'City', 'Quantity', 'Rotation', 'Status', 'Submitted'].map((label) => <th key={label} scope="col">{label}</th>)}
          <th scope="col"><span className="sr-only">Actions</span></th>
        </tr></thead>
        <tbody>
          {lists.map((list) => (
            <tr key={list.id} tabIndex={0} onClick={() => onOpen(list.id)} onKeyDown={(event) => {
              if (event.target !== event.currentTarget || !['Enter', ' '].includes(event.key)) return;
              event.preventDefault();
              onOpen(list.id);
            }}>
              <th scope="row">{list.name}</th>
              <td>{list.country}</td>
              <td>{list.city}</td>
              <td>{list.lines.length}</td>
              <td>{rotationLabel(list.rotation)}</td>
              <td><span className="status-chip">Ready</span></td>
              <td><time dateTime={list.submittedAt}>{submittedFormat.format(new Date(list.submittedAt))}</time></td>
              <td><button className="row-action" type="button" aria-label={`View ${list.name}`} onClick={(event) => {
                event.stopPropagation();
                onOpen(list.id);
              }}>View</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
