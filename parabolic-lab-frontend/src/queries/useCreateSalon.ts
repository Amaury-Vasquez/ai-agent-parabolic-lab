"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCookies } from "react-cookie";
import { createSalon, MY_SALONES_QUERY_KEY } from "@/fetchers/salones";
import { ACCESS_TOKEN_COOKIE } from "@/constants/auth";

export function useCreateSalon() {
  const [cookies] = useCookies([ACCESS_TOKEN_COOKIE]);
  const token = cookies[ACCESS_TOKEN_COOKIE];
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { nombresalon: string }) => createSalon(token, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MY_SALONES_QUERY_KEY });
    },
  });
}