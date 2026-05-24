import { cookies, headers } from "next/headers";
import { ReactNode } from "react";
import type { Metadata } from "next";
import "amvasdev-ui/dist/index.css";
import "./globals.css";
import ThemeApplier from "@/components/ThemeApplier";
import { ACCESS_TOKEN_COOKIE } from "@/constants/auth";
import { isValidTheme } from "@/constants/themes";
import { fetchMe } from "@/fetchers/auth";
import AppCookiesProvider from "@/providers/CookiesProvider";
import QueryProvider from "@/providers/QueryProvider";

export const metadata: Metadata = {
  title: "Parabolic lab",
  description: "Aplicacion de soporte para el aprendizaje de tiro parabólico",
};

interface RootLayoutProps {
  children: ReactNode;
}

async function getUserTheme(): Promise<string | undefined> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  if (!token) return undefined;

  try {
    const user = await fetchMe(token);
    return isValidTheme(user.temapreferido) ? user.temapreferido : undefined;
  } catch {
    return undefined;
  }
}

export default async function RootLayout({ children }: RootLayoutProps) {
  const [theme, cookieHeader] = await Promise.all([
    getUserTheme(),
    headers().then((h) => h.get("cookie") ?? undefined),
  ]);

  return (
    <html lang="en" data-theme={theme}>
      <body>
        <AppCookiesProvider cookieHeader={cookieHeader}>
          <QueryProvider>
            <ThemeApplier />
            {children}
          </QueryProvider>
        </AppCookiesProvider>
      </body>
    </html>
  );
}
