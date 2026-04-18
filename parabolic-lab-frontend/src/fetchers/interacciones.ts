import { get, post, patch } from "@/services/api";
import { InteraccionEscenario } from "@/models/interaccion_escenario";

export const INTERACCION_QUERY_KEY = (idinteraccion: string) => [
  "interacciones",
  idinteraccion,
];

export async function fetchInteraccion(
  token: string,
  idinteraccion: string
): Promise<InteraccionEscenario> {
  return get<InteraccionEscenario>(
    `/interacciones-escenario/${idinteraccion}`,
    { token }
  );
}

export async function createInteraccion(
  token: string,
  data: { idescenario: string; idalumno: string }
): Promise<InteraccionEscenario> {
  return post<InteraccionEscenario>("/interacciones-escenario/", data, {
    token,
  });
}

export async function updateInteraccion(
  token: string,
  idinteraccion: string,
  data: {
    fechafin?: string;
    tiempototal?: number;
    puntuacion?: number;
    completado?: boolean;
    datosinteraccion?: Record<string, unknown>;
  }
): Promise<InteraccionEscenario> {
  return patch<InteraccionEscenario>(
    `/interacciones-escenario/${idinteraccion}`,
    data,
    { token }
  );
}