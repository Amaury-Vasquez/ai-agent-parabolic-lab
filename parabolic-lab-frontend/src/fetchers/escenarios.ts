import { get, post, patch, del } from "@/services/api";
import { sanitizeData } from "@/utils/sanitizeData";
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

export async function fetchEscenario(
  token: string,
  idescenario: string
): Promise<Scenario> {
  return get<Scenario>(`/escenarios/${idescenario}`, { token });
}

export async function createEscenario(
  token: string,
  data: {
    idsalon: string;
    nombre: string;
    descripcion?: string;
    niveldificultad: string;
    tipoescenario: string;
    objetivosaprendizaje?: string;
    instrucciones?: string;
    tiempolimite?: number;
    intentospermitidos?: number;
    configuracionescenario?: Record<string, unknown>;
  }
): Promise<Scenario> {
  // Sanitizar los datos para evitar enviar campos innecesarios
  const sanitizedData = sanitizeData(data);
  return post<Scenario>("/escenarios/", sanitizedData, { token });
}

export async function updateEscenario(
  token: string,
  idescenario: string,
  data: Partial<{
    nombre: string;
    descripcion: string;
    niveldificultad: string;
    tipoescenario: string;
    objetivosaprendizaje: string;
    instrucciones: string;
    tiempolimite: number;
    intentospermitidos: number;
    configuracionescenario: Record<string, unknown>;
    activo: boolean;
  }>
): Promise<Scenario> {
  // Sanitizar los datos para evitar enviar campos innecesarios como fechas
  const sanitizedData = sanitizeData(data);
  return patch<Scenario>(`/escenarios/${idescenario}`, sanitizedData, { token });
}

export async function deleteEscenario(
  token: string,
  idescenario: string
): Promise<void> {
  return del<void>(`/escenarios/${idescenario}`, { token });
}

export async function asignarEscenario(
  token: string,
  idescenario: string,
  idsalon: string
): Promise<Scenario> {
  return post<Scenario>(
    `/escenarios/${idescenario}/asignar`,
    { idsalon },
    { token }
  );
}