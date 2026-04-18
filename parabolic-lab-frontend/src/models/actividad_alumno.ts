export interface ActividadAlumno {
  idactividadalumno: string;
  idactividad: string;
  idalumno: string;
  puntuacionobtenida?: number | null;
  fechaactividad?: Date | null;
  fechamodificacion?: Date | null;
  completada?: boolean | null;
}