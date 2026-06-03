import { Badge, Button } from "amvasdev-ui";
import type { AdminAlumnoActividadRow } from "@/types/admin";

interface AlumnoCardProps {
  alumno: AdminAlumnoActividadRow;
  onVerReporte: (alumno: AdminAlumnoActividadRow) => void;
}

const formatPuntuacion = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return "—";
  return Number(value).toFixed(1);
};

const AlumnoCard = ({ alumno, onVerReporte }: AlumnoCardProps) => {
  const isActivo = alumno.activo !== false;
  const fullName = [
    alumno.nombre,
    alumno.apellidopaterno,
    alumno.apellidomaterno,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <article className="bg-base-100 border border-base-300 rounded-2xl p-4 flex flex-col gap-3 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-semibold truncate">{fullName}</h3>
          <p className="text-xs opacity-60 break-all">{alumno.email}</p>
          <p className="text-xs opacity-60 mt-0.5">
            Matrícula: {alumno.matricula}
          </p>
        </div>
        <Badge variant={isActivo ? "success" : "error"} soft>
          {isActivo ? "Activo" : "Inactivo"}
        </Badge>
      </div>
      <dl className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-xs uppercase opacity-60">Salones</dt>
          <dd className="font-semibold">{alumno.total_salones}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase opacity-60">Interacciones</dt>
          <dd className="font-semibold">{alumno.total_interacciones}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase opacity-60">Completados</dt>
          <dd className="font-semibold">{alumno.escenarios_completados}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase opacity-60">Promedio</dt>
          <dd className="font-semibold">
            {formatPuntuacion(alumno.promedio_puntuacion)}
          </dd>
        </div>
        <div className="col-span-2">
          <dt className="text-xs uppercase opacity-60">Tiempo total</dt>
          <dd className="font-semibold">
            {Number(alumno.tiempo_total_minutos).toFixed(0)} minutos
          </dd>
        </div>
      </dl>
      <Button
        variant="ghost"
        size="sm"
        className="w-full"
        onClick={() => onVerReporte(alumno)}
      >
        Ver reporte
      </Button>
    </article>
  );
};

export default AlumnoCard;
