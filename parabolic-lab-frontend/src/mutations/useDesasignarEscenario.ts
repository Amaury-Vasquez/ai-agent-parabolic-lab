"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCookies } from "react-cookie";
import { ACCESS_TOKEN_COOKIE } from "@/constants/auth";
import { MIS_ESCENARIOS_QUERY_KEY } from "@/fetchers/escenarios";
import { MY_SALONES_QUERY_KEY } from "@/fetchers/salones";
import { del } from "@/services/api";

async function desasignarEscenario(
  token: string,
  idescenario: string,
): Promise<void> {
  return del<void>(`/escenarios/${idescenario}/asignacion`, { token });
}

/**
 * Quita un escenario de su salón sin eliminarlo de la biblioteca del docente.
 */
export function useDesasignarEscenario() {
  const [cookies] = useCookies([ACCESS_TOKEN_COOKIE]);
  const token = cookies[ACCESS_TOKEN_COOKIE];
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (idescenario: string) => desasignarEscenario(token, idescenario),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MIS_ESCENARIOS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: MY_SALONES_QUERY_KEY });
    },
  });
}
