import React, { createContext, useContext, useState, useEffect } from "react";
import { User, Role } from "../types";
import { api } from "../services/api";

interface AuthContextType {
  user: User | null;
  role: Role | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User>;
  signup: (name: string, email: string, password: string, role: Role) => Promise<User>;
  logout: () => void;
  switchRole: (role: Role) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem("bountyvault_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem("bountyvault_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("bountyvault_user");
    }
  }, [user]);

  const login = async (email: string, password: string): Promise<User> => {
    const res = await api.login({ email, password });
    setUser(res.user);
    return res.user;
  };

  const signup = async (name: string, email: string, password: string, role: Role): Promise<User> => {
    const res = await api.signup({ name, email, password, role });
    setUser(res.user);
    return res.user;
  };

  const logout = () => {
    setUser(null);
  };

  const switchRole = (newRole: Role) => {
    if (user) {
      const updated = { ...user, role: newRole };
      setUser(updated);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user ? user.role : null,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
