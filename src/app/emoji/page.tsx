import HomeClient from '@/components/HomeClient';
import { getLocalEmojiDataResponse } from '@/lib/data/localData';

export const dynamic = 'force-dynamic';

export default async function EmojiPage() {
  const data = await getLocalEmojiDataResponse();
  
  return (
    <HomeClient
      symbols={data.symbols}
      categoryStats={data.stats?.categoryStats || []}
      pageTitle="Emoji"
      pageDescription="探索丰富的Emoji世界，找到完美的表达方式"
    />
  );
}
