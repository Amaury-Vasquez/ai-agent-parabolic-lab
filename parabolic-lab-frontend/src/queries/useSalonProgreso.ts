"use client";
import { useQuery } from "@tanstack/react-query";
import { useCookies } from "react-cookie";
import {
  fetchSalonProgreso,
  SALON_PROGRESO_QUERY_KEY,
  SalonProgresoEstudiante,
} from "@/fetchers/salones";
import { ACCESS_TOKEN_COOKIE } from "@/constants/auth";

export function useSalonProgreso(salonId: string) {
  const [cookies] = useCookies([ACCESS_TOKEN_COOKIE]);
  const token = cookies[ACCESS_TOKEN_COOKIE];

  return useQuery<SalonProgresoEstudiante[]>({
    queryKey: SALON_PROGRESO_QUERY_KEY(salonId),
    queryFn: () => fetchSalonProgreso(token, salonId),
    enabled: !!token && !!salonId,
  });
}
