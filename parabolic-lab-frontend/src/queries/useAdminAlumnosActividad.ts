"use client";
import { useQuery } from "@tanstack/react-query";
import { useCookies } from "react-cookie";
import { ACCESS_TOKEN_COOKIE } from "@/constants/auth";
import {
  ADMIN_ALUMNOS_ACTIVIDAD_QUERY_KEY,
  fetchAdminAlumnosActividad,
} from "@/fetchers/admin";

export function useAdminAlumnosActividad() {
  const [cookies] = useCookies([ACCESS_TOKEN_COOKIE]);
  const token = cookies[ACCESS_TOKEN_COOKIE];

  return useQuery({
    queryKey: ADMIN_ALUMNOS_ACTIVIDAD_QUERY_KEY,
    queryFn: () => fetchAdminAlumnosActividad(token),
    enabled: !!token,
  });
}
