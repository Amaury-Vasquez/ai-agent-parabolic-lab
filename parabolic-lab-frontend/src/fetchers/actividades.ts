import { get, post, patch } from "@/services/api";
import { ActividadAlumno } from "@/models/actividad_alumno";
import { Activity, ActivityWithScenarios } from "@/models/activity";

export const ACTIVIDADES_QUERY_KEY = ["actividades"];
export const MIS_ACTIVIDADES_QUERY_KEY = ["actividades", "me"];
export const ACTIVIDAD_QUERY_KEY = (idactividad: string) => ["actividades", idactividad];

export async function fetchActividades(token: string): Promise<Activity[]> {
  return get<Activity[]>("/actividades-interactivas/", { token });
}

export async function fetchMisActividades(
  token: string,
): Promise<ActivityWithScenarios[]> {
  return get<ActivityWithScenarios[]>("/actividades-interactivas/me", { token });
}

export async function fetchActividad(
  token: string,
  idactividad: string
): Promise<Activity> {
  return get<Activity>(`/actividades-interactivas/${idactividad}`, { token });
}

export async function createActividadAlumno(
  token: string,
  data: { idactividad: string; idalumno: string }
): Promise<ActividadAlumno> {
  return post<ActividadAlumno>("/actividades-alumno/", data, { token });
}

export async function updateActividadAlumno(
  token: string,
  idactividadalumno: string,
  data: { puntuacionobtenida?: number; completada?: boolean }
): Promise<ActividadAlumno> {
  return patch<ActividadAlumno>(
    `/actividades-alumno/${idactividadalumno}`,
    data,
    { token }
  );
}