import { getLocalSymbolDataResponse } from '@/lib/data/localData';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const data = await getLocalSymbolDataResponse();
    return Response.json(data);
  } catch (error) {
    console.error('Symbols API route error:', error);
    return Response.json({ error: 'Failed to fetch symbols data' }, { status: 500 });
  }
}
