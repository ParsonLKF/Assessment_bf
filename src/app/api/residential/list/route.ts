import { apiErrorResponse } from '@/lib/api-errors';
import { asns, cities } from '@/lib/lookup-fixtures';
import { buildProxyUrls } from '@/lib/proxy-builder';
import { validateListRequest } from '@/lib/validators';

export async function POST(request: Request) {
  let input: unknown;
  try {
    input = await request.json();
  } catch {
    return apiErrorResponse('invalid_parameter', 'Send a valid JSON request body.');
  }

  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return apiErrorResponse('invalid_parameter', 'Send a JSON object with the list settings.');
  }
  const validation = validateListRequest(input, { cities, asns });
  if (!validation.ok) {
    const { proxy_user_id, proxy_user_password } = validation.errors;
    const fields = input as Record<string, unknown>;
    if (proxy_user_id && (typeof fields.proxy_user_id !== 'string' || !fields.proxy_user_id.trim())) {
      return apiErrorResponse('missing_credentials', proxy_user_id);
    }
    if (proxy_user_password && (typeof fields.proxy_user_password !== 'string' || !fields.proxy_user_password.trim())) {
      return apiErrorResponse('missing_credentials', proxy_user_password);
    }
    return apiErrorResponse('invalid_parameter', Object.values(validation.errors)[0] ?? 'Check the list settings.');
  }

  try {
    return Response.json({ data: buildProxyUrls(validation.value), message: 'Residential list successfully generated.' }, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch {
    return apiErrorResponse('internal_server_error', 'Could not generate the proxy list. Try again.');
  }
}
