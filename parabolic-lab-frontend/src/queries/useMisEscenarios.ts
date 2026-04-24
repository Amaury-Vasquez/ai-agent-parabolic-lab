import { useQuery } from "@tanstack/react-query";
import { useCookies } from "react-cookie";
import { get } from "@/services/api";
import { Scenario } from "@/models/scenario";
import { ACCESS_TOKEN_COOKIE } from "@/constants/auth";

export const MIS_ESCENARIOS_QUERY_KEY = ["escenarios", "mis"];

export async function fetchMisEscenarios(token: string): Promise<Scenario[]> {
  return get<Scenario[]>("/escenarios/me", { token });
}

export function useMisEscenarios() {
  const [cookies] = useCookies([ACCESS_TOKEN_COOKIE]);
  const token = cookies[ACCESS_TOKEN_COOKIE];

  return useQuery({
    queryKey: MIS_ESCENARIOS_QUERY_KEY,
    queryFn: () => fetchMisEscenarios(token),
    enabled: !!token,
  });
}
