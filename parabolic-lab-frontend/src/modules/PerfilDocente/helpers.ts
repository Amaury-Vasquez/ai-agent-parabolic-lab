import type { Institucion } from "@/models/institucion";

export interface ProfileFormState {
  nombre: string;
  apellidopaterno: string;
  apellidomaterno: string;
  gradoacademico: string;
}

export interface InstitutionFormState {
  nombre: string;
  direccion: string;
  telefono: string;
}

export const EMPTY_PROFILE_FORM: ProfileFormState = {
  nombre: "",
  apellidopaterno: "",
  apellidomaterno: "",
  gradoacademico: "",
};

export const EMPTY_INSTITUTION_FORM: InstitutionFormState = {
  nombre: "",
  direccion: "",
  telefono: "",
};

export const buildProfileForm = (
  user:
    | {
        nombre: string;
        apellidopaterno: string;
        apellidomaterno?: string | null;
      }
    | undefined,
  docente: { gradoacademico?: string | null } | undefined,
): ProfileFormState => ({
  nombre: user?.nombre ?? "",
  apellidopaterno: user?.apellidopaterno ?? "",
  apellidomaterno: user?.apellidomaterno ?? "",
  gradoacademico: docente?.gradoacademico ?? "",
});

export const buildInstitutionForm = (
  institucion: Institucion | undefined,
): InstitutionFormState => ({
  nombre: institucion?.nombre ?? "",
  direccion: institucion?.direccion ?? "",
  telefono: institucion?.telefono ?? "",
});

export const getInitials = (nombre?: string, apellido?: string) =>
  `${nombre?.charAt(0) ?? ""}${apellido?.charAt(0) ?? ""}`.toUpperCase() || "?";
