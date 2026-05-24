"use client";
import { Badge, Button, Input } from "amvasdev-ui";
import {
  Award,
  Building2,
  CheckCircle2,
  Edit2,
  Flame,
  Mail,
  Sparkles,
  Star,
  Target,
  Trophy,
  User,
  XCircle,
} from "lucide-react";
import { ReactNode, useEffect, useState } from "react";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import type { UpdateUsuarioPayload } from "@/models/user";
import { useUpdateUsuario } from "@/mutations/useUpdateUsuario";
import { useInstitucion } from "@/queries/useInstitucion";
import { useInteraccionesAlumno } from "@/queries/useInteraccionesAlumno";
import { useMe } from "@/queries/useMe";

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

const buildProfileForm = (
  user:
    | {
        nombre: string;
        apellidopaterno: string;
        apellidomaterno?: string | null;
      }
    | undefined,
): ProfileFormState => ({
  nombre: user?.nombre ?? "",
  apellidopaterno: user?.apellidopaterno ?? "",
  apellidomaterno: user?.apellidomaterno ?? "",
});

const getInitials = (nombre?: string, apellido?: string) =>
  `${nombre?.charAt(0) ?? ""}${apellido?.charAt(0) ?? ""}`.toUpperCase() || "?";

interface StatTileProps {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  accent?: "primary" | "success" | "warning" | "info";
}

const STAT_ACCENTS: Record<NonNullable<StatTileProps["accent"]>, string> = {
  primary: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  info: "bg-info/10 text-info",
};

const StatTile = ({ icon, label, value, accent = "primary" }: StatTileProps) => (
  <div className="flex items-center gap-3 rounded-xl border border-base-300 bg-base-100 p-3 md:p-4">
    <div className={`shrink-0 rounded-lg p-2.5 ${STAT_ACCENTS[accent]}`}>
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-xs uppercase tracking-wide opacity-60 font-semibold">
        {label}
      </p>
      <p className="font-semibold text-lg leading-tight truncate">{value}</p>
    </div>
  </div>
);

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
        <div className="rounded-xl bg-primary/15 text-primary p-2.5">{icon}</div>
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

interface Achievement {
  idinteraccion: string;
  puntuacion: number | null;
  fechafin: Date | null;
}

const AchievementCard = ({ logro }: { logro: Achievement }) => {
  const isHigh = (logro.puntuacion ?? 0) >= 80;
  return (
    <article className="group flex items-center gap-3 rounded-xl border border-base-300 bg-base-100 p-4 hover:border-primary/40 hover:-translate-y-0.5 transition-all">
      <div
        className={`shrink-0 rounded-xl p-2.5 ${
          isHigh ? "bg-warning/15 text-warning" : "bg-info/10 text-info"
        }`}
      >
        {isHigh ? (
          <Star size={24} className="fill-current" />
        ) : (
          <Award size={24} />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-sm truncate">Escenario completado</p>
        <p className="text-xs opacity-70">
          Puntuación: {logro.puntuacion ?? "N/A"}
        </p>
        {logro.fechafin ? (
          <p className="text-xs opacity-50">
            {new Date(logro.fechafin).toLocaleDateString("es-MX", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
        ) : null}
      </div>
    </article>
  );
};

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

  const isSavingProfile = updateUsuario.isPending;

  const handleProfileInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
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
          error instanceof Error ? error.message : "Error al guardar cambios",
      });
    }
  };

  const handleCancelProfile = () => {
    setIsEditingProfile(false);
    setProfileForm(buildProfileForm(user));
  };

  // Decimal fields arrive from the backend as strings — coerce with Number()
  // before doing arithmetic, otherwise `+` concatenates and produces NaN.
  const toScore = (v: number | string | null | undefined) =>
    v == null ? null : Number(v);

  const completados = interacciones?.filter((i) => i.completado) ?? [];
  const totalCompletados = completados.length;
  const totalIntentos = interacciones?.length ?? 0;
  const scoredCompletados = completados
    .map((i) => toScore(i.puntuacion))
    .filter((p): p is number => p != null && !Number.isNaN(p));
  const promedioPuntuacion = scoredCompletados.length
    ? Math.round(
        scoredCompletados.reduce((acc, p) => acc + p, 0) /
          scoredCompletados.length,
      )
    : null;
  const mejorPuntuacion = scoredCompletados.length
    ? Math.round(Math.max(...scoredCompletados))
    : null;

  const ultimosLogros: Achievement[] = completados
    .slice()
    .sort(
      (a, b) =>
        new Date(b.fechafin ?? 0).getTime() -
        new Date(a.fechafin ?? 0).getTime(),
    )
    .slice(0, 6)
    .map((i) => ({
      idinteraccion: i.idinteraccion,
      puntuacion: toScore(i.puntuacion),
      fechafin: i.fechafin ?? null,
    }));

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

  const initials = getInitials(user.nombre, user.apellidopaterno);
  const fullName = [user.nombre, user.apellidopaterno, user.apellidomaterno]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="px-4 py-6 md:p-8 max-w-5xl mx-auto w-full space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold">Mi Perfil</h1>

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
      <section className="relative overflow-hidden rounded-2xl border border-base-300 bg-linear-to-br from-primary/15 via-base-100 to-accent/10 p-6 md:p-8 shadow-sm">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-20 -right-16 size-64 rounded-full bg-primary/20 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-20 -left-10 size-56 rounded-full bg-accent/20 blur-3xl"
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
                <Sparkles size={14} className="mr-1" />
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
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
          <StatTile
            icon={<Target size={20} />}
            label="Completados"
            value={totalCompletados}
            accent="success"
          />
          <StatTile
            icon={<Flame size={20} />}
            label="Intentos"
            value={totalIntentos}
            accent="info"
          />
          <StatTile
            icon={<Trophy size={20} />}
            label="Mejor puntuación"
            value={mejorPuntuacion ?? "—"}
            accent="warning"
          />
          <StatTile
            icon={<Award size={20} />}
            label="Promedio"
            value={promedioPuntuacion ?? "—"}
            accent="primary"
          />
        </div>
      </section>

      {/* Personal info */}
      <SectionCard
        icon={<User size={22} />}
        title="Información Personal"
        description="Mantén tus datos actualizados"
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

      {/* Institución */}
      {institucion ? (
        <SectionCard
          icon={<Building2 size={22} />}
          title="Mi Institución"
          description="Tu centro educativo"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <ProfileField
              icon={<Building2 size={16} />}
              label="Nombre"
              value={institucion.nombre}
            />
          </div>
        </SectionCard>
      ) : null}

      {/* Logros */}
      <SectionCard
        icon={<Trophy size={22} />}
        title="Últimos Logros"
        description="Tus escenarios completados más recientes"
      >
        {ultimosLogros.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {ultimosLogros.map((logro) => (
              <AchievementCard key={logro.idinteraccion} logro={logro} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-base-300 bg-base-100 py-10 px-6 text-center">
            <Trophy
              size={36}
              className="mx-auto opacity-30 mb-3"
              aria-hidden="true"
            />
            <p className="font-medium">Aún no tienes logros</p>
            <p className="text-sm opacity-70 mt-1">
              Completa escenarios para empezar a coleccionar logros.
            </p>
          </div>
        )}
      </SectionCard>

      {/* Theme switcher */}
      <ThemeSwitcher />
    </div>
  );
};

export default PerfilAlumno;
