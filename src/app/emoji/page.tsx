import HomeClient from '@/components/HomeClient';
import { getLocalEmojiDataResponse } from '@/lib/data/localData';

// 开启 ISR (增量静态再生)，每小时重新生成页面
export const revalidate = 3600;

export default async function EmojiPage() {
  const data = await getLocalEmojiDataResponse();

  return (
    <HomeClient
      apiEndpoint="/api/emoji"
      categoryStats={data.stats?.categoryStats || []}
      pageTitle="Emoji"
      pageDescription="探索丰富的Emoji世界，找到完美的表达方式"
    />
  );
}
