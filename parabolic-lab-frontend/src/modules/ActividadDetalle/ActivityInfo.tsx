"use client";
import { useParams } from "next/navigation";
import InfoCard from "./InfoCard";
import { Activity } from "@/models/activity";

// TODO: Replace with API call
const MOCK_ACTIVITY: Activity = {
  idactividad: "activity-123",
  idsalon: "salon-123",
  titulo: "Tiro Parabólico - Nivel Básico",
  descripcion:
    "En esta actividad aprenderás los conceptos fundamentales del tiro parabólico mediante ejercicios prácticos y simulaciones interactivas.",
  instrucciones:
    "Completa todos los escenarios en orden. Lee cuidadosamente cada descripción y sigue las instrucciones proporcionadas. Tienes múltiples intentos para mejorar tu puntuación.",
  duracionminutos: 45,
  intentospermitidos: 3,
  fechacreacion: new Date("2025-01-15"),
  fechamodificacion: new Date("2025-01-20"),
  fechaexpiracion: new Date("2025-12-31"),
  puntuaciontotal: 100,
  tipoactividad: "Práctica",
  activa: true,
};

const ActivityInfo = () => {
  const params = useParams();
  const activityId = params.activityId as string;

  const activity = { ...MOCK_ACTIVITY, idactividad: activityId };

  const formatDate = (date?: Date | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

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
        <span
          className={`badge ${
            activity.activa ? "badge-success" : "badge-error"
          }`}
        >
          {activity.activa ? "Activa" : "Inactiva"}
        </span>
      </div>
    </div>
  );
};

export default ActivityInfo;
