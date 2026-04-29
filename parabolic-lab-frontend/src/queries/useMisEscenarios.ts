"use client";
import { useQuery } from "@tanstack/react-query";
import { useCookies } from "react-cookie";
import { fetchMisEscenarios, MIS_ESCENARIOS_QUERY_KEY } from "@/fetchers/escenarios";
import { ACCESS_TOKEN_COOKIE } from "@/constants/auth";

export function useMisEscenarios() {
  const [cookies] = useCookies([ACCESS_TOKEN_COOKIE]);
  const token = cookies[ACCESS_TOKEN_COOKIE];

  return useQuery({
    queryKey: MIS_ESCENARIOS_QUERY_KEY,
    queryFn: () => fetchMisEscenarios(token),
    enabled: !!token,
  });
}