import { get } from "@/services/api";
import { InteraccionEscenario } from "@/models/interaccion_escenario";

export const MIS_INTERACCIONES_QUERY_KEY = ["interacciones", "me"];
export const PROGRESO_ALUMNO_QUERY_KEY = ["interacciones-escenario", "me"];

export interface ProgresoAlumnoData {
  total_escenarios: number;
  escenarios_completados: number;
  puntuacion_promedio: number | null;
  mejor_puntuacion: number | null;
  tiempo_total_minutos: number;
  interacciones: InteraccionEscenario[];
}

export async function fetchMisInteracciones(
  token: string
): Promise<InteraccionEscenario[]> {
  return get<InteraccionEscenario[]>("/interacciones-escenario/", { token });
}

export async function fetchProgresoAlumno(
  token: string
): Promise<ProgresoAlumnoData> {
  return get<ProgresoAlumnoData>("/interacciones-escenario/me", { token });
}