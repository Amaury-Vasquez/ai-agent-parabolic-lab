"use client";
import { useQuery } from "@tanstack/react-query";
import { useCookies } from "react-cookie";
import { ACCESS_TOKEN_COOKIE } from "@/constants/auth";
import { fetchInstitucion } from "@/fetchers/auth";
import type { Institucion } from "@/models/institucion";
import { INSTITUCION_QUERY_KEY } from "@/mutations/useUpdateInstitucion";

export function useInstitucion(idinstitucion: string | undefined) {
  const [cookies] = useCookies([ACCESS_TOKEN_COOKIE]);
  const token = cookies[ACCESS_TOKEN_COOKIE];

  return useQuery<Institucion>({
    queryKey: idinstitucion ? INSTITUCION_QUERY_KEY(idinstitucion) : [],
    queryFn: () => fetchInstitucion(token, idinstitucion!),
    enabled: !!token && !!idinstitucion,
  });
}
