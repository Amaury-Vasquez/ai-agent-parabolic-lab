import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCookies } from "react-cookie";
import { del } from "@/services/api";
import { ACCESS_TOKEN_COOKIE } from "@/constants/auth";
import { MIS_ESCENARIOS_QUERY_KEY } from "@/queries/useMisEscenarios";

export async function deleteEscenario(token: string, idescenario: string): Promise<void> {
  return del<void>(`/escenarios/${idescenario}`, { token });
}
const deleteEscenarioFn = deleteEscenario;

export function useDeleteEscenario() {
  const [cookies] = useCookies([ACCESS_TOKEN_COOKIE]);
  const token = cookies[ACCESS_TOKEN_COOKIE];
  const queryClient = useQueryClient();

  const { mutateAsync: deleteEscenario, ...rest } = useMutation({
    mutationFn: (idescenario: string) => deleteEscenarioFn(token, idescenario),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MIS_ESCENARIOS_QUERY_KEY });
    },
  });
  return { deleteEscenario, ...rest };
}
