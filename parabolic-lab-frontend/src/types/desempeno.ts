import type { DatosInteraccion } from "./datosInteraccion";

export interface InteraccionConEscenario {
  idinteraccion: string;
  idescenario: string;
  escenario_nombre: string;
  escenario_dificultad: string;
  fechainicio: string | null;
  fechafin: string | null;
  tiempototal: number | null;
  intentosrealizados: number | null;
  puntuacion: number | string | null;
  completado: boolean | null;
  datosinteraccion: Partial<DatosInteraccion> | null;
}

export interface DesempenoAlumnoEnSalon {
  idalumno: string;
  nombre: string;
  apellidopaterno: string;
  apellidomaterno: string | null;
  email: string;
  total_interacciones: number;
  escenarios_completados: number;
  promedio_puntuacion: number | string | null;
  mejor_puntuacion: number | string | null;
  total_intentos: number;
  tiempo_total_minutos: number;
  interacciones: InteraccionConEscenario[];
}

export interface ResolucionAlumno {
  idinteraccion: string;
  idalumno: string;
  alumno_nombre: string;
  alumno_apellidopaterno: string;
  alumno_apellidomaterno: string | null;
  fechainicio: string | null;
  fechafin: string | null;
  tiempototal: number | null;
  intentosrealizados: number | null;
  puntuacion: number | string | null;
  completado: boolean | null;
  datosinteraccion: Partial<DatosInteraccion> | null;
}

export interface ResolucionesEscenario {
  idescenario: string;
  escenario_nombre: string;
  escenario_descripcion: string | null;
  escenario_dificultad: string;
  resoluciones: ResolucionAlumno[];
}
