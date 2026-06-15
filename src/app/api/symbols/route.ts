import { getPaginatedSymbols } from '@/lib/data/localData';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(500, Math.max(1, parseInt(searchParams.get('limit') || '200', 10)));
    const seed = searchParams.get('seed') ? parseInt(searchParams.get('seed')!, 10) : undefined;
    const category = searchParams.get('category') || undefined;
    const search = searchParams.get('search') || undefined;

    const data = await getPaginatedSymbols({ page, limit, seed, category, search });
    return Response.json(data);
  } catch (error) {
    console.error('Symbols API route error:', error);
    return Response.json({ error: 'Failed to fetch symbols data' }, { status: 500 });
  }
}
