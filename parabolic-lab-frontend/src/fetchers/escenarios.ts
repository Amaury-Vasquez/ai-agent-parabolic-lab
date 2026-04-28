import { get } from "@/services/api";
import { Scenario } from "@/models/scenario";


export const ESCENARIOS_SALON_QUERY_KEY = (salonId: string) => ["escenarios", salonId];
export const MIS_ESCENARIOS_QUERY_KEY = ["escenarios", "mis"];
export const ESCENARIO_QUERY_KEY = (idescenario: string) => ["escenarios", idescenario];

export async function fetchEscenariosBySalon(
  token: string,
  salonId: string
): Promise<Scenario[]> {
  return get<Scenario[]>(`/escenarios/?idsalon=${salonId}`, { token });
}

export async function fetchMisEscenarios(token: string): Promise<Scenario[]> {
  return get<Scenario[]>("/escenarios/me", { token });
}
export async function fetchEscenario(token: string, idescenario: string): Promise<Scenario> {
  return get<Scenario>(`/escenarios/${idescenario}`, { token });
}