"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCookies } from "react-cookie";
import { ACCESS_TOKEN_COOKIE } from "@/constants/auth";
import { ME_QUERY_KEY } from "@/fetchers/auth";
import type { UpdateUsuarioPayload, UserProfile } from "@/models/user";
import { patch } from "@/services/api";

async function updateUsuario(
  token: string,
  data: UpdateUsuarioPayload,
): Promise<UserProfile> {
  return patch<UserProfile>("/usuarios/me", data, { token });
}

export function useUpdateUsuario() {
  const [cookies] = useCookies([ACCESS_TOKEN_COOKIE]);
  const token = cookies[ACCESS_TOKEN_COOKIE];
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateUsuarioPayload) => updateUsuario(token, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ME_QUERY_KEY });
    },
  });
}
