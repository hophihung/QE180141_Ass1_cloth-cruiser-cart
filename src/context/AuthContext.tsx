import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import { apiFetch, setAuthToken } from "@/lib/api";

const AUTH_STORAGE_KEY = "cloth-cruiser-auth-token";

export interface AuthUser {
  id: string;
  email: string;
  createdAt?: string;
  role?: "user" | "admin";
}

interface LoginInput {
  email: string;
  password: string;
}

interface RegisterInput extends LoginInput {}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (input: LoginInput) => Promise<AuthUser>;
  register: (input: RegisterInput) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const getStoredToken = () => {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(AUTH_STORAGE_KEY);
};

const storeToken = (token: string | null) => {
  if (typeof window === "undefined") return;
  if (token) {
    window.localStorage.setItem(AUTH_STORAGE_KEY, token);
  } else {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
  }
};

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [token, setTokenState] = useState<string | null>(() =>
    getStoredToken()
  );
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const syncToken = useCallback((nextToken: string | null) => {
    setTokenState(nextToken);
    setAuthToken(nextToken);
    storeToken(nextToken);
  }, []);

  useEffect(() => {
    // ensure api layer is aware of the initial token
    setAuthToken(token);
  }, [token]);

  const refresh = useCallback(async () => {
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = (await apiFetch("/api/auth/me")) as AuthUser | null;
      if (data && data.id) {
        setUser(data);
      } else {
        syncToken(null);
        setUser(null);
      }
    } catch (error) {
      console.error("Failed to refresh auth state", error);
      syncToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [syncToken, token]);

  useEffect(() => {
    refresh();
    // refresh already depends on token and will rerun when it changes
  }, [refresh]);

  const login = useCallback(
    async (input: LoginInput) => {
      setLoading(true);
      try {
        const result = (await apiFetch("/api/auth/login", {
          method: "POST",
          json: input,
        })) as { token?: string; user?: AuthUser } | null;

        if (!result?.token || !result.user) {
          throw new Error("Unexpected login response");
        }

        syncToken(result.token);
        setUser(result.user);
        return result.user;
      } catch (error) {
        syncToken(null);
        setUser(null);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [syncToken]
  );

  const register = useCallback(
    async (input: RegisterInput) => {
      await apiFetch("/api/auth/register", {
        method: "POST",
        json: input,
      });
      return login(input);
    },
    [login]
  );

  const logout = useCallback(async () => {
    try {
      if (token) {
        // best-effort logout call, ignore errors
        await apiFetch("/api/auth/logout", { method: "POST" }).catch(
          () => undefined
        );
      }
    } finally {
      syncToken(null);
      setUser(null);
      setLoading(false);
    }
  }, [syncToken, token]);

  const value = useMemo(
    () => ({ user, token, loading, login, register, logout, refresh }),
    [loading, login, logout, refresh, register, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
};
