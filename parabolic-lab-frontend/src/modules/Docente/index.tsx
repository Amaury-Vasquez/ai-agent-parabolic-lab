"use client";
import { Button } from "amvasdev-ui";
import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import EmptyState from "@/components/EmptyState";
import TutorialModal from "@/components/TutorialModal";
import SalonCard from "./SalonCard";
import CreateClassroomModal from "@/components/CreateClassroomModal";
import InstitutionIdCard from "@/components/InstitutionIdCard";
import { useInstitucion } from "@/queries/useInstitucion";
import { useMe } from "@/queries/useMe";
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
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [showTutorialPrompt, setShowTutorialPrompt] = useState(true);

  const { data: salones, isLoading } = useMySalones();
  const { data: me } = useMe();
  const { data: institucion } = useInstitucion(me?.idinstitucion);

  const salonesOrdenados = useMemo(
    () => sortSalones(salones ?? [], sortBy),
    [salones, sortBy],
  );

  return (
    <div className="p-4 md:p-6 lg:p-8 flex flex-col gap-6">
      {institucion ? (
        <InstitutionIdCard
          idinstitucion={institucion.idinstitucion}
          nombreInstitucion={institucion.nombre}
          clavect={institucion.clavect}
          description="Comparte este ID con tus alumnos para que se registren en tu institución."
        />
      ) : null}

      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Mis Salones</h1>
          <p className="mt-1 text-sm md:text-base">
            Gestiona tus salones, asigna escenarios y monitorea el progreso
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {salonesOrdenados.map((salon) => (
            <SalonCard key={salon.idsalon} salon={salon} />
          ))}
        </div>
      ) : (
        <EmptyState
          emoji="🏫"
          title="Aún no tienes salones creados"
          subtitle="Crea tu primer salón y comienza a gestionar tus clases de física."
          actionLabel="Crear mi primer salón"
          onAction={() => setIsModalOpen(true)}
        />
      )}

      {/* Create Classroom Modal */}
      <CreateClassroomModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <TutorialModal isOpen={isTutorialOpen} onClose={() => setIsTutorialOpen(false)} />

      {/* Floating tutorial prompt widget */}
      {showTutorialPrompt && !isTutorialOpen ? (
        <div className="fixed bottom-6 right-6 z-40 bg-base-100 shadow-xl border border-base-300 rounded-2xl p-4 max-w-sm animate-fade-in">
          <div className="flex items-start gap-3">
            <span className="text-2xl select-none">🎓</span>
            <p className="text-sm font-semibold text-base-content">
              ¡Hola! ¿Deseas ver un recorrido rápido por el sistema?
            </p>
          </div>
          <div className="flex gap-2 mt-3 justify-end">
            <button
              className="btn btn-ghost btn-sm text-base-content/60"
              onClick={() => setShowTutorialPrompt(false)}
            >
              No, gracias
            </button>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => {
                setShowTutorialPrompt(false);
                setIsTutorialOpen(true);
              }}
            >
              Sí, ver tutorial
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Docente;
