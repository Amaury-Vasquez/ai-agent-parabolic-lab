"use client";
import { Button, Input } from "amvasdev-ui";
import { ArrowLeft, Mail, MailCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import Card from "@/components/Card";
import {
  LOGIN_LINK,
  RESET_PASSWORD_LINK,
} from "@/constants/navLinks";
import { useForgotPassword } from "@/mutations/useForgotPassword";

interface ForgotPasswordFormValues {
  email: string;
}

const RecuperarContrasena = () => {
  const { register, handleSubmit, getValues } =
    useForm<ForgotPasswordFormValues>();
  const { mutateAsync, isPending } = useForgotPassword();
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const onSubmit = async ({ email }: ForgotPasswordFormValues) => {
    setError("");
    try {
      const callback_url = `${window.location.origin}${RESET_PASSWORD_LINK}`;
      await mutateAsync({ email, callback_url });
      setSent(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No fue posible enviar el correo de restablecimiento",
      );
    }
  };

  if (sent) {
    return (
      <Card border contentClassName="flex flex-col gap-4 text-center">
        <span className="inline-flex items-center justify-center size-12 mx-auto bg-success/15 text-success rounded-2xl">
          <MailCheck className="size-6" />
        </span>
        <h2 className="text-2xl font-bold">Revisa tu correo</h2>
        <p className="text-sm opacity-70">
          Si <strong>{getValues("email")}</strong> está registrado en
          ParabolicLab, recibirás un correo con un enlace para restablecer tu
          contraseña. El enlace expira pronto, así que úsalo en cuanto puedas.
        </p>
        <p className="text-xs opacity-60">
          ¿No ves el correo? Revisa tu carpeta de spam o intenta de nuevo.
        </p>
        <Link
          href={LOGIN_LINK}
          className="link link-primary text-sm inline-flex items-center justify-center gap-1"
        >
          <ArrowLeft size={14} />
          Volver al inicio de sesión
        </Link>
      </Card>
    );
  }

  return (
    <Card border contentClassName="flex flex-col gap-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Recuperar contraseña</h2>
        <p className="text-sm opacity-70 mt-1">
          Ingresa tu correo y te enviaremos un enlace para crear una nueva.
        </p>
      </div>

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

        {error ? <p className="text-sm text-error">{error}</p> : null}

        <Button
          type="submit"
          variant="primary"
          className="w-full"
          isLoading={isPending}
        >
          {isPending ? "Enviando..." : "Enviar correo de recuperación"}
        </Button>

        <Link
          href={LOGIN_LINK}
          className="link link-primary text-sm inline-flex items-center justify-center gap-1"
        >
          <ArrowLeft size={14} />
          Volver al inicio de sesión
        </Link>
      </form>
    </Card>
  );
};

export default RecuperarContrasena;
