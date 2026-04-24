import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCookies } from "react-cookie";
import { patch } from "@/services/api";
import { Scenario } from "@/models/scenario";
import { sanitizeData } from "@/utils/sanitizeData";
import { ACCESS_TOKEN_COOKIE } from "@/constants/auth";
import { MIS_ESCENARIOS_QUERY_KEY } from "@/queries/useMisEscenarios";

export async function updateEscenario(
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
  return patch<Scenario>(`/escenarios/${idescenario}`, sanitizeData(data), { token });
}
const updateEscenarioFn = updateEscenario;

export function useUpdateEscenario() {
  const [cookies] = useCookies([ACCESS_TOKEN_COOKIE]);
  const token = cookies[ACCESS_TOKEN_COOKIE];
  const queryClient = useQueryClient();

  const { mutateAsync: updateEscenario, ...rest } = useMutation({
    mutationFn: (data: Parameters<typeof updateEscenarioFn>[2] & { idescenario: string }) => {
      const { idescenario, ...updateData } = data;
      return updateEscenarioFn(token, idescenario, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MIS_ESCENARIOS_QUERY_KEY });
    },
  });
  return { updateEscenario, ...rest };
}
