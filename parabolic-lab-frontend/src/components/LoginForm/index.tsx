"use client";
import { Button, Input, PasswordInput } from "amvasdev-ui";
import { Lock, Mail } from "lucide-react";
import Link from "next/link";
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
import { REGISTER_LINK } from "@/constants/navLinks";
import { useLogin } from "@/mutations/useLogin";

interface LoginFormValues {
  email: string;
  password: string;
}

const LoginForm = () => {
  const router = useRouter();
  const [, setCookie] = useCookies();
  const { loginUser, isPending } = useLogin();
  const [error, setError] = useState("");
  const { register, handleSubmit } = useForm<LoginFormValues>();

  const onSubmit = async (values: LoginFormValues) => {
    setError("");
    try {
      const data = await loginUser(values);
      setCookie(ACCESS_TOKEN_COOKIE, data.access_token, { path: "/" });
      setCookie(REFRESH_TOKEN_COOKIE, data.refresh_token, { path: "/" });
      setCookie(USER_TYPE_COOKIE, data.tipousuario, { path: "/" });
      router.push(AUTH_REDIRECT[data.tipousuario] ?? "/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión");
    }
  };

  return (
    <Card border contentClassName="flex flex-col gap-4 text-center">
      <h2 className="text-2xl text-center font-bold">Iniciar Sesión</h2>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
        <Input
          id="email"
          label="Correo Electrónico"
          type="email"
          placeholder="correo@institucion.edu"
          leftIcon={<Mail className="size-4" />}
          required
          {...register("email")}
        />

        <PasswordInput
          id="password"
          label="Contraseña"
          placeholder="••••••••"
          leftIcon={<Lock className="size-4" />}
          required
          {...register("password")}
        />

        {error ? <p className="text-sm text-error">{error}</p> : null}

        <Button type="submit" variant="primary" className="w-full mt-2" isLoading={isPending}>
          {isPending ? "Ingresando..." : "Iniciar Sesión"}
        </Button>
        <p className="text-sm">
          ¿No tienes cuenta?{" "}
          <Link href={REGISTER_LINK} className="link link-primary font-medium">
            Crea una aquí
          </Link>
        </p>
      </form>
    </Card>
  );
};

export default LoginForm;
