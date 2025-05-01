/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useContext, useEffect } from "react";
import { toast } from "react-toastify";
import { getDoc, doc } from "firebase/firestore";
import { db } from "../firebase";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [employee, setEmployee] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const login = async (employeeId) => {
    try {
      const empDoc = await getDoc(doc(db, "employees", employeeId));
      if (empDoc.exists()) {
        const employeeData = {
          id: employeeId,
          ...empDoc.data(),
          isAdmin: empDoc.data().isAdmin || false,
        };
        setEmployee(employeeData);
        setIsAdmin(employeeData.isAdmin);
        localStorage.setItem("loggedInEmployee", employeeId);
        localStorage.setItem("loginTimestamp", Date.now());
      }
    } catch (error) {
      console.error("Error fetching employee data in Auth:", error);
    } finally {
      setLoading(false);
    }
  };

  const logout = (sessionExpired = false) => {
    setEmployee(null);
    setIsAdmin(false);
    localStorage.removeItem("loggedInEmployee");
    localStorage.removeItem("loginTimestamp");

    if (sessionExpired) {
      toast.error("Session expired. Please log in again.");
    } else {
      toast.success("You have been logged out.");
    }
  };

  useEffect(() => {
    const storedEmployee = localStorage.getItem("loggedInEmployee");
    const loginTime = localStorage.getItem("loginTimestamp");

    if (storedEmployee && loginTime) {
      const now = Date.now();
      const elapsedHours = (now - Number(loginTime)) / (1000 * 60 * 60);

      if (elapsedHours > 2) {
        logout(true);
      } else {
        login(storedEmployee);
      }
    } else {
      setLoading(false);
    }

    const interval = setInterval(() => {
      const loginTime = localStorage.getItem("loginTimestamp");
      if (loginTime) {
        const now = Date.now();
        const elapsedHours = (now - Number(loginTime)) / (1000 * 60 * 60);

        if (elapsedHours > 2) {
          logout(true);
        }
      }
    }, 1000 * 60);

    return () => clearInterval(interval);
  }, []);

  return (
    <AuthContext.Provider value={{ employee, isAdmin, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
