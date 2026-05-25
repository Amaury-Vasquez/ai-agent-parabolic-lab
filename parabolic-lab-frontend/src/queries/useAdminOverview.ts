"use client";
import { useQuery } from "@tanstack/react-query";
import { useCookies } from "react-cookie";
import { ACCESS_TOKEN_COOKIE } from "@/constants/auth";
import {
  ADMIN_OVERVIEW_QUERY_KEY,
  fetchAdminOverview,
} from "@/fetchers/admin";

export function useAdminOverview() {
  const [cookies] = useCookies([ACCESS_TOKEN_COOKIE]);
  const token = cookies[ACCESS_TOKEN_COOKIE];

  return useQuery({
    queryKey: ADMIN_OVERVIEW_QUERY_KEY,
    queryFn: () => fetchAdminOverview(token),
    enabled: !!token,
  });
}
