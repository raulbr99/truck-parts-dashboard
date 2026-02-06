import { supabase } from "@/lib/supabase";
import { PartsTable } from "./PartsTable";
import type { TruckPart } from "@/types/database";

export const revalidate = 60; // Revalidate every 60 seconds

async function fetchAllParts(): Promise<{ parts: TruckPart[]; error: string | null }> {
  const allParts: TruckPart[] = [];
  const pageSize = 1000;
  let page = 0;
  let hasMore = true;

  while (hasMore) {
    const from = page * pageSize;
    const to = from + pageSize - 1;

    const { data, error } = await supabase
      .from("truck_parts")
      .select("*")
      .eq("active", true)
      .order("part_num", { ascending: true })
      .range(from, to);

    if (error) {
      return { parts: [], error: error.message };
    }

    if (data) {
      allParts.push(...data);
      hasMore = data.length === pageSize;
    } else {
      hasMore = false;
    }

    page++;
  }

  return { parts: allParts, error: null };
}

export default async function Home() {
  const { parts, error } = await fetchAllParts();

  if (error) {
    return (
      <div className="min-h-screen p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-red-800 font-semibold">Error loading data</h2>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Truck Parts Inventory
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {parts.length.toLocaleString()} parts available
        </p>
      </header>

      <PartsTable parts={parts} />
    </div>
  );
}
