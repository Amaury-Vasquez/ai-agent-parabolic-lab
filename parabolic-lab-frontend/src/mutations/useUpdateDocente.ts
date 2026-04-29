"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCookies } from "react-cookie";
import { ACCESS_TOKEN_COOKIE } from "@/constants/auth";
import { DOCENTE_QUERY_KEY } from "@/fetchers/auth";
import type { DocenteProfile, UpdateDocentePayload } from "@/models/user";
import { patch } from "@/services/api";

async function updateDocente(
  token: string,
  data: UpdateDocentePayload,
): Promise<DocenteProfile> {
  return patch<DocenteProfile>("/docentes/me", data, { token });
}

export function useUpdateDocente() {
  const [cookies] = useCookies([ACCESS_TOKEN_COOKIE]);
  const token = cookies[ACCESS_TOKEN_COOKIE];
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateDocentePayload) => updateDocente(token, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DOCENTE_QUERY_KEY });
    },
  });
}
