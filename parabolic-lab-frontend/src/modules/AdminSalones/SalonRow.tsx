import { Badge } from "amvasdev-ui";
import { BookOpen, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import type { AdminSalonRow } from "@/types/admin";

interface SalonRowProps {
  salon: AdminSalonRow;
}

const SalonListRow = ({ salon }: SalonRowProps) => {
  const router = useRouter();
  const isActivo = salon.activo !== false;

  return (
    <tr
      className="cursor-pointer hover:bg-base-200 transition-colors"
      onClick={() => router.push(`/admin/salones/${salon.idsalon}`)}
    >
      <td>
        <div className="flex flex-col">
          <span className="font-semibold">{salon.nombresalon}</span>
          <span className="font-mono text-xs opacity-60">
            {salon.codigoacceso}
          </span>
        </div>
      </td>
      <td className="text-sm">
        {salon.docente_nombre} {salon.docente_apellidopaterno}
      </td>
      <td>
        <span className="inline-flex items-center gap-1 text-sm">
          <Users size={14} className="opacity-60" />
          {salon.total_alumnos}
        </span>
      </td>
      <td>
        <span className="inline-flex items-center gap-1 text-sm">
          <BookOpen size={14} className="opacity-60" />
          {salon.total_escenarios}
        </span>
      </td>
      <td>
        <Badge variant={isActivo ? "success" : "error"} soft>
          {isActivo ? "Activo" : "Inactivo"}
        </Badge>
      </td>
    </tr>
  );
};

export default SalonListRow;
