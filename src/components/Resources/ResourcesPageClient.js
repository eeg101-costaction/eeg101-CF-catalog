"use client";

import React, { useState, useMemo } from "react";
import SearchBar from "@/components/ui/SearchBar";
import { FilterSidebar } from "./FilterSidebar";
import { ResourceCard } from "./ResourceCard";
import { matchesFilters } from "@/lib/filterUtils";

/**
 * Filter resources based on active filters
 */
function filterResources(resources, activeFilters) {
  return resources.filter((resource) =>
    matchesFilters(resource, activeFilters),
  );
}

export function ResourcesPageClient({ initialResources }) {
  const [activeFilters, setActiveFilters] = useState({
    frameworkSections: [],
    types: [],
    languages: [],
  });

  const [searchQuery, setSearchQuery] = useState("");

  // Apply filters to resources
  const filteredResources = useMemo(() => {
    // First apply category filters
    let results = filterResources(initialResources, activeFilters);

    // Then apply search query
    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      results = results.filter((resource) => {
        const titleMatch = resource.title?.toLowerCase().includes(lowerQuery);
        const creatorsMatch = resource.creators
          ?.toLowerCase()
          .includes(lowerQuery);
        const abstractMatch = resource.abstract
          ?.toLowerCase()
          .includes(lowerQuery);

        return titleMatch || creatorsMatch || abstractMatch;
      });
    }

    return results;
  }, [initialResources, activeFilters, searchQuery]);

  // Format count display
  const resultCount = filteredResources.length;
  const resultText =
    resultCount > 99
      ? "+99 results"
      : `${resultCount} result${resultCount !== 1 ? "s" : ""}`;

  return (
    <div className="flex flex-col mx-auto px-4 md:px-8 gap-24">
      {/* Search Bar */}
      <div className="mb-6">
        <SearchBar resources={initialResources} onSearch={setSearchQuery} />
      </div>
      <div className="flex flex-col lg:flex-row gap-16">
        {/* Left Sidebar - Filters */}
        <aside className="w-full lg:w-74 flex-shrink-0">
          <div className="lg:sticky lg:top-32 lg:max-h-[calc(100vh)]">
            {/* Filter Header */}
            <div className="flex justify-between items-center mb-6">
              <h2
                className="font-semibold text-text-primary mb-1"
                style={{ fontSize: "var(--font-size-h4)" }}
              >
                Resources filters
              </h2>
              <p
                className="text-text-tertiary"
                style={{ fontSize: "var(--font-size-small)" }}
              >
                {resultText}
              </p>
            </div>

            {/* Filter Sidebar - Scrollable Container */}
            <div
              className="overflow-y-auto filter-sidebar-scroll"
              style={{
                maxHeight: "calc(100vh - 12rem)",
                overscrollBehavior: "contain",
                scrollBehavior: "smooth",
                WebkitOverflowScrolling: "touch",
                touchAction: "pan-y",
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            >
              <FilterSidebar
                resources={initialResources}
                activeFilters={activeFilters}
                onFilterChange={setActiveFilters}
              />
            </div>
          </div>
        </aside>

        {/* Main Content - Resources Grid */}
        <main className="flex-1 min-w-0">
          {/* Resources Grid */}
          <div
            className="grid gap-8"
            style={{
              gridTemplateColumns:
                "repeat(auto-fill, minmax(min(100%, 400px), 1fr))",
            }}
          >
            {filteredResources.length > 0 ? (
              filteredResources.map((resource) => (
                <ResourceCard key={resource.id} resource={resource} />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p
                  className="text-text-secondary"
                  style={{ fontSize: "var(--font-size-body)" }}
                >
                  No resources found matching the selected filters.
                </p>
                <button
                  onClick={() =>
                    setActiveFilters({
                      frameworkSections: [],
                      types: [],
                      languages: [],
                    })
                  }
                  className="mt-4 text-text-link underline hover:text-text-primary transition-colors"
                  style={{ fontSize: "var(--font-size-small)" }}
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
