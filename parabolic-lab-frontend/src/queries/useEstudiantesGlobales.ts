"use client";
import { useQuery } from "@tanstack/react-query";
import { useCookies } from "react-cookie";
import { ACCESS_TOKEN_COOKIE } from "@/constants/auth";
import {
  fetchEstudiantesGlobales,
  getEstudiantesGlobalesQueryKey,
} from "@/fetchers/salones";
import type {
  EstudianteGlobal,
  EstudiantesGlobalesOptions,
} from "@/models/estudiante";

export function useEstudiantesGlobales(options?: EstudiantesGlobalesOptions) {
  const [cookies] = useCookies([ACCESS_TOKEN_COOKIE]);
  const token = cookies[ACCESS_TOKEN_COOKIE];

  return useQuery<EstudianteGlobal[]>({
    queryKey: getEstudiantesGlobalesQueryKey(
      options?.sort_by,
      options?.order,
      options?.idsalon,
    ),
    queryFn: () => fetchEstudiantesGlobales(token, options),
    enabled: !!token,
  });
}
