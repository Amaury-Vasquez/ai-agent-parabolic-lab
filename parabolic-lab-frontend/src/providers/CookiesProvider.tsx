"use client";
import { ReactNode, useState } from "react";
import { Cookies, CookiesProvider } from "react-cookie";

interface CookiesProviderProps {
  children: ReactNode;
  cookieHeader?: string;
}

const AppCookiesProvider = ({ children, cookieHeader }: CookiesProviderProps) => {
  // Build a Cookies instance seeded with the server-side cookie header so
  // useCookies returns the same values on the SSR pass as on the client.
  // Without this, react-cookie reads only document.cookie which is empty on
  // the server, causing useQuery `enabled: !!token` gates to flip after
  // hydration and triggering React 19 hydration mismatches.
  const [cookies] = useState(() => new Cookies(cookieHeader ?? null));

  return <CookiesProvider cookies={cookies}>{children}</CookiesProvider>;
};

export default AppCookiesProvider;
