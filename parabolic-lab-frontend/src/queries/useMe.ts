import { useQuery } from "@tanstack/react-query";
import { useCookies } from "react-cookie";
import { get } from "@/services/api";
import { ACCESS_TOKEN_COOKIE } from "@/constants/auth";

export const ME_QUERY_KEY = ["auth", "me"];

export interface UserProfile {
  idusuario: string;
  authid: string;
  email: string;
  nombre: string;
  apellidopaterno: string;
  apellidomaterno?: string | null;
  tipousuario: string;
  idinstitucion: string;
  activo?: boolean | null;
}

export async function fetchMe(token: string): Promise<UserProfile> {
  return get<UserProfile>("/auth/me", { token });
}

export function useMe() {
  const [cookies] = useCookies([ACCESS_TOKEN_COOKIE]);
  const token = cookies[ACCESS_TOKEN_COOKIE];

  return useQuery({
    queryKey: ME_QUERY_KEY,
    queryFn: () => fetchMe(token),
    enabled: !!token,
  });
}
