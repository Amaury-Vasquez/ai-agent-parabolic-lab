import { useQuery } from "@tanstack/react-query";
import { useCookies } from "react-cookie";
import { get } from "@/services/api";
import { ACCESS_TOKEN_COOKIE } from "@/constants/auth";

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

interface SalonProgresoResponse {
  estudiantes: SalonProgresoEstudiante[];
}

export const SALON_PROGRESO_QUERY_KEY = (salonId: string) => ["salones", salonId, "progreso"];

export async function fetchSalonProgreso(
  token: string,
  salonId: string
): Promise<SalonProgresoEstudiante[]> {
  const data = await get<SalonProgresoResponse>(`/salones/${salonId}/progreso`, { token });
  return data?.estudiantes ?? [];
}

export function useSalonProgreso(salonId: string) {
  const [cookies] = useCookies([ACCESS_TOKEN_COOKIE]);
  const token = cookies[ACCESS_TOKEN_COOKIE];

  return useQuery<SalonProgresoEstudiante[]>({
    queryKey: SALON_PROGRESO_QUERY_KEY(salonId),
    queryFn: () => fetchSalonProgreso(token, salonId),
    enabled: !!token && !!salonId,
  });
}
