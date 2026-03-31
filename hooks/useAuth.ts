"use client";

import { useMutation } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";

export const useAuth = () => {
  const router = useRouter();
  const { setAuth, clearAuth, user, isAuthenticated } = useAuthStore();

  const loginMutation = useMutation({
    mutationFn: async (credentials: { email: string; password?: string }) => {
      // Note: Backend login expects email and password
      const response = await apiClient.post("/auth/login", credentials);
      return response.data;
    },
    onSuccess: (data) => {
      let accessToken = data.access_token || data.accessToken;
      let user = data.user;

      // If backend only returns { access_token }, decode the JWT to get the user
      if (!user && accessToken) {
        try {
          const base64Url = accessToken.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
              return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join(''));
          const decoded = JSON.parse(jsonPayload);
          
          user = {
            id: decoded.sub || decoded.id,
            email: decoded.email,
            role: decoded.role,
            name: decoded.name || decoded.email?.split('@')[0] || "User",
            isOnboarded: decoded.isOnboarded || false,
          };
        } catch (e) {
          console.error("Failed to decode token", e);
        }
      }

      setAuth(user, accessToken);
      if (user?.role) {
        router.push(`/dashboard/${user.role.toLowerCase().replace('_', '-')}`);
      } else {
        router.push("/dashboard/agent"); // fallback
      }
    },
  });

  const signupMutation = useMutation({
    mutationFn: async (userData: any) => {
      const response = await apiClient.post("/auth/register", userData);
      return response.data;
    },
    onSuccess: (data) => {
      let accessToken = data.access_token || data.accessToken;
      let user = data.user;

      if (accessToken) {
        if (!user) {
          try {
            const base64Url = accessToken.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            const decoded = JSON.parse(jsonPayload);
            
            user = {
              id: decoded.sub || decoded.id,
              email: decoded.email,
              role: decoded.role,
              name: decoded.name || decoded.email?.split('@')[0] || "User",
              isOnboarded: decoded.isOnboarded || false,
            };
          } catch (e) {
            console.error("Failed to decode token", e);
          }
        }
        setAuth(user, accessToken);
        if (user?.role) {
          router.push(`/dashboard/${user.role.toLowerCase().replace('_', '-')}`);
        } else {
          router.push("/dashboard/agent");
        }
      } else {
        router.push("/login");
      }
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      // If there's a backend logout, call it here
      // For now we just clear local state
      return Promise.resolve();
    },
    onSuccess: () => {
      clearAuth();
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
