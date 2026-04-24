import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCookies } from "react-cookie";
import { post } from "@/services/api";
import { Scenario } from "@/models/scenario";
import { sanitizeData } from "@/utils/sanitizeData";
import { ACCESS_TOKEN_COOKIE } from "@/constants/auth";
import { MIS_ESCENARIOS_QUERY_KEY } from "@/queries/useMisEscenarios";

export async function createEscenario(
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
  return post<Scenario>("/escenarios/", sanitizeData(data), { token });
}

export function useCreateEscenario() {
  const [cookies] = useCookies([ACCESS_TOKEN_COOKIE]);
  const token = cookies[ACCESS_TOKEN_COOKIE];
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Parameters<typeof createEscenario>[1]) =>
      createEscenario(token, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MIS_ESCENARIOS_QUERY_KEY });
    },
  });
}
