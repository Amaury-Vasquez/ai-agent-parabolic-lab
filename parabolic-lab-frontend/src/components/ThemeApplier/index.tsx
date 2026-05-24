"use client";
import { useEffect } from "react";
import { useCookies } from "react-cookie";
import { ACCESS_TOKEN_COOKIE } from "@/constants/auth";
import { isValidTheme } from "@/constants/themes";
import { useMe } from "@/queries/useMe";

const ThemeApplier = () => {
  const [cookies] = useCookies([ACCESS_TOKEN_COOKIE]);
  const token = cookies[ACCESS_TOKEN_COOKIE];
  const { data: user } = useMe();
  const theme = user?.temapreferido;

  useEffect(() => {
    if (!token) {
      delete document.documentElement.dataset.theme;
      return;
    }
    if (isValidTheme(theme)) {
      document.documentElement.dataset.theme = theme;
    }
  }, [token, theme]);

  return null;
};

export default ThemeApplier;
