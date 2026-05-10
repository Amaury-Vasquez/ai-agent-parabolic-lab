export interface SimSettings {
  angle: number;
  velocity: number;
  cannonHeight: number;
  cannonX: number;
  targetDistance: number;
  targetRadius: number;
  gravity: number;
}

export type GamePhase = "idle" | "firing" | "hit" | "miss";

export interface ScoreState {
  shots: number;
  hits: number;
  streak: number;
  bestStreak: number;
  points: number;
}

export interface ProjectileState {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export interface ScorePopup {
  x: number;
  y: number;
  text: string;
  life: number;
  color: string;
}
