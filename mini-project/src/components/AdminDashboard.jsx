import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  query,
  getDoc,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase";
import FilterPanel from "./FilterPanel";
import LogoutButton from "./LogoutButton";
import SortingTable from "./SortingTable";
import StatusBadge from "./StatusBadge";

export default function AdminDashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    statuses: searchParams.get("statuses")?.split(",") || [],
    leaveTypes: searchParams.get("leaveTypes")?.split(",") || [],
    startDate: searchParams.get("startDate") || "",
    endDate: searchParams.get("endDate") || "",
    days: searchParams.get("days") || "",
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
    <div className="min-h-screen px-4 py-6 sm:px-6 bg-blue-50">
      <div className="flex justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl sm:text-4xl font-bold text-blue-800">
          Admin - PTO Requests
        </h1>
        <LogoutButton />
      </div>

      <FilterPanel
        onChange={handleFilterChange}
        leaveTypeOptions={["Sick", "Casual", "Vacation"]}
        statusOptions={["Pending", "Approved", "Denied"]}
        initialValues={filters}
      />
      {loading ? (
        <p className="text-blue-500">Loading requests...</p>
      ) : requests.length === 0 ? (
        <p className="text-gray-600 italic">No leave requests found.</p>
      ) : (
        <SortingTable
          data={requests}
          defaultSort={{ key: "timestamp", direction: "desc" }}
          columns={[
            { key: "employeeName", label: "Employee", sortable: true },
            {
              key: "employeeId",
              label: "ID",
              sortable: true,
              className: "hidden md:table-cell",
            },
            { key: "leaveType", label: "Type", sortable: true },
            { key: "startDate", label: "Start", sortable: true },
            { key: "endDate", label: "End", sortable: true },
            {
              key: "numDays",
              label: "Days",
              sortable: true,
              className: "hidden sm:table-cell",
            },
            { key: "status", label: "Status", sortable: true },
            { key: "actions", label: "Actions", sortable: false },
          ]}
          renderRow={(req, index) => (
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
              <td className="px-3 py-2 hidden sm:table-cell">{req.numDays}</td>
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
          )}
        />
      )}
    </div>
  );
}
