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
