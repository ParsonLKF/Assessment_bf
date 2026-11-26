import { apiErrorResponse } from '@/lib/api-errors';
import { countries, fixtureAsns, fixtureCities } from '@/lib/lookup-fixtures';

export async function GET(request: Request, context: { params: Promise<{ resource: string }> }) {
  const { resource } = await context.params;
  const query = new URL(request.url).searchParams;
  const country = query.get('country_id') ?? '';
  const term = query.get('q') ?? '';

  switch (resource) {
    case 'countries':
      return Response.json({ data: countries });
    case 'cities':
      if (!/^[a-z]{2}$/.test(country)) return apiErrorResponse('invalid_parameter', 'Choose a country before searching for cities.');
      return Response.json({ data: fixtureCities(country, term) });
    case 'asns':
      if (country && !/^[a-z]{2}$/.test(country)) return apiErrorResponse('invalid_parameter', 'Use a lowercase two-letter country code.');
      return Response.json({ data: fixtureAsns(country, term) });
    default:
      return apiErrorResponse('not_found', 'This lookup does not exist.');
  }
}
