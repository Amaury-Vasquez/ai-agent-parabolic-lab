export interface Activity {
  idactividad: string;
  idsalon: string;
  titulo: string;
  descripcion?: string | null;
  instrucciones?: string | null;
  duracionminutos?: number | null;
  intentospermitidos?: number;
  fechacreacion?: Date;
  fechamodificacion?: Date;
  fechaexpiracion?: Date | null;
  puntuaciontotal?: number;
  tipoactividad: string;
  activa?: boolean;
}
