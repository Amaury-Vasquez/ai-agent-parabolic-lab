import type { UserType } from "@/models/user";

export interface AdminOverview {
  idinstitucion: string;
  nombre_institucion: string;
  clavect?: string | null;
  total_docentes: number;
  total_docentes_activos: number;
  total_alumnos: number;
  total_alumnos_activos: number;
  total_salones: number;
  total_salones_activos: number;
}

export interface AdminUsuarioRow {
  idusuario: string;
  authid: string;
  nombre: string;
  apellidopaterno: string;
  apellidomaterno?: string | null;
  email: string;
  tipousuario: UserType;
  activo?: boolean | null;
  fecharegistro?: string | null;
  ultimoacceso?: string | null;
  matricula?: string | null;
  gradoacademico?: string | null;
}

export interface AdminSalonRow {
  idsalon: string;
  nombresalon: string;
  codigoacceso: string;
  activo?: boolean | null;
  fechacreacion?: string | null;
  iddocente: string;
  docente_nombre: string;
  docente_apellidopaterno: string;
  total_alumnos: number;
  total_escenarios: number;
}

export interface AdminAlumnoInteraccion {
  idinteraccion: string;
  idescenario: string;
  completado?: boolean | null;
  fechafin?: string | null;
}

export interface AdminAlumnoActividadRow {
  idalumno: string;
  idusuario: string;
  nombre: string;
  apellidopaterno: string;
  apellidomaterno?: string | null;
  email: string;
  matricula: string;
  activo?: boolean | null;
  ultimoacceso?: string | null;
  total_salones: number;
  total_interacciones: number;
  escenarios_completados: number;
  promedio_puntuacion?: number | null;
  tiempo_total_minutos: number;
}
