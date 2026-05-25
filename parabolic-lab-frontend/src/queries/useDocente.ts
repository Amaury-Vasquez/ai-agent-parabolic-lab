"use client";
import { useQuery } from "@tanstack/react-query";
import { useCookies } from "react-cookie";
import { fetchDocente, DOCENTE_QUERY_KEY } from "@/fetchers/auth";
import type { DocenteProfile } from "@/models/user";
import { ACCESS_TOKEN_COOKIE } from "@/constants/auth";
import { useMe } from "./useMe";

export function useDocente() {
  const [cookies] = useCookies([ACCESS_TOKEN_COOKIE]);
  const token = cookies[ACCESS_TOKEN_COOKIE];
  const { data: me } = useMe();

  return useQuery<DocenteProfile>({
    queryKey: DOCENTE_QUERY_KEY,
    queryFn: () => fetchDocente(token),
    enabled: !!token && me?.tipousuario === "docente",
  });
}
