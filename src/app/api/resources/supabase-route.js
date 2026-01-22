/**
 * EEG101 Resources API Endpoint (Supabase Version)
 *
 * GET /api/resources
 *
 * Query parameters:
 * - family: Filter by family ('bibliographic', 'multimedia', 'technical', 'webpage') [optional]
 * - manifestoPart: Filter by manifesto part ('Part 1', 'Part 2', 'Part 3') [optional]
 * - page: Page number for pagination (default: 1) [optional]
 * - perPage: Items per page (default: 20, max: 100) [optional]
 */

import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const family = searchParams.get("family");
    const manifestoPart = searchParams.get("manifestoPart");
    const page = parseInt(searchParams.get("page")) || 1;
    const perPage = Math.min(parseInt(searchParams.get("perPage")) || 20, 100);

    // Build Supabase query
    let query = supabase.from("resources").select("*", { count: "exact" });

    // Apply filters
    if (family) {
      query = query.eq("family", family);
    }

    if (manifestoPart) {
      query = query.contains("manifesto_part", [manifestoPart]);
    }

    // Apply pagination
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;
    query = query.range(from, to);

    // Execute query
    const { data: resources, error, count } = await query;

    if (error) {
      console.error("Supabase query error:", error);
      return NextResponse.json(
        { error: "Failed to fetch resources" },
        { status: 500 }
      );
    }

    // Calculate statistics
    const stats = {
      total: count,
      page,
      perPage,
      totalPages: Math.ceil(count / perPage),
    };

    // Group by family for counts
    const { data: familyCounts } = await supabase
      .from("resources")
      .select("family")
      .then(({ data }) => {
        const counts = {};
        data?.forEach((item) => {
          counts[item.family] = (counts[item.family] || 0) + 1;
        });
        return { data: counts };
      });

    return NextResponse.json({
      resources,
      stats,
      familyCounts,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
