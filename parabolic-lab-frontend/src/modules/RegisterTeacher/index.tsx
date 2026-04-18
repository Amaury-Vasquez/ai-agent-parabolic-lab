"use client";
import { Button, Input, PasswordInput } from "amvasdev-ui";
import { GraduationCap, Lock, Mail, User } from "lucide-react";
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

interface RegisterTeacherProps {
  institutionId: string;
}

interface TeacherFormValues {
  nombre: string;
  email: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  gradoAcademico: string;
  contrasena: string;
}

const RegisterTeacher = ({ institutionId }: RegisterTeacherProps) => {
  const router = useRouter();
  const [, setCookie] = useCookies();
  const { registerUser, isPending } = useRegister();
  const [error, setError] = useState("");
  const { register, handleSubmit } = useForm<TeacherFormValues>();

  const onSubmit = async (values: TeacherFormValues) => {
    setError("");
    try {
      const data = await registerUser({
        email: values.email,
        password: values.contrasena,
        nombre: values.nombre,
        apellidopaterno: values.apellidoPaterno,
        apellidomaterno: values.apellidoMaterno || undefined,
        idinstitucion: institutionId,
        tipousuario: "docente",
        gradoacademico: values.gradoAcademico || undefined,
      });
      setCookie(ACCESS_TOKEN_COOKIE, data.access_token, { path: "/" });
      setCookie(REFRESH_TOKEN_COOKIE, data.refresh_token, { path: "/" });
      setCookie(USER_TYPE_COOKIE, data.tipousuario, { path: "/" });
      router.push(AUTH_REDIRECT[data.tipousuario] ?? "/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al registrar docente");
    }
  };

  return (
    <div className="flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Registro de Docente</h1>
          <p className="text-base-content/70">
            ID de Institución:
            <strong>{` ${institutionId}`}</strong>
          </p>
        </div>

        <Card border>
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <Input
              id="nombre"
              label="Nombre"
              type="text"
              placeholder="Carlos"
              leftIcon={<User className="size-4" />}
              required
              {...register("nombre")}
            />

            <Input
              id="email"
              label="Correo Electrónico"
              type="email"
              placeholder="cmartinez@ejemplo.com"
              leftIcon={<Mail className="size-4" />}
              required
              {...register("email")}
            />

            <Input
              id="apellidoPaterno"
              label="Apellido Paterno"
              type="text"
              placeholder="Martínez"
              leftIcon={<User className="size-4" />}
              required
              {...register("apellidoPaterno")}
            />

            <Input
              id="apellidoMaterno"
              label="Apellido Materno"
              type="text"
              placeholder="López"
              leftIcon={<User className="size-4" />}
              {...register("apellidoMaterno")}
            />

            <Input
              id="gradoAcademico"
              label="Grado Académico"
              type="text"
              placeholder="Maestría en Física"
              leftIcon={<GraduationCap className="size-4" />}
              {...register("gradoAcademico")}
            />

            <PasswordInput
              id="contrasena"
              label="Contraseña"
              placeholder="••••••••"
              leftIcon={<Lock className="size-4" />}
              required
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
