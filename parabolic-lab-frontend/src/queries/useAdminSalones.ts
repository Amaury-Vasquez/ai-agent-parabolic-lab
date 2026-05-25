"use client";
import { useQuery } from "@tanstack/react-query";
import { useCookies } from "react-cookie";
import { ACCESS_TOKEN_COOKIE } from "@/constants/auth";
import {
  ADMIN_SALONES_QUERY_KEY,
  fetchAdminSalones,
} from "@/fetchers/admin";

export function useAdminSalones() {
  const [cookies] = useCookies([ACCESS_TOKEN_COOKIE]);
  const token = cookies[ACCESS_TOKEN_COOKIE];

  return useQuery({
    queryKey: ADMIN_SALONES_QUERY_KEY,
    queryFn: () => fetchAdminSalones(token),
    enabled: !!token,
  });
}
