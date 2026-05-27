"use client";
import { useQuery } from "@tanstack/react-query";
import { useCookies } from "react-cookie";
import { ACCESS_TOKEN_COOKIE } from "@/constants/auth";
import { fetchReporteIntento, REPORTE_INTENTO_QUERY_KEY } from "@/fetchers/reportes";

export function useReporteIntento(idinteraccion: string | null) {
  const [cookies] = useCookies([ACCESS_TOKEN_COOKIE]);
  const token = cookies[ACCESS_TOKEN_COOKIE];

  return useQuery({
    queryKey: REPORTE_INTENTO_QUERY_KEY(idinteraccion ?? ""),
    queryFn: () => fetchReporteIntento(token, idinteraccion!),
    enabled: !!token && !!idinteraccion,
  });
}
