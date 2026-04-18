"use client";
import { useQuery } from "@tanstack/react-query";
import { useCookies } from "react-cookie";
import {
  fetchEstudiantesBySalon,
  SALON_ESTUDIANTES_QUERY_KEY,
} from "@/fetchers/salones";
import { ACCESS_TOKEN_COOKIE } from "@/constants/auth";

export function useEstudiantesBySalon(salonId: string) {
  const [cookies] = useCookies([ACCESS_TOKEN_COOKIE]);
  const token = cookies[ACCESS_TOKEN_COOKIE];

  return useQuery({
    queryKey: SALON_ESTUDIANTES_QUERY_KEY(salonId),
    queryFn: () => fetchEstudiantesBySalon(token, salonId),
    enabled: !!token && !!salonId,
  });
}
