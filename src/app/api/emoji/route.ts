import { getLocalEmojiDataResponse } from '@/lib/data/localData';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const data = await getLocalEmojiDataResponse();
    return Response.json(data);
  } catch (error) {
    console.error('Emoji API route error:', error);
    return Response.json({ error: 'Failed to fetch emoji data' }, { status: 500 });
  }
}
