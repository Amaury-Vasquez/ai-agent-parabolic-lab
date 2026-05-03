"use client";
import { useQuery } from "@tanstack/react-query";
import { useCookies } from "react-cookie";
import { fetchActividad, ACTIVIDAD_QUERY_KEY } from "@/fetchers/actividades";
import { ACCESS_TOKEN_COOKIE } from "@/constants/auth";

export function useActividad(idactividad: string) {
  const [cookies] = useCookies([ACCESS_TOKEN_COOKIE]);
  const token = cookies[ACCESS_TOKEN_COOKIE];

  return useQuery({
    queryKey: ACTIVIDAD_QUERY_KEY(idactividad),
    queryFn: () => fetchActividad(token, idactividad),
    enabled: !!token && !!idactividad,
  });
}