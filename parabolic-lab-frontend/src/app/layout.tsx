import { cookies, headers } from "next/headers";
import { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import "amvasdev-ui/dist/index.css";
import "./globals.css";
import ThemeApplier from "@/components/ThemeApplier";
import { ACCESS_TOKEN_COOKIE } from "@/constants/auth";
import {
  BACKGROUND_COLOR,
  BRAND_COLOR,
  DEFAULT_OG_IMAGE,
  SITE_CREATOR,
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  SITE_LOCALE,
  SITE_NAME,
  SITE_TITLE,
  SITE_URL,
  TITLE_TEMPLATE,
  TWITTER_HANDLE,
} from "@/constants/seo";
import { isValidTheme } from "@/constants/themes";
import { fetchMe } from "@/fetchers/auth";
import AppCookiesProvider from "@/providers/CookiesProvider";
import QueryProvider from "@/providers/QueryProvider";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: TITLE_TEMPLATE,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: SITE_KEYWORDS,
  authors: [{ name: SITE_CREATOR }],
  creator: SITE_CREATOR,
  publisher: SITE_CREATOR,
  category: "education",
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: SITE_NAME,
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: SITE_LOCALE,
    url: SITE_URL,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    site: TWITTER_HANDLE,
    creator: TWITTER_HANDLE,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: BRAND_COLOR },
    { media: "(prefers-color-scheme: dark)", color: BACKGROUND_COLOR },
  ],
  colorScheme: "light",
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
    <html lang="es" data-theme={theme}>
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
