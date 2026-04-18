"use client";
import { ReactNode } from "react";
import { CookiesProvider } from "react-cookie";

interface CookiesProviderProps {
  children: ReactNode;
}

const AppCookiesProvider = ({ children }: CookiesProviderProps) => {
  return <CookiesProvider>{children}</CookiesProvider>;
};

export default AppCookiesProvider;
