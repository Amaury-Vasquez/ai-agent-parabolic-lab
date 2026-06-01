"use client";
import { School } from "lucide-react";
import SalonCard from "./SalonCard";
import SalonRow from "./SalonRow";
import BackButton from "@/components/BackButton";
import useIsMobileOrTablet from "@/hooks/useIsMobileOrTablet";
import { useAdminSalones } from "@/queries/useAdminSalones";

const AdminSalones = () => {
  const isMobileOrTablet = useIsMobileOrTablet();
  const { data: salones, isLoading } = useAdminSalones();

  return (
    <div className="p-4 md:p-6 lg:p-8 flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <BackButton />
          <h1 className="text-2xl md:text-3xl font-bold">Salones</h1>
        </div>
        <p className="text-sm md:text-base opacity-70">
          Todos los salones registrados en tu institución
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner loading-lg" />
        </div>
      ) : !salones || salones.length === 0 ? (
        <div className="flex flex-col items-center text-center py-12 gap-2 opacity-70">
          <School size={32} />
          <p>Aún no hay salones en tu institución.</p>
        </div>
      ) : isMobileOrTablet ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {salones.map((salon) => (
            <SalonCard key={salon.idsalon} salon={salon} />
          ))}
        </div>
      ) : (
        <div className="bg-base-100 border border-base-300 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Salón</th>
                  <th>Docente</th>
                  <th>Alumnos</th>
                  <th>Escenarios</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {salones.map((salon) => (
                  <SalonRow key={salon.idsalon} salon={salon} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSalones;
