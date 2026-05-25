"use client";
import { GraduationCap, School, ShieldCheck, Users } from "lucide-react";
import StatCard from "./StatCard";
import InstitutionIdCard from "@/components/InstitutionIdCard";
import { useAdminOverview } from "@/queries/useAdminOverview";

const AdminOverview = () => {
  const { data, isLoading, error } = useAdminOverview();

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 lg:p-8 flex justify-center">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-4 md:p-6 lg:p-8">
        <p className="text-error">
          No se pudo cargar el resumen de tu institución.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 flex flex-col gap-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Panel de Administración</h1>
        <p className="text-sm md:text-base opacity-70 mt-1">
          Resumen de tu institución y métricas globales
        </p>
      </div>

      <InstitutionIdCard
        idinstitucion={data.idinstitucion}
        nombreInstitucion={data.nombre_institucion}
        clavect={data.clavect}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={ShieldCheck}
          label="Docentes"
          value={data.total_docentes}
          hint={`${data.total_docentes_activos} activos`}
          accent="primary"
        />
        <StatCard
          icon={GraduationCap}
          label="Alumnos"
          value={data.total_alumnos}
          hint={`${data.total_alumnos_activos} activos`}
          accent="success"
        />
        <StatCard
          icon={School}
          label="Salones"
          value={data.total_salones}
          hint={`${data.total_salones_activos} activos`}
          accent="warning"
        />
        <StatCard
          icon={Users}
          label="Comunidad"
          value={data.total_docentes + data.total_alumnos}
          hint="Usuarios totales"
        />
      </div>
    </div>
  );
};

export default AdminOverview;
