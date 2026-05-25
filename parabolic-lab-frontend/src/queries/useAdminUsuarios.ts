"use client";
import { useQuery } from "@tanstack/react-query";
import { useCookies } from "react-cookie";
import { ACCESS_TOKEN_COOKIE } from "@/constants/auth";
import {
  ADMIN_USUARIOS_QUERY_KEY,
  fetchAdminUsuarios,
} from "@/fetchers/admin";

export function useAdminUsuarios() {
  const [cookies] = useCookies([ACCESS_TOKEN_COOKIE]);
  const token = cookies[ACCESS_TOKEN_COOKIE];

  return useQuery({
    queryKey: ADMIN_USUARIOS_QUERY_KEY,
    queryFn: () => fetchAdminUsuarios(token),
    enabled: !!token,
  });
}
