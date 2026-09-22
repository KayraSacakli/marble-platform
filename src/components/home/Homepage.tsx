import type { HomepageContent, HomepageSection } from '@/types/api';
import { HeroSection } from './Hero/HeroSection';
import { FeaturedProductsSection } from './FeaturedProductsSection';
import { CollectionsSection } from './CollectionsSection';
import { ApplicationsSection } from './ApplicationsSection';
import { ProjectsSection } from './ProjectsSection';
import { JournalSection } from './JournalSection';
import { HomepageCTA } from './HomepageCTA';

interface HomepageProps {
  data: HomepageContent;
}

function renderSection(section: HomepageSection) {
  switch (section.type) {
    case 'featured_products':
      return (
        <FeaturedProductsSection
          key={section.type}
          heading={section.heading}
          products={section.products}
        />
      );
    case 'featured_collections':
      return (
        <CollectionsSection
          key={section.type}
          heading={section.heading}
          collections={section.collections}
        />
      );
    case 'featured_applications':
      return (
        <ApplicationsSection
          key={section.type}
          heading={section.heading}
          applications={section.applications}
        />
      );
    case 'featured_projects':
      return (
        <ProjectsSection
          key={section.type}
          heading={section.heading}
          projects={section.projects}
        />
      );
    case 'featured_journal':
      return (
        <JournalSection
          key={section.type}
          heading={section.heading}
          articles={section.articles}
        />
      );
    case 'final_cta':
      return (
        <HomepageCTA
          key={section.type}
          heading={section.heading}
          message={section.message}
          primaryCTA={section.primaryCTA}
          secondaryCTA={section.secondaryCTA}
        />
      );
    case 'quarry_factory':
      return null;
    default:
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[Homepage] Unknown section type: ${(section as { type: string }).type}`);
      }
      return null;
  }
}

export function Homepage({ data }: HomepageProps) {
  const orderedSections = data.sectionOrder
    .map((sectionType) => data.sections.find((s) => s.type === sectionType))
    .filter((section): section is HomepageSection => section !== undefined);

  const allSections = orderedSections.length > 0 ? orderedSections : data.sections;

  return (
    <>
      <HeroSection hero={data.hero} />
      {allSections.map((section) => renderSection(section))}
    </>
  );
}
