"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCookies } from "react-cookie";
import { ACCESS_TOKEN_COOKIE } from "@/constants/auth";
import type {
  Institucion,
  UpdateInstitucionPayload,
} from "@/models/institucion";
import { patch } from "@/services/api";

export const INSTITUCION_QUERY_KEY = (idinstitucion: string) => [
  "instituciones",
  idinstitucion,
];

interface UpdateInstitucionVariables {
  idinstitucion: string;
  data: UpdateInstitucionPayload;
}

async function updateInstitucion(
  token: string,
  idinstitucion: string,
  data: UpdateInstitucionPayload,
): Promise<Institucion> {
  return patch<Institucion>(`/instituciones/${idinstitucion}`, data, { token });
}

export function useUpdateInstitucion() {
  const [cookies] = useCookies([ACCESS_TOKEN_COOKIE]);
  const token = cookies[ACCESS_TOKEN_COOKIE];
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ idinstitucion, data }: UpdateInstitucionVariables) =>
      updateInstitucion(token, idinstitucion, data),
    onSuccess: (_, { idinstitucion }) => {
      queryClient.invalidateQueries({
        queryKey: INSTITUCION_QUERY_KEY(idinstitucion),
      });
    },
  });
}
