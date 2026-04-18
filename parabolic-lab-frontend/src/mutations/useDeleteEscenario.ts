"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCookies } from "react-cookie";
import { deleteEscenario, MIS_ESCENARIOS_QUERY_KEY } from "@/fetchers/escenarios";
import { ACCESS_TOKEN_COOKIE } from "@/constants/auth";

export function useDeleteEscenario() {
  const [cookies] = useCookies([ACCESS_TOKEN_COOKIE]);
  const token = cookies[ACCESS_TOKEN_COOKIE];
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (idescenario: string) => deleteEscenario(token, idescenario),
    onSuccess: () => {
      // Invalidar el cache de mis escenarios
      queryClient.invalidateQueries({ queryKey: MIS_ESCENARIOS_QUERY_KEY });
    },
  });
}
