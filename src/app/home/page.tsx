import HomeClient from '@/components/HomeClient';
import { getLocalSymbolDataResponse, getPaginatedSymbols } from '@/lib/data/localData';
import { getHourlySeed, SYMBOL_PAGE_SIZE } from '@/lib/core/pagination';
import { CategoryStat, InitialCategoryData } from '@/lib/core/types';

// 开启 ISR (增量静态再生)，每小时重新生成页面
export const revalidate = 3600;

export default async function Home() {
  const data = await getLocalSymbolDataResponse();
  const initialSeed = getHourlySeed();
  const initialData = await getPaginatedSymbols({
    page: 1,
    limit: SYMBOL_PAGE_SIZE,
    seed: initialSeed
  });
  const stats = data.stats?.categoryStats ?? [];

  // 在服务端预计算分类列表，避免客户端 useMemo 依赖问题
  const totalCount = data.stats?.totalSymbols ?? 0;
  const categories: CategoryStat[] = [
    { id: 'all', name: '全部', count: totalCount },
    ...stats
  ];
  const initialCategoryData: InitialCategoryData = Object.fromEntries(
    await Promise.all(
      stats.map(async (category) => [
        category.id,
        await getPaginatedSymbols({
          page: 1,
          limit: SYMBOL_PAGE_SIZE,
          category: category.id
        })
      ])
    )
  );

  return (
    <HomeClient
      key="symbols"
      apiEndpoint="/api/symbols"
      categories={categories}
      initialData={initialData}
      initialCategoryData={initialCategoryData}
      initialSeed={initialSeed}
    />
  );
}
