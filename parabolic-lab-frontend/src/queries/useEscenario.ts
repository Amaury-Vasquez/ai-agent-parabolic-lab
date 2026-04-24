import { useQuery } from "@tanstack/react-query";
import { useCookies } from "react-cookie";
import { get } from "@/services/api";
import { Scenario } from "@/models/scenario";
import { ACCESS_TOKEN_COOKIE } from "@/constants/auth";

export const ESCENARIO_QUERY_KEY = (idescenario: string) => ["escenarios", idescenario];
export const ESCENARIOS_SALON_QUERY_KEY = (salonId: string) => ["escenarios", salonId];

export async function fetchEscenario(token: string, idescenario: string): Promise<Scenario> {
  return get<Scenario>(`/escenarios/${idescenario}`, { token });
}

export async function fetchEscenariosBySalon(token: string, salonId: string): Promise<Scenario[]> {
  return get<Scenario[]>(`/escenarios/?idsalon=${salonId}`, { token });
}

export function useEscenario(idescenario: string | undefined) {
  const [cookies] = useCookies([ACCESS_TOKEN_COOKIE]);
  const token = cookies[ACCESS_TOKEN_COOKIE];

  return useQuery({
    queryKey: ESCENARIO_QUERY_KEY(idescenario ?? ''),
    queryFn: () => fetchEscenario(token, idescenario!),
    enabled: !!token && !!idescenario,
  });
}

export function useEscenariosBySalon(idsalon: string) {
  const [cookies] = useCookies([ACCESS_TOKEN_COOKIE]);
  const token = cookies[ACCESS_TOKEN_COOKIE];

  return useQuery({
    queryKey: ESCENARIOS_SALON_QUERY_KEY(idsalon),
    queryFn: () => fetchEscenariosBySalon(token, idsalon),
    enabled: !!token && !!idsalon,
  });
}
