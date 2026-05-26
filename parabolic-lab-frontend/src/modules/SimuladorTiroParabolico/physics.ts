import type { ProjectileState, SimSettings } from "./types";

export const TARGET_CENTER_HEIGHT_FACTOR = 1;

export function initialProjectile(s: SimSettings): ProjectileState {
  const angleRad = (s.angle * Math.PI) / 180;
  return {
    x: s.cannonX,
    y: s.cannonHeight,
    vx: s.velocity * Math.cos(angleRad),
    vy: s.velocity * Math.sin(angleRad),
  };
}

export function step(p: ProjectileState, gravity: number, dt: number): void {
  p.x += p.vx * dt;
  p.y += p.vy * dt;
  p.vy -= gravity * dt;
}

export function targetCenter(s: SimSettings): { x: number; y: number } {
  return {
    x: s.targetDistance,
    y: s.targetRadius * TARGET_CENTER_HEIGHT_FACTOR,
  };
}

export function distanceToTarget(
  p: { x: number; y: number },
  s: SimSettings
): number {
  const c = targetCenter(s);
  const dx = p.x - c.x;
  const dy = p.y - c.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function isHit(p: { x: number; y: number }, s: SimSettings): boolean {
  return distanceToTarget(p, s) <= s.targetRadius;
}

export function pointsForHit(
  p: { x: number; y: number },
  s: SimSettings
): number {
  const d = distanceToTarget(p, s);
  const ratio = Math.max(0, 1 - d / s.targetRadius);
  if (ratio === 0) return 0;
  if (ratio > 0.85) return 100;
  if (ratio > 0.55) return 75;
  if (ratio > 0.25) return 50;
  return 25;
}

export interface IdealTrajectory {
  alturaMaxima: number;
  alcance: number;
  tiempoVuelo: number;
  vx: number;
  vy: number;
}

export function computeIdealTrajectory(s: SimSettings): IdealTrajectory {
  const angleRad = (s.angle * Math.PI) / 180;
  const vx = s.velocity * Math.cos(angleRad);
  const vy = s.velocity * Math.sin(angleRad);
  const g = s.gravity;
  // Tiempo hasta y = 0 (suelo) — fórmula cuadrática con altura inicial cannonHeight.
  const tVuelo =
    (vy + Math.sqrt(vy * vy + 2 * g * s.cannonHeight)) / g;
  const alcance = s.cannonX + vx * tVuelo;
  const alturaMaxima = s.cannonHeight + (vy * vy) / (2 * g);
  return { alturaMaxima, alcance, tiempoVuelo: tVuelo, vx, vy };
}

export interface ShotScore {
  // 0–100, basado en cercanía al centro y bonus por impacto.
  score: number;
  hit: boolean;
  distance: number;
  closenessRatio: number;
}

export function computeShotScore(
  closestPoint: { x: number; y: number },
  s: SimSettings,
  hit: boolean
): ShotScore {
  const d = distanceToTarget(closestPoint, s);
  const tolerance = s.targetRadius * 4;
  const closenessRatio = Math.max(0, 1 - d / Math.max(0.0001, tolerance));
  let score: number;
  if (hit) {
    const inside = Math.max(0, 1 - d / s.targetRadius);
    score = 70 + inside * 30;
  } else {
    score = Math.min(60, closenessRatio * 60);
  }
  return {
    score: Math.round(score * 10) / 10,
    hit,
    distance: d,
    closenessRatio,
  };
}

export interface ContextualHint {
  kind: "angle" | "velocity" | "perfect";
  message: string;
  direction: "increase" | "decrease" | "ok";
}

// Genera una pista basada en el impacto real del último disparo.
// Compara dónde aterrizó vs. dónde está el blanco para sugerir ajustes
// SIN dar la respuesta exacta (mantiene el desafío pedagógico).
export function computeContextualHint(
  landingX: number,
  landingY: number,
  s: SimSettings,
  hit: boolean
): ContextualHint {
  if (hit) {
    return {
      kind: "perfect",
      message: "¡Impacto! Intenta reproducir el resultado con menos intentos.",
      direction: "ok",
    };
  }
  const center = targetCenter(s);
  const dxLanding = landingX - center.x;
  // Si cae más allá del blanco
  if (dxLanding > s.targetRadius * 1.5) {
    if (s.angle > 60) {
      return {
        kind: "angle",
        message: "Te pasaste. Reduce un poco el ángulo para volar más bajo y largo.",
        direction: "decrease",
      };
    }
    if (s.angle < 30) {
      return {
        kind: "velocity",
        message: "Aterrizó muy lejos. Considera bajar la velocidad inicial.",
        direction: "decrease",
      };
    }
    return {
      kind: "velocity",
      message: "Pasó de largo. Disminuye la velocidad inicial.",
      direction: "decrease",
    };
  }
  // Si se quedó corto
  if (dxLanding < -s.targetRadius * 1.5) {
    if (s.angle < 30) {
      return {
        kind: "angle",
        message: "Se quedó corto. Sube el ángulo para ganar altura y alcance.",
        direction: "increase",
      };
    }
    if (s.angle > 70) {
      return {
        kind: "angle",
        message: "Tiro muy vertical. Reduce el ángulo para ganar alcance horizontal.",
        direction: "decrease",
      };
    }
    return {
      kind: "velocity",
      message: "Le faltó alcance. Aumenta la velocidad inicial.",
      direction: "increase",
    };
  }
  // Cerca pero alto/bajo
  if (landingY > center.y + s.targetRadius) {
    return {
      kind: "angle",
      message: "Casi. Pasó arriba del blanco — reduce un poco el ángulo.",
      direction: "decrease",
    };
  }
  return {
    kind: "angle",
    message: "Muy cerca. Ajusta el ángulo en pasos pequeños y vuelve a intentar.",
    direction: "ok",
  };
}
