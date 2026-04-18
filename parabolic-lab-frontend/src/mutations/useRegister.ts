import { useMutation } from "@tanstack/react-query";
import { post } from "@/services/api";
import { AuthResponse } from "@/types/auth";

export interface RegisterParams {
  email: string;
  password: string;
  nombre: string;
  apellidopaterno: string;
  apellidomaterno?: string;
  idinstitucion: string;
  tipousuario: string;
  matricula?: string;
  gradoacademico?: string;
}

export async function register(data: RegisterParams): Promise<AuthResponse> {
  return post<AuthResponse>("/auth/register", data);
}

export function useRegister() {
  const { mutateAsync: registerUser, data: authData, ...rest } = useMutation({
    mutationFn: register,
  });
  return { registerUser, authData, ...rest };
}
