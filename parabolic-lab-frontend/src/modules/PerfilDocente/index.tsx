"use client";
import { Button, Input } from "amvasdev-ui";
import { ArrowLeft, Edit2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type {
  Institucion,
  UpdateInstitucionPayload,
} from "@/models/institucion";
import type {
  UpdateDocentePayload,
  UpdateUsuarioPayload,
} from "@/models/user";
import { useUpdateDocente } from "@/mutations/useUpdateDocente";
import { useUpdateInstitucion } from "@/mutations/useUpdateInstitucion";
import { useUpdateUsuario } from "@/mutations/useUpdateUsuario";
import { useDocente } from "@/queries/useDocente";
import { useInstitucion } from "@/queries/useInstitucion";
import { useMe } from "@/queries/useMe";

interface SaveMessage {
  type: "success" | "error";
  text: string;
}

interface ProfileFormState {
  nombre: string;
  apellidopaterno: string;
  apellidomaterno: string;
  gradoacademico: string;
}

interface InstitutionFormState {
  nombre: string;
  direccion: string;
  telefono: string;
}

const EMPTY_PROFILE_FORM: ProfileFormState = {
  nombre: "",
  apellidopaterno: "",
  apellidomaterno: "",
  gradoacademico: "",
};

const EMPTY_INSTITUTION_FORM: InstitutionFormState = {
  nombre: "",
  direccion: "",
  telefono: "",
};

const buildProfileForm = (
  user: { nombre: string; apellidopaterno: string; apellidomaterno?: string | null } | undefined,
  docente: { gradoacademico?: string | null } | undefined,
): ProfileFormState => ({
  nombre: user?.nombre ?? "",
  apellidopaterno: user?.apellidopaterno ?? "",
  apellidomaterno: user?.apellidomaterno ?? "",
  gradoacademico: docente?.gradoacademico ?? "",
});

const buildInstitutionForm = (
  institucion: Institucion | undefined,
): InstitutionFormState => ({
  nombre: institucion?.nombre ?? "",
  direccion: institucion?.direccion ?? "",
  telefono: institucion?.telefono ?? "",
});

const PerfilDocente = () => {
  const router = useRouter();
  const { data: user, isLoading: isLoadingUser } = useMe();
  const { data: docente, isLoading: isLoadingDocente } = useDocente();
  const { data: institucion } = useInstitucion(user?.idinstitucion);

  const updateUsuario = useUpdateUsuario();
  const updateDocente = useUpdateDocente();
  const updateInstitucion = useUpdateInstitucion();

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingInstitution, setIsEditingInstitution] = useState(false);
  const [saveMessage, setSaveMessage] = useState<SaveMessage | null>(null);

  const [profileForm, setProfileForm] = useState<ProfileFormState>(EMPTY_PROFILE_FORM);
  const [institutionForm, setInstitutionForm] = useState<InstitutionFormState>(
    EMPTY_INSTITUTION_FORM,
  );

  useEffect(() => {
    setProfileForm(buildProfileForm(user, docente));
  }, [user, docente]);

  useEffect(() => {
    setInstitutionForm(buildInstitutionForm(institucion));
  }, [institucion]);

  const isSavingProfile =
    updateUsuario.isPending || updateDocente.isPending;
  const isSavingInstitution = updateInstitucion.isPending;

  const handleProfileInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleInstitutionInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value } = e.target;
    setInstitutionForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaveMessage(null);

    const usuarioPayload: UpdateUsuarioPayload = {
      nombre: profileForm.nombre,
      apellidopaterno: profileForm.apellidopaterno,
      apellidomaterno: profileForm.apellidomaterno,
    };

    try {
      await updateUsuario.mutateAsync(usuarioPayload);

      if (user.tipousuario === "docente") {
        const docentePayload: UpdateDocentePayload = {
          gradoacademico: profileForm.gradoacademico,
        };
        await updateDocente.mutateAsync(docentePayload);
      }

      setSaveMessage({
        type: "success",
        text: "Perfil actualizado correctamente",
      });
      setIsEditingProfile(false);
    } catch (error) {
      setSaveMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Error al guardar cambios",
      });
    }
  };

  const handleSaveInstitution = async () => {
    if (!user) return;
    setSaveMessage(null);

    const payload: UpdateInstitucionPayload = {
      nombre: institutionForm.nombre,
      direccion: institutionForm.direccion,
      telefono: institutionForm.telefono,
    };

    try {
      await updateInstitucion.mutateAsync({
        idinstitucion: user.idinstitucion,
        data: payload,
      });
      setSaveMessage({
        type: "success",
        text: "Institución actualizada correctamente",
      });
      setIsEditingInstitution(false);
    } catch (error) {
      setSaveMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Error al guardar cambios",
      });
    }
  };

  const handleCancelProfile = () => {
    setIsEditingProfile(false);
    setProfileForm(buildProfileForm(user, docente));
  };

  const handleCancelInstitution = () => {
    setIsEditingInstitution(false);
    setInstitutionForm(buildInstitutionForm(institucion));
  };

  const isLoading =
    isLoadingUser || (user?.tipousuario === "docente" && isLoadingDocente);

  if (isLoading) {
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

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => router.back()}
          className="btn btn-ghost btn-square btn-sm"
          title="Regresar"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-3xl font-bold">Mi Perfil</h1>
      </div>

      {saveMessage ? (
        <div
          className={`alert mb-6 ${saveMessage.type === "success" ? "alert-success" : "alert-error"}`}
        >
          <p>{saveMessage.text}</p>
        </div>
      ) : null}

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

        {!isEditingProfile ? (
          <div className="space-y-4">
            <div>
              <label className="label">
                <span className="label-text font-medium">Nombre</span>
              </label>
              <p>{user.nombre}</p>
            </div>

            <div>
              <label className="label">
                <span className="label-text font-medium">Apellido Paterno</span>
              </label>
              <p>{user.apellidopaterno}</p>
            </div>

            <div>
              <label className="label">
                <span className="label-text font-medium">Apellido Materno</span>
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

            <div>
              <label className="label">
                <span className="label-text font-medium">Tipo de Usuario</span>
              </label>
              <p className="capitalize">{user.tipousuario}</p>
            </div>

            {user.tipousuario === "docente" ? (
              <div>
                <label className="label">
                  <span className="label-text font-medium">
                    Grado Académico
                  </span>
                </label>
                <p>{docente?.gradoacademico || "-"}</p>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="space-y-4">
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

            {user.tipousuario === "docente" ? (
              <div>
                <label className="label">
                  <span className="label-text">Grado Académico</span>
                </label>
                <Input
                  id="gradoacademico"
                  name="gradoacademico"
                  placeholder="Maestría en Física"
                  value={profileForm.gradoacademico}
                  onChange={handleProfileInputChange}
                />
              </div>
            ) : null}

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

      {(user.tipousuario === "docente" || user.tipousuario === "admin") &&
      institucion ? (
        <div className="bg-base-200 rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">
              Información de la Institución
            </h2>
            {!isEditingInstitution && user.tipousuario === "admin" ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditingInstitution(true)}
              >
                <Edit2 size={16} />
                Editar
              </Button>
            ) : null}
          </div>

          {!isEditingInstitution ? (
            <div className="space-y-4">
              <div>
                <label className="label">
                  <span className="label-text font-medium">
                    Nombre de Institución
                  </span>
                </label>
                <p>{institucion.nombre}</p>
              </div>

              {user.tipousuario === "admin" ? (
                <>
                  <div>
                    <label className="label">
                      <span className="label-text font-medium">Dirección</span>
                    </label>
                    <p>{institucion.direccion || "-"}</p>
                  </div>

                  <div>
                    <label className="label">
                      <span className="label-text font-medium">Teléfono</span>
                    </label>
                    <p>{institucion.telefono || "-"}</p>
                  </div>
                </>
              ) : null}
            </div>
          ) : user.tipousuario === "admin" ? (
            <div className="space-y-4">
              <div>
                <label className="label">
                  <span className="label-text">Nombre de Institución</span>
                </label>
                <Input
                  id="inst-nombre"
                  name="nombre"
                  placeholder="Colegio Nacional"
                  value={institutionForm.nombre}
                  onChange={handleInstitutionInputChange}
                />
              </div>

              <div>
                <label className="label">
                  <span className="label-text">Dirección</span>
                </label>
                <Input
                  id="inst-direccion"
                  name="direccion"
                  placeholder="Calle Principal 123"
                  value={institutionForm.direccion}
                  onChange={handleInstitutionInputChange}
                />
              </div>

              <div>
                <label className="label">
                  <span className="label-text">Teléfono</span>
                </label>
                <Input
                  id="inst-telefono"
                  name="telefono"
                  placeholder="(555) 123-4567"
                  value={institutionForm.telefono}
                  onChange={handleInstitutionInputChange}
                />
              </div>

              <div className="flex gap-4 mt-6">
                <Button
                  variant="primary"
                  onClick={handleSaveInstitution}
                  disabled={isSavingInstitution}
                >
                  {isSavingInstitution ? "Guardando..." : "Guardar"}
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleCancelInstitution}
                  disabled={isSavingInstitution}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

export default PerfilDocente;
