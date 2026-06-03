"use client";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import SaveMessageBanner, {
  type SaveMessage,
} from "@/components/SaveMessage";
import BackButton from "@/components/BackButton";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import type { UpdateUsuarioPayload } from "@/models/user";
import { useUpdateUsuario } from "@/mutations/useUpdateUsuario";
import { useInstitucion } from "@/queries/useInstitucion";
import { useInteraccionesAlumno } from "@/queries/useInteraccionesAlumno";
import { useMe } from "@/queries/useMe";
import AchievementsSection from "./AchievementsSection";
import Hero from "./Hero";
import InstitucionCard from "./InstitucionCard";
import PersonalInfoCard from "./PersonalInfoCard";
import {
  buildProfileForm,
  computeAlumnoStats,
  EMPTY_PROFILE_FORM,
  type ProfileFormState,
} from "./helpers";

const PerfilAlumno = () => {
  const { data: user, isLoading: isLoadingUser } = useMe();
  const { data: institucion } = useInstitucion(user?.idinstitucion);
  const { data: interacciones } = useInteraccionesAlumno();

  const updateUsuario = useUpdateUsuario();

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [saveMessage, setSaveMessage] = useState<SaveMessage | null>(null);
  const [profileForm, setProfileForm] =
    useState<ProfileFormState>(EMPTY_PROFILE_FORM);

  useEffect(() => {
    setProfileForm(buildProfileForm(user));
  }, [user]);

  const stats = useMemo(() => computeAlumnoStats(interacciones), [interacciones]);

  const handleProfileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
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
          error instanceof Error ? error.message : "Error al guardar cambios",
      });
    }
  };

  const handleCancelProfile = () => {
    setIsEditingProfile(false);
    setProfileForm(buildProfileForm(user));
  };

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

  return (
    <div className="px-4 py-6 md:p-8 max-w-5xl mx-auto w-full space-y-6">
      <div className="flex items-center gap-3">
        <BackButton />
        <h1 className="text-2xl md:text-3xl font-bold">Mi Perfil</h1>
      </div>

      <SaveMessageBanner message={saveMessage} />

      <Hero user={user} institucion={institucion} stats={stats} />

      <PersonalInfoCard
        user={user}
        isEditing={isEditingProfile}
        isSaving={updateUsuario.isPending}
        form={profileForm}
        onEdit={() => setIsEditingProfile(true)}
        onCancel={handleCancelProfile}
        onChange={handleProfileInputChange}
        onSave={handleSaveProfile}
      />

      {institucion ? <InstitucionCard institucion={institucion} /> : null}

      <AchievementsSection logros={stats.ultimosLogros} />

      <ThemeSwitcher />
    </div>
  );
};

export default PerfilAlumno;
