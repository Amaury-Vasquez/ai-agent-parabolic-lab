export interface Scenario {
  idescenario: string;
  idsalon: string;
  nombre: string;
  descripcion?: string | null;
  niveldificultad: string;
  tipoescenario: string;
  objetivosaprendizaje?: string | null;
  instrucciones?: string | null;
  tiempolimite?: number | null;
  intentospermitidos?: number;
  configuracionescenario?: Record<string, unknown>;
  fechacreacion?: Date;
  fechamodificacion?: Date;
  activo?: boolean;
}
