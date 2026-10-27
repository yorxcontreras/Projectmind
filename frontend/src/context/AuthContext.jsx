import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      // Limpa qualquer dado residual antigo de localStorage para não reabrir sessões antigas
      localStorage.removeItem("pm_user");
      localStorage.removeItem("pm_token");

      const savedUser = sessionStorage.getItem("pm_user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const login = (userData) => {
    setUser(userData);
    try {
      sessionStorage.setItem("pm_user", JSON.stringify(userData));
      if (userData?.token) {
        sessionStorage.setItem("pm_token", userData.token);
      }
    } catch (e) {
      console.error("Erro ao salvar sessão:", e);
    }
  };

  const logout = () => {
    setUser(null);
    try {
      sessionStorage.removeItem("pm_user");
      sessionStorage.removeItem("pm_token");
      localStorage.removeItem("pm_user");
      localStorage.removeItem("pm_token");
    } catch (e) {
      console.error("Erro ao limpar sessão:", e);
    }
  };

  const atualizarUsuarioContext = (dadosAtualizados) => {
    setUser((prev) => {
      const updated = { ...prev, ...dadosAtualizados };
      try {
        sessionStorage.setItem("pm_user", JSON.stringify(updated));
      } catch (e) {
        console.error("Erro ao salvar dados atualizados do usuário:", e);
      }
      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        login,
        logout,
        atualizarUsuarioContext,
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