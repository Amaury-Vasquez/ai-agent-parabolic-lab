"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCookies } from "react-cookie";
import {
  darDeBajaEstudiante,
  SALON_ESTUDIANTES_QUERY_KEY,
} from "@/fetchers/salones";
import { ACCESS_TOKEN_COOKIE } from "@/constants/auth";

export function useDarDeBajaEstudiante() {
  const [cookies] = useCookies([ACCESS_TOKEN_COOKIE]);
  const token = cookies[ACCESS_TOKEN_COOKIE];
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      salonId,
      idalumno,
    }: {
      salonId: string;
      idalumno: string;
    }) => darDeBajaEstudiante(token, salonId, idalumno),
    onSuccess: (_, { salonId }) => {
      queryClient.invalidateQueries({
        queryKey: SALON_ESTUDIANTES_QUERY_KEY(salonId),
      });
    },
  });
}
