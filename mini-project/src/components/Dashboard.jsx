import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { useAuth } from "./Authcontext";
import { db } from "../firebase";
import RequestFormModal from "./RequestFormModal";

export default function Dashboard() {
  const { employee, logout } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const fetchRequests = useCallback(async () => {
    if (!employee) return;
    setLoading(true);

    try {
      const requestsQuery = query(
        collection(db, "ptoRequests"),
        where("employeeId", "==", employee),
        orderBy("timestamp", "desc")
      );
      const requestResult = await getDocs(requestsQuery);

      setRequests(
        requestResult.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
      );
      setLoading(false);
    } catch (error) {
      console.error("Error fetching requests:", error);
      setLoading(false);
    }
  }, [employee]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-semibold">Your PTO Requests</h1>
        <div className="flex gap-4">
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Submit Request
          </button>
          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Log Out
          </button>
        </div>
      </div>

      {loading ? (
        <p>Loading…</p>
      ) : requests.length === 0 ? (
        <p className="text-gray-600">No requests yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg shadow">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left">Type</th>
                <th className="px-4 py-2 text-left">Start</th>
                <th className="px-4 py-2 text-left">End</th>
                <th className="px-4 py-2 text-left">Days</th>
                <th className="px-4 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req.id} className="border-b last:border-none">
                  <td className="px-4 py-2">{req.leaveType}</td>
                  <td className="px-4 py-2">
                    {new Date(req.startDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2">
                    {new Date(req.endDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2">{req.numDays}</td>
                  <td className="px-4 py-2 capitalize">{req.status}</td>
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
