import { useQuery } from "@tanstack/react-query";
import { useCookies } from "react-cookie";
import { get } from "@/services/api";
import { Salon } from "@/types/salon";
import { ACCESS_TOKEN_COOKIE } from "@/constants/auth";

export const MY_SALONES_QUERY_KEY = ["salones", "me"];

export async function fetchMySalones(token: string): Promise<Salon[]> {
  return get<Salon[]>("/salones/me", { token });
}

export function useMySalones() {
  const [cookies] = useCookies([ACCESS_TOKEN_COOKIE]);
  const token = cookies[ACCESS_TOKEN_COOKIE];

  return useQuery({
    queryKey: MY_SALONES_QUERY_KEY,
    queryFn: () => fetchMySalones(token),
    enabled: !!token,
  });
}
