import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("pm_user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const login = (userData) => {
    setUser(userData);
    try {
      localStorage.setItem("pm_user", JSON.stringify(userData));
      if (userData?.token) {
        localStorage.setItem("pm_token", userData.token);
      }
    } catch (e) {
      console.error("Erro ao salvar sessão:", e);
    }
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem("pm_user");
      localStorage.removeItem("pm_token");
    } catch (e) {
      console.error("Erro ao limpar sessão:", e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}