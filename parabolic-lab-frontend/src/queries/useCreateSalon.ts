import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCookies } from "react-cookie";
import { post } from "@/services/api";
import { Salon } from "@/types/salon";
import { ACCESS_TOKEN_COOKIE } from "@/constants/auth";
import { MY_SALONES_QUERY_KEY } from "@/queries/useMySalones";

export async function createSalon(
  token: string,
  data: { nombresalon: string }
): Promise<Salon> {
  return post<Salon>("/salones/", data, { token });
}

export function useCreateSalon() {
  const [cookies] = useCookies([ACCESS_TOKEN_COOKIE]);
  const token = cookies[ACCESS_TOKEN_COOKIE];
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { nombresalon: string }) => createSalon(token, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MY_SALONES_QUERY_KEY });
    },
  });
}
