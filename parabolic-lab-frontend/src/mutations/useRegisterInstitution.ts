import { useMutation } from "@tanstack/react-query";
import { post } from "@/services/api";
import { AuthResponse } from "@/types/auth";

export interface RegisterInstitutionParams {
  nombre_institucion: string;
  clavect?: string;
  telefono: string;
  email_institucion: string;
  direccion?: string;
  colonia?: string;
  codigopostal?: string;
  municipio?: string;
  estado?: string;
  nombre: string;
  email: string;
  password: string;
  apellidopaterno: string;
  apellidomaterno?: string;
}

export async function registerInstitution(data: RegisterInstitutionParams): Promise<AuthResponse> {
  return post<AuthResponse>("/auth/register/institucion", data);
}

export function useRegisterInstitution() {
  const { mutateAsync: registerInst, data: authData, ...rest } = useMutation({
    mutationFn: registerInstitution,
  });
  return { registerInst, authData, ...rest };
}
