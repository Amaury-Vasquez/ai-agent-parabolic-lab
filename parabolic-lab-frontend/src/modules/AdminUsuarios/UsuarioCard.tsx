import { Badge, Button } from "amvasdev-ui";
import { RotateCcw, Trash2, UserX } from "lucide-react";
import type { AdminUsuarioRow } from "@/types/admin";

interface UsuarioCardProps {
  usuario: AdminUsuarioRow;
  isPending: boolean;
  onDesactivar: () => void;
  onReactivar: () => void;
  onEliminar: () => void;
}

const TIPO_LABEL: Record<string, string> = {
  alumno: "Alumno",
  docente: "Docente",
  admin: "Admin",
};

const TIPO_VARIANT: Record<string, "primary" | "success" | "warning"> = {
  alumno: "success",
  docente: "primary",
  admin: "warning",
};

const UsuarioCard = ({
  usuario,
  isPending,
  onDesactivar,
  onReactivar,
  onEliminar,
}: UsuarioCardProps) => {
  const isActivo = usuario.activo !== false;
  const fullName = [
    usuario.nombre,
    usuario.apellidopaterno,
    usuario.apellidomaterno,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <article className="bg-base-100 border border-base-300 rounded-2xl p-4 flex flex-col gap-3 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-semibold truncate">{fullName}</h3>
          <p className="text-xs opacity-60 break-all">{usuario.email}</p>
        </div>
        <Badge variant={isActivo ? "success" : "error"} soft>
          {isActivo ? "Activo" : "Inactivo"}
        </Badge>
      </div>
      <div className="flex flex-wrap gap-2">
        <Badge variant={TIPO_VARIANT[usuario.tipousuario] ?? "primary"} soft>
          {TIPO_LABEL[usuario.tipousuario] ?? usuario.tipousuario}
        </Badge>
        {usuario.matricula ? (
          <span className="text-xs opacity-70">
            Matrícula: {usuario.matricula}
          </span>
        ) : null}
        {usuario.gradoacademico ? (
          <span className="text-xs opacity-70">{usuario.gradoacademico}</span>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-2">
        {isActivo ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={onDesactivar}
            disabled={isPending}
            className="flex-1"
          >
            <UserX size={14} />
            Desactivar
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReactivar}
            disabled={isPending}
            className="flex-1"
          >
            <RotateCcw size={14} />
            Reactivar
          </Button>
        )}
        <Button
          variant="error"
          outlined
          size="sm"
          onClick={onEliminar}
          disabled={isPending}
          className="flex-1"
        >
          <Trash2 size={14} />
          Eliminar
        </Button>
      </div>
    </article>
  );
};

export default UsuarioCard;
