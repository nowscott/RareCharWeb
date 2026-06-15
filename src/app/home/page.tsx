import HomeClient from '@/components/HomeClient';
import { getLocalSymbolDataResponse } from '@/lib/data/localData';
import { CategoryStat } from '@/lib/core/types';

// 开启 ISR (增量静态再生)，每小时重新生成页面
export const revalidate = 3600;

export default async function Home() {
  const data = await getLocalSymbolDataResponse();
  const stats = data.stats?.categoryStats ?? [];

  // 在服务端预计算分类列表，避免客户端 useMemo 依赖问题
  const totalCount = stats.reduce((sum, c) => sum + c.count, 0);
  const categories: CategoryStat[] = [
    { id: 'all', name: '全部', count: totalCount },
    ...stats
  ];

  return (
    <HomeClient
      apiEndpoint="/api/symbols"
      categories={categories}
    />
  );
}
