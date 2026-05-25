import { get } from "@/services/api";
import type {
  AdminAlumnoActividadRow,
  AdminOverview,
  AdminSalonRow,
  AdminUsuarioRow,
} from "@/types/admin";

export const ADMIN_OVERVIEW_QUERY_KEY = ["admin", "overview"];
export const ADMIN_USUARIOS_QUERY_KEY = ["admin", "usuarios"];
export const ADMIN_SALONES_QUERY_KEY = ["admin", "salones"];
export const ADMIN_ALUMNOS_ACTIVIDAD_QUERY_KEY = ["admin", "alumnos-actividad"];

export function fetchAdminOverview(token: string): Promise<AdminOverview> {
  return get<AdminOverview>("/admins/me/overview", { token });
}

export function fetchAdminUsuarios(token: string): Promise<AdminUsuarioRow[]> {
  return get<AdminUsuarioRow[]>("/admins/me/usuarios", { token });
}

export function fetchAdminSalones(token: string): Promise<AdminSalonRow[]> {
  return get<AdminSalonRow[]>("/admins/me/salones", { token });
}

export function fetchAdminAlumnosActividad(
  token: string,
): Promise<AdminAlumnoActividadRow[]> {
  return get<AdminAlumnoActividadRow[]>("/admins/me/alumnos-actividad", {
    token,
  });
}
