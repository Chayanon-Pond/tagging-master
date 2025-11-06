"use client";
import { useState } from "react";
import { useAuth, RegisterData } from "../context/AuthContext";

export const useRegister = () => {
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (userData: RegisterData) => {
    setError("");
    setLoading(true);

    try {
      await register(userData);
    } catch (err: any) {
      setError(err.message || "An error occurred during registration");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const validatePasswordMatch = (password: string, confirmPassword: string): boolean => {
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    return true;
  };

  return {
    handleRegister,
    loading,
    error,
    setError,
    validatePasswordMatch,
  };
}
