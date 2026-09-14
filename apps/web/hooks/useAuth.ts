"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";

export const useAuth = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { setAuth, clearAuth, user, isAuthenticated } = useAuthStore();

  const fetchUserProfile = async (accessToken: string) => {
    const response = await apiClient.get("/auth/profile", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response.data;
  };

  const logoutMutation = useMutation({
    mutationFn: async () => {
      return Promise.resolve();
    },
    onSuccess: () => {
      clearAuth();
      queryClient.clear();
      router.push("/login");
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.delete("/users/me");
      return response.data;
    },
    onSuccess: () => {
      clearAuth();
      queryClient.clear();
      router.push("/");
    },
  });

  return {
    user,
    isAuthenticated,
    fetchUserProfile,
    logout: logoutMutation.mutateAsync,
    isLoggingOut: logoutMutation.isPending,
    deleteAccount: deleteAccountMutation.mutateAsync,
    isDeletingAccount: deleteAccountMutation.isPending,
  };
};
