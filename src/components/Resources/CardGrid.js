import React from "react";
import SearchBar from "@/components/ui/SearchBar";
import { ResourceCard } from "./ResourceCard";
import Link from "next/link";

export function ResourceCardGrid({ resources, meta }) {
  const { page = 1, totalPages = 1 } = meta || {};

  return (
    <div>
      <SearchBar resources={resources} />
      <div
        className="grid max-w-6xl mx-auto px-4 md:px-8 py-8 gap-8"
        style={{
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        }}
      >
        <style>
          {`
          @media (min-width: 768px) {
            .grid {
              grid-template-columns: 1fr 1fr;
            }
          }
        `}
        </style>

        {resources.map((resource) => (
          <ResourceCard key={resource.id} resource={resource} />
        ))}

        {/* Pagination Controls */}
        <div className="col-span-full flex justify-center my-8">
          <nav className="flex gap-2">
            {Array.from({ length: totalPages }).map((_, idx) => (
              <Link
                key={idx}
                href={`/resources?page=${idx + 1}`}
                className={`px-3 py-1 rounded ${
                  page === idx + 1
                    ? "bg-black text-white"
                    : "bg-gray-200 text-black"
                }`}
              >
                {idx + 1}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
