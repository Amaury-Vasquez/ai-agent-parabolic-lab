import { get, post, patch, del } from "@/services/api";
import { Salon } from "@/types/salon";

export const MY_SALONES_QUERY_KEY = ["salones", "me"];

export const ESTUDIANTES_GLOBALES_QUERY_KEY = (
  sortBy?: string,
  order?: string,
  salonId?: string
) => ["docentes", "estudiantes-global", { sortBy, order, salonId }];

export interface SalonProgresoEstudiante {
  idalumno: string;
  nombre: string;
  apellidopaterno: string;
  promedio_puntuacion: number;
  escenarios_completados: number;
  total_intentos: number;
  tiempo_total_minutos: number;
  mejor_puntuacion: number;
}

export interface SalonProgresoResponse {
  estudiantes: SalonProgresoEstudiante[];
}

export const SALON_PROGRESO_QUERY_KEY = (salonId: string) => [
  "salones",
  salonId,
  "progreso",
];

export async function fetchMySalones(token: string): Promise<Salon[]> {
  return get<Salon[]>("/salones/me", { token });
}

export async function fetchSalonProgreso(
  token: string,
  salonId: string
): Promise<SalonProgresoEstudiante[]> {
  const data = await get<SalonProgresoResponse>(
    `/salones/${salonId}/progreso`,
    { token }
  );
  // Asegurar que siempre retorna un array, nunca undefined
  return data?.estudiantes ?? [];
}

export async function createSalon(
  token: string,
  data: { nombresalon: string }
): Promise<Salon> {
  return post<Salon>("/salones/", data, { token });
}

export async function updateSalon(
  token: string,
  idsalon: string,
  data: { nombresalon: string }
): Promise<Salon> {
  return patch<Salon>(`/salones/${idsalon}`, data, { token });
}

export const SALON_ESTUDIANTES_QUERY_KEY = (salonId: string) => [
  "salones",
  salonId,
  "estudiantes",
];

export interface EstudianteEnSalon {
  idalumno: string;
  nombre: string;
  apellido: string;
  correo: string;
  ultimo_acceso: string | null;
  escenarios_completados: number;
  total_escenarios: number;
}

export async function fetchEstudiantesBySalon(
  token: string,
  salonId: string
): Promise<EstudianteEnSalon[]> {
  return get<EstudianteEnSalon[]>(`/salones/${salonId}/estudiantes`, {
    token,
  });
}

export async function agregarEstudianteASalon(
  token: string,
  salonId: string,
  correoAlumno: string
): Promise<EstudianteEnSalon> {
  return post<EstudianteEnSalon>(
    `/salones/${salonId}/agregar-estudiante`,
    { correo: correoAlumno },
    { token }
  );
}

export async function darDeBajaEstudiante(
  token: string,
  salonId: string,
  idalumno: string
): Promise<void> {
  return del<void>(`/salones/${salonId}/estudiantes/${idalumno}`, { token });
}

// Estudiantes Globales
export interface EstudianteGlobal {
  idalumno: string;
  nombre: string;
  apellido: string;
  correo: string;
  idsalon: string;
  nombresalon: string;
  progreso_total: number;
  promedio_puntuacion: number;
  escenarios_completados: number;
  total_intentos: number;
}

export interface EstudiantesGlobalesResponse {
  estudiantes: EstudianteGlobal[];
  total: number;
}

export async function fetchEstudiantesGlobales(
  token: string,
  options?: {
    sort_by?: "nombre" | "promedio" | "interacciones" | "salon";
    order?: "asc" | "desc";
    idsalon?: string;
  }
): Promise<EstudianteGlobal[]> {
  const params = new URLSearchParams();

  if (options?.sort_by) params.append("sort_by", options.sort_by);
  if (options?.order) params.append("order", options.order);
  if (options?.idsalon) params.append("idsalon", options.idsalon);

  const queryString = params.toString();
  const endpoint = `/docentes/me/estudiantes-global${queryString ? `?${queryString}` : ""}`;

  const data = await get<EstudiantesGlobalesResponse>(endpoint, { token });
  return data?.estudiantes ?? [];
}