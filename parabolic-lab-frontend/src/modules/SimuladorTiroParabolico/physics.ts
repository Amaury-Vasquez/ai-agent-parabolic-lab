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
