'use client';

import { NavigationButtons } from '@/components/navigation';
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 sm:py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <nav className="mb-6 sm:mb-8 flex justify-between items-center">
          <div className="flex flex-col">
            <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">{aboutConfig.pageTitle}</h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">{aboutConfig.pageDescription}</p>
          </div>
          <div className="flex space-x-2 sm:space-x-4">
            <NavigationButtons />
          </div>
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
