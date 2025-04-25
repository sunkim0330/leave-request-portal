import { useState, useEffect } from "react";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../firebase";

export default function AdminDashboard() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const requestQuery = await getDocs(collection(db, "ptoRequests"));
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
    <div className="min-h-screen p-6 bg-blue-50">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold text-blue-800">
          Admin - PTO Requests
        </h1>
        <LogoutButton />
      </div>

      {loading ? (
        <p>Loading requests...</p>
      ) : requests.length === 0 ? (
        <p>No PTO requests found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg shadow-lg">
            <thead className="bg-blue-100">
              <tr>
                <th className="px-4 py-3 text-left">Employee Name</th>
                <th className="px-4 py-3 text-left">Employee ID</th>
                <th className="px-4 py-3 text-left">Leave Type</th>
                <th className="px-4 py-3 text-left">Start Date</th>
                <th className="px-4 py-3 text-left">End Date</th>
                <th className="px-4 py-3 text-left">Days</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req.id} className="border-b last:border-none">
                  <td className="px-4 py-2">{req.employeeName}</td>
                  <td className="px-4 py-2">{req.employeeId}</td>
                  <td className="px-4 py-2">{req.leaveType}</td>
                  <td className="px-4 py-2">
                    {new Date(req.startDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2">
                    {new Date(req.endDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2">{req.numDays}</td>
                  <td className="px-4 py-2 capitalize">{req.status}</td>
                  <td className="px-4 py-2 space-x-2">
                    {req.status === "Pending" ? (
                      <>
                        <button
                          onClick={() => handleStatusChange(req.id, "Approved")}
                          className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleStatusChange(req.id, "Denied")}
                          className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                        >
                          Deny
                        </button>
                      </>
                    ) : (
                      <span className="text-gray-400 text-sm">
                        {req.status}
                      </span>
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
