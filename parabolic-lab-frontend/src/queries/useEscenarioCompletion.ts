"use client";

import { useMemo } from "react";
import { useInteraccionesAlumno } from "./useInteraccionesAlumno";

export interface EscenarioCompletion {
  completado: boolean;
  mejorPuntuacion: number | null;
  intentos: number;
}

const EMPTY: EscenarioCompletion = {
  completado: false,
  mejorPuntuacion: null,
  intentos: 0,
};

export function useEscenarioCompletion(
  idescenario: string | undefined
): EscenarioCompletion {
  const { data: interacciones } = useInteraccionesAlumno();

  return useMemo(() => {
    if (!idescenario || !interacciones) return EMPTY;
    let completado = false;
    let mejor: number | null = null;
    let intentos = 0;
    for (const it of interacciones) {
      if (it.idescenario !== idescenario) continue;
      intentos += 1;
      if (it.completado) completado = true;
      const score = it.puntuacion === null || it.puntuacion === undefined
        ? null
        : Number(it.puntuacion);
      if (score !== null && !isNaN(score)) {
        if (mejor === null || score > mejor) mejor = score;
      }
    }
    return { completado, mejorPuntuacion: mejor, intentos };
  }, [idescenario, interacciones]);
}
