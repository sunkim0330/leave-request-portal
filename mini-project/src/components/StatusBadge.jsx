import React from "react";

export default function StatusBadge({ status }) {
  let color = "bg-gray-300 text-gray-900";

  if (status === "Approved") {
    color = "bg-green-100 text-green-800";
  } else if (status === "Denied") {
    color = "bg-red-100 text-red-800";
  } else if (status === "Pending") {
    color = "bg-yellow-100 text-yellow-800";
  }

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${color}`}>
      {status}
    </span>
  );
}
