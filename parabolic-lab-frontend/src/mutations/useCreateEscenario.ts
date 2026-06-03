"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCookies } from "react-cookie";
import { ACCESS_TOKEN_COOKIE } from "@/constants/auth";
import { Scenario } from "@/models/scenario";
import { MY_SALONES_QUERY_KEY } from "@/fetchers/salones";
import { post } from "@/services/api";
import { sanitizeData } from "@/utils/sanitizeData";

async function createEscenario(
  token: string,
  data: {
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
      // Invalida listados de escenarios y salones (que embeben escenarios)
      // para que toda vista refleje el nuevo escenario.
      queryClient.invalidateQueries({ queryKey: ["escenarios"] });
      queryClient.invalidateQueries({ queryKey: MY_SALONES_QUERY_KEY });
    },
  });
}
