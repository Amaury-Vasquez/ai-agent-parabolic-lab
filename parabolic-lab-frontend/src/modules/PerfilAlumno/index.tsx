"use client";
import { Button, Input } from "amvasdev-ui";
import { Edit2, Trophy, Star, Award, Palette } from "lucide-react";
import { useEffect, useState } from "react";
import type { UpdateUsuarioPayload } from "@/models/user";
import { useUpdateUsuario } from "@/mutations/useUpdateUsuario";
import { useInstitucion } from "@/queries/useInstitucion";
import { useMe } from "@/queries/useMe";
import { useInteraccionesAlumno } from "@/queries/useInteraccionesAlumno";

interface SaveMessage {
  type: "success" | "error";
  text: string;
}

interface ProfileFormState {
  nombre: string;
  apellidopaterno: string;
  apellidomaterno: string;
}

const EMPTY_PROFILE_FORM: ProfileFormState = {
  nombre: "",
  apellidopaterno: "",
  apellidomaterno: "",
};

const THEMES = [
  { id: "default", name: "Clásico", preview: "bg-base-300" },
  { id: "ocean", name: "Océano", preview: "bg-blue-900" },
  { id: "forest", name: "Bosque", preview: "bg-emerald-900" },
  { id: "sunset", name: "Atardecer", preview: "bg-orange-900" },
  { id: "galaxy", name: "Galaxia", preview: "bg-purple-900" },
];

const buildProfileForm = (
  user:
    | {
        nombre: string;
        apellidopaterno: string;
        apellidomaterno?: string | null;
      }
    | undefined
): ProfileFormState => ({
  nombre: user?.nombre ?? "",
  apellidopaterno: user?.apellidopaterno ?? "",
  apellidomaterno: user?.apellidomaterno ?? "",
});

const PerfilAlumno = () => {
  const { data: user, isLoading: isLoadingUser } = useMe();
  const { data: institucion } = useInstitucion(user?.idinstitucion);
  const { data: interacciones } = useInteraccionesAlumno();

  const updateUsuario = useUpdateUsuario();

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [saveMessage, setSaveMessage] = useState<SaveMessage | null>(null);
  const [selectedTheme, setSelectedTheme] = useState("default");
  const [profileForm, setProfileForm] =
    useState<ProfileFormState>(EMPTY_PROFILE_FORM);

  useEffect(() => {
    setProfileForm(buildProfileForm(user));
  }, [user]);

  const isSavingProfile = updateUsuario.isPending;

  const handleProfileInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaveMessage(null);

    const payload: UpdateUsuarioPayload = {
      nombre: profileForm.nombre,
      apellidopaterno: profileForm.apellidopaterno,
      apellidomaterno: profileForm.apellidomaterno,
    };

    try {
      await updateUsuario.mutateAsync(payload);
      setSaveMessage({
        type: "success",
        text: "Perfil actualizado correctamente",
      });
      setIsEditingProfile(false);
    } catch (error) {
      setSaveMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Error al guardar cambios",
      });
    }
  };

  const handleCancelProfile = () => {
    setIsEditingProfile(false);
    setProfileForm(buildProfileForm(user));
  };

  // Obtener últimos logros de las interacciones completadas
  const ultimosLogros = interacciones
    ?.filter((i) => i.completado)
    .sort(
      (a, b) =>
        new Date(b.fechafin ?? 0).getTime() -
        new Date(a.fechafin ?? 0).getTime()
    )
    .slice(0, 5);

  if (isLoadingUser) {
    return (
      <div className="p-8 flex justify-center">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-8">
        <p className="text-center text-error">
          No se pudo cargar la información del usuario
        </p>
      </div>
    );
  }

  const initials = `${user.nombre?.charAt(0) ?? ""}${user.apellidopaterno?.charAt(0) ?? ""}`.toUpperCase();

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Mi Perfil</h1>

      {saveMessage ? (
        <div
          className={`alert mb-6 ${saveMessage.type === "success" ? "alert-success" : "alert-error"}`}
        >
          <p>{saveMessage.text}</p>
        </div>
      ) : null}

      {/* Sección principal: Avatar + Info */}
      <div className="bg-base-200 rounded-lg p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Información Personal</h2>
          {!isEditingProfile ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditingProfile(true)}
            >
              <Edit2 size={16} />
              Editar
            </Button>
          ) : null}
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-3">
            <div className="avatar placeholder">
              <div className="bg-primary text-primary-content rounded-full w-28 h-28 flex items-center justify-center">
                <span className="text-3xl font-bold">{initials}</span>
              </div>
            </div>
            <span className="badge badge-outline capitalize">
              {user.tipousuario}
            </span>
          </div>

          {/* Datos */}
          {!isEditingProfile ? (
            <div className="flex-1 space-y-4">
              <div>
                <label className="label">
                  <span className="label-text font-medium">Nombre</span>
                </label>
                <p>{user.nombre}</p>
              </div>

              <div>
                <label className="label">
                  <span className="label-text font-medium">
                    Apellido Paterno
                  </span>
                </label>
                <p>{user.apellidopaterno}</p>
              </div>

              <div>
                <label className="label">
                  <span className="label-text font-medium">
                    Apellido Materno
                  </span>
                </label>
                <p>{user.apellidomaterno || "-"}</p>
              </div>

              <div>
                <label className="label">
                  <span className="label-text font-medium">
                    Correo Electrónico
                  </span>
                </label>
                <p>{user.email}</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 space-y-4">
              <div>
                <label className="label">
                  <span className="label-text">Nombre</span>
                </label>
                <Input
                  id="nombre"
                  name="nombre"
                  placeholder="Juan"
                  value={profileForm.nombre}
                  onChange={handleProfileInputChange}
                />
              </div>

              <div>
                <label className="label">
                  <span className="label-text">Apellido Paterno</span>
                </label>
                <Input
                  id="apellidopaterno"
                  name="apellidopaterno"
                  placeholder="García"
                  value={profileForm.apellidopaterno}
                  onChange={handleProfileInputChange}
                />
              </div>

              <div>
                <label className="label">
                  <span className="label-text">Apellido Materno</span>
                </label>
                <Input
                  id="apellidomaterno"
                  name="apellidomaterno"
                  placeholder="Martínez"
                  value={profileForm.apellidomaterno}
                  onChange={handleProfileInputChange}
                />
              </div>

              <div className="flex gap-4 mt-6">
                <Button
                  variant="primary"
                  onClick={handleSaveProfile}
                  disabled={isSavingProfile}
                >
                  {isSavingProfile ? "Guardando..." : "Guardar"}
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleCancelProfile}
                  disabled={isSavingProfile}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Institución */}
      {institucion ? (
        <div className="bg-base-200 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Mi Institución</h2>
          <div>
            <label className="label">
              <span className="label-text font-medium">
                Nombre de Institución
              </span>
            </label>
            <p>{institucion.nombre}</p>
          </div>
        </div>
      ) : null}

      {/* Últimos logros */}
      <div className="bg-base-200 rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <Trophy size={24} className="text-warning" />
          Últimos Logros
        </h2>

        {ultimosLogros && ultimosLogros.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ultimosLogros.map((logro) => (
              <div
                key={logro.idinteraccion}
                className="bg-base-100 rounded-lg p-4 flex items-center gap-3 shadow-sm"
              >
                <div className="text-warning">
                  {logro.puntuacion != null && logro.puntuacion >= 80 ? (
                    <Star size={28} className="fill-warning" />
                  ) : (
                    <Award size={28} />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">Escenario completado</p>
                  <p className="text-xs opacity-70">
                    Puntuación: {logro.puntuacion ?? "N/A"}
                  </p>
                  {logro.fechafin ? (
                    <p className="text-xs opacity-50">
                      {new Date(logro.fechafin).toLocaleDateString("es-MX")}
                    </p>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center opacity-60 py-4">
            Aún no tienes logros. ¡Completa escenarios para ganar logros!
          </p>
        )}
      </div>

      {/* Temas / Personalización */}
      <div className="bg-base-200 rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <Palette size={24} />
          Personalización
        </h2>
        <p className="mb-4 opacity-70">
          Elige un tema para personalizar tu experiencia
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {THEMES.map((theme) => (
            <button
              key={theme.id}
              onClick={() => setSelectedTheme(theme.id)}
              className={`rounded-lg p-6 text-center transition-all cursor-pointer ${theme.preview} ${
                selectedTheme === theme.id
                  ? "ring-2 ring-primary ring-offset-2 ring-offset-base-100 scale-105"
                  : "hover:scale-105 opacity-80 hover:opacity-100"
              }`}
            >
              <p className="font-medium text-sm text-white">{theme.name}</p>
            </button>
          ))}
        </div>

        <p className="text-xs opacity-50 mt-4">
          Los temas personalizados estarán disponibles próximamente
        </p>
      </div>
    </div>
  );
};

export default PerfilAlumno;