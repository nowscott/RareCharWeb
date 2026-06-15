import HomeClient from '@/components/HomeClient';
import { getLocalSymbolDataResponse } from '@/lib/data/localData';

// 开启 ISR (增量静态再生)，每小时重新生成页面
export const revalidate = 3600;

export default async function Home() {
  const data = await getLocalSymbolDataResponse();

  return (
    <HomeClient
      apiEndpoint="/api/symbols"
      categoryStats={data.stats?.categoryStats || []}
    />
  );
}
