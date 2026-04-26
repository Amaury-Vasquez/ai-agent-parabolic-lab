"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCookies } from "react-cookie";
import { patch } from "@/services/api";
import { sanitizeData } from "@/utils/sanitizeData";
import { Scenario } from "@/models/scenario";
import { ACCESS_TOKEN_COOKIE } from "@/constants/auth";
import { MIS_ESCENARIOS_QUERY_KEY, ESCENARIO_QUERY_KEY } from "@/fetchers/escenarios";

async function updateEscenario(
  token: string,
  idescenario: string,
  data: Partial<{
    nombre: string;
    descripcion: string;
    niveldificultad: string;
    tipoescenario: string;
    objetivosaprendizaje: string;
    instrucciones: string;
    tiempolimite: number;
    intentospermitidos: number;
    configuracionescenario: Record<string, unknown>;
    activo: boolean;
  }>
): Promise<Scenario> {
  // Sanitizar los datos para evitar enviar campos innecesarios como fechas
  const sanitizedData = sanitizeData(data);
  return patch<Scenario>(`/escenarios/${idescenario}`, sanitizedData, { token });
}

export function useUpdateEscenario() {
  const [cookies] = useCookies([ACCESS_TOKEN_COOKIE]);
  const token = cookies[ACCESS_TOKEN_COOKIE];
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Parameters<typeof updateEscenario>[2] & { idescenario: string }) => {
      const { idescenario, ...updateData } = data;
      return updateEscenario(token, idescenario, updateData);
    },
    onSuccess: (_, { idescenario }) => {
      // Invalidar el cache de mis escenarios y del escenario específico
      queryClient.invalidateQueries({ queryKey: MIS_ESCENARIOS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ESCENARIO_QUERY_KEY(idescenario) });
    },
  });
}
