import { useState, useEffect, useCallback } from "react";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  query,
  orderBy,
  getDoc,
  where,
} from "firebase/firestore";
import { db } from "../firebase";
import FilterPanel from "./FilterPanel";
import LogoutButton from "./LogoutButton";
import StatusBadge from "./StatusBadge";

export default function AdminDashboard() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    statuses: [],
    leaveTypes: [],
    startDate: "",
    endDate: "",
    days: "",
  });

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const conditions = [];

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

      const requestQuery = query(
        collection(db, "ptoRequests"),
        ...conditions,
        orderBy("timestamp", "desc")
      );

      const snapshot = await getDocs(requestQuery);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setRequests(data);
    } catch (error) {
      console.error("Error fetching requests for admin:", error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const requestDoc = doc(db, "ptoRequests", id);
      const requestSnap = await getDoc(requestDoc);
      if (!requestSnap.exists()) return;

      const requestData = requestSnap.data();

      await updateDoc(requestDoc, { status: newStatus });

      if (newStatus === "Denied") {
        const employeeRef = doc(db, "employees", requestData.employeeId);
        const employeeSnap = await getDoc(employeeRef);

        if (employeeSnap.exists()) {
          const currentBalance = employeeSnap.data().leaveBalance || 0;
          await updateDoc(employeeRef, {
            leaveBalance: currentBalance + (requestData.numDays || 0),
          });
        }
      }
      fetchRequests();
    } catch (error) {
      console.error("Error updating request status:", error);
      alert("Failed to update status. Check permissions.");
    }
  };

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 bg-blue-50">
      <div className="flex justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl sm:text-4xl font-bold text-blue-800">
          Admin - PTO Requests
        </h1>
        <LogoutButton />
      </div>

      <FilterPanel
        onChange={setFilters}
        leaveTypeOptions={["Sick", "Casual", "Vacation"]}
        statusOptions={["Pending", "Approved", "Denied"]}
      />
      {loading ? (
        <p className="text-blue-500">Loading requests...</p>
      ) : requests.length === 0 ? (
        <p className="text-gray-600 italic">No PTO requests found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg shadow-lg text-sm sm:text-base">
            <thead className="bg-blue-100 text-blue-900">
              <tr>
                <th className="px-3 py-3 text-left">Employee</th>
                <th className="px-3 py-3 text-left hidden md:table-cell">ID</th>
                <th className="px-3 py-3 text-left">Type</th>
                <th className="px-3 py-3 text-left">Start</th>
                <th className="px-3 py-3 text-left">End</th>
                <th className="px-3 py-3 text-left hidden sm:table-cell">
                  Days
                </th>
                <th className="px-3 py-3 text-left">Status</th>
                <th className="px-3 py-3 text-left">Actions</th>
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
                  <td className="px-3 py-2">{req.employeeName}</td>
                  <td className="px-3 py-2 hidden md:table-cell">
                    {req.employeeId}
                  </td>
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
                  <td className="px-3 py-2">
                    <StatusBadge status={req.status} />
                  </td>
                  <td className="px-3 py-2">
                    {req.status === "Pending" ? (
                      <div className="flex flex-col sm:flex-row gap-2">
                        <button
                          onClick={() => handleStatusChange(req.id, "Approved")}
                          className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-sm"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleStatusChange(req.id, "Denied")}
                          className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm"
                        >
                          Deny
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">no action</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
