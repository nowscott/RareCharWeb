import AboutClient from './AboutClient';
import { generateDataOverview } from '@/lib/about/aboutUtils';
import { getLocalDataManifest } from '@/lib/data/localData';

export default async function About() {
  const manifest = await getLocalDataManifest();
  const dataOverview = generateDataOverview(manifest);

  return <AboutClient dataOverview={dataOverview} />;
}
