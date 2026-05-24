export type UserType = "docente" | "alumno" | "admin";

export interface UserProfile {
  idusuario: string;
  authid: string;
  email: string;
  nombre: string;
  apellidopaterno: string;
  apellidomaterno?: string | null;
  tipousuario: UserType;
  idinstitucion: string;
  activo?: boolean | null;
  temapreferido?: string | null;
}

export interface DocenteProfile {
  iddocente: string;
  idusuario: string;
  gradoacademico?: string | null;
}

export interface UpdateUsuarioPayload {
  nombre?: string;
  apellidopaterno?: string;
  apellidomaterno?: string;
  temapreferido?: string;
}

export interface UpdateDocentePayload {
  gradoacademico?: string;
}
