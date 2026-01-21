"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { mockApi } from "@/lib/mockApi";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";

export const useAuth = () => {
  const router = useRouter();
  const { setAuth, clearAuth, user, isAuthenticated } = useAuthStore();

  const loginMutation = useMutation({
    mutationFn: mockApi.login,
    onSuccess: (data) => {
      setAuth(data.user, data.token);
      router.push(`/dashboard/${data.user.role}`);
    },
  });

  const signupMutation = useMutation({
    mutationFn: mockApi.signup,
    onSuccess: (data) => {
      setAuth(data.user, data.token);
      router.push("/verify-email");
    },
  });

  const logoutMutation = useMutation({
    mutationFn: mockApi.logout,
    onSuccess: () => {
      clearAuth();
      router.push("/signin");
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: mockApi.deleteAccount,
    onSuccess: () => {
      clearAuth();
      router.push("/");
    },
  });

  return {
    user,
    isAuthenticated,
    login: loginMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    signup: signupMutation.mutate,
    isSigningUp: signupMutation.isPending,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
    deleteAccount: deleteAccountMutation.mutate,
    isDeletingAccount: deleteAccountMutation.isPending,
    loginError: loginMutation.error,
    signupError: signupMutation.error,
  };
};
