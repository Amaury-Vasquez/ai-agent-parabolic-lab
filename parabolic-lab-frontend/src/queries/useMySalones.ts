"use client";
import { useQuery } from "@tanstack/react-query";
import { useCookies } from "react-cookie";
import { fetchMySalones, MY_SALONES_QUERY_KEY } from "@/fetchers/salones";
import { ACCESS_TOKEN_COOKIE } from "@/constants/auth";

export function useMySalones() {
  const [cookies] = useCookies([ACCESS_TOKEN_COOKIE]);
  const token = cookies[ACCESS_TOKEN_COOKIE];

  return useQuery({
    queryKey: MY_SALONES_QUERY_KEY,
    queryFn: () => fetchMySalones(token),
    enabled: !!token,
  });
}
