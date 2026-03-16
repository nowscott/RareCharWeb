import HomeClient from '@/components/HomeClient';
import { getLocalSymbolDataResponse } from '@/lib/data/localData';

export default async function Home() {
  const data = await getLocalSymbolDataResponse();
  return <HomeClient symbols={data.symbols} categoryStats={data.stats?.categoryStats || []} />;
}
