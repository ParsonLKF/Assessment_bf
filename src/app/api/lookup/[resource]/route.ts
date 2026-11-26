import { apiErrorMessage, apiErrorResponse } from '@/lib/api-errors';
import { bytefulErrorResponse, lookupResponse, searchByteful } from '@/lib/byteful-api-client';

const lookupResources = { countries: 'country', cities: 'city', asns: 'asn' } as const;
type ResourceName = keyof typeof lookupResources;

export async function GET(request: Request, context: { params: Promise<{ resource: string }> }) {
  const { resource } = await context.params;
  if (!(resource in lookupResources)) return apiErrorResponse('not_found', apiErrorMessage.request.unknownLookup);
  const name = resource as ResourceName;
  const params = new URL(request.url).searchParams;
  const countryId = params.get('country_id')?.trim().toLowerCase();
  const query = params.get('q')?.trim();
  const page = Number(params.get('page') ?? '1');

  console.info('[lookup-route] request', {
    resource: name,
    countryId: countryId ?? undefined,
    query: query || undefined,
    page,
  });

  if (name !== 'countries' && countryId && !/^[a-z]{2}$/.test(countryId)) {
    return apiErrorResponse('invalid_parameter', apiErrorMessage.request.invalidCountry);
  }
  if (name === 'cities' && !countryId) return apiErrorResponse('invalid_parameter', apiErrorMessage.request.countryRequired);
  if (params.has('q') && (!query || query.length > 80)) return apiErrorResponse('invalid_parameter', apiErrorMessage.request.invalidSearch);
  if (!Number.isSafeInteger(page) || page < 1) return apiErrorResponse('invalid_parameter', apiErrorMessage.request.invalidPage);

  try {
    const result = await searchByteful(lookupResources[name], { countryId, query: query || undefined, page }, request.signal);
    return lookupResponse(result);
  } catch (error) {
    console.error('[lookup-route] failed', {
      resource: name,
      countryId: countryId ?? undefined,
      page,
      error: error instanceof Error ? error.message : apiErrorMessage.lookup.failed,
    });
    return bytefulErrorResponse(error);
  }
}
