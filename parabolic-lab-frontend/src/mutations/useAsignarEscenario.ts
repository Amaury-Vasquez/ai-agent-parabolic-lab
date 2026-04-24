import { post } from "@/services/api";
import { Scenario } from "@/models/scenario";

export async function asignarEscenario(
  token: string,
  idescenario: string,
  idsalon: string
): Promise<Scenario> {
  return post<Scenario>(`/escenarios/${idescenario}/asignar`, { idsalon }, { token });
}
