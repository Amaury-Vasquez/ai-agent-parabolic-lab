"use client";
import { Badge } from "amvasdev-ui";
import { useMe } from "@/queries/useMe";

const TIPO_USUARIO_LABELS: Record<string, string> = {
  admin: "Administrador",
  alumno: "Alumno",
  docente: "Docente",
};

const PerfilAlumno = () => {
  const { data: user, isLoading } = useMe();

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  if (!user) return null;

  const fullName = [user.nombre, user.apellidopaterno, user.apellidomaterno]
    .filter(Boolean)
    .join(" ");

  const initials = `${user.nombre[0]}${user.apellidopaterno[0]}`.toUpperCase();
  const tipoLabel = TIPO_USUARIO_LABELS[user.tipousuario] ?? user.tipousuario;

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Mi Perfil</h1>
      <div className="card bg-base-100 shadow-xl border border-solid border-base-300">
        <div className="card-body gap-6">
          <div className="flex items-center gap-4">
            <div className="avatar placeholder">
              <div className="bg-primary text-primary-content rounded-full w-16">
                <span className="text-xl">{initials}</span>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <h2 className="text-xl font-bold">{fullName}</h2>
              <Badge variant="primary" soft>
                {tipoLabel}
              </Badge>
            </div>
          </div>
          <div className="divider my-0" />
          <div className="grid gap-4">
            <div>
              <p className="text-sm opacity-60 mb-1">Nombre</p>
              <p className="font-medium">{user.nombre}</p>
            </div>
            <div>
              <p className="text-sm opacity-60 mb-1">Apellido paterno</p>
              <p className="font-medium">{user.apellidopaterno}</p>
            </div>
            {user.apellidomaterno ? (
              <div>
                <p className="text-sm opacity-60 mb-1">Apellido materno</p>
                <p className="font-medium">{user.apellidomaterno}</p>
              </div>
            ) : null}
            <div>
              <p className="text-sm opacity-60 mb-1">Correo electrónico</p>
              <p className="font-medium">{user.email}</p>
            </div>
            <div>
              <p className="text-sm opacity-60 mb-1">Tipo de usuario</p>
              <p className="font-medium">{tipoLabel}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerfilAlumno;
