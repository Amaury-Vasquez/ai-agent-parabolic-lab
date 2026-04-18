import { get } from "@/services/api";
import { Salon } from "@/types/salon";

export const MY_SALONES_QUERY_KEY = ["salones", "me"];

export async function fetchMySalones(token: string): Promise<Salon[]> {
  return get<Salon[]>("/salones/me", { token });
}
