'use client';

import { DnaPageHeader } from '../dna-profile/dna-page-header';
import IndustryFilter from '../filters/industry-filter';

export function AIFilterPage() {
  return (
    <div className="space-y-6">
      {/* Standardized Header */}
      <DnaPageHeader 
        title="AI FILTER"
        description="AI-powered industry filtering and smart categorization for your bookmarks"
      />

      {/* Reuse existing Industry Filter component */}
      <IndustryFilter />
    </div>
  );
} 