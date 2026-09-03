"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import SearchBar from "@/components/ui/SearchBar";

export function HomePageSearch() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchCommit = (query) => {
    if (query.trim()) {
      // Navigate to resources page with search query
      router.push(`/resources?search=${encodeURIComponent(query)}`);
    }
  };

  return (
    <SearchBar
      resources={[]}
      onSearch={setSearchQuery}
      onCommit={handleSearchCommit}
      value={searchQuery}
      autoFocus={true}
    />
  );
}
