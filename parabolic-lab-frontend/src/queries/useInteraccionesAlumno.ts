"use client";
import { useQuery } from "@tanstack/react-query";
import { useCookies } from "react-cookie";
import {
  fetchMisInteracciones,
  MIS_INTERACCIONES_QUERY_KEY,
} from "@/fetchers/interaccionesAlumno";
import { ACCESS_TOKEN_COOKIE } from "@/constants/auth";

export function useInteraccionesAlumno() {
  const [cookies] = useCookies([ACCESS_TOKEN_COOKIE]);
  const token = cookies[ACCESS_TOKEN_COOKIE];

  return useQuery({
    queryKey: MIS_INTERACCIONES_QUERY_KEY,
    queryFn: () => fetchMisInteracciones(token),
    enabled: !!token,
  });
}