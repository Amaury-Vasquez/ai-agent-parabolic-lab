export const ACCESS_TOKEN_COOKIE = "access_token";
export const REFRESH_TOKEN_COOKIE = "refresh_token";
export const USER_TYPE_COOKIE = "tipousuario";

export const AUTH_REDIRECT: Record<string, string> = {
  docente: "/docente",
  alumno: "/alumno",
  admin: "/docente",
};

export const PROTECTED_ROUTES = ["/docente", "/alumno"];
export const AUTH_ONLY_ROUTES = ["/registro"];
