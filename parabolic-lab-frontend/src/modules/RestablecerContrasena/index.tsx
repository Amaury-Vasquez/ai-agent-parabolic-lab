"use client";
import { Button, PasswordInput } from "amvasdev-ui";
import { CheckCircle2, Lock, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Card from "@/components/Card";
import {
  FORGOT_PASSWORD_LINK,
  LOGIN_LINK,
} from "@/constants/navLinks";
import {
  useResetPassword,
  useVerifyResetCode,
} from "@/mutations/useForgotPassword";

interface ResetFormValues {
  password: string;
  confirmPassword: string;
}

type CodeState = "checking" | "valid" | "invalid" | "missing";

const RestablecerContrasena = () => {
  const searchParams = useSearchParams();
  const code = searchParams.get("code") ?? "";
  const [codeState, setCodeState] = useState<CodeState>(
    code ? "checking" : "missing",
  );
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const { mutateAsync: verifyCode } = useVerifyResetCode();
  const { mutateAsync: resetPassword, isPending } = useResetPassword();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetFormValues>();

  useEffect(() => {
    let cancelled = false;
    if (!code) {
      setCodeState("missing");
      return;
    }
    setCodeState("checking");
    verifyCode(code)
      .then((result) => {
        if (cancelled) return;
        setCodeState(result.is_code_valid ? "valid" : "invalid");
      })
      .catch(() => {
        if (!cancelled) setCodeState("invalid");
      });
    return () => {
      cancelled = true;
    };
  }, [code, verifyCode]);

  const onSubmit = async ({ password, confirmPassword }: ResetFormValues) => {
    setError("");
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }
    try {
      await resetPassword({ code, password });
      setDone(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No fue posible restablecer la contraseña",
      );
    }
  };

  if (done) {
    return (
      <Card border contentClassName="flex flex-col gap-4 text-center">
        <span className="inline-flex items-center justify-center size-12 mx-auto bg-success/15 text-success rounded-2xl">
          <CheckCircle2 className="size-6" />
        </span>
        <h2 className="text-2xl font-bold">Contraseña actualizada</h2>
        <p className="text-sm opacity-70">
          Ya puedes iniciar sesión con tu nueva contraseña.
        </p>
        <Link href={LOGIN_LINK} className="btn btn-primary">
          Iniciar sesión
        </Link>
      </Card>
    );
  }

  if (codeState === "checking") {
    return (
      <Card border contentClassName="flex flex-col items-center gap-3 py-8">
        <span className="loading loading-spinner loading-lg" />
        <p className="text-sm opacity-70">Validando enlace...</p>
      </Card>
    );
  }

  if (codeState === "missing" || codeState === "invalid") {
    return (
      <Card border contentClassName="flex flex-col gap-4 text-center">
        <span className="inline-flex items-center justify-center size-12 mx-auto bg-error/15 text-error rounded-2xl">
          <ShieldAlert className="size-6" />
        </span>
        <h2 className="text-2xl font-bold">Enlace no válido</h2>
        <p className="text-sm opacity-70">
          {codeState === "missing"
            ? "El enlace no incluye un código. Asegúrate de abrirlo directamente desde tu correo."
            : "El enlace expiró o ya fue usado. Solicita uno nuevo para continuar."}
        </p>
        <Link href={FORGOT_PASSWORD_LINK} className="btn btn-primary">
          Solicitar enlace nuevo
        </Link>
      </Card>
    );
  }

  return (
    <Card border contentClassName="flex flex-col gap-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Nueva contraseña</h2>
        <p className="text-sm opacity-70 mt-1">
          Elige una contraseña que no hayas usado antes en ParabolicLab.
        </p>
      </div>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
        <PasswordInput
          id="password"
          label="Contraseña nueva"
          placeholder="••••••••"
          leftIcon={<Lock className="size-4" />}
          required
          {...register("password", {
            minLength: {
              value: 8,
              message: "Mínimo 8 caracteres",
            },
          })}
          errorMessage={errors.password?.message}
        />
        <PasswordInput
          id="confirmPassword"
          label="Confirmar contraseña"
          placeholder="••••••••"
          leftIcon={<Lock className="size-4" />}
          required
          {...register("confirmPassword", {
            validate: (value) =>
              value === watch("password") || "Las contraseñas no coinciden",
          })}
          errorMessage={errors.confirmPassword?.message}
        />

        {error ? <p className="text-sm text-error">{error}</p> : null}

        <Button
          type="submit"
          variant="primary"
          className="w-full"
          isLoading={isPending}
        >
          {isPending ? "Guardando..." : "Restablecer contraseña"}
        </Button>
      </form>
    </Card>
  );
};

export default RestablecerContrasena;
