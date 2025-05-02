import { useState, useEffect, useMemo } from "react";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase";
import LogoutButton from "./LogoutButton";
import StatusBadge from "./StatusBadge";
import StatusFilter from "./StatusFilter";

export default function AdminDashboard() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");

  const filteredRequests = useMemo(() => {
    if (statusFilter === "All") return requests;
    return requests.filter((req) => req.status === statusFilter);
  }, [requests, statusFilter]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const requestQuery = await getDocs(
        query(collection(db, "ptoRequests"), orderBy("timestamp", "desc"))
      );
      const data = requestQuery.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setRequests(data);
    } catch (error) {
      console.error("Error fetching requests for admin:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const requestDoc = doc(db, "ptoRequests", id);
      await updateDoc(requestDoc, { status: newStatus });
      fetchRequests();
    } catch (error) {
      console.error("Error updating request status:", error);
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

      <StatusFilter value={statusFilter} onChange={setStatusFilter} />
      {loading ? (
        <p className="text-blue-500">Loading requests...</p>
      ) : filteredRequests.length === 0 ? (
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
              {filteredRequests.map((req, index) => (
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
