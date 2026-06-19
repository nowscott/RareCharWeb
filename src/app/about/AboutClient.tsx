'use client';

import { NavigationButtons } from '@/components/navigation';
import { LiquidGlassSurface } from '@/components/ui/LiquidGlassSurface';
import { aboutConfig } from '@/lib/about/aboutConfig';
import { AboutDataOverview } from '@/lib/about/aboutUtils';
import { useBackdoorClick, clearCacheAndReload } from '@/lib/about/backdoor';
import {
  DataOverviewSection,
  FeaturesSection,
  InstructionsSection,
  ContactSection,
  ProjectsSection,
  FooterSection
} from '@/components/about';

interface AboutClientProps {
  dataOverview: AboutDataOverview;
}

export default function AboutClient({ dataOverview }: AboutClientProps) {
  const handleVersionClick = useBackdoorClick(clearCacheAndReload);

  return (
    <div className="liquid-page py-4 sm:py-8 px-4">
      <div className="liquid-shell max-w-6xl mx-auto">
        <nav className="mb-6 sm:mb-8 liquid-header">
          <LiquidGlassSurface variant="panel" className="p-4 sm:p-5">
            <div className="flex justify-between items-start gap-4 sm:items-center">
              <div className="flex min-w-0 flex-col">
                <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2 text-gray-950 dark:text-white">{aboutConfig.pageTitle}</h1>
                <p className="text-sm sm:text-base liquid-text-muted">{aboutConfig.pageDescription}</p>
              </div>
              <div className="-mt-1 flex shrink-0 flex-wrap justify-end gap-2 sm:mt-0 sm:gap-3">
                <NavigationButtons />
              </div>
            </div>
          </LiquidGlassSurface>
        </nav>

        <DataOverviewSection overview={dataOverview} />

        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
          <FeaturesSection />
          <InstructionsSection />
        </div>

        <div className="grid grid-cols-1 gap-6 sm:gap-8 mb-6 sm:mb-8">
          <ContactSection />
        </div>

        <div className="grid grid-cols-1 gap-6 sm:gap-8 mb-6 sm:mb-8">
          <ProjectsSection />
        </div>

        <FooterSection onVersionClick={handleVersionClick} />
      </div>
    </div>
  );
}
