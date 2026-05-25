import { Badge } from "amvasdev-ui";
import type { AdminAlumnoActividadRow } from "@/types/admin";

interface AlumnoActividadRowProps {
  alumno: AdminAlumnoActividadRow;
}

const formatPuntuacion = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return "—";
  return Number(value).toFixed(1);
};

const AlumnoRow = ({ alumno }: AlumnoActividadRowProps) => {
  const isActivo = alumno.activo !== false;
  const fullName = [
    alumno.nombre,
    alumno.apellidopaterno,
    alumno.apellidomaterno,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <tr>
      <td>
        <div className="flex flex-col">
          <span className="font-semibold">{fullName}</span>
          <span className="text-xs opacity-60">{alumno.email}</span>
        </div>
      </td>
      <td className="text-sm">{alumno.matricula}</td>
      <td className="text-sm">{alumno.total_salones}</td>
      <td className="text-sm">{alumno.total_interacciones}</td>
      <td className="text-sm">{alumno.escenarios_completados}</td>
      <td className="text-sm">{formatPuntuacion(alumno.promedio_puntuacion)}</td>
      <td className="text-sm">
        {Number(alumno.tiempo_total_minutos).toFixed(0)} min
      </td>
      <td>
        <Badge variant={isActivo ? "success" : "error"} soft>
          {isActivo ? "Activo" : "Inactivo"}
        </Badge>
      </td>
    </tr>
  );
};

export default AlumnoRow;
