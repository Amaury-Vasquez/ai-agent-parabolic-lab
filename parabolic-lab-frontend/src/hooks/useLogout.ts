"use client";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCookies } from "react-cookie";
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  USER_TYPE_COOKIE,
} from "@/constants/auth";

export default function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [, , removeCookie] = useCookies();

  const logout = () => {
    removeCookie(ACCESS_TOKEN_COOKIE, { path: "/" });
    removeCookie(REFRESH_TOKEN_COOKIE, { path: "/" });
    removeCookie(USER_TYPE_COOKIE, { path: "/" });
    queryClient.clear();
    router.push("/login");
  };

  return logout;
}
