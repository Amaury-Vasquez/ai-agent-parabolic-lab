"use client";
import { Badge } from "amvasdev-ui";
import { BookOpen, GraduationCap, Mail, User, Users } from "lucide-react";
import BackButton from "@/components/BackButton";
import useIsMobileOrTablet from "@/hooks/useIsMobileOrTablet";
import { useAdminSalonDetalle } from "@/queries/useAdminSalonDetalle";
import type { AdminSalonEstudiante } from "@/types/admin";

interface AdminSalonDetalleProps {
  salonId: string;
}

const formatFecha = (fecha?: string | null) =>
  fecha
    ? new Date(fecha).toLocaleDateString("es-MX", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

const nombreCompleto = (e: AdminSalonEstudiante) =>
  [e.nombre, e.apellidopaterno, e.apellidomaterno].filter(Boolean).join(" ");

const EstudianteCard = ({ estudiante }: { estudiante: AdminSalonEstudiante }) => (
  <article className="bg-base-100 border border-base-300 rounded-2xl p-4 flex flex-col gap-1.5 shadow-sm">
    <h3 className="font-semibold leading-snug">{nombreCompleto(estudiante)}</h3>
    <p className="font-mono text-xs opacity-60">{estudiante.matricula}</p>
    <p className="text-sm opacity-70 break-all">{estudiante.email}</p>
    <p className="text-xs opacity-60">
      Inscrito: {formatFecha(estudiante.fechainscripcion)}
    </p>
  </article>
);

const AdminSalonDetalle = ({ salonId }: AdminSalonDetalleProps) => {
  const isMobileOrTablet = useIsMobileOrTablet();
  const { data: salon, isLoading, error } = useAdminSalonDetalle(salonId);

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 lg:p-8 flex justify-center py-12">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  if (error || !salon) {
    return (
      <div className="p-4 md:p-6 lg:p-8 flex flex-col gap-4">
        <BackButton />
        <p className="text-error">
          No se pudo cargar el salón. Verifica que pertenezca a tu institución.
        </p>
      </div>
    );
  }

  const isActivo = salon.activo !== false;
  const docenteNombre = [
    salon.docente_nombre,
    salon.docente_apellidopaterno,
    salon.docente_apellidomaterno,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="p-4 md:p-6 lg:p-8 flex flex-col gap-6">
      {/* Encabezado */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3 flex-wrap">
          <BackButton />
          <h1 className="text-2xl md:text-3xl font-bold">
            {salon.nombresalon}
          </h1>
          <Badge variant={isActivo ? "success" : "error"} soft>
            {isActivo ? "Activo" : "Inactivo"}
          </Badge>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm opacity-70">
          <span className="font-mono">Código: {salon.codigoacceso}</span>
          <span className="inline-flex items-center gap-1">
            <Users size={14} />
            {salon.estudiantes.length} estudiantes
          </span>
          <span className="inline-flex items-center gap-1">
            <BookOpen size={14} />
            {salon.total_escenarios} escenarios
          </span>
          <span>Creado: {formatFecha(salon.fechacreacion)}</span>
        </div>
      </div>

      {/* Docente */}
      <section className="bg-base-100 border border-base-300 rounded-2xl p-4 md:p-6 flex flex-col gap-3">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <User size={18} className="opacity-70" />
          Docente
        </h2>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
          <span className="font-medium">{docenteNombre}</span>
          <span className="inline-flex items-center gap-1.5 text-sm opacity-70 break-all">
            <Mail size={14} className="shrink-0" />
            {salon.docente_email}
          </span>
          {salon.docente_gradoacademico ? (
            <span className="inline-flex items-center gap-1.5 text-sm opacity-70">
              <GraduationCap size={14} className="shrink-0" />
              {salon.docente_gradoacademico}
            </span>
          ) : null}
        </div>
      </section>

      {/* Estudiantes */}
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Users size={18} className="opacity-70" />
          Estudiantes inscritos
        </h2>
        {salon.estudiantes.length === 0 ? (
          <div className="flex flex-col items-center text-center py-10 gap-2 opacity-70 bg-base-100 border border-base-300 rounded-2xl">
            <Users size={28} />
            <p>Aún no hay estudiantes inscritos en este salón.</p>
          </div>
        ) : isMobileOrTablet ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {salon.estudiantes.map((estudiante) => (
              <EstudianteCard
                key={estudiante.idalumno}
                estudiante={estudiante}
              />
            ))}
          </div>
        ) : (
          <div className="bg-base-100 border border-base-300 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Estudiante</th>
                    <th>Matrícula</th>
                    <th>Correo</th>
                    <th>Inscripción</th>
                  </tr>
                </thead>
                <tbody>
                  {salon.estudiantes.map((estudiante) => (
                    <tr key={estudiante.idalumno}>
                      <td className="font-medium">
                        {nombreCompleto(estudiante)}
                      </td>
                      <td className="font-mono text-sm">
                        {estudiante.matricula}
                      </td>
                      <td className="text-sm">{estudiante.email}</td>
                      <td className="text-sm">
                        {formatFecha(estudiante.fechainscripcion)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminSalonDetalle;
