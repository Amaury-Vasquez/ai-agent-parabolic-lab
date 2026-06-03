"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCookies } from "react-cookie";
import { post } from "@/services/api";
import { Scenario } from "@/models/scenario";
import { ACCESS_TOKEN_COOKIE } from "@/constants/auth";
import { MY_SALONES_QUERY_KEY } from "@/fetchers/salones";
import { MIS_ESCENARIOS_QUERY_KEY } from "@/fetchers/escenarios";

async function asignarEscenario(
  token: string,
  idescenario: string,
  idsalones: string[]
): Promise<Scenario[]> {
  return post<Scenario[]>(
    `/escenarios/${idescenario}/asignar`,
    { idsalones },
    { token }
  );
}

export function useAsignarEscenario() {
  const [cookies] = useCookies([ACCESS_TOKEN_COOKIE]);
  const token = cookies[ACCESS_TOKEN_COOKIE];
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      idescenario,
      idsalones,
    }: {
      idescenario: string;
      idsalones: string[];
    }) => asignarEscenario(token, idescenario, idsalones),
    onSuccess: () => {
      // Invalidar el cache de salones y escenarios
      queryClient.invalidateQueries({ queryKey: MY_SALONES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: MIS_ESCENARIOS_QUERY_KEY });
    },
  });
}
