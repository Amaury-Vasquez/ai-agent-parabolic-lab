import { useMutation } from "@tanstack/react-query";
import { post } from "@/services/api";
import { AuthResponse } from "@/types/auth";

export async function login(email: string, password: string): Promise<AuthResponse> {
  return post<AuthResponse>("/auth/login", { email, password });
}

interface LoginParams {
  email: string;
  password: string;
}

export function useLogin() {
  const { mutateAsync: loginUser, data: authData, ...rest } = useMutation({
    mutationFn: (params: LoginParams) => login(params.email, params.password),
  });
  return { loginUser, authData, ...rest };
}
