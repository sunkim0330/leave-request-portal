import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { sendOtpEmail, validateOtp } from "../otpService";

export default function Login() {
  const navigate = useNavigate();

  const [employeeId, setEmployeeId] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGetOtp = async () => {
    setError("");
    setMessage("");
    if (!employeeId.trim()) {
      setError("Please enter your employee ID");
      return;
    }

    setLoading(true);
    try {
      await sendOtpEmail(employeeId.trim());

      setMessage("Passcode was sent to your email");
      setOtpSent(true);
    } catch (error) {
      setError(error.message || "Failed to send passcode. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError("");
    setMessage("");
    if (!otpInput.trim()) {
      setError("Please enter the passcode sent to your email");
      return;
    }

    setLoading(true);
    try {
      const result = await validateOtp({
        employeeId: employeeId.trim(),
        otpInput: otpInput.trim(),
      });

      if (result.success) {
        localStorage.setItem("loggedInEmployee", employeeId.trim());
        navigate("/dashboard");
      } else {
        setError(result.message || "Invalid passcode. Please try again.");
      }
    } catch {
      setError("Invalid passcode. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-semibold text-center mb-6">
          Employee Login
        </h2>

        {!otpSent ? (
          <>
            <label className="block mb-2 text-sm font-medium">
              Employee ID
            </label>
            <input
              type="text"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              placeholder="E123"
              className="w-full px-3 py-2 border rounded mb-4 focus:outline-none focus:ring focus:border-blue-400"
            />
            <button
              onClick={handleGetOtp}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Sending OTP…" : "Send OTP"}
            </button>
          </>
        ) : (
          <>
            <p className="text-sm text-gray-600 mb-4">{message}</p>
            <label className="block mb-2 text-sm font-medium">Enter OTP</label>
            <input
              type="text"
              value={otpInput}
              onChange={(e) => setOtpInput(e.target.value)}
              placeholder="123456"
              className="w-full px-3 py-2 border rounded mb-4 focus:outline-none focus:ring focus:border-blue-400"
            />
            <button
              onClick={handleVerifyOtp}
              disabled={loading}
              className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? "Verifying…" : "Verify OTP"}
            </button>
            <p className="mt-4 text-sm text-gray-500">
              Didn’t get it?{" "}
              <button
                className="text-blue-600 hover:underline"
                onClick={() => {
                  setOtpSent(false);
                  setOtpInput("");
                }}
              >
                Resend OTP
              </button>
            </p>
          </>
        )}

        {error && <p className="mt-4 text-red-600 text-sm">{error}</p>}
      </div>
    </div>
  );
}
