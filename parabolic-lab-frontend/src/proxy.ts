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

/**
 * Lee el claim `exp` de un JWT sin verificar la firma. Solo se usa como
 * compuerta barata en el proxy: la verificación real de firma la hace el
 * backend en cada llamada a la API. Devuelve `null` si no se puede decodificar.
 */
function getJwtExpiryMs(token: string): number | null {
  const parts = token.split(".");
  if (parts.length < 2) return null;
  let payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
  payload += "=".repeat((4 - (payload.length % 4)) % 4);
  try {
    const claims = JSON.parse(atob(payload));
    return typeof claims.exp === "number" ? claims.exp * 1000 : null;
  } catch {
    return null;
  }
}

/** Token presente y aún vigente (con 10s de margen). */
function isTokenFresh(token: string): boolean {
  const expiryMs = getJwtExpiryMs(token);
  if (expiryMs === null) return false;
  return Date.now() < expiryMs - 10_000;
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

    // Caso común: el token sigue vigente. Compuerta local, sin llamar al
    // backend, para no bloquear la navegación si el backend está frío o
    // momentáneamente inalcanzable (causa del bloqueo en producción).
    if (isTokenFresh(token)) {
      return NextResponse.next();
    }

    // Token expirado: intentar renovar con el refresh token. Esta es la única
    // ruta que toca el backend, y solo ocurre cuando realmente hace falta.
    if (refreshToken) {
      try {
        const data = await post<VerifyResponse>("/auth/verify", {}, {
          token,
          headers: { "x-stack-refresh-token": refreshToken },
        });

        if (data.access_token) {
          const nextResponse = NextResponse.next();
          nextResponse.cookies.set(ACCESS_TOKEN_COOKIE, data.access_token, {
            path: "/",
          });
          return nextResponse;
        }

        if (data.valid) {
          return NextResponse.next();
        }
      } catch {
        return NextResponse.redirect(new URL("/login", request.url));
      }
    }

    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/docente/:path*",
    "/alumno/:path*",
    "/admin/:path*",
    "/login",
    "/registro/:path*",
  ],
};
