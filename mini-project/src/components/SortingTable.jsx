import { useState } from "react";

export default function SortingTable({
  data,
  columns,
  renderRow,
  defaultSort,
}) {
  const [sortConfig, setSortConfig] = useState(
    defaultSort || { key: null, direction: "asc" }
  );

  const sortedData = [...data].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const aVal = a[sortConfig.key];
    const bVal = b[sortConfig.key];

    const valA = aVal?.toDate ? aVal.toDate() : aVal;
    const valB = bVal?.toDate ? bVal.toDate() : bVal;

    if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
    if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  const handleSort = (key) => {
    setSortConfig((prev) =>
      prev.key === key
        ? { key, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "asc" }
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white rounded-lg shadow text-sm sm:text-base">
        <thead className="bg-blue-100 text-blue-900">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                onClick={() => col.sortable && handleSort(col.key)}
                className={`px-3 py-2 text-left select-none ${
                  col.sortable ? "cursor-pointer hover:text-blue-700" : ""
                } ${col.className || ""}`}
              >
                <span className="inline-flex items-center gap-1">
                  {col.label}
                  {col.sortable && (
                    <span
                      className={`text-xs ${
                        sortConfig.key === col.key
                          ? "text-blue-600"
                          : "text-gray-400"
                      }`}
                    >
                      {sortConfig.key === col.key
                        ? sortConfig.direction === "asc"
                          ? "▲"
                          : "▼"
                        : "↕"}
                    </span>
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{sortedData.map((item, index) => renderRow(item, index))}</tbody>
      </table>
    </div>
  );
}
