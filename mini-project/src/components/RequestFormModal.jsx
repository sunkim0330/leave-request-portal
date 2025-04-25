import { useState, useEffect } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { calculateBusinessDays } from "../utils/calculateBusinessDays";
import { useAuth } from "../components/Authcontext";

export default function RequestFormModal({ onClose, onCreated }) {
  const { employee } = useAuth();

  const [formData, setFormData] = useState({
    leaveType: "",
    startDate: "",
    endDate: "",
    numDays: 0,
    reason: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const { startDate, endDate } = formData;
    if (startDate && endDate) {
      setFormData((form) => ({
        ...form,
        numDays: calculateBusinessDays(startDate, endDate),
      }));
    }
  }, [formData.startDate, formData.endDate]);

  const handleChange = (formName) => (e) => {
    setFormData((prev) => {
      if (formName === "startDate") {
        const newStartDate = e.target.value;
        const currentEndDate = prev.endDate;

        let newEndDate = currentEndDate;
        if (currentEndDate) {
          const startDate = new Date(newStartDate);
          const endDate = new Date(currentEndDate);

          endDate.setFullYear(startDate.getFullYear());
          endDate.setMonth(startDate.getMonth());

          newEndDate =
            endDate < startDate
              ? newStartDate
              : endDate.toISOString().split("T")[0];
        } else {
          newEndDate = newStartDate;
        }

        return {
          ...prev,
          startDate: newStartDate,
          endDate: newEndDate,
        };
      }
      return {
        ...prev,
        [formName]: e.target.value,
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.startDate || !formData.endDate) {
      setError("Please select a valid start and end date");
      return;
    }

    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      setError("End date cannot be before start date");
      return;
    }

    if (!formData.leaveType) {
      setError("Please select a leave type");
      return;
    }

    setSubmitting(true);
    try {
      await addDoc(collection(db, "ptoRequests"), {
        employeeId: employee.id,
        employeeName: employee.name,
        ...formData,
        status: "Pending",
        timestamp: serverTimestamp(),
      });
      onCreated();
    } catch (error) {
      console.error("Error submitting request:", error);
      setError("Failed to submit request");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white w-4/5 max-w-lg p-6 rounded-lg shadow relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-600 hover:text-gray-800"
        >
          X
        </button>
        <h2 className="text-xl font-semibold mb-4">Submit PTO Request</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Leave Type</label>
            <select
              value={formData.leaveType}
              onChange={handleChange("leaveType")}
              className="w-full px-3 py-2 border rounded"
              required
            >
              <option value="" disabled>
                Select Leave Type
              </option>
              <option value="Sick">Sick Leave</option>
              <option value="Casual">Casual Leave</option>
              <option value="Vacation">Vacation</option>
            </select>
          </div>

          <div className="flex space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium">Start Date</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={handleChange("startDate")}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium">End Date</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={handleChange("endDate")}
                min={formData.startDate}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium">Number of Days</label>
            <input
              type="text"
              value={formData.numDays}
              readOnly
              className="w-full px-3 py-2 border rounded bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Reason</label>
            <textarea
              value={formData.reason}
              onChange={handleChange("reason")}
              rows={3}
              className="w-full px-3 py-2 border rounded"
            />
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? "Submitting…" : "Submit Request"}
          </button>
        </form>
      </div>
    </div>
  );
}
