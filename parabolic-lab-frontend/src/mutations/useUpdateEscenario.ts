"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCookies } from "react-cookie";
import { updateEscenario } from "@/fetchers/escenarios";
import { ACCESS_TOKEN_COOKIE } from "@/constants/auth";
import { MIS_ESCENARIOS_QUERY_KEY } from "@/fetchers/escenarios";

export function useUpdateEscenario() {
  const [cookies] = useCookies([ACCESS_TOKEN_COOKIE]);
  const token = cookies[ACCESS_TOKEN_COOKIE];
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Parameters<typeof updateEscenario>[2] & { idescenario: string }) => {
      const { idescenario, ...updateData } = data;
      return updateEscenario(token, idescenario, updateData);
    },
    onSuccess: () => {
      // Invalidar el cache de mis escenarios para que se refleje la actualización
      queryClient.invalidateQueries({ queryKey: MIS_ESCENARIOS_QUERY_KEY });
    },
  });
}
