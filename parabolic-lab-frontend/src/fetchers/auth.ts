import { get, patch } from "@/services/api";

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

export interface DocenteProfile {
  iddocente: string;
  idusuario: string;
  gradoacademico?: string | null;
}

export interface Institucion {
  idinstitucion: string;
  clavect?: string | null;
  nombre: string;
  direccion?: string | null;
  colonia?: string | null;
  municipio?: string | null;
  estado?: string | null;
  codigopostal?: string | null;
  email: string;
  telefono: string;
  activa?: boolean | null;
}

export async function fetchMe(token: string): Promise<UserProfile> {
  return get<UserProfile>("/auth/me", { token });
}

export interface UpdateUsuarioData {
  nombre?: string;
  apellidopaterno?: string;
  apellidomaterno?: string;
}

export async function fetchUpdateUsuario(
  token: string,
  data: UpdateUsuarioData,
): Promise<UserProfile> {
  return patch<UserProfile>("/usuarios/me", data, { token });
}

export interface UpdateDocenteData {
  gradoacademico?: string;
}

export async function fetchUpdateDocente(
  token: string,
  data: UpdateDocenteData,
): Promise<DocenteProfile> {
  return patch<DocenteProfile>("/docentes/me", data, { token });
}

export async function fetchInstitucion(
  token: string,
  idinstitucion: string,
): Promise<Institucion> {
  return get<Institucion>(`/instituciones/${idinstitucion}`, { token });
}

export interface UpdateInstitucionData {
  nombre?: string;
  direccion?: string;
  telefono?: string;
}

export async function fetchDocente(token: string): Promise<DocenteProfile> {
  return get<DocenteProfile>("/docentes/me", { token });
}

export const DOCENTE_QUERY_KEY = ["docente", "me"];

export async function fetchUpdateInstitucion(
  token: string,
  idinstitucion: string,
  data: UpdateInstitucionData,
): Promise<Institucion> {
  return patch<Institucion>(`/instituciones/${idinstitucion}`, data, { token });
}
