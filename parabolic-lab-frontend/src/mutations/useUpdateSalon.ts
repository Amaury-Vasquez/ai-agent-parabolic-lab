"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCookies } from "react-cookie";
import { updateSalon, MY_SALONES_QUERY_KEY } from "@/fetchers/salones";
import { ACCESS_TOKEN_COOKIE } from "@/constants/auth";

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
