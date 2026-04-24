import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCookies } from "react-cookie";
import { patch } from "@/services/api";
import { InteraccionEscenario } from "@/models/interaccion_escenario";
import { ACCESS_TOKEN_COOKIE } from "@/constants/auth";

export async function updateInteraccion(
  token: string,
  idinteraccion: string,
  data: {
    fechafin?: string;
    tiempototal?: number;
    puntuacion?: number;
    completado?: boolean;
    datosinteraccion?: Record<string, unknown>;
  }
): Promise<InteraccionEscenario> {
  return patch<InteraccionEscenario>(`/interacciones-escenario/${idinteraccion}`, data, { token });
}
const updateInteraccionFn = updateInteraccion;

export function useUpdateInteraccion() {
  const [cookies] = useCookies([ACCESS_TOKEN_COOKIE]);
  const token = cookies[ACCESS_TOKEN_COOKIE];
  const queryClient = useQueryClient();

  const { mutateAsync: updateInteraccion, ...rest } = useMutation({
    mutationFn: ({
      idinteraccion,
      data,
    }: {
      idinteraccion: string;
      data: Parameters<typeof updateInteraccionFn>[2];
    }) => updateInteraccionFn(token, idinteraccion, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["interacciones"] });
    },
  });
  return { updateInteraccion, ...rest };
}
