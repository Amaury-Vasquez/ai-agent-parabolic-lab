"use client";
import { useQuery } from "@tanstack/react-query";
import { useCookies } from "react-cookie";
import { fetchEscenario, ESCENARIO_QUERY_KEY } from "@/fetchers/escenarios";
import { ACCESS_TOKEN_COOKIE } from "@/constants/auth";

export function useEscenario(idescenario: string | undefined) {
  const [cookies] = useCookies([ACCESS_TOKEN_COOKIE]);
  const token = cookies[ACCESS_TOKEN_COOKIE];

  return useQuery({
    queryKey: idescenario ? ESCENARIO_QUERY_KEY(idescenario) : [],
    queryFn: () => fetchEscenario(token, idescenario!),
    enabled: !!token && !!idescenario,
  });
}
