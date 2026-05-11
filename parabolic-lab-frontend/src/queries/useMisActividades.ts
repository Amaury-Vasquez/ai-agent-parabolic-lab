"use client";
import { useQuery } from "@tanstack/react-query";
import { useCookies } from "react-cookie";
import { fetchMisActividades, MIS_ACTIVIDADES_QUERY_KEY } from "@/fetchers/actividades";
import { ACCESS_TOKEN_COOKIE } from "@/constants/auth";

export function useMisActividades() {
  const [cookies] = useCookies([ACCESS_TOKEN_COOKIE]);
  const token = cookies[ACCESS_TOKEN_COOKIE];

  return useQuery({
    queryKey: MIS_ACTIVIDADES_QUERY_KEY,
    queryFn: () => fetchMisActividades(token),
    enabled: !!token,
  });
}
