export interface SalonProgresoEstudiante {
  idalumno: string;
  nombre: string;
  apellidopaterno: string;
  promedio_puntuacion: number;
  escenarios_completados: number;
  total_intentos: number;
  tiempo_total_minutos: number;
  mejor_puntuacion: number;
}

export interface SalonProgresoResponse {
  estudiantes: SalonProgresoEstudiante[];
}

export interface EstudianteEnSalon {
  idalumno: string;
  nombre: string;
  apellido: string;
  correo: string;
  ultimo_acceso: string | null;
  escenarios_completados: number;
  total_escenarios: number;
}

export interface EstudianteGlobal {
  idalumno: string;
  nombre: string;
  apellido: string;
  correo: string;
  idsalon: string;
  nombresalon: string;
  progreso_total: number;
  promedio_puntuacion: number;
  escenarios_completados: number;
  total_intentos: number;
}

export interface EstudiantesGlobalesResponse {
  estudiantes: EstudianteGlobal[];
  total: number;
}

export type SortBy = "nombre" | "promedio" | "interacciones" | "salon";
export type Order = "asc" | "desc";

export interface EstudiantesGlobalesOptions {
  sort_by?: SortBy;
  order?: Order;
  idsalon?: string;
}
