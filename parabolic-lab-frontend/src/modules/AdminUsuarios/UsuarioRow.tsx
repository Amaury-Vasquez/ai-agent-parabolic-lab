import { Badge, Button } from "amvasdev-ui";
import { RotateCcw, Trash2, UserX } from "lucide-react";
import type { AdminUsuarioRow } from "@/types/admin";

interface UsuarioRowProps {
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

const UsuarioRow = ({
  usuario,
  isPending,
  onDesactivar,
  onReactivar,
  onEliminar,
}: UsuarioRowProps) => {
  const isActivo = usuario.activo !== false;
  const fullName = [
    usuario.nombre,
    usuario.apellidopaterno,
    usuario.apellidomaterno,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <tr>
      <td>
        <div className="flex flex-col">
          <span className="font-semibold">{fullName}</span>
          <span className="text-xs opacity-60">{usuario.email}</span>
        </div>
      </td>
      <td>
        <Badge variant={TIPO_VARIANT[usuario.tipousuario] ?? "primary"} soft>
          {TIPO_LABEL[usuario.tipousuario] ?? usuario.tipousuario}
        </Badge>
      </td>
      <td className="text-sm">
        {usuario.matricula ?? usuario.gradoacademico ?? "—"}
      </td>
      <td>
        <Badge variant={isActivo ? "success" : "error"} soft>
          {isActivo ? "Activo" : "Inactivo"}
        </Badge>
      </td>
      <td>
        <div className="flex flex-wrap gap-2 justify-end">
          {isActivo ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDesactivar}
              disabled={isPending}
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
          >
            <Trash2 size={14} />
            Eliminar
          </Button>
        </div>
      </td>
    </tr>
  );
};

export default UsuarioRow;
