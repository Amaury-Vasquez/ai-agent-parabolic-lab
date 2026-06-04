import { Badge } from "amvasdev-ui";
import { BookOpen, User, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import type { AdminSalonRow } from "@/types/admin";

interface SalonCardProps {
  salon: AdminSalonRow;
}

const SalonCard = ({ salon }: SalonCardProps) => {
  const router = useRouter();
  const isActivo = salon.activo !== false;

  return (
    <article
      className="bg-base-100 border border-base-300 rounded-2xl p-4 flex flex-col gap-3 shadow-sm cursor-pointer hover:border-primary/40 transition-colors"
      onClick={() => router.push(`/admin/salones/${salon.idsalon}`)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-semibold truncate">{salon.nombresalon}</h3>
          <p className="font-mono text-xs opacity-60 truncate">
            {salon.codigoacceso}
          </p>
        </div>
        <Badge variant={isActivo ? "success" : "error"} soft>
          {isActivo ? "Activo" : "Inactivo"}
        </Badge>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <User size={14} className="opacity-60" />
        <span className="truncate">
          {salon.docente_nombre} {salon.docente_apellidopaterno}
        </span>
      </div>
      <div className="flex items-center gap-4 text-sm">
        <span className="inline-flex items-center gap-1">
          <Users size={14} className="opacity-60" />
          {salon.total_alumnos} alumnos
        </span>
        <span className="inline-flex items-center gap-1">
          <BookOpen size={14} className="opacity-60" />
          {salon.total_escenarios} escenarios
        </span>
      </div>
    </article>
  );
};

export default SalonCard;
