export interface EscenarioEnSalon {
  idescenario: string;
  nombre: string;
  idescenario_origen?: string | null;
}

export interface Salon {
  idsalon: string;
  nombresalon: string;
  codigoacceso: string;
  activo: boolean | null;
  escenarios: EscenarioEnSalon[];
  num_estudiantes: number;
}
