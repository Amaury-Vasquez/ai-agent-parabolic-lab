import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCookies } from "react-cookie";
import { post } from "@/services/api";
import { InteraccionEscenario } from "@/models/interaccion_escenario";
import { ACCESS_TOKEN_COOKIE } from "@/constants/auth";

export async function createInteraccion(
  token: string,
  data: { idescenario: string; idalumno: string }
): Promise<InteraccionEscenario> {
  return post<InteraccionEscenario>("/interacciones-escenario/", data, { token });
}
const createInteraccionFn = createInteraccion;

export function useCreateInteraccion() {
  const [cookies] = useCookies([ACCESS_TOKEN_COOKIE]);
  const token = cookies[ACCESS_TOKEN_COOKIE];
  const queryClient = useQueryClient();

  const { mutateAsync: createInteraccion, ...rest } = useMutation({
    mutationFn: (data: { idescenario: string; idalumno: string }) =>
      createInteraccionFn(token, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["interacciones"] });
    },
  });
  return { createInteraccion, ...rest };
}
