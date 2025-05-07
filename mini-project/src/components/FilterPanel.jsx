import { useState } from "react";

export default function FilterPanel({
  onChange,
  statusOptions = [],
  leaveTypeOptions = [],
}) {
  const [expanded, setExpanded] = useState(false);
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [selectedLeaveTypes, setSelectedLeaveTypes] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [days, setDays] = useState("");

  const toggleOption = (value, selected, setSelected) => {
    if (selected.includes(value)) {
      setSelected(selected.filter((v) => v !== value));
    } else {
      setSelected([...selected, value]);
    }
  };

  const applyFilters = () => {
    onChange({
      statuses: selectedStatuses,
      leaveTypes: selectedLeaveTypes,
      startDate,
      endDate,
      days,
    });
  };

  const clearFilters = () => {
    setSelectedStatuses([]);
    setSelectedLeaveTypes([]);
    setStartDate("");
    setDays("");
    onChange({
      statuses: [],
      leaveTypes: [],
      startDate: "",
      endDate: "",
      days: "",
    });
  };

  return (
    <div
      className={`mb-8 bg-white rounded shadow p-2 transition-all ${
        expanded ? "w-full" : "w-fit"
      }`}
    >
      <div className={`py-2 flex items-center ${expanded ? "mb-2" : ""}`}>
        <button
          className="text-blue-600 font-semibold text-lg"
          onClick={() => setExpanded((prev) => !prev)}
        >
          {expanded ? "Hide Filters ▲" : "Show Filters ▼"}
        </button>
      </div>

      {expanded && (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          <div>
            <label className="block font-medium mb-1 text-gray-700">
              Status
            </label>
            <div className="space-y-1">
              {statusOptions.map((status) => (
                <label key={status} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedStatuses.includes(status)}
                    onChange={() =>
                      toggleOption(
                        status,
                        selectedStatuses,
                        setSelectedStatuses
                      )
                    }
                  />
                  {status}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-medium mb-1 text-gray-700">
              Leave Type
            </label>
            <div className="space-y-1">
              {leaveTypeOptions.map((type) => (
                <label key={type} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedLeaveTypes.includes(type)}
                    onChange={() =>
                      toggleOption(
                        type,
                        selectedLeaveTypes,
                        setSelectedLeaveTypes
                      )
                    }
                  />
                  {type}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-medium mb-1 text-gray-700">
              # of Days =
            </label>
            <input
              type="number"
              className="w-full border rounded px-2 py-1"
              value={days}
              onChange={(e) => setDays(e.target.value)}
              min="1"
            />
          </div>

          <>
            <div>
              <label className="block font-medium mb-1 text-gray-700">
                Start Date ≥
              </label>
              <input
                type="date"
                className="w-full border rounded px-2 py-1"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div>
              <label className="block font-medium mb-1 text-gray-700">
                End Date ≤
              </label>
              <input
                type="date"
                className="w-full border rounded px-2 py-1"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </>
        </div>
      )}

      {expanded && (
        <div className="flex gap-3 mt-4">
          <button
            onClick={applyFilters}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Apply Filters
          </button>
          <button
            onClick={clearFilters}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}
