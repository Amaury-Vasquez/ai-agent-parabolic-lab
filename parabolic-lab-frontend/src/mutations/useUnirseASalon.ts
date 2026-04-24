import { post } from "@/services/api";

export async function unirseASalon(token: string, codigoacceso: string): Promise<void> {
  return post<void>("/alumnos-en-salon/unirse", { codigoacceso }, { token });
}
