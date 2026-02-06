import { supabase } from "@/lib/supabase";
import { PartsTable } from "./PartsTable";

export const revalidate = 60; // Revalidate every 60 seconds

export default async function Home() {
  const { data: parts, error } = await supabase
    .from("truck_parts")
    .select("*")
    .eq("active", true)
    .order("part_num", { ascending: true });

  if (error) {
    return (
      <div className="min-h-screen p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-red-800 font-semibold">Error loading data</h2>
          <p className="text-red-600">{error.message}</p>
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
          {parts?.length.toLocaleString()} parts available
        </p>
      </header>

      <PartsTable parts={parts || []} />
    </div>
  );
}
