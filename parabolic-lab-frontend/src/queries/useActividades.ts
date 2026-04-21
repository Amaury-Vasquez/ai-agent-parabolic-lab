"use client";
import { useQuery } from "@tanstack/react-query";
import { useCookies } from "react-cookie";
import { fetchActividades, ACTIVIDADES_QUERY_KEY } from "@/fetchers/actividades";
import { ACCESS_TOKEN_COOKIE } from "@/constants/auth";

export function useActividades() {
  const [cookies] = useCookies([ACCESS_TOKEN_COOKIE]);
  const token = cookies[ACCESS_TOKEN_COOKIE];

  return useQuery({
    queryKey: ACTIVIDADES_QUERY_KEY,
    queryFn: () => fetchActividades(token),
    enabled: !!token,
  });
}