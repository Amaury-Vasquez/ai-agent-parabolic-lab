import { get } from "@/services/api";
import { InteraccionEscenario } from "@/models/interaccion_escenario";

export const MIS_INTERACCIONES_QUERY_KEY = ["interacciones", "me"];

export async function fetchMisInteracciones(
  token: string
): Promise<InteraccionEscenario[]> {
  return get<InteraccionEscenario[]>("/interacciones-escenario/", { token });
}