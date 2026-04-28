import { useQuery } from "@tanstack/react-query";
import { useCookies } from "react-cookie";
import { InteraccionEscenario } from "@/models/interaccion_escenario";
import { get } from "@/services/api";
import { ACCESS_TOKEN_COOKIE } from "@/constants/auth";

export interface ProgresoAlumnoData {
  total_escenarios: number;
  escenarios_completados: number;
  puntuacion_promedio: number | null;
  mejor_puntuacion: number | null;
  tiempo_total_minutos: number;
  interacciones: InteraccionEscenario[];
}

export const PROGRESO_ALUMNO_QUERY_KEY = ["interacciones-escenario", "me"];

export async function fetchProgresoAlumno(token: string): Promise<ProgresoAlumnoData> {
  return get<ProgresoAlumnoData>("/interacciones-escenario/me", { token });
}

export function useProgresoAlumno() {
  const [cookies] = useCookies([ACCESS_TOKEN_COOKIE]);
  const token = cookies[ACCESS_TOKEN_COOKIE];

  return useQuery({
    queryKey: PROGRESO_ALUMNO_QUERY_KEY,
    queryFn: () => fetchProgresoAlumno(token),
    enabled: !!token,
  });
}
