import { randomInt } from 'node:crypto';
import type { ListRequest } from './list-rules';

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

export function buildProxyUrls(request: ListRequest) {
  let username = request.proxy_user_id;
  if (request.country_id) username += `_c_${request.country_id}`;
  if (request.city_alias) username += `_city_${request.city_alias}`;
  if (request.asn_id !== undefined) username += `_asn_${request.asn_id}`;
  const password = encodeURIComponent(request.proxy_user_password);
  const url = (user: string) => `${request.list_format}://${encodeURIComponent(user)}:${password}@residential.byteful.com:8000`;
  if (request.list_session_type === 'rotating') return Array<string>(request.list_count).fill(url(username));

  const sessions = new Set<string>();
  while (sessions.size < request.list_count) {
    const id = Array.from({ length: 16 }, () => alphabet[randomInt(alphabet.length)]).join('');
    sessions.add(id);
  }
  return Array.from(sessions, (id) => url(`${username}_s_${id}`));
}
