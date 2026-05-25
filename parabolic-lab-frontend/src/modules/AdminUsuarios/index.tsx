"use client";
import { Input, Modal } from "amvasdev-ui";
import { Search, Users } from "lucide-react";
import { ChangeEvent, useMemo, useState } from "react";
import UsuarioCard from "./UsuarioCard";
import UsuarioRow from "./UsuarioRow";
import useIsMobileOrTablet from "@/hooks/useIsMobileOrTablet";
import {
  useDesactivarUsuario,
  useEliminarUsuario,
  useReactivarUsuario,
} from "@/mutations/useAdminUsuarioActions";
import { useAdminUsuarios } from "@/queries/useAdminUsuarios";
import type { AdminUsuarioRow } from "@/types/admin";

type TipoFiltro = "todos" | "docente" | "alumno" | "admin";
type EstadoFiltro = "todos" | "activos" | "inactivos";

const filtrarUsuarios = (
  usuarios: AdminUsuarioRow[],
  tipo: TipoFiltro,
  estado: EstadoFiltro,
  search: string,
): AdminUsuarioRow[] => {
  const q = search.trim().toLowerCase();
  return usuarios.filter((u) => {
    if (tipo !== "todos" && u.tipousuario !== tipo) return false;
    if (estado === "activos" && u.activo === false) return false;
    if (estado === "inactivos" && u.activo !== false) return false;
    if (!q) return true;
    const haystack = [
      u.nombre,
      u.apellidopaterno,
      u.apellidomaterno,
      u.email,
      u.matricula,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
};

const AdminUsuarios = () => {
  const isMobileOrTablet = useIsMobileOrTablet();
  const { data: usuarios, isLoading } = useAdminUsuarios();
  const [tipo, setTipo] = useState<TipoFiltro>("todos");
  const [estado, setEstado] = useState<EstadoFiltro>("todos");
  const [search, setSearch] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<AdminUsuarioRow | null>(
    null,
  );

  const desactivar = useDesactivarUsuario();
  const reactivar = useReactivarUsuario();
  const eliminar = useEliminarUsuario();

  const isPending =
    desactivar.isPending || reactivar.isPending || eliminar.isPending;

  const usuariosFiltrados = useMemo(
    () => filtrarUsuarios(usuarios ?? [], tipo, estado, search),
    [usuarios, tipo, estado, search],
  );

  const handleEliminar = () => {
    if (!confirmDelete) return;
    eliminar.mutate(confirmDelete.idusuario, {
      onSuccess: () => setConfirmDelete(null),
    });
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl md:text-3xl font-bold">Usuarios</h1>
        <p className="text-sm md:text-base opacity-70">
          Docentes, alumnos y administradores de tu institución
        </p>
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-3">
        <div className="flex-1">
          <Input
            id="admin-usuarios-search"
            type="text"
            placeholder="María González"
            value={search}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setSearch(e.target.value)
            }
            leftIcon={<Search size={16} className="opacity-60" />}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            className="select select-bordered select-sm"
            value={tipo}
            onChange={(e) => setTipo(e.target.value as TipoFiltro)}
          >
            <option value="todos">Todos los tipos</option>
            <option value="docente">Docentes</option>
            <option value="alumno">Alumnos</option>
            <option value="admin">Admins</option>
          </select>
          <select
            className="select select-bordered select-sm"
            value={estado}
            onChange={(e) => setEstado(e.target.value as EstadoFiltro)}
          >
            <option value="todos">Activos e inactivos</option>
            <option value="activos">Solo activos</option>
            <option value="inactivos">Solo inactivos</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner loading-lg" />
        </div>
      ) : usuariosFiltrados.length === 0 ? (
        <div className="flex flex-col items-center text-center py-12 gap-2 opacity-70">
          <Users size={32} />
          <p>No hay usuarios que coincidan con los filtros.</p>
        </div>
      ) : isMobileOrTablet ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {usuariosFiltrados.map((u) => (
            <UsuarioCard
              key={u.idusuario}
              usuario={u}
              isPending={isPending}
              onDesactivar={() => desactivar.mutate(u.idusuario)}
              onReactivar={() => reactivar.mutate(u.idusuario)}
              onEliminar={() => setConfirmDelete(u)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-base-100 border border-base-300 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Tipo</th>
                  <th>Identificador</th>
                  <th>Estado</th>
                  <th className="text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuariosFiltrados.map((u) => (
                  <UsuarioRow
                    key={u.idusuario}
                    usuario={u}
                    isPending={isPending}
                    onDesactivar={() => desactivar.mutate(u.idusuario)}
                    onReactivar={() => reactivar.mutate(u.idusuario)}
                    onEliminar={() => setConfirmDelete(u)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {confirmDelete ? (
        <Modal
          onClose={() => setConfirmDelete(null)}
          title="Eliminar usuario permanentemente"
          confirmButton={{
            children: eliminar.isPending ? "Eliminando..." : "Sí, eliminar",
            variant: "error",
            disabled: eliminar.isPending,
            onClick: handleEliminar,
          }}
        >
          <p className="py-2">
            ¿Estás seguro de eliminar a{" "}
            <strong>
              {confirmDelete.nombre} {confirmDelete.apellidopaterno}
            </strong>
            ? Esta acción es <strong>irreversible</strong> y borrará todos sus
            datos asociados (interacciones, inscripciones, progreso).
          </p>
          <p className="text-sm opacity-70 pb-2">
            Si solo quieres bloquear el acceso, usa &quot;Desactivar&quot; en su
            lugar.
          </p>
        </Modal>
      ) : null}
    </div>
  );
};

export default AdminUsuarios;
