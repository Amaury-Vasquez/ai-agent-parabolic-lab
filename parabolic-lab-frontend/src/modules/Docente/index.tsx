"use client";
import { Button } from "amvasdev-ui";
import { Plus } from "lucide-react";
import { useState } from "react";
import SalonCard from "./SalonCard";
import CreateClassroomModal from "@/components/CreateClassroomModal";
import { useMySalones } from "@/queries/useMySalones";

const Docente = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: salones, isLoading } = useMySalones();

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
        <Button variant="primary" onClick={() => setIsModalOpen(true)}>
          <Plus size="16" />
          Crear Nuevo Salón
        </Button>
      </div>

      {/* Salones Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner loading-lg" />
        </div>
      ) : salones && salones.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {salones.map((salon) => (
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
