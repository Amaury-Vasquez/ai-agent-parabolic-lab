"use client";
import { Button } from "amvasdev-ui";
import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import SalonCard from "./SalonCard";
import CreateClassroomModal from "@/components/CreateClassroomModal";
import { useMySalones } from "@/queries/useMySalones";
import type { Salon } from "@/types/salon";

function sortSalones(salones: Salon[], sortBy: string): Salon[] {
  const sorted = [...salones];
  switch (sortBy) {
    case "alfabetico":
      return sorted.sort((a, b) => a.nombresalon.localeCompare(b.nombresalon));
    case "alumnos":
      return sorted.sort((a, b) => b.num_estudiantes - a.num_estudiantes);
    case "escenarios":
      return sorted.sort((a, b) => b.escenarios.length - a.escenarios.length);
    default:
      return sorted;
  }
}

const Docente = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState("reciente");
  const { data: salones, isLoading } = useMySalones();

  const salonesOrdenados = useMemo(
    () => sortSalones(salones ?? [], sortBy),
    [salones, sortBy],
  );

  return (
    <div className="p-8">
      {/* Header Section */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold">Mis Salones</h1>
          <p className="mt-1">
            Gestiona tus salones, asigna escenarios y monitorea el progreso
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            className="select select-bordered select-sm"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="reciente">Más reciente</option>
            <option value="alfabetico">Alfabético A-Z</option>
            <option value="alumnos">Más alumnos</option>
            <option value="escenarios">Más escenarios</option>
          </select>
          <Button variant="primary" onClick={() => setIsModalOpen(true)}>
            <Plus size="16" />
            Crear Nuevo Salón
          </Button>
        </div>
      </div>

      {/* Salones Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner loading-lg" />
        </div>
      ) : salonesOrdenados.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {salonesOrdenados.map((salon) => (
            <SalonCard key={salon.idsalon} salon={salon} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 opacity-60">
          <p className="text-lg">No tienes salones asignados aún.</p>
          <p className="text-sm mt-1">
            Crea un nuevo salón para comenzar.
          </p>
        </div>
      )}

      {/* Create Classroom Modal */}
      <CreateClassroomModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default Docente;
