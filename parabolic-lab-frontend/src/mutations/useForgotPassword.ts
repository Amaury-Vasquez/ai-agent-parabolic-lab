"use client";
import { useMutation } from "@tanstack/react-query";
import { post } from "@/services/api";

interface ForgotPasswordParams {
  email: string;
  callback_url: string;
}

interface ForgotPasswordResponse {
  sent: boolean;
}

interface CheckResetCodeResponse {
  is_code_valid: boolean;
}

interface ResetPasswordParams {
  code: string;
  password: string;
}

interface ResetPasswordResponse {
  success: boolean;
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (params: ForgotPasswordParams) =>
      post<ForgotPasswordResponse>("/auth/password/forgot", params),
  });
}

export function useVerifyResetCode() {
  return useMutation({
    mutationFn: (code: string) =>
      post<CheckResetCodeResponse>("/auth/password/reset/verify", { code }),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (params: ResetPasswordParams) =>
      post<ResetPasswordResponse>("/auth/password/reset", params),
  });
}
