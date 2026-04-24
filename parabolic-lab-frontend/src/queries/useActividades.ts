import { useQuery } from "@tanstack/react-query";
import { useCookies } from "react-cookie";
import { get } from "@/services/api";
import { Activity } from "@/models/activity";
import { ACCESS_TOKEN_COOKIE } from "@/constants/auth";

export const ACTIVIDADES_QUERY_KEY = ["actividades"];

export async function fetchActividades(token: string): Promise<Activity[]> {
  return get<Activity[]>("/actividades-interactivas/", { token });
}

export function useActividades() {
  const [cookies] = useCookies([ACCESS_TOKEN_COOKIE]);
  const token = cookies[ACCESS_TOKEN_COOKIE];

  return useQuery({
    queryKey: ACTIVIDADES_QUERY_KEY,
    queryFn: () => fetchActividades(token),
    enabled: !!token,
  });
}
