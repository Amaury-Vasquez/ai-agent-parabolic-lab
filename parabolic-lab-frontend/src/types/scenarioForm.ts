import type { DifficultyLevel } from "@/constants/difficultyLevels";
import type { ScenarioType } from "@/constants/scenarioTypes";
import type { ScenarioConfiguracion } from "./physicsConfig";

export interface ScenarioFormData {
  nombre: string;
  descripcion?: string;
  niveldificultad: DifficultyLevel;
  tipoescenario: ScenarioType;
  objetivosaprendizaje?: string;
  instrucciones?: string;
  tiempolimite?: number;
  intentospermitidos: number;
  configuracionescenario: ScenarioConfiguracion;
  activo: boolean;
}

export interface ScenarioFormErrors {
  nombre?: string;
  niveldificultad?: string;
  tipoescenario?: string;
  tiempolimite?: string;
  intentospermitidos?: string;
  configuracionescenario?: string;
}
