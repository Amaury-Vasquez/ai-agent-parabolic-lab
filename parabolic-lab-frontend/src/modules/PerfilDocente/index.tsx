"use client";
import { Badge, Button, Input } from "amvasdev-ui";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Edit2,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  User,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import ThemeSwitcher from "@/components/ThemeSwitcher";
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

const getInitials = (nombre?: string, apellido?: string) =>
  `${nombre?.charAt(0) ?? ""}${apellido?.charAt(0) ?? ""}`.toUpperCase() || "?";

interface ProfileFieldProps {
  icon?: ReactNode;
  label: string;
  value?: string | null;
}

const ProfileField = ({ icon, label, value }: ProfileFieldProps) => (
  <div className="flex items-start gap-3 rounded-xl bg-base-100 border border-base-300 p-4">
    {icon ? (
      <div className="shrink-0 rounded-lg bg-primary/10 text-primary p-2">
        {icon}
      </div>
    ) : null}
    <div className="min-w-0 flex-1">
      <p className="text-xs uppercase tracking-wide opacity-60 font-semibold">
        {label}
      </p>
      <p className="font-medium wrap-break-word mt-0.5">{value || "—"}</p>
    </div>
  </div>
);

interface SectionCardProps {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}

const SectionCard = ({
  icon,
  title,
  description,
  action,
  children,
}: SectionCardProps) => (
  <section className="rounded-2xl bg-base-200 border border-base-300 p-5 md:p-7 shadow-sm">
    <header className="flex items-start justify-between gap-3 mb-5 flex-wrap">
      <div className="flex items-start gap-3 min-w-0">
        <div className="rounded-xl bg-primary/15 text-primary p-2.5">
          {icon}
        </div>
        <div className="min-w-0">
          <h2 className="text-xl md:text-2xl font-semibold leading-tight">
            {title}
          </h2>
          {description ? (
            <p className="text-sm opacity-70 mt-1">{description}</p>
          ) : null}
        </div>
      </div>
      {action}
    </header>
    {children}
  </section>
);

const FormField = ({
  id,
  name,
  label,
  placeholder,
  value,
  onChange,
}: {
  id: string;
  name: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
  <div className="flex flex-col gap-1.5">
    <label htmlFor={id} className="text-sm font-medium">
      {label}
    </label>
    <Input
      id={id}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
    />
  </div>
);

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

  const isSavingProfile = updateUsuario.isPending || updateDocente.isPending;
  const isSavingInstitution = updateInstitucion.isPending;

  const handleProfileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const initials = getInitials(user.nombre, user.apellidopaterno);
  const fullName = [user.nombre, user.apellidopaterno, user.apellidomaterno]
    .filter(Boolean)
    .join(" ");
  const isAdmin = user.tipousuario === "admin";

  return (
    <div className="px-4 py-6 md:p-8 max-w-5xl mx-auto w-full space-y-6">
      {/* Top bar */}
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

      {/* Save message */}
      {saveMessage ? (
        <div
          role="status"
          className={`alert shadow-sm ${
            saveMessage.type === "success" ? "alert-success" : "alert-error"
          }`}
        >
          {saveMessage.type === "success" ? (
            <CheckCircle2 size={20} />
          ) : (
            <XCircle size={20} />
          )}
          <span>{saveMessage.text}</span>
        </div>
      ) : null}

      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl border border-base-300 bg-linear-to-br from-primary/15 via-base-100 to-secondary/10 p-6 md:p-8 shadow-sm">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-16 -right-16 size-56 rounded-full bg-primary/20 blur-3xl"
        />
        <div className="relative flex flex-col md:flex-row items-center md:items-start gap-5 md:gap-7 text-center md:text-left">
          <div className="avatar placeholder shrink-0">
            <div className="bg-primary text-primary-content rounded-2xl w-24 h-24 md:w-28 md:h-28 ring-4 ring-base-100 shadow-md flex items-center justify-center">
              <span className="text-3xl md:text-4xl font-bold">{initials}</span>
            </div>
          </div>
          <div className="min-w-0 flex-1 space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold leading-tight wrap-break-word">
              {fullName}
            </h2>
            <div className="flex items-center gap-2 justify-center md:justify-start text-sm opacity-80 break-all">
              <Mail size={16} className="shrink-0" />
              <span className="truncate">{user.email}</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap justify-center md:justify-start pt-1">
              <Badge variant="primary">
                {isAdmin ? (
                  <ShieldCheck size={14} className="mr-1" />
                ) : (
                  <GraduationCap size={14} className="mr-1" />
                )}
                <span className="capitalize">{user.tipousuario}</span>
              </Badge>
              {institucion ? (
                <Badge variant="neutral">
                  <Building2 size={14} className="mr-1" />
                  <span className="truncate max-w-48">
                    {institucion.nombre}
                  </span>
                </Badge>
              ) : null}
              {!isAdmin && docente?.gradoacademico ? (
                <Badge variant="neutral">
                  <GraduationCap size={14} className="mr-1" />
                  {docente.gradoacademico}
                </Badge>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {/* Personal info */}
      <SectionCard
        icon={<User size={22} />}
        title="Información Personal"
        description="Tus datos visibles para el resto de la plataforma"
        action={
          !isEditingProfile ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditingProfile(true)}
            >
              <Edit2 size={16} />
              Editar
            </Button>
          ) : null
        }
      >
        {!isEditingProfile ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <ProfileField icon={<User size={16} />} label="Nombre" value={user.nombre} />
            <ProfileField
              icon={<User size={16} />}
              label="Apellido Paterno"
              value={user.apellidopaterno}
            />
            <ProfileField
              icon={<User size={16} />}
              label="Apellido Materno"
              value={user.apellidomaterno}
            />
            <ProfileField
              icon={<Mail size={16} />}
              label="Correo Electrónico"
              value={user.email}
            />
            {!isAdmin ? (
              <ProfileField
                icon={<GraduationCap size={16} />}
                label="Grado Académico"
                value={docente?.gradoacademico}
              />
            ) : null}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                id="nombre"
                name="nombre"
                label="Nombre"
                placeholder="Juan"
                value={profileForm.nombre}
                onChange={handleProfileInputChange}
              />
              <FormField
                id="apellidopaterno"
                name="apellidopaterno"
                label="Apellido Paterno"
                placeholder="García"
                value={profileForm.apellidopaterno}
                onChange={handleProfileInputChange}
              />
              <FormField
                id="apellidomaterno"
                name="apellidomaterno"
                label="Apellido Materno"
                placeholder="Martínez"
                value={profileForm.apellidomaterno}
                onChange={handleProfileInputChange}
              />
              {!isAdmin ? (
                <FormField
                  id="gradoacademico"
                  name="gradoacademico"
                  label="Grado Académico"
                  placeholder="Maestría en Física"
                  value={profileForm.gradoacademico}
                  onChange={handleProfileInputChange}
                />
              ) : null}
            </div>
            <div className="flex gap-3 pt-2 flex-wrap">
              <Button
                variant="primary"
                onClick={handleSaveProfile}
                disabled={isSavingProfile}
              >
                {isSavingProfile ? "Guardando..." : "Guardar cambios"}
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
      </SectionCard>

      {/* Institution info */}
      {institucion ? (
        <SectionCard
          icon={<Building2 size={22} />}
          title="Información de la Institución"
          description={
            isAdmin
              ? "Gestiona los datos de tu institución"
              : "Datos de tu institución"
          }
          action={
            !isEditingInstitution && isAdmin ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditingInstitution(true)}
              >
                <Edit2 size={16} />
                Editar
              </Button>
            ) : null
          }
        >
          {!isEditingInstitution ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <ProfileField
                icon={<Building2 size={16} />}
                label="Nombre"
                value={institucion.nombre}
              />
              {isAdmin ? (
                <>
                  <ProfileField
                    icon={<MapPin size={16} />}
                    label="Dirección"
                    value={institucion.direccion}
                  />
                  <ProfileField
                    icon={<Phone size={16} />}
                    label="Teléfono"
                    value={institucion.telefono}
                  />
                </>
              ) : null}
            </div>
          ) : isAdmin ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  id="inst-nombre"
                  name="nombre"
                  label="Nombre de Institución"
                  placeholder="Colegio Nacional"
                  value={institutionForm.nombre}
                  onChange={handleInstitutionInputChange}
                />
                <FormField
                  id="inst-direccion"
                  name="direccion"
                  label="Dirección"
                  placeholder="Calle Principal 123"
                  value={institutionForm.direccion}
                  onChange={handleInstitutionInputChange}
                />
                <FormField
                  id="inst-telefono"
                  name="telefono"
                  label="Teléfono"
                  placeholder="(555) 123-4567"
                  value={institutionForm.telefono}
                  onChange={handleInstitutionInputChange}
                />
              </div>
              <div className="flex gap-3 pt-2 flex-wrap">
                <Button
                  variant="primary"
                  onClick={handleSaveInstitution}
                  disabled={isSavingInstitution}
                >
                  {isSavingInstitution ? "Guardando..." : "Guardar cambios"}
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
        </SectionCard>
      ) : null}

      {/* Theme switcher */}
      <ThemeSwitcher />
    </div>
  );
};

export default PerfilDocente;
