import { createContext, useState, useEffect, useContext } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [employee, setEmployee] = useState(() =>
    localStorage.getItem("loggedInEmployee")
  );

  const isLoggedIn = Boolean(employee);

  useEffect(() => {
    const storedEmployee = localStorage.getItem("loggedInEmployee");
    if (storedEmployee) {
      setEmployee(storedEmployee);
    }
  }, []);

  const login = (employeeId) => {
    localStorage.setItem("loggedInEmployee", employeeId);
    setEmployee(employeeId);
  };

  const logout = () => {
    localStorage.removeItem("loggedInEmployee");
    setEmployee(null);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, employee, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
