export interface Salon {
  idsalon: string;
  nombresalon: string;
  codigoacceso: string;
  activo: boolean | null;
  escenarios: { idescenario: string; nombre: string }[];
  num_estudiantes: number;
}
