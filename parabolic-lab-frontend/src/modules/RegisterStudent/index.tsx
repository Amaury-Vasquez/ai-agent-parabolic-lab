"use client";
import { Button, Input, PasswordInput } from "amvasdev-ui";
import { Hash, Lock, Mail, User } from "lucide-react";
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

interface RegisterStudentProps {
  institutionId: string;
}

interface StudentFormValues {
  email: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  matricula: string;
  contrasena: string;
}

const RegisterStudent = ({ institutionId }: RegisterStudentProps) => {
  const router = useRouter();
  const [, setCookie] = useCookies();
  const { registerUser, isPending } = useRegister();
  const [error, setError] = useState("");
  const { register, handleSubmit } = useForm<StudentFormValues>();

  const onSubmit = async (values: StudentFormValues) => {
    setError("");
    try {
      const data = await registerUser({
        email: values.email,
        password: values.contrasena,
        nombre: values.nombre,
        apellidopaterno: values.apellidoPaterno,
        apellidomaterno: values.apellidoMaterno || undefined,
        idinstitucion: institutionId,
        tipousuario: "alumno",
        matricula: values.matricula || undefined,
      });
      setCookie(ACCESS_TOKEN_COOKIE, data.access_token, { path: "/" });
      setCookie(REFRESH_TOKEN_COOKIE, data.refresh_token, { path: "/" });
      setCookie(USER_TYPE_COOKIE, data.tipousuario, { path: "/" });
      router.push(AUTH_REDIRECT[data.tipousuario] ?? "/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al registrar alumno");
    }
  };

  return (
    <div className="flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Registro de Alumno</h1>
          <p className="text-base-content/70">
            ID de Institución:{" "}
            <span className="font-mono font-bold">{institutionId}</span>
          </p>
        </div>

        <Card border>
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <Input
              id="email"
              label="Correo Electrónico"
              type="email"
              placeholder="correo@ejemplo.com"
              leftIcon={<Mail className="size-4" />}
              required
              {...register("email")}
            />

            <Input
              id="nombre"
              label="Nombre"
              type="text"
              placeholder="María"
              leftIcon={<User className="size-4" />}
              required
              {...register("nombre")}
            />

            <Input
              id="apellidoPaterno"
              label="Apellido Paterno"
              type="text"
              placeholder="García"
              leftIcon={<User className="size-4" />}
              required
              {...register("apellidoPaterno")}
            />

            <Input
              id="apellidoMaterno"
              label="Apellido Materno"
              type="text"
              placeholder="Rodríguez"
              leftIcon={<User className="size-4" />}
              {...register("apellidoMaterno")}
            />

            <Input
              id="matricula"
              label="Matrícula"
              type="text"
              placeholder="2024030123"
              leftIcon={<Hash className="size-4" />}
              {...register("matricula")}
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
              {isPending ? "Registrando..." : "Registrar Alumno"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default RegisterStudent;
