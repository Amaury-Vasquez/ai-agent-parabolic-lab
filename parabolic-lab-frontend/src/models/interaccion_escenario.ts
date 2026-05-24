export interface InteraccionEscenario {
  idinteraccion: string;
  idescenario: string;
  idalumno: string;
  fechainicio?: Date | null;
  fechamodificacion?: Date | null;
  fechafin?: Date | null;
  tiempototal?: number | null;
  intentosrealizados?: number | null;
  puntuacion?: number | null;
  completado?: boolean | null;
  datosinteraccion?: Record<string, unknown> | null;
  escenario_nombre?: string | null;
}