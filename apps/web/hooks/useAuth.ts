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

  const loginMutation = useMutation({
    mutationFn: async (credentials: { email: string; password?: string }) => {
      const response = await apiClient.post("/auth/login", credentials);
      return response.data;
    },
    onSuccess: async (data) => {
      const accessToken = data.access_token || data.accessToken;
      if (!accessToken) {
        router.push("/login");
        return;
      }

      try {
        const userData = await fetchUserProfile(accessToken);
        setAuth(userData, accessToken);
        if (userData?.role) {
          router.push(`/dashboard/${userData.role.toLowerCase().replace('_', '-')}`);
        } else {
          router.push("/dashboard/agent");
        }
      } catch (e) {
        console.error("Failed to fetch user profile", e);
        router.push("/login");
      }
    },
  });

  const signupMutation = useMutation({
    mutationFn: async (userData: any) => {
      const response = await apiClient.post("/auth/register", userData);
      return response.data;
    },
    onSuccess: async (data) => {
      const accessToken = data.access_token || data.accessToken;
      if (!accessToken) {
        router.push("/login");
        return;
      }

      try {
        const userData = await fetchUserProfile(accessToken);
        setAuth(userData, accessToken);
        if (userData?.role) {
          router.push(`/dashboard/${userData.role.toLowerCase().replace('_', '-')}`);
        } else {
          router.push("/dashboard/agent");
        }
      } catch (e) {
        console.error("Failed to fetch user profile", e);
        router.push("/login");
      }
    },
  });

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
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    signup: signupMutation.mutateAsync,
    isSigningUp: signupMutation.isPending,
    logout: logoutMutation.mutateAsync,
    isLoggingOut: logoutMutation.isPending,
    deleteAccount: deleteAccountMutation.mutateAsync,
    isDeletingAccount: deleteAccountMutation.isPending,
    loginError: loginMutation.error,
    signupError: signupMutation.error,
  };
};