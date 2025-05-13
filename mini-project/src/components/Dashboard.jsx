import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "./AuthContext";
import FilterPanel from "./FilterPanel";
import LogoutButton from "./LogoutButton";
import RequestFormModal from "./RequestFormModal";
import StatusBadge from "./StatusBadge";
import SortingTable from "./SortingTable";

export default function Dashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { employee } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({
    statuses: searchParams.get("statuses")?.split(",") || [],
    leaveTypes: searchParams.get("leaveTypes")?.split(",") || [],
    startDate: searchParams.get("startDate") || "",
    endDate: searchParams.get("endDate") || "",
    days: searchParams.get("days") || "",
  });

  const fetchRequests = useCallback(async () => {
    if (!employee) return;
    setLoading(true);

    try {
      const conditions = [where("employeeId", "==", employee.id)];

      if (filters.statuses.length) {
        conditions.push(where("status", "in", filters.statuses));
      }

      if (filters.leaveTypes.length) {
        conditions.push(where("leaveType", "in", filters.leaveTypes));
      }
      if (filters.startDate) {
        conditions.push(where("startDate", ">=", filters.startDate));
      }
      if (filters.endDate) {
        conditions.push(where("endDate", "<=", filters.endDate));
      }
      if (filters.days) {
        conditions.push(where("numDays", "==", Number(filters.days)));
      }

      const q = query(
        collection(db, "ptoRequests"),
        ...conditions,
        orderBy("timestamp", "desc")
      );

      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setRequests(data);
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setLoading(false);
    }
  }, [employee, filters]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);

    const params = new URLSearchParams();

    if (newFilters.statuses.length)
      params.set("statuses", newFilters.statuses.join(","));

    if (newFilters.leaveTypes.length)
      params.set("leaveTypes", newFilters.leaveTypes.join(","));

    if (newFilters.startDate) params.set("startDate", newFilters.startDate);
    if (newFilters.endDate) params.set("endDate", newFilters.endDate);
    if (newFilters.days) params.set("days", newFilters.days);

    setSearchParams(params);
  };

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 bg-gray-50">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-semibold text-black-700">
          {employee.name} - PTO Requests
        </h1>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <button
            onClick={() => setShowModal(true)}
            className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Submit Request
          </button>
          <LogoutButton />
        </div>
      </div>
      <div className="flex flex-row gap-3 sm:gap-4 justify-between mb-4">
        <p className="text-gray-500 italic font-semibold text-lg">
          Leave Balance: {employee.leaveBalance} days
        </p>
      </div>
      <FilterPanel
        onChange={handleFilterChange}
        leaveTypeOptions={["Sick", "Casual", "Vacation"]}
        statusOptions={["Pending", "Approved", "Denied"]}
        initialValues={filters}
      />
      {loading ? (
        <p className="text-blue-500">Loading…</p>
      ) : requests.length === 0 ? (
        <p className="text-gray-500 italic">No requests yet.</p>
      ) : (
        <SortingTable
          data={requests}
          defaultSort={{ key: "timestamp", direction: "desc" }}
          columns={[
            { key: "leaveType", label: "Type", sortable: true },
            { key: "startDate", label: "Start", sortable: true },
            {
              key: "endDate",
              label: "End",
              sortable: true,
            },
            {
              key: "numDays",
              label: "Days",
              sortable: true,
              className: "hidden sm:table-cell",
            },
            { key: "status", label: "Status", sortable: true },
          ]}
          renderRow={(req, index) => (
            <tr
              key={req.id}
              className={`${
                index % 2 === 0 ? "bg-gray-50" : "bg-white"
              } border-b last:border-none`}
            >
              <td className="px-3 py-2">{req.leaveType}</td>
              <td className="px-3 py-2">
                {new Date(req.startDate + "T00:00:00").toLocaleDateString()}
              </td>
              <td className="px-3 py-2">
                {new Date(req.endDate + "T00:00:00").toLocaleDateString()}
              </td>
              <td className="px-3 py-2 hidden sm:table-cell">{req.numDays}</td>
              <td className="px-3 py-2">
                <StatusBadge status={req.status} />
              </td>
            </tr>
          )}
        />
      )}

      {showModal && (
        <RequestFormModal
          onClose={() => setShowModal(false)}
          onCreated={() => {
            setShowModal(false);
            fetchRequests();
          }}
        />
      )}
    </div>
  );
}
