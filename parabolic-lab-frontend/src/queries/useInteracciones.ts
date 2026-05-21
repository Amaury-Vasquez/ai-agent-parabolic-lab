"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCookies } from "react-cookie";
import { createInteraccion, updateInteraccion } from "@/fetchers/interacciones";
import { MIS_INTERACCIONES_QUERY_KEY, PROGRESO_ALUMNO_QUERY_KEY } from "@/fetchers/interaccionesAlumno";
import { ACCESS_TOKEN_COOKIE } from "@/constants/auth";

export function useCreateInteraccion() {
  const [cookies] = useCookies([ACCESS_TOKEN_COOKIE]);
  const token = cookies[ACCESS_TOKEN_COOKIE];
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { idescenario: string; idalumno: string }) =>
      createInteraccion(token, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROGRESO_ALUMNO_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: MIS_INTERACCIONES_QUERY_KEY });
    },
  });
}

export function useUpdateInteraccion() {
  const [cookies] = useCookies([ACCESS_TOKEN_COOKIE]);
  const token = cookies[ACCESS_TOKEN_COOKIE];
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      idinteraccion,
      data,
    }: {
      idinteraccion: string;
      data: {
        fechafin?: string;
        tiempototal?: number;
        puntuacion?: number;
        completado?: boolean;
        datosinteraccion?: Record<string, unknown>;
      };
    }) => updateInteraccion(token, idinteraccion, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROGRESO_ALUMNO_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: MIS_INTERACCIONES_QUERY_KEY });
    },
  });
}