"use client";
import { useQuery } from "@tanstack/react-query";
import { useCookies } from "react-cookie";
import { fetchMe, ME_QUERY_KEY } from "@/fetchers/auth";
import type { UserProfile } from "@/models/user";
import { ACCESS_TOKEN_COOKIE } from "@/constants/auth";

export function useMe() {
  const [cookies] = useCookies([ACCESS_TOKEN_COOKIE]);
  const token = cookies[ACCESS_TOKEN_COOKIE];

  return useQuery<UserProfile>({
    queryKey: ME_QUERY_KEY,
    queryFn: () => fetchMe(token),
    enabled: !!token,
  });
}
