import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { calculateCategoryStats } from '@/lib/core/apiUtils';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const filePath = join(process.cwd(), 'public', 'data', 'data.json');
    const raw = await readFile(filePath, 'utf8');
    const data = JSON.parse(raw);

    if (!data?.symbols || !Array.isArray(data.symbols)) {
      return Response.json({ error: 'No symbols data available' }, { status: 503 });
    }

    const categoryStats = calculateCategoryStats(data.symbols);
    const processedData = {
      ...data,
      symbols: data.symbols,
      stats: {
        totalSymbols: data.symbols.length,
        categoryStats
      }
    };

    return Response.json(processedData);
  } catch (error) {
    console.error('Symbols API route error:', error);
    return Response.json({ error: 'Failed to fetch symbols data' }, { status: 500 });
  }
}
