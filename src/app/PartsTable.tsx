"use client";

import { useState, useMemo } from "react";
import type { TruckPart } from "@/types/database";

interface PartsTableProps {
  parts: TruckPart[];
}

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

export function PartsTable({ parts }: PartsTableProps) {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [sortField, setSortField] = useState<keyof TruckPart>("part_num");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Filters
  const [modelFilter, setModelFilter] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [stockedFilter, setStockedFilter] = useState<string>("");

  // Extract unique values for filters
  const filterOptions = useMemo(() => {
    const models = new Set<string>();
    const categories = new Set<string>();

    parts.forEach((part) => {
      if (part.model) models.add(part.model);
      if (part.category_name) categories.add(part.category_name);
    });

    return {
      models: Array.from(models).sort(),
      categories: Array.from(categories).sort(),
    };
  }, [parts]);

  const filteredParts = useMemo(() => {
    return parts.filter((part) => {
      // Search filter
      if (search.trim()) {
        const searchLower = search.toLowerCase();
        const matchesSearch =
          part.part_num?.toLowerCase().includes(searchLower) ||
          part.description?.toLowerCase().includes(searchLower) ||
          part.model?.toLowerCase().includes(searchLower) ||
          part.category_name?.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Model filter
      if (modelFilter && part.model !== modelFilter) return false;

      // Category filter
      if (categoryFilter && part.category_name !== categoryFilter) return false;

      // Stocked filter
      if (stockedFilter === "yes" && !part.stocked) return false;
      if (stockedFilter === "no" && part.stocked) return false;

      return true;
    });
  }, [parts, search, modelFilter, categoryFilter, stockedFilter]);

  const sortedParts = useMemo(() => {
    return [...filteredParts].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];

      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
      }

      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();
      return sortDirection === "asc"
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    });
  }, [filteredParts, sortField, sortDirection]);

  const totalPages = Math.ceil(sortedParts.length / pageSize);
  const paginatedParts = sortedParts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleSort = (field: keyof TruckPart) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setModelFilter("");
    setCategoryFilter("");
    setStockedFilter("");
    setCurrentPage(1);
  };

  const hasActiveFilters = search || modelFilter || categoryFilter || stockedFilter;

  const formatPrice = (price: number | null) => {
    if (price === null) return "-";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const SortIcon = ({ field }: { field: keyof TruckPart }) => {
    if (sortField !== field) return <span className="text-gray-300 ml-1">↕</span>;
    return <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>;
  };

  const selectClassName = "px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white text-sm";

  return (
    <div>
      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by part number, description, model, or category..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full max-w-xl px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
        />
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-3 items-center">
        <select
          value={modelFilter}
          onChange={(e) => {
            setModelFilter(e.target.value);
            setCurrentPage(1);
          }}
          className={selectClassName}
        >
          <option value="">All Models</option>
          {filterOptions.models.map((model) => (
            <option key={model} value={model}>
              {model}
            </option>
          ))}
        </select>

        <select
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value);
            setCurrentPage(1);
          }}
          className={selectClassName}
        >
          <option value="">All Categories</option>
          {filterOptions.categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        <select
          value={stockedFilter}
          onChange={(e) => {
            setStockedFilter(e.target.value);
            setCurrentPage(1);
          }}
          className={selectClassName}
        >
          <option value="">All Stock Status</option>
          <option value="yes">In Stock</option>
          <option value="no">Out of Stock</option>
        </select>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="px-3 py-2 text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Results count */}
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Showing {paginatedParts.length} of {sortedParts.length} results
        {hasActiveFilters && " (filtered)"}
      </p>

      {/* Table */}
      <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th
                onClick={() => handleSort("part_num")}
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Part # <SortIcon field="part_num" />
              </th>
              <th
                onClick={() => handleSort("description")}
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Description <SortIcon field="description" />
              </th>
              <th
                onClick={() => handleSort("model")}
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Model <SortIcon field="model" />
              </th>
              <th
                onClick={() => handleSort("category_name")}
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Category <SortIcon field="category_name" />
              </th>
              <th
                onClick={() => handleSort("price")}
                className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Price <SortIcon field="price" />
              </th>
              <th
                onClick={() => handleSort("stocked")}
                className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Stocked <SortIcon field="stocked" />
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {paginatedParts.map((part) => (
              <tr
                key={part.part_num}
                className="hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap">
                  {part.part_num}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 max-w-md truncate">
                  {part.description || "-"}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
                  {part.model || "-"}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
                  {part.category_name || "-"}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white text-right whitespace-nowrap">
                  {formatPrice(part.price)}
                </td>
                <td className="px-4 py-3 text-center">
                  {part.stocked ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      Yes
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                      No
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4 flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Page {currentPage} of {totalPages || 1}
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 dark:text-gray-400">Rows:</label>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1 text-sm border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="px-3 py-1 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-800 dark:border-gray-600"
          >
            First
          </button>
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-800 dark:border-gray-600"
          >
            Previous
          </button>
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages || totalPages === 0}
            className="px-3 py-1 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-800 dark:border-gray-600"
          >
            Next
          </button>
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages || totalPages === 0}
            className="px-3 py-1 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-800 dark:border-gray-600"
          >
            Last
          </button>
        </div>
      </div>
    </div>
  );
}
