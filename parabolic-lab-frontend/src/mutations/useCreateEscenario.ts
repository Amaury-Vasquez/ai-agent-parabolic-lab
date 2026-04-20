"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCookies } from "react-cookie";
import { post } from "@/services/api";
import { sanitizeData } from "@/utils/sanitizeData";
import { Scenario } from "@/models/scenario";
import { ACCESS_TOKEN_COOKIE } from "@/constants/auth";

export const MIS_ESCENARIOS_QUERY_KEY = ["escenarios", "mis"];

async function createEscenario(
  token: string,
  data: {
    idsalon: string;
    nombre: string;
    descripcion?: string;
    niveldificultad: string;
    tipoescenario: string;
    objetivosaprendizaje?: string;
    instrucciones?: string;
    tiempolimite?: number;
    intentospermitidos?: number;
    configuracionescenario?: Record<string, unknown>;
  }
): Promise<Scenario> {
  // Sanitizar los datos para evitar enviar campos innecesarios
  const sanitizedData = sanitizeData(data);
  return post<Scenario>("/escenarios/", sanitizedData, { token });
}

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
