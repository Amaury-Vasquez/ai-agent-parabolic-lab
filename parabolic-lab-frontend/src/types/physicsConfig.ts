export interface PhysicsConfig {
  // Rango permitido para el ángulo
  angleMin: number;
  angleMax: number;
  angleDefault: number;

  // Rango permitido para la velocidad inicial
  velocityMin: number;
  velocityMax: number;
  velocityDefault: number;

  // Altura del cañón
  cannonHeight: number;

  // Configuración del objetivo
  targetDistance: number;
  targetRadius: number;

  // Opciones de visualización
  showTrajectory?: boolean;
  showVectors?: boolean;
  showGrid?: boolean;
}

export interface ScenarioConfiguracion {
  physics: PhysicsConfig;
  // Espacio para futuras configuraciones adicionales
  [key: string]: unknown;
}
