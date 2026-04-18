"use client";
import { useActividad } from "@/queries/useActividad";
import InfoCard from "./InfoCard";

interface ActivityInfoProps {
  idactividad: string;
}

const ActivityInfo = ({ idactividad }: ActivityInfoProps) => {
  const { data: activity, isLoading, isError } = useActividad(idactividad);

  const formatDate = (date?: Date | string | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="rounded-lg bg-base-200 p-4 md:p-6">
        <span className="loading loading-spinner loading-md" />
      </div>
    );
  }

  if (isError || !activity) {
    return (
      <div className="rounded-lg bg-base-200 p-4 md:p-6">
        <p className="opacity-70">No se pudo cargar la actividad.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg flex flex-col gap-4 bg-base-200 p-4 md:p-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">{activity.titulo}</h1>
        <p className="text-sm opacity-70">Tipo: {activity.tipoactividad}</p>
      </div>

      {activity.descripcion ? (
        <div>
          <h2 className="text-lg font-semibold mb-2">Descripción</h2>
          <p>{activity.descripcion}</p>
        </div>
      ) : null}

      {activity.instrucciones ? (
        <div>
          <h2 className="text-lg font-semibold mb-2">Instrucciones</h2>
          <p>{activity.instrucciones}</p>
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {activity.duracionminutos ? (
          <InfoCard
            label="Duración estimada"
            value={`${activity.duracionminutos} minutos`}
          />
        ) : null}
        {activity.intentospermitidos ? (
          <InfoCard
            label="Intentos permitidos"
            value={activity.intentospermitidos}
          />
        ) : null}
        {activity.puntuaciontotal !== undefined ? (
          <InfoCard label="Puntuación total" value={activity.puntuaciontotal} />
        ) : null}
        {activity.fechaexpiracion ? (
          <InfoCard
            label="Fecha de expiración"
            value={formatDate(activity.fechaexpiracion)}
          />
        ) : null}
        {activity.fechacreacion ? (
          <InfoCard
            label="Fecha de creación"
            value={formatDate(activity.fechacreacion)}
          />
        ) : null}
        {activity.fechamodificacion ? (
          <InfoCard
            label="Última modificación"
            value={formatDate(activity.fechamodificacion)}
          />
        ) : null}
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm opacity-70">Estado:</span>
        <span className={`badge ${activity.activa ? "badge-success" : "badge-error"}`}>
          {activity.activa ? "Activa" : "Inactiva"}
        </span>
      </div>
    </div>
  );
};

export default ActivityInfo;