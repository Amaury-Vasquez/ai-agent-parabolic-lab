"use client";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { ChangeEvent, useEffect, useState } from "react";
import SaveMessageBanner, {
  type SaveMessage,
} from "@/components/SaveMessage";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import type { UpdateInstitucionPayload } from "@/models/institucion";
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
import Hero from "./Hero";
import InstitutionInfoCard from "./InstitutionInfoCard";
import PersonalInfoCard from "./PersonalInfoCard";
import {
  buildInstitutionForm,
  buildProfileForm,
  EMPTY_INSTITUTION_FORM,
  EMPTY_PROFILE_FORM,
  type InstitutionFormState,
  type ProfileFormState,
} from "./helpers";

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

  const [profileForm, setProfileForm] =
    useState<ProfileFormState>(EMPTY_PROFILE_FORM);
  const [institutionForm, setInstitutionForm] = useState<InstitutionFormState>(
    EMPTY_INSTITUTION_FORM,
  );

  useEffect(() => {
    setProfileForm(buildProfileForm(user, docente));
  }, [user, docente]);

  useEffect(() => {
    setInstitutionForm(buildInstitutionForm(institucion));
  }, [institucion]);

  const isSavingProfile = updateUsuario.isPending || updateDocente.isPending;
  const isSavingInstitution = updateInstitucion.isPending;

  const handleProfileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleInstitutionInputChange = (e: ChangeEvent<HTMLInputElement>) => {
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
        text:
          error instanceof Error ? error.message : "Error al guardar cambios",
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
        text:
          error instanceof Error ? error.message : "Error al guardar cambios",
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

  const isAdmin = user.tipousuario === "admin";

  return (
    <div className="px-4 py-6 md:p-8 max-w-5xl mx-auto w-full space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="btn btn-ghost btn-square btn-sm"
          title="Regresar"
          aria-label="Regresar"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl md:text-3xl font-bold">Mi Perfil</h1>
      </div>

      <SaveMessageBanner message={saveMessage} />

      <Hero user={user} docente={docente} institucion={institucion} />

      <PersonalInfoCard
        user={user}
        docente={docente}
        isEditing={isEditingProfile}
        isSaving={isSavingProfile}
        form={profileForm}
        onEdit={() => setIsEditingProfile(true)}
        onCancel={handleCancelProfile}
        onChange={handleProfileInputChange}
        onSave={handleSaveProfile}
      />

      {institucion ? (
        <InstitutionInfoCard
          institucion={institucion}
          isAdmin={isAdmin}
          isEditing={isEditingInstitution}
          isSaving={isSavingInstitution}
          form={institutionForm}
          onEdit={() => setIsEditingInstitution(true)}
          onCancel={handleCancelInstitution}
          onChange={handleInstitutionInputChange}
          onSave={handleSaveInstitution}
        />
      ) : null}

      <ThemeSwitcher />
    </div>
  );
};

export default PerfilDocente;
