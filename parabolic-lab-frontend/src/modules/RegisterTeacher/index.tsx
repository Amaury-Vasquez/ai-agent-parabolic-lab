"use client";
import { Button, Input, PasswordInput } from "amvasdev-ui";
import { Building2, GraduationCap, Lock, Mail, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCookies } from "react-cookie";
import { useForm } from "react-hook-form";
import Card from "@/components/Card";
import {
  ACCESS_TOKEN_COOKIE,
  AUTH_REDIRECT,
  REFRESH_TOKEN_COOKIE,
  USER_TYPE_COOKIE,
} from "@/constants/auth";
import { useRegister } from "@/mutations/useRegister";
import { ApiError } from "@/services/api";

interface RegisterTeacherProps {
  institutionId: string;
}

interface TeacherFormValues {
  institucion: string;
  nombre: string;
  email: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  gradoAcademico: string;
  contrasena: string;
}

// Mapea los nombres de campo del backend a los del formulario.
const FIELD_MAP: Record<string, keyof TeacherFormValues> = {
  email: "email",
  nombre: "nombre",
  apellidopaterno: "apellidoPaterno",
  apellidomaterno: "apellidoMaterno",
  gradoacademico: "gradoAcademico",
  password: "contrasena",
  idinstitucion: "institucion",
};

const RegisterTeacher = ({ institutionId }: RegisterTeacherProps) => {
  const router = useRouter();
  const [, setCookie] = useCookies();
  const { registerUser, isPending } = useRegister();
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof TeacherFormValues, string>>
  >({});
  const { register, handleSubmit } = useForm<TeacherFormValues>({
    // Prellenado desde la URL (leído en el servidor)
    defaultValues: { institucion: institutionId },
  });

  const onSubmit = async (values: TeacherFormValues) => {
    setError("");
    setFieldErrors({});
    try {
      const data = await registerUser({
        email: values.email,
        password: values.contrasena,
        nombre: values.nombre,
        apellidopaterno: values.apellidoPaterno,
        apellidomaterno: values.apellidoMaterno || undefined,
        idinstitucion: values.institucion.trim(),
        tipousuario: "docente",
        gradoacademico: values.gradoAcademico || undefined,
      });
      setCookie(ACCESS_TOKEN_COOKIE, data.access_token, { path: "/" });
      setCookie(REFRESH_TOKEN_COOKIE, data.refresh_token, { path: "/" });
      setCookie(USER_TYPE_COOKIE, data.tipousuario, { path: "/" });
      router.push(AUTH_REDIRECT[data.tipousuario] ?? "/");
    } catch (err) {
      if (err instanceof ApiError && Object.keys(err.fieldErrors).length > 0) {
        const mapped: Partial<Record<keyof TeacherFormValues, string>> = {};
        for (const [campo, mensaje] of Object.entries(err.fieldErrors)) {
          const formField = FIELD_MAP[campo];
          if (formField) mapped[formField] = mensaje;
        }
        setFieldErrors(mapped);
        const hayNoMapeados = Object.keys(err.fieldErrors).some(
          (c) => !FIELD_MAP[c],
        );
        setError(hayNoMapeados ? err.message : "");
      } else {
        setError(
          err instanceof Error ? err.message : "Error al registrar docente",
        );
      }
    }
  };

  return (
    <div className="flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Registro de Docente</h1>
          <p className="text-base-content/70">
            Crea tu cuenta para gestionar salones y escenarios
          </p>
        </div>

        <Card border>
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <Input
              id="institucion"
              label="ID de Institución"
              type="text"
              placeholder="d290f1ee-6c54-4b01-90e6-d701748f0851"
              leftIcon={<Building2 className="size-4" />}
              required
              variant={fieldErrors.institucion ? "error" : undefined}
              errorMessage={fieldErrors.institucion}
              {...register("institucion")}
            />

            <Input
              id="nombre"
              label="Nombre"
              type="text"
              placeholder="Carlos"
              leftIcon={<User className="size-4" />}
              required
              variant={fieldErrors.nombre ? "error" : undefined}
              errorMessage={fieldErrors.nombre}
              {...register("nombre")}
            />

            <Input
              id="email"
              label="Correo Electrónico"
              type="email"
              placeholder="cmartinez@ejemplo.com"
              leftIcon={<Mail className="size-4" />}
              required
              variant={fieldErrors.email ? "error" : undefined}
              errorMessage={fieldErrors.email}
              {...register("email")}
            />

            <Input
              id="apellidoPaterno"
              label="Apellido Paterno"
              type="text"
              placeholder="Martínez"
              leftIcon={<User className="size-4" />}
              required
              variant={fieldErrors.apellidoPaterno ? "error" : undefined}
              errorMessage={fieldErrors.apellidoPaterno}
              {...register("apellidoPaterno")}
            />

            <Input
              id="apellidoMaterno"
              label="Apellido Materno"
              type="text"
              placeholder="López"
              leftIcon={<User className="size-4" />}
              variant={fieldErrors.apellidoMaterno ? "error" : undefined}
              errorMessage={fieldErrors.apellidoMaterno}
              {...register("apellidoMaterno")}
            />

            <Input
              id="gradoAcademico"
              label="Grado Académico"
              type="text"
              placeholder="Maestría en Física"
              leftIcon={<GraduationCap className="size-4" />}
              variant={fieldErrors.gradoAcademico ? "error" : undefined}
              errorMessage={fieldErrors.gradoAcademico}
              {...register("gradoAcademico")}
            />

            <PasswordInput
              id="contrasena"
              label="Contraseña"
              placeholder="••••••••"
              leftIcon={<Lock className="size-4" />}
              required
              variant={fieldErrors.contrasena ? "error" : undefined}
              errorMessage={fieldErrors.contrasena}
              {...register("contrasena")}
            />

            {error ? <p className="text-sm text-error">{error}</p> : null}

            <Button type="submit" variant="primary" className="w-full mt-6" isLoading={isPending}>
              {isPending ? "Registrando..." : "Registrar Docente"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default RegisterTeacher;
