"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCookies } from "react-cookie";
import {
  agregarEstudianteASalon,
  SALON_ESTUDIANTES_QUERY_KEY,
} from "@/fetchers/salones";
import { ACCESS_TOKEN_COOKIE } from "@/constants/auth";

export function useAgregarEstudiante() {
  const [cookies] = useCookies([ACCESS_TOKEN_COOKIE]);
  const token = cookies[ACCESS_TOKEN_COOKIE];
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      salonId,
      correoAlumno,
    }: {
      salonId: string;
      correoAlumno: string;
    }) => agregarEstudianteASalon(token, salonId, correoAlumno),
    onSuccess: (_, { salonId }) => {
      queryClient.invalidateQueries({
        queryKey: SALON_ESTUDIANTES_QUERY_KEY(salonId),
      });
    },
  });
}
