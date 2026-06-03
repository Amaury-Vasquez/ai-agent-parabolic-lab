export const ACCESS_TOKEN_COOKIE = "access_token";
export const REFRESH_TOKEN_COOKIE = "refresh_token";
export const USER_TYPE_COOKIE = "tipousuario";

export const AUTH_REDIRECT: Record<string, string> = {
  docente: "/docente",
  alumno: "/alumno",
  admin: "/admin",
};

export const PROTECTED_ROUTES = ["/docente", "/alumno", "/admin"];
// Rutas solo para usuarios NO autenticados: con sesión activa se redirige
// al panel correspondiente a su tipo de usuario.
export const AUTH_ONLY_ROUTES = ["/login", "/registro"];
