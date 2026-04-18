"use client";
import { useQuery } from "@tanstack/react-query";
import { useCookies } from "react-cookie";
import {
  fetchEstudiantesGlobales,
  ESTUDIANTES_GLOBALES_QUERY_KEY,
  EstudianteGlobal,
} from "@/fetchers/salones";
import { ACCESS_TOKEN_COOKIE } from "@/constants/auth";

export interface UseEstudiantesGlobalesOptions {
  sort_by?: "nombre" | "promedio" | "interacciones" | "salon";
  order?: "asc" | "desc";
  idsalon?: string;
}

export function useEstudiantesGlobales(options?: UseEstudiantesGlobalesOptions) {
  const [cookies] = useCookies([ACCESS_TOKEN_COOKIE]);
  const token = cookies[ACCESS_TOKEN_COOKIE];

  return useQuery<EstudianteGlobal[]>({
    queryKey: ESTUDIANTES_GLOBALES_QUERY_KEY(options?.sort_by, options?.order, options?.idsalon),
    queryFn: () =>
      fetchEstudiantesGlobales(token, {
        sort_by: options?.sort_by,
        order: options?.order,
        idsalon: options?.idsalon,
      }),
    enabled: !!token,
  });
}
