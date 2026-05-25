"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCookies } from "react-cookie";
import { ACCESS_TOKEN_COOKIE } from "@/constants/auth";
import {
  ADMIN_ALUMNOS_ACTIVIDAD_QUERY_KEY,
  ADMIN_OVERVIEW_QUERY_KEY,
  ADMIN_USUARIOS_QUERY_KEY,
} from "@/fetchers/admin";
import { del, patch } from "@/services/api";

const invalidationKeys = [
  ADMIN_USUARIOS_QUERY_KEY,
  ADMIN_OVERVIEW_QUERY_KEY,
  ADMIN_ALUMNOS_ACTIVIDAD_QUERY_KEY,
];

export function useDesactivarUsuario() {
  const [cookies] = useCookies([ACCESS_TOKEN_COOKIE]);
  const token = cookies[ACCESS_TOKEN_COOKIE];
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (idusuario: string) =>
      patch(`/admins/me/usuarios/${idusuario}/desactivar`, {}, { token }),
    onSuccess: () => {
      invalidationKeys.forEach((queryKey) =>
        queryClient.invalidateQueries({ queryKey }),
      );
    },
  });
}

export function useReactivarUsuario() {
  const [cookies] = useCookies([ACCESS_TOKEN_COOKIE]);
  const token = cookies[ACCESS_TOKEN_COOKIE];
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (idusuario: string) =>
      patch(`/admins/me/usuarios/${idusuario}/reactivar`, {}, { token }),
    onSuccess: () => {
      invalidationKeys.forEach((queryKey) =>
        queryClient.invalidateQueries({ queryKey }),
      );
    },
  });
}

export function useEliminarUsuario() {
  const [cookies] = useCookies([ACCESS_TOKEN_COOKIE]);
  const token = cookies[ACCESS_TOKEN_COOKIE];
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (idusuario: string) =>
      del(`/admins/me/usuarios/${idusuario}`, { token }),
    onSuccess: () => {
      invalidationKeys.forEach((queryKey) =>
        queryClient.invalidateQueries({ queryKey }),
      );
    },
  });
}
