import { NextRequest, NextResponse } from "next/server";
import {
  ACCESS_TOKEN_COOKIE,
  AUTH_ONLY_ROUTES,
  AUTH_REDIRECT,
  PROTECTED_ROUTES,
  REFRESH_TOKEN_COOKIE,
} from "@/constants/auth";
import { fetchMe } from "@/fetchers/auth";
import { post } from "@/services/api";
import { matchesRoutes } from "@/utils/routes";

interface VerifyResponse {
  valid: boolean;
  access_token?: string;
}

export async function proxy(request: NextRequest) {
  const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;
  const { pathname } = request.nextUrl;

  if (matchesRoutes(pathname, AUTH_ONLY_ROUTES)) {
    // Routes only for unauthenticated users: redirect logged-in users to their dashboard
    if (!token) return NextResponse.next();

    try {
      const user = await fetchMe(token);
      const redirect = AUTH_REDIRECT[user.tipousuario] ?? "/";
      return NextResponse.redirect(new URL(redirect, request.url));
    } catch {
      return NextResponse.next();
    }
  } else if (matchesRoutes(pathname, PROTECTED_ROUTES)) {
    // Protected routes: redirect unauthenticated users to login
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    try {
      const data = await post<VerifyResponse>("/auth/verify", {}, {
        token,
        headers: refreshToken
          ? { "x-stack-refresh-token": refreshToken }
          : {},
      });

      if (data.access_token) {
        const nextResponse = NextResponse.next();
        nextResponse.cookies.set(ACCESS_TOKEN_COOKIE, data.access_token, {
          path: "/",
        });
        return nextResponse;
      }
    } catch {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/docente/:path*", "/alumno/:path*", "/registro/:path*"],
};
