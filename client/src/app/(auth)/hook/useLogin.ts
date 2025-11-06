"use client";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export const useLogin = () => {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (email: string, password: string) => {
    setError("");
    setLoading(true);

    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || "An error occurred during login");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    handleLogin,
    loading,
    error,
    setError,
  };
}
