import type {
  EstudianteEnSalon,
  EstudianteGlobal,
  EstudiantesGlobalesOptions,
  Order,
  SalonProgresoEstudiante,
  SortBy,
} from "@/models/estudiante";
import { get, post } from "@/services/api";
import { Salon } from "@/types/salon";

export const MY_SALONES_QUERY_KEY = ["salones", "me"];

export const SALON_PROGRESO_QUERY_KEY = (salonId: string) => [
  "salones",
  salonId,
  "progreso",
];

export const SALON_ESTUDIANTES_QUERY_KEY = (salonId: string) => [
  "salones",
  salonId,
  "estudiantes",
];

export const getEstudiantesGlobalesQueryKey = (
  sortBy?: SortBy,
  order?: Order,
  salonId?: string,
) => ["docentes", "estudiantes-global", { sortBy, order, salonId }];

export async function fetchMySalones(token: string): Promise<Salon[]> {
  return get<Salon[]>("/salones/me", { token });
}

export async function fetchSalonProgreso(
  token: string,
  salonId: string,
): Promise<SalonProgresoEstudiante[]> {
  return get<SalonProgresoEstudiante[]>(
    `/salones/${salonId}/progreso`,
    { token },
  );
}

export async function fetchEstudiantesBySalon(
  token: string,
  salonId: string,
): Promise<EstudianteEnSalon[]> {
  return get<EstudianteEnSalon[]>(`/salones/${salonId}/estudiantes`, { token });
}

export async function fetchEstudiantesGlobales(
  token: string,
  options?: EstudiantesGlobalesOptions,
): Promise<EstudianteGlobal[]> {
  const params = new URLSearchParams();

  if (options?.sort_by) params.append("sort_by", options.sort_by);
  if (options?.order) params.append("order", options.order);
  if (options?.idsalon) params.append("idsalon", options.idsalon);

  const queryString = params.toString();
  const endpoint = `/docentes/me/estudiantes-global${queryString ? `?${queryString}` : ""}`;

  return get<EstudianteGlobal[]>(endpoint, { token });
}

export async function unirseASalon(
  token: string,
  codigoacceso: string,
): Promise<void> {
  return post<void>("/alumnos-en-salon/unirse", { codigoacceso }, { token });
}
