"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCookies } from "react-cookie";
import { createEscenario, MIS_ESCENARIOS_QUERY_KEY } from "@/fetchers/escenarios";
import { ACCESS_TOKEN_COOKIE } from "@/constants/auth";

export function useCreateEscenario() {
  const [cookies] = useCookies([ACCESS_TOKEN_COOKIE]);
  const token = cookies[ACCESS_TOKEN_COOKIE];
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Parameters<typeof createEscenario>[1]) =>
      createEscenario(token, data),
    onSuccess: () => {
      // Invalidar el cache de mis escenarios para que se refleje el nuevo escenario
      queryClient.invalidateQueries({ queryKey: MIS_ESCENARIOS_QUERY_KEY });
    },
  });
}