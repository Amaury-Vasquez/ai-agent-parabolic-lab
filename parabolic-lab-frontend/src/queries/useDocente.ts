"use client";
import { useQuery } from "@tanstack/react-query";
import { useCookies } from "react-cookie";
import { fetchDocente, DOCENTE_QUERY_KEY, DocenteProfile } from "@/fetchers/auth";
import { ACCESS_TOKEN_COOKIE } from "@/constants/auth";

export function useDocente() {
  const [cookies] = useCookies([ACCESS_TOKEN_COOKIE]);
  const token = cookies[ACCESS_TOKEN_COOKIE];

  return useQuery<DocenteProfile>({
    queryKey: DOCENTE_QUERY_KEY,
    queryFn: () => fetchDocente(token),
    enabled: !!token,
  });
}
