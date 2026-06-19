import HomeClient from '@/components/HomeClient';
import { getLocalEmojiDataResponse, getPaginatedEmoji } from '@/lib/data/localData';
import { getHourlySeed, SYMBOL_PAGE_SIZE } from '@/lib/core/pagination';
import { CategoryStat, InitialCategoryData } from '@/lib/core/types';

// 开启 ISR (增量静态再生)，每小时重新生成页面
export const revalidate = 3600;

export default async function EmojiPage() {
  const data = await getLocalEmojiDataResponse();
  const initialSeed = getHourlySeed();
  const initialData = await getPaginatedEmoji({
    page: 1,
    limit: SYMBOL_PAGE_SIZE,
    seed: initialSeed
  });
  const stats = data.stats?.categoryStats ?? [];

  // 在服务端预计算分类列表
  const totalCount = data.stats?.totalSymbols ?? 0;
  const categories: CategoryStat[] = [
    { id: 'all', name: '全部', count: totalCount },
    ...stats
  ];
  const initialCategoryData: InitialCategoryData = Object.fromEntries(
    await Promise.all(
      stats.map(async (category) => [
        category.id,
        await getPaginatedEmoji({
          page: 1,
          limit: SYMBOL_PAGE_SIZE,
          category: category.id
        })
      ])
    )
  );

  return (
    <HomeClient
      apiEndpoint="/api/emoji"
      categories={categories}
      initialData={initialData}
      initialCategoryData={initialCategoryData}
      initialSeed={initialSeed}
      pageTitle="Emoji"
      pageDescription="探索丰富的Emoji世界，找到完美的表达方式"
    />
  );
}
