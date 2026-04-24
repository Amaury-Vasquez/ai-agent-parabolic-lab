import { get } from "@/services/api";

export const ME_QUERY_KEY = ["auth", "me"];

export interface UserProfile {
  idusuario: string;
  authid: string;
  email: string;
  nombre: string;
  apellidopaterno: string;
  apellidomaterno?: string | null;
  tipousuario: string;
  idinstitucion: string;
  activo?: boolean | null;
}

export async function fetchMe(token: string): Promise<UserProfile> {
  return get<UserProfile>("/auth/me", { token });
}
