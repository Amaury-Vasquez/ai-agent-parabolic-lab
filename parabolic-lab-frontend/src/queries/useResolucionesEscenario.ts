"use client";
import { useQuery } from "@tanstack/react-query";
import { useCookies } from "react-cookie";
import { ACCESS_TOKEN_COOKIE } from "@/constants/auth";
import {
  fetchResolucionesEscenario,
  SALON_ESCENARIO_RESOLUCIONES_QUERY_KEY,
} from "@/fetchers/salones";

export function useResolucionesEscenario(
  salonId: string,
  escenarioId: string,
) {
  const [cookies] = useCookies([ACCESS_TOKEN_COOKIE]);
  const token = cookies[ACCESS_TOKEN_COOKIE];

  return useQuery({
    queryKey: SALON_ESCENARIO_RESOLUCIONES_QUERY_KEY(salonId, escenarioId),
    queryFn: () => fetchResolucionesEscenario(token, salonId, escenarioId),
    enabled: !!token && !!salonId && !!escenarioId,
  });
}
