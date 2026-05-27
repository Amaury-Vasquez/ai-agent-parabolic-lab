export interface DisparoReporte {
  n: number;
  angulo: number | null;
  velocidad: number | null;
  altura_canon: number | null;
  distancia: number | null;
  acierto: boolean;
  puntos: number;
}

export interface AnalisisReporte {
  angulo_alumno: number | null;
  angulo_correcto: number | null;
  velocidad_alumno: number | null;
  velocidad_correcta: number | null;
  alcance_alumno: number | null;
  alcance_correcto: number | null;
  altura_maxima_alumno: number | null;
  tiempo_vuelo_alumno: number | null;
  procedimiento: string | null;
  notas: string | null;
}

export interface IntentoComparativo {
  idinteraccion: string;
  fechainicio: string | null;
  puntuacion: number | null;
  intentosrealizados: number | null;
  completado: boolean | null;
}

export interface ReporteIntento {
  idinteraccion: string;
  idescenario: string;
  nombre_escenario: string;
  descripcion: string | null;
  niveldificultad: string;
  fechainicio: string | null;
  fechafin: string | null;
  tiempototal: number | null;
  intentosrealizados: number | null;
  puntuacion: number | null;
  disparos: DisparoReporte[];
  analisis: AnalisisReporte;
  comparativa: IntentoComparativo[];
}
