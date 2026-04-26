"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCookies } from "react-cookie";
import { del } from "@/services/api";
import { ACCESS_TOKEN_COOKIE } from "@/constants/auth";
import { SALON_ESTUDIANTES_QUERY_KEY } from "@/fetchers/salones";

async function darDeBajaEstudiante(
  token: string,
  salonId: string,
  idalumno: string
): Promise<void> {
  return del<void>(`/salones/${salonId}/estudiantes/${idalumno}`, { token });
}

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
