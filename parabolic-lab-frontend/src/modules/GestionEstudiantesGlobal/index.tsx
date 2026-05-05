"use client";
import { Button } from "amvasdev-ui";
import { Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type {
  EstudianteGlobal,
  Order,
  SortBy,
} from "@/models/estudiante";
import { useEstudiantesGlobales } from "@/queries/useEstudiantesGlobales";
import { useMySalones } from "@/queries/useMySalones";

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: "nombre", label: "Alfabético" },
  { value: "promedio", label: "Rendimiento/Promedio" },
  { value: "interacciones", label: "Actividad/Interacciones" },
  { value: "salon", label: "Salón" },
];

const GestionEstudiantesGlobal = () => {
  const router = useRouter();
  const [sortBy, setSortBy] = useState<SortBy>("nombre");
  const [order, setOrder] = useState<Order>("asc");
  const [selectedSalonId, setSelectedSalonId] = useState<string>("");

  const { data: estudiantes, isLoading: isEstudiantesLoading } =
    useEstudiantesGlobales({
      sort_by: sortBy,
      order: order,
      idsalon: selectedSalonId || undefined,
    });

  const { data: salones, isLoading: isSalonesLoading } = useMySalones();

  const handleVerExpediente = (estudiante: EstudianteGlobal) => {
    router.push(
      `/docente/salon/${estudiante.idsalon}/estudiantes/${estudiante.idalumno}`
    );
  };

  const calcularPorcentajeProgreso = (
    completados: number,
    total: number,
  ): number => (total > 0 ? (completados / total) * 100 : 0);

  const isLoading = isEstudiantesLoading || isSalonesLoading;

  return (
    <div className="p-8">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Gestión Global de Estudiantes
        </h1>
        <p className="opacity-60">
          Total: {estudiantes?.length || 0} estudiante
          {estudiantes && estudiantes.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Toolbar de Filtros */}
      <div className="bg-base-100 border border-base-300 rounded-lg p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Filtro por Salón */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Filtrar por Salón</span>
            </label>
            <select
              value={selectedSalonId}
              onChange={(e) => setSelectedSalonId(e.target.value)}
              className="select select-bordered w-full"
              disabled={isSalonesLoading}
            >
              <option value="">Todos los salones</option>
              {salones?.map((salon) => (
                <option key={salon.idsalon} value={salon.idsalon}>
                  {salon.nombresalon}
                </option>
              ))}
            </select>
          </div>

          {/* Ordenamiento */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Ordenar por</span>
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className="select select-bordered w-full"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Dirección */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Dirección</span>
            </label>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={order === "asc" ? "primary" : "ghost"}
                onClick={() => setOrder("asc")}
                className="flex-1 text-xs"
              >
                Ascendente ↑
              </Button>
              <Button
                size="sm"
                variant={order === "desc" ? "primary" : "ghost"}
                onClick={() => setOrder("desc")}
                className="flex-1 text-xs"
              >
                Descendente ↓
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : !estudiantes || estudiantes.length === 0 ? (
        /* Empty State */
        <div className="card bg-base-200">
          <div className="card-body items-center justify-center h-64">
            <p className="text-center text-lg font-medium">
              Aún no tienes estudiantes inscritos
            </p>
            <p className="text-center opacity-60 mt-2">
              ¡Invita a tus alumnos a unirse a un salón!
            </p>
          </div>
        </div>
      ) : (
        /* Tabla de Estudiantes */
        <div className="overflow-x-auto bg-base-100 rounded-lg border border-base-300">
          <table className="table w-full">
            <thead>
              <tr className="bg-base-300">
                <th>Estudiante</th>
                <th>Salón</th>
                <th>Rendimiento</th>
                <th>Actividad</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {estudiantes.map((estudiante) => (
                <tr key={estudiante.idalumno} className="hover:bg-base-200">
                  {/* Estudiante */}
                  <td>
                    <div>
                      <div className="font-medium">
                        {estudiante.nombre} {[estudiante.apellidopaterno, estudiante.apellidomaterno].filter(Boolean).join(" ")}
                      </div>
                      <div className="text-sm opacity-60">
                        {estudiante.email}
                      </div>
                    </div>
                  </td>

                  {/* Salón */}
                  <td>
                    <span className="text-sm">{estudiante.nombresalon}</span>
                  </td>

                  {/* Rendimiento */}
                  <td>
                    <div className="flex items-center gap-2">
                      <progress
                        className="progress progress-primary h-2 w-28"
                        value={calcularPorcentajeProgreso(
                          estudiante.escenarios_completados,
                          estudiante.total_intentos
                        )}
                        max="100"
                      ></progress>
                      <span className="text-sm min-w-fit">
                        {(estudiante.promedio_puntuacion ?? 0).toFixed(1)}%
                      </span>
                    </div>
                  </td>

                  {/* Actividad */}
                  <td>
                    <div className="badge badge-primary badge-outline">
                      {estudiante.total_intentos} intentos
                    </div>
                  </td>

                  {/* Acciones */}
                  <td>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleVerExpediente(estudiante)}
                      title="Ver expediente del estudiante"
                      className="gap-1"
                    >
                      <Eye size={14} />
                      Ver Expediente
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default GestionEstudiantesGlobal;
