export interface SalonProgresoEstudiante {
  idalumno: string;
  nombre: string;
  apellidopaterno: string;
  apellidomaterno?: string | null;
  total_interacciones: number;
  promedio_puntuacion: number;
  mejor_puntuacion: number;
  total_intentos: number;
  escenarios_completados: number;
  tiempo_total_minutos: number;
}

export interface SalonProgresoResponse {
  estudiantes: SalonProgresoEstudiante[];
}

export interface EstudianteEnSalon {
  idalumno: string;
  nombre: string;
  apellidopaterno: string;
  apellidomaterno?: string | null;
  email: string;
  ultimo_acceso: string | null;
  escenarios_completados: number;
  total_escenarios: number;
}

export interface EstudianteGlobal {
  idalumno: string;
  idusuario: string;
  nombre: string;
  apellidopaterno: string;
  apellidomaterno?: string | null;
  email: string;
  matricula: string;
  idsalon: string;
  nombresalon: string;
  total_interacciones: number;
  promedio_puntuacion: number | null;
  mejor_puntuacion: number | null;
  total_intentos: number;
  escenarios_completados: number;
  tiempo_total_minutos: number;
  progreso_total: number;
}

export type SortBy = "nombre" | "promedio" | "interacciones" | "salon";
export type Order = "asc" | "desc";

export interface EstudiantesGlobalesOptions {
  sort_by?: SortBy;
  order?: Order;
  idsalon?: string;
}
