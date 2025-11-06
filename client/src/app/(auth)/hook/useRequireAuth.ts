"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

export const useRequireAuth = (requiredRole?: "admin" | "member") => {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      // If not authenticated, redirect to login
      if (!isAuthenticated) {
        router.push("/login");
        return;
      }

      // If role is required and user doesn't have it, redirect
      if (requiredRole && user?.role !== requiredRole) {
        router.push("/");
      }
    }
  }, [user, loading, isAuthenticated, requiredRole, router]);

  return { user, loading };
}
