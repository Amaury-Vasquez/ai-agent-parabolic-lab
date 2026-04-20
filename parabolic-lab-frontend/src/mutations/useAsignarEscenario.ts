"use client";
import { useMutation } from "@tanstack/react-query";
import { useCookies } from "react-cookie";
import { post } from "@/services/api";
import { Scenario } from "@/models/scenario";
import { ACCESS_TOKEN_COOKIE } from "@/constants/auth";

async function asignarEscenario(
  token: string,
  idescenario: string,
  idsalon: string
): Promise<Scenario> {
  return post<Scenario>(
    `/escenarios/${idescenario}/asignar`,
    { idsalon },
    { token }
  );
}

export function useAsignarEscenario() {
  const [cookies] = useCookies([ACCESS_TOKEN_COOKIE]);
  const token = cookies[ACCESS_TOKEN_COOKIE];

  return useMutation({
    mutationFn: ({ idescenario, idsalon }: { idescenario: string; idsalon: string }) =>
      asignarEscenario(token, idescenario, idsalon),
  });
}
