import { useState, useEffect, useCallback } from "react";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "./AuthContext";
import FilterPanel from "./FilterPanel";
import LogoutButton from "./LogoutButton";
import RequestFormModal from "./RequestFormModal";
import StatusBadge from "./StatusBadge";

export default function Dashboard() {
  const { employee } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({
    statuses: [],
    leaveTypes: [],
    startDate: "",
    endDate: "",
    days: "",
  });

  const fetchRequests = useCallback(async () => {
    if (!employee) return;
    setLoading(true);

    try {
      const conditions = [where("employeeId", "==", employee.id)];

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
      <div className="flex flex-row gap-3 sm:gap-4 justify-between">
        <p className="text-gray-500 italic font-semibold text-lg">
          Leave Balance: {employee.leaveBalance} days
        </p>
        <FilterPanel
          onChange={setFilters}
          leaveTypeOptions={["Sick", "Casual", "Vacation"]}
          statusOptions={["Pending", "Approved", "Denied"]}
        />
      </div>

      {loading ? (
        <p className="text-blue-500">Loading…</p>
      ) : requests.length === 0 ? (
        <p className="text-gray-500 italic">No requests yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg shadow text-sm sm:text-base">
            <thead>
              <tr className="bg-blue-100 text-blue-900">
                <th className="px-3 py-2 text-left">Type</th>
                <th className="px-3 py-2 text-left">Start</th>
                <th className="px-3 py-2 text-left">End</th>
                <th className="px-3 py-2 text-left hidden sm:table-cell">
                  Days
                </th>
                <th className="px-3 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req, index) => (
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
                  <td className="px-3 py-2 hidden sm:table-cell">
                    {req.numDays}
                  </td>
                  <td>
                    <StatusBadge status={req.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
