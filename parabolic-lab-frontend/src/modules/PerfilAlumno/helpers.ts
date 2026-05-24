import type { InteraccionEscenario } from "@/models/interaccion_escenario";

export interface ProfileFormState {
  nombre: string;
  apellidopaterno: string;
  apellidomaterno: string;
}

export const EMPTY_PROFILE_FORM: ProfileFormState = {
  nombre: "",
  apellidopaterno: "",
  apellidomaterno: "",
};

export const buildProfileForm = (
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

export const getInitials = (nombre?: string, apellido?: string) =>
  `${nombre?.charAt(0) ?? ""}${apellido?.charAt(0) ?? ""}`.toUpperCase() || "?";

// Decimal fields arrive from the backend as strings — coerce with Number()
// before doing arithmetic, otherwise `+` concatenates and produces NaN.
export const toScore = (v: number | string | null | undefined) =>
  v == null ? null : Number(v);

export interface Achievement {
  idinteraccion: string;
  puntuacion: number | null;
  fechafin: Date | null;
  escenarioNombre: string | null;
}

export interface AlumnoStats {
  totalCompletados: number;
  totalIntentos: number;
  mejorPuntuacion: number | null;
  promedioPuntuacion: number | null;
  ultimosLogros: Achievement[];
}

export const computeAlumnoStats = (
  interacciones: InteraccionEscenario[] | undefined,
): AlumnoStats => {
  const list = interacciones ?? [];
  const completados = list.filter((i) => i.completado);
  const scored = completados
    .map((i) => toScore(i.puntuacion))
    .filter((p): p is number => p != null && !Number.isNaN(p));

  const promedioPuntuacion = scored.length
    ? Math.round(scored.reduce((acc, p) => acc + p, 0) / scored.length)
    : null;
  const mejorPuntuacion = scored.length
    ? Math.round(Math.max(...scored))
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
      escenarioNombre: i.escenario_nombre ?? null,
    }));

  return {
    totalCompletados: completados.length,
    totalIntentos: list.length,
    mejorPuntuacion,
    promedioPuntuacion,
    ultimosLogros,
  };
};
