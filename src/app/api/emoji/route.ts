import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { calculateCategoryStats } from '@/lib/core/apiUtils';
import { EmojiData } from '@/lib/core/types';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const filePath = join(process.cwd(), 'public', 'data', 'emoji-data.json');
    const raw = await readFile(filePath, 'utf8');
    const data = JSON.parse(raw);

    if (!data?.emojis || !Array.isArray(data.emojis)) {
      return Response.json({ error: 'No emoji data available' }, { status: 503 });
    }

    const symbols = data.emojis.map((emoji: EmojiData) => ({
      symbol: emoji.emoji,
      name: emoji.name,
      pronunciation: '',
      category: [emoji.category],
      searchTerms: emoji.keywords || [],
      notes: emoji.text || ''
    }));

    const categoryStats = calculateCategoryStats(symbols);
    const processedData = {
      ...data,
      symbols,
      stats: {
        totalSymbols: symbols.length,
        categoryStats
      }
    };

    return Response.json(processedData);
  } catch (error) {
    console.error('Emoji API route error:', error);
    return Response.json({ error: 'Failed to fetch emoji data' }, { status: 500 });
  }
}
