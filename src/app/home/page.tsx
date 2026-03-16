import HomeClient from '@/components/HomeClient';
import { getLocalSymbolDataResponse } from '@/lib/data/localData';
import { shuffleArray } from '@/lib/core/symbolUtils';

// 开启 ISR (增量静态再生)，每小时随机打乱一次页面符号顺序
export const revalidate = 3600;

export default async function Home() {
  const data = await getLocalSymbolDataResponse();
  // 在服务端生成静态页面时进行随机打乱
  const shuffledSymbols = shuffleArray(data.symbols);
  
  return <HomeClient symbols={shuffledSymbols} categoryStats={data.stats?.categoryStats || []} />;
}
