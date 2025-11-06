"use client";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";

export interface User {
  member_id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: "admin" | "member";
  status: string;
  created_at: string;
}

export interface JWTPayload {
  sub: number; // member_id
  email: string;
  role: "admin" | "member";
  iat: number; // issued at
  exp: number; // expiration time
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  payload: JWTPayload | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  getAuthHeaders: () => HeadersInit;
}

export interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [payload, setPayload] = useState<JWTPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Decode JWT token and extract payload
  const decodeToken = (token: string): JWTPayload | null => {
    try {
      const decoded = jwtDecode<JWTPayload>(token);

      // Check if token is expired
      if (decoded.exp * 1000 < Date.now()) {
        console.log("Token expired");
        return null;
      }

      return decoded;
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  };

  useEffect(() => {
    const checkAuth = () => {
      try {
        const storedToken = localStorage.getItem("access_token");
        const userData = localStorage.getItem("user");

        if (storedToken && userData) {
          const decodedPayload = decodeToken(storedToken);

          if (decodedPayload) {
            setToken(storedToken);
            setPayload(decodedPayload);
            setUser(JSON.parse(userData));
          } else {
            // Token is invalid or expired, clear everything
            localStorage.removeItem("access_token");
            localStorage.removeItem("user");
          }
        }
      } catch (error) {
        console.error("Error checking auth:", error);
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      const response = await fetch("http://localhost:3001/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Decode token and set all auth states
      const decodedPayload = decodeToken(data.access_token);

      if (!decodedPayload) {
        throw new Error("Invalid token received");
      }

      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setToken(data.access_token);
      setPayload(decodedPayload);
      setUser(data.user);

      if (data.user.role === "admin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/");
      }
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      const response = await fetch("http://localhost:3001/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      router.push("/login");
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    setToken(null);
    setPayload(null);
    setUser(null);
    router.push("/login");
  };

  // Get auth headers for API requests
  const getAuthHeaders = (): HeadersInit => {
    if (!token) {
      return {
        "Content-Type": "application/json",
      };
    }

    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  const value: AuthContextType = {
    user,
    token,
    payload,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user && !!token,
    isAdmin: user?.role === "admin",
    getAuthHeaders,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
