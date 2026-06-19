import AboutClient from './AboutClient';
import { generateDataOverview, generateStats, generateVersions } from '@/lib/about/aboutUtils';
import { getLocalDataManifest, getLocalEmojiDataResponse, getLocalSymbolDataResponse } from '@/lib/data/localData';

export default async function About() {
  const [symbolData, emojiData, manifest] = await Promise.all([
    getLocalSymbolDataResponse(),
    getLocalEmojiDataResponse(),
    getLocalDataManifest()
  ]);
  const stats = generateStats(
    symbolData.symbols,
    emojiData.symbols,
    symbolData.stats?.categoryStats || [],
    emojiData.stats?.categoryStats || []
  );
  const versions = generateVersions(symbolData.version, emojiData.version);
  const dataOverview = generateDataOverview(
    manifest,
    versions,
    symbolData.stats?.categoryStats || [],
    emojiData.stats?.categoryStats || []
  );

  return <AboutClient stats={stats} versions={versions} dataOverview={dataOverview} />;
}
