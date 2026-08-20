import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { authApi } from "@/lib/api/authApi";
import { getAuthToken, setAuthToken } from "@/lib/api/client";
import type { User } from "@/types";
import type { LoginFormData, RegisterFormData } from "@/schemas";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginFormData) => Promise<void>;
  register: (data: RegisterFormData) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function formatUser(u: User | null): User | null {
  if (!u) return null;
  let name = u.name;
  if (u.email === "admin@demo-retail.com" || !name || name.includes("Demo Admin")) {
    name = "Lokeek Lokhande";
  } else if (u.email === "analyst@demo-retail.com" || name.includes("Demo Analyst")) {
    name = "Gauri Dhondge";
  } else if (u.email === "manager@demo-retail.com" || name.includes("Demo Manager")) {
    name = "Ved Mahajan";
  }
  return { ...u, name };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      setIsLoading(false);
      return;
    }
    try {
      const res = await authApi.me();
      setUser(formatUser(res.data));
    } catch {
      setAuthToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadUser();
  }, [loadUser]);

  const login = useCallback(async (data: LoginFormData) => {
    const res = await authApi.login(data);
    setAuthToken(res.data.token);
    setUser(formatUser(res.data.user));
  }, []);

  const register = useCallback(async (data: RegisterFormData) => {
    const res = await authApi.register(data);
    setAuthToken(res.data.token);
    setUser(formatUser(res.data.user));
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setAuthToken(null);
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      register,
      logout,
    }),
    [user, isLoading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
