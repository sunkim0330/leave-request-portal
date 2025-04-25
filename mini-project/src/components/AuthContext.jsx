/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useContext, useEffect } from "react";
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
      }
    } catch (error) {
      console.error("Error fetching employee data in Auth:", error);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setEmployee(null);
    setIsAdmin(false);
    localStorage.removeItem("loggedInEmployee");
  };

  useEffect(() => {
    const storedEmployee = localStorage.getItem("loggedInEmployee");
    if (storedEmployee) {
      login(storedEmployee);
    } else {
      setLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ employee, isAdmin, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
