export interface ParameterLock {
  enabled: boolean;
  min: number;
  max: number;
}

export interface PhysicsLocks {
  angle?: ParameterLock;
  velocity?: ParameterLock;
  cannonHeight?: ParameterLock;
  cannonX?: ParameterLock;
  targetDistance?: ParameterLock;
}

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

  // Locks por parámetro: cuando enabled=true, el alumno solo puede ajustar
  // dentro de [min, max]. Si min === max se comporta como valor fijo.
  locks?: PhysicsLocks;
}

export interface AssetSelection {
  cannon: string;
  projectile: string;
  target: string;
}

export interface ScenarioConfiguracion {
  physics: PhysicsConfig;
  // Visuales originales por escenario (docente fija el default)
  assets?: AssetSelection;
  // Orden dentro de su nivel de dificultad para progresión secuencial
  orden?: number;
  // Espacio para futuras configuraciones adicionales
  [key: string]: unknown;
}
