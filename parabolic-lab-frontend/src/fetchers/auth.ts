import type { Institucion } from "@/models/institucion";
import type { DocenteProfile, UserProfile } from "@/models/user";
import { get } from "@/services/api";

export const ME_QUERY_KEY = ["auth", "me"];
export const DOCENTE_QUERY_KEY = ["docente", "me"];

export async function fetchMe(token: string): Promise<UserProfile> {
  return get<UserProfile>("/auth/me", { token });
}

export async function fetchDocente(token: string): Promise<DocenteProfile> {
  return get<DocenteProfile>("/docentes/me", { token });
}

export async function fetchInstitucion(
  token: string,
  idinstitucion: string,
): Promise<Institucion> {
  return get<Institucion>(`/instituciones/${idinstitucion}`, { token });
}
