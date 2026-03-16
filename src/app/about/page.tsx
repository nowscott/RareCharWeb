import AboutClient from './AboutClient';
import { generateStats, generateVersions } from '@/lib/about/aboutUtils';
import { getLocalEmojiDataResponse, getLocalSymbolDataResponse } from '@/lib/data/localData';

export default async function About() {
  const [symbolData, emojiData] = await Promise.all([getLocalSymbolDataResponse(), getLocalEmojiDataResponse()]);
  const stats = generateStats(
    symbolData.symbols,
    emojiData.symbols,
    symbolData.stats?.categoryStats || [],
    emojiData.stats?.categoryStats || []
  );
  const versions = generateVersions(symbolData.version, emojiData.version);
  return <AboutClient stats={stats} versions={versions} />;
}
