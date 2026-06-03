export interface Disparo {
  n: number;
  angle: number;
  velocity: number;
  cannonHeight: number;
  cannonX: number;
  hit: boolean;
  distance: number;
  points: number;
  timestamp: string;
}

export interface ResolucionAlumno {
  procedimiento: string;
  respuestas: {
    angulo: number | null;
    velocidad: number | null;
    alturaMaxima: number | null;
    alcance: number | null;
    tiempoVuelo: number | null;
  };
  notas: string;
}

export interface DatosInteraccion {
  disparos: Disparo[];
  resolucion: ResolucionAlumno;
  puntuacionFinal: number;
  intentosUsados: number;
  tiempoTotalSegundos: number;
  autoScoreMejor?: number;
  calificacion_manual?: number;
}

export const EMPTY_RESOLUCION: ResolucionAlumno = {
  procedimiento: "",
  respuestas: {
    angulo: null,
    velocidad: null,
    alturaMaxima: null,
    alcance: null,
    tiempoVuelo: null,
  },
  notas: "",
};

// Claves de los campos obligatorios en la solución del alumno.
export type CampoResolucion =
  | "procedimiento"
  | "angulo"
  | "velocidad"
  | "alturaMaxima"
  | "alcance"
  | "tiempoVuelo";

/**
 * Devuelve los campos obligatorios que el alumno dejó sin responder.
 * Exige el procedimiento (texto) y los 5 valores numéricos.
 */
export function getCamposFaltantes(
  resolucion: ResolucionAlumno,
): Set<CampoResolucion> {
  const faltantes = new Set<CampoResolucion>();
  if (!resolucion.procedimiento.trim()) faltantes.add("procedimiento");
  const { angulo, velocidad, alturaMaxima, alcance, tiempoVuelo } =
    resolucion.respuestas;
  if (angulo === null) faltantes.add("angulo");
  if (velocidad === null) faltantes.add("velocidad");
  if (alturaMaxima === null) faltantes.add("alturaMaxima");
  if (alcance === null) faltantes.add("alcance");
  if (tiempoVuelo === null) faltantes.add("tiempoVuelo");
  return faltantes;
}
