"use client";
import { useQuery } from "@tanstack/react-query";
import { useCookies } from "react-cookie";
import { ACCESS_TOKEN_COOKIE } from "@/constants/auth";
import {
  fetchDesempenoAlumno,
  SALON_ALUMNO_DESEMPENO_QUERY_KEY,
} from "@/fetchers/salones";

export function useDesempenoAlumno(salonId: string, alumnoId: string) {
  const [cookies] = useCookies([ACCESS_TOKEN_COOKIE]);
  const token = cookies[ACCESS_TOKEN_COOKIE];

  return useQuery({
    queryKey: SALON_ALUMNO_DESEMPENO_QUERY_KEY(salonId, alumnoId),
    queryFn: () => fetchDesempenoAlumno(token, salonId, alumnoId),
    enabled: !!token && !!salonId && !!alumnoId,
  });
}
