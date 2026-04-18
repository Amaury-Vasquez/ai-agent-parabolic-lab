export const PHYSICS_DEFAULTS = {
  // Ángulo del cañón (grados)
  ANGLE_MIN: 0,
  ANGLE_MAX: 90,
  ANGLE_DEFAULT: 45,
  ANGLE_STEP: 1,

  // Velocidad inicial (m/s)
  VELOCITY_MIN: 1,
  VELOCITY_MAX: 100,
  VELOCITY_DEFAULT: 20,
  VELOCITY_STEP: 0.5,

  // Altura del cañón (metros)
  CANNON_HEIGHT_MIN: 0,
  CANNON_HEIGHT_MAX: 50,
  CANNON_HEIGHT_DEFAULT: 0,
  CANNON_HEIGHT_STEP: 0.5,

  // Distancia del objetivo (metros)
  TARGET_DISTANCE_MIN: 1,
  TARGET_DISTANCE_MAX: 200,
  TARGET_DISTANCE_DEFAULT: 40,
  TARGET_DISTANCE_STEP: 1,

  // Radio del objetivo (metros)
  TARGET_RADIUS_MIN: 0.5,
  TARGET_RADIUS_MAX: 10,
  TARGET_RADIUS_DEFAULT: 2,
  TARGET_RADIUS_STEP: 0.5,

  // Gravedad (m/s²)
  GRAVITY: 9.8,
} as const;
