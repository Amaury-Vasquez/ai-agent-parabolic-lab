"use client";
import { useQuery } from "@tanstack/react-query";
import { useCookies } from "react-cookie";
import { ACCESS_TOKEN_COOKIE } from "@/constants/auth";
import {
  ADMIN_SALON_DETALLE_QUERY_KEY,
  fetchAdminSalonDetalle,
} from "@/fetchers/admin";

export function useAdminSalonDetalle(idsalon: string) {
  const [cookies] = useCookies([ACCESS_TOKEN_COOKIE]);
  const token = cookies[ACCESS_TOKEN_COOKIE];

  return useQuery({
    queryKey: ADMIN_SALON_DETALLE_QUERY_KEY(idsalon),
    queryFn: () => fetchAdminSalonDetalle(token, idsalon),
    enabled: !!token && !!idsalon,
  });
}
