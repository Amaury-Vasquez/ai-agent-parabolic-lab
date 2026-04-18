"use client";
import { Button } from "amvasdev-ui";
import { Plus } from "lucide-react";
import { useState } from "react";
import ClassroomCard from "./ClassroomCard";
import JoinClassroomModal from "@/components/JoinClassroomModal";
import { useMySalones } from "@/queries/useMySalones";

const Alumno = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: salones, isLoading } = useMySalones();

  return (
    <div className="p-4 md:p-8">
      {/* Header Section */}
      <div className="flex flex-col justify-between items-start mb-8 sm:items-center gap-4 sm:flex-row">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Mis Salones</h1>
          <p className="mt-1">Accede a tus salones y revisa tu progreso</p>
        </div>
        <Button
          variant="primary"
          onClick={() => setIsModalOpen(true)}
          className="max-sm:w-full"
        >
          <Plus size="16" strokeWidth="2.5" />
          Unirse a un Salón
        </Button>
      </div>

      {/* Classrooms Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner loading-lg" />
        </div>
      ) : salones && salones.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {salones.map((salon) => (
            <ClassroomCard key={salon.idsalon} salon={salon} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 opacity-60">
          <p className="text-lg">No estás inscrito en ningún salón aún.</p>
          <p className="text-sm mt-1">
            Únete a un salón con el código de acceso de tu profesor.
          </p>
        </div>
      )}

      {/* Join Classroom Modal */}
      <JoinClassroomModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default Alumno;
