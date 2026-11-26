import assert from 'node:assert/strict';
import { beforeEach, test } from 'node:test';
import { GET as lookup } from '../src/app/api/lookup/[resource]/route.ts';
import { POST as generate } from '../src/app/api/residential/list/route.ts';
import { buildBytefulSearchUrl } from '../src/lib/byteful-api-client.ts';
import { buildProxyUrls } from '../src/lib/proxy-builder.ts';
import { validateListRequest } from '../src/lib/validators.ts';

const credentials = { proxy_user_id: 'demo@user', proxy_user_password: 'p:a#%' };
const keys = { BYTEFUL_PUBLIC_KEY: 'test-public', BYTEFUL_PRIVATE_KEY: 'test-private' };

beforeEach((t) => {
  for (const [name, value] of Object.entries(keys)) {
    const previous = process.env[name];
    process.env[name] = value;
    t.after(() => {
      if (previous === undefined) delete process.env[name];
      else process.env[name] = previous;
    });
  }
  t.mock.method(console, 'info', () => {});
  t.mock.method(console, 'error', () => {});
  t.mock.method(globalThis, 'fetch', () => {
    assert.fail('Unexpected network request');
  });
});

function get(resource, query = '') {
  return lookup(new Request(`http://localhost/api/lookup/${resource}${query}`), {
    params: Promise.resolve({ resource }),
  });
}

function post(body) {
  return generate(new Request('http://localhost/api/residential/list', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  }));
}

async function assertError(response, status, code) {
  assert.equal(response.status, status);
  const body = await response.json();
  assert.deepEqual(Object.keys(body).sort(), ['error', 'message']);
  assert.equal(body.error, code);
  assert.equal(typeof body.message, 'string');
  assert.ok(body.message.length);
}

test('validation applies defaults and accepts counts from 1 through 1000', () => {
  const result = validateListRequest(credentials);
  assert.equal(result.ok, true);
  assert.equal(result.value.list_count, 100);
  assert.equal(result.value.list_format, 'http');
  assert.equal(result.value.list_session_type, 'sticky');
  for (const list_count of [1, 1000]) {
    assert.equal(validateListRequest({ ...credentials, list_count }).ok, true);
  }
  for (const list_count of [0, 1001, 1.5, '2', null]) {
    assert.ok(validateListRequest({ ...credentials, list_count }).errors.list_count);
  }
});

test('validation rejects whitespace in either credential and invalid targeting', () => {
  for (const value of ['', ' demo', 'demo ', 'demo user', 'demo\tuser']) {
    assert.ok(validateListRequest({ ...credentials, proxy_user_id: value }).errors.proxy_user_id);
    assert.ok(validateListRequest({ ...credentials, proxy_user_password: value }).errors.proxy_user_password);
  }
  assert.ok(validateListRequest({ ...credentials, city_alias: 'london' }).errors.city_alias);
  assert.ok(validateListRequest({ ...credentials, asn_id: '5089' }).errors.asn_id);
});

test('generation accepts assigned lowercase country codes or an omitted country', async () => {
  for (const country_id of [undefined, 'gb', 'us', 'ax']) {
    const response = await post(JSON.stringify({ ...credentials, country_id, list_count: 1 }));
    assert.equal(response.status, 200);
  }
  for (const country_id of ['GB', 'uk', 'zz', null]) {
    const response = await post(JSON.stringify({ ...credentials, country_id }));
    await assertError(response, 400, 'invalid_parameter');
  }
});

test('sticky proxy URLs encode credentials and have distinct 16-character sessions', () => {
  const result = validateListRequest(credentials);
  assert.equal(result.ok, true);
  const urls = buildProxyUrls(result.value);
  assert.equal(urls.length, 100);
  assert.equal(new Set(urls).size, 100);
  for (const url of urls) {
    assert.match(url, /^http:\/\/demo%40user_s_[A-Z0-9]{16}:p%3Aa%23%25@residential\.byteful\.com:8000$/);
  }
});

test('generation accepts combined targeting and returns identical rotating URLs', async () => {
  const response = await post(JSON.stringify({
    ...credentials,
    country_id: 'gb',
    city_alias: 'london',
    asn_id: 5089,
    list_count: 2,
    list_format: 'socks5h',
    list_session_type: 'rotating',
  }));
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
  const expected = 'socks5h://demo%40user_c_gb_city_london_asn_5089:p%3Aa%23%25@residential.byteful.com:8000';
  const body = await response.json();
  assert.deepEqual(body.data, [expected, expected]);
  assert.equal(typeof body.message, 'string');
});

test('generation returns the API error contract for invalid requests', async () => {
  await assertError(await post('{'), 400, 'invalid_parameter');
  await assertError(await post('[]'), 400, 'invalid_parameter');
  await assertError(await post('{}'), 400, 'missing_credentials');
  await assertError(await post(JSON.stringify({ ...credentials, list_count: 1001 })), 400, 'invalid_parameter');
});

test('Byteful search encodes name wildcards once and matches numeric ASN IDs exactly', () => {
  const country = buildBytefulSearchUrl('country', { query: 'United' });
  assert.match(country, /[?&]like_country_name=%25United%25$/);
  const city = buildBytefulSearchUrl('city', { countryId: 'gb', query: 'London' });
  assert.match(city, /[?&]like_subdivision_id=gb%25&like_city_name=%25London%25$/);
  const asnName = buildBytefulSearchUrl('asn', { countryId: 'gb', query: 'Virgin' });
  assert.match(asnName, /[?&]country_id=gb&like_asn_name=%25Virgin%25$/);
  const asnId = new URL(buildBytefulSearchUrl('asn', { query: '5089' }));
  assert.equal(asnId.searchParams.get('asn_id'), '5089');
  assert.equal(asnId.searchParams.has('like_asn_name'), false);
});

test('lookup sends authentication headers and normalizes paginated city results', async (t) => {
  const fetch = t.mock.method(globalThis, 'fetch', (url, init) => {
    const upstream = new URL(url);
    assert.equal(upstream.origin, 'https://api.byteful.com');
    assert.equal(upstream.pathname, '/1.0/public/user/city/search');
    assert.equal(upstream.searchParams.get('page'), '2');
    assert.equal(upstream.searchParams.get('like_subdivision_id'), 'gb%');
    assert.equal(upstream.searchParams.get('like_city_name'), '%London%');
    assert.equal(init.headers['X-API-Public-Key'], keys.BYTEFUL_PUBLIC_KEY);
    assert.equal(init.headers['X-API-Private-Key'], keys.BYTEFUL_PRIVATE_KEY);
    return Response.json({
      page: 2,
      per_page: 1,
      total_count: 3,
      data: [{ city_name: 'London', city_alias: 'london', subdivision_id: 'gb-eng' }],
    });
  });
  const response = await get('cities', '?country_id=GB&q=London&page=2');
  assert.equal(fetch.mock.callCount(), 1);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('X-Current-Page'), '2');
  assert.equal(response.headers.get('X-Per-Page'), '1');
  assert.equal(response.headers.get('X-Next-Page'), '3');
  assert.deepEqual(await response.json(), {
    data: [{ city_name: 'London', city_alias: 'london', country_id: 'gb' }],
  });
  assert.equal(response.headers.has('X-API-Private-Key'), false);
});

test('lookup returns an empty array with no next-page header', async (t) => {
  t.mock.method(globalThis, 'fetch', () => Response.json({ data: [], page: 1, per_page: 100, total_count: 0 }));
  const response = await get('countries');
  assert.equal(response.status, 200);
  assert.equal(response.headers.has('X-Next-Page'), false);
  assert.deepEqual(await response.json(), { data: [] });
});

test('lookup rejects invalid parameters and reports missing keys without calling Byteful', async () => {
  await assertError(await get('not-a-resource'), 404, 'not_found');
  await assertError(await get('cities'), 400, 'invalid_parameter');
  await assertError(await get('asns', '?country_id=123'), 400, 'invalid_parameter');
  await assertError(await get('countries', '?q=&page=1'), 400, 'invalid_parameter');
  await assertError(await get('countries', '?page=0'), 400, 'invalid_parameter');
  delete process.env.BYTEFUL_PRIVATE_KEY;
  await assertError(await get('countries'), 503, 'missing_api_keys');
  assert.equal(globalThis.fetch.mock.callCount(), 0);
});

test('lookup forwards upstream rate limits and Retry-After', async (t) => {
  t.mock.method(globalThis, 'fetch', () => new Response(null, {
    status: 429, headers: { 'Retry-After': '3' },
  }));
  const response = await get('countries');
  assert.equal(response.headers.get('Retry-After'), '3');
  await assertError(response, 429, 'rate_limited');
});

test('lookup maps malformed upstream data to a structured 502 error', async (t) => {
  t.mock.method(globalThis, 'fetch', () => Response.json({ data: 'invalid' }));
  await assertError(await get('countries'), 502, 'upstream_failure');
});
