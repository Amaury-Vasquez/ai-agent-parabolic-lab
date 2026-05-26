export const CANNON_ASSET_KEYS = [
  "cannon",
  "slingshot",
  "bow",
  "launcher",
  "catapult",
] as const;

export const PROJECTILE_ASSET_KEYS = [
  "ball",
  "stone",
  "dart",
  "spark",
  "comet",
] as const;

export const TARGET_ASSET_KEYS = [
  "bullseye",
  "balloon",
  "block",
  "crate",
  "buoy",
] as const;

export type CannonAssetKey = (typeof CANNON_ASSET_KEYS)[number];
export type ProjectileAssetKey = (typeof PROJECTILE_ASSET_KEYS)[number];
export type TargetAssetKey = (typeof TARGET_ASSET_KEYS)[number];

export const CANNON_LABELS: Record<CannonAssetKey, string> = {
  cannon: "Cañón",
  slingshot: "Resortera",
  bow: "Arco",
  launcher: "Lanzador",
  catapult: "Catapulta",
};

export const PROJECTILE_LABELS: Record<ProjectileAssetKey, string> = {
  ball: "Pelota",
  stone: "Piedra",
  dart: "Dardo",
  spark: "Chispa",
  comet: "Cometa",
};

export const TARGET_LABELS: Record<TargetAssetKey, string> = {
  bullseye: "Diana",
  balloon: "Globo",
  block: "Bloque",
  crate: "Caja",
  buoy: "Boya",
};

export const DEFAULT_ASSETS = {
  cannon: "cannon" as CannonAssetKey,
  projectile: "ball" as ProjectileAssetKey,
  target: "bullseye" as TargetAssetKey,
};
