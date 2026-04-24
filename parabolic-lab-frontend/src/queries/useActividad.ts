import { useQuery } from "@tanstack/react-query";
import { useCookies } from "react-cookie";
import { get, patch, post } from "@/services/api";
import { ActividadAlumno } from "@/models/actividad_alumno";
import { Activity } from "@/models/activity";
import { ACCESS_TOKEN_COOKIE } from "@/constants/auth";

export const ACTIVIDAD_QUERY_KEY = (idactividad: string) => ["actividades", idactividad];

export async function fetchActividad(token: string, idactividad: string): Promise<Activity> {
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
  return patch<ActividadAlumno>(`/actividades-alumno/${idactividadalumno}`, data, { token });
}

export function useActividad(idactividad: string) {
  const [cookies] = useCookies([ACCESS_TOKEN_COOKIE]);
  const token = cookies[ACCESS_TOKEN_COOKIE];

  return useQuery({
    queryKey: ACTIVIDAD_QUERY_KEY(idactividad),
    queryFn: () => fetchActividad(token, idactividad),
    enabled: !!token && !!idactividad,
  });
}
