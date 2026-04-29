"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCookies } from "react-cookie";
import { patch } from "@/services/api";
import { Salon } from "@/types/salon";
import { ACCESS_TOKEN_COOKIE } from "@/constants/auth";
import { MY_SALONES_QUERY_KEY } from "@/fetchers/salones";

async function updateSalon(
  token: string,
  idsalon: string,
  data: { nombresalon: string }
): Promise<Salon> {
  return patch<Salon>(`/salones/${idsalon}`, data, { token });
}

export function useUpdateSalon() {
  const [cookies] = useCookies([ACCESS_TOKEN_COOKIE]);
  const token = cookies[ACCESS_TOKEN_COOKIE];
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ idsalon, nombresalon }: { idsalon: string; nombresalon: string }) =>
      updateSalon(token, idsalon, { nombresalon }),
    onSuccess: () => {
      // Invalidar el cache de mis salones
      queryClient.invalidateQueries({ queryKey: MY_SALONES_QUERY_KEY });
    },
  });
}
