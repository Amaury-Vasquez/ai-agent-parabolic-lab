"use client";
import { Button, Input, PasswordInput } from "amvasdev-ui";
import { Building2, Hash, Lock, Mail, User } from "lucide-react";
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
import { unirseASalon } from "@/fetchers/salones";
import { useRegister } from "@/mutations/useRegister";
import { ApiError } from "@/services/api";

interface RegisterStudentProps {
  institutionId: string;
  salonCode?: string;
}

// Mapea los nombres de campo del backend a los del formulario.
const FIELD_MAP: Record<string, keyof StudentFormValues> = {
  email: "email",
  nombre: "nombre",
  apellidopaterno: "apellidoPaterno",
  apellidomaterno: "apellidoMaterno",
  matricula: "matricula",
  password: "contrasena",
  idinstitucion: "institucion",
};

interface StudentFormValues {
  institucion: string;
  email: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  matricula: string;
  codigoSalon: string;
  contrasena: string;
}

const RegisterStudent = ({
  institutionId,
  salonCode = "",
}: RegisterStudentProps) => {
  const router = useRouter();
  const [, setCookie] = useCookies();
  const { registerUser, isPending } = useRegister();
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof StudentFormValues, string>>
  >({});
  const { register, handleSubmit } = useForm<StudentFormValues>({
    // Prellenados desde la URL (leídos en el servidor)
    defaultValues: { institucion: institutionId, codigoSalon: salonCode },
  });

  const onSubmit = async (values: StudentFormValues) => {
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
        tipousuario: "alumno",
        matricula: values.matricula || undefined,
      });
      setCookie(ACCESS_TOKEN_COOKIE, data.access_token, { path: "/" });
      setCookie(REFRESH_TOKEN_COOKIE, data.refresh_token, { path: "/" });
      setCookie(USER_TYPE_COOKIE, data.tipousuario, { path: "/" });

      // Si trae código de salón, unirse antes de entrar al panel. Si el
      // código falla la cuenta ya existe: avisamos y entramos de cualquier
      // forma (puede unirse después desde su panel).
      if (values.codigoSalon.trim()) {
        try {
          await unirseASalon(data.access_token, values.codigoSalon.trim());
        } catch {
          setError(
            "Tu cuenta se creó, pero el código de salón no es válido. Podrás unirte a un salón desde tu panel.",
          );
          setTimeout(
            () => router.push(AUTH_REDIRECT[data.tipousuario] ?? "/"),
            2500,
          );
          return;
        }
      }
      router.push(AUTH_REDIRECT[data.tipousuario] ?? "/");
    } catch (err) {
      if (err instanceof ApiError && Object.keys(err.fieldErrors).length > 0) {
        const mapped: Partial<Record<keyof StudentFormValues, string>> = {};
        for (const [campo, mensaje] of Object.entries(err.fieldErrors)) {
          const formField = FIELD_MAP[campo];
          if (formField) mapped[formField] = mensaje;
        }
        setFieldErrors(mapped);
        // Si hay errores no mapeables a un campo, muéstralos arriba.
        const hayNoMapeados = Object.keys(err.fieldErrors).some(
          (c) => !FIELD_MAP[c],
        );
        setError(hayNoMapeados ? err.message : "");
      } else {
        setError(
          err instanceof Error ? err.message : "Error al registrar alumno",
        );
      }
    }
  };

  return (
    <div className="flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Registro de Alumno</h1>
          <p className="text-base-content/70">
            Crea tu cuenta para acceder a tus salones y simulaciones
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
              id="email"
              label="Correo Electrónico"
              type="email"
              placeholder="correo@ejemplo.com"
              leftIcon={<Mail className="size-4" />}
              required
              variant={fieldErrors.email ? "error" : undefined}
              errorMessage={fieldErrors.email}
              {...register("email")}
            />

            <Input
              id="nombre"
              label="Nombre"
              type="text"
              placeholder="María"
              leftIcon={<User className="size-4" />}
              required
              variant={fieldErrors.nombre ? "error" : undefined}
              errorMessage={fieldErrors.nombre}
              {...register("nombre")}
            />

            <Input
              id="apellidoPaterno"
              label="Apellido Paterno"
              type="text"
              placeholder="García"
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
              placeholder="Rodríguez"
              leftIcon={<User className="size-4" />}
              variant={fieldErrors.apellidoMaterno ? "error" : undefined}
              errorMessage={fieldErrors.apellidoMaterno}
              {...register("apellidoMaterno")}
            />

            <Input
              id="matricula"
              label="Matrícula"
              type="text"
              placeholder="2024030123"
              leftIcon={<Hash className="size-4" />}
              variant={fieldErrors.matricula ? "error" : undefined}
              errorMessage={fieldErrors.matricula}
              {...register("matricula")}
            />

            <Input
              id="codigoSalon"
              label="Código de Salón (opcional)"
              type="text"
              placeholder="FISICA-2024-A1"
              leftIcon={<Hash className="size-4" />}
              variant={fieldErrors.codigoSalon ? "error" : undefined}
              errorMessage={fieldErrors.codigoSalon}
              {...register("codigoSalon")}
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
              {isPending ? "Registrando..." : "Registrar Alumno"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default RegisterStudent;
