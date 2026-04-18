"use client";
import { Button, Input, PasswordInput } from "amvasdev-ui";
import {
  Building2,
  FileKey,
  Lock,
  Mail,
  MapPin,
  Phone,
  School2,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCookies } from "react-cookie";
import { useForm } from "react-hook-form";
import {
  ACCESS_TOKEN_COOKIE,
  AUTH_REDIRECT,
  REFRESH_TOKEN_COOKIE,
  USER_TYPE_COOKIE,
} from "@/constants/auth";
import { useRegisterInstitution } from "@/mutations/useRegisterInstitution";

interface InstitutionFormValues {
  nombreInstitucion: string;
  cct: string;
  telefono: string;
  emailInstitucion: string;
  calle: string;
  colonia: string;
  codigoPostal: string;
  municipio: string;
  estado: string;
  adminNombre: string;
  adminApellidoPaterno: string;
  adminApellidoMaterno: string;
  adminEmail: string;
  adminPassword: string;
}

const RegisterInstitutionForm = () => {
  const router = useRouter();
  const [, setCookie] = useCookies();
  const { registerInst, isPending } = useRegisterInstitution();
  const [error, setError] = useState("");
  const { register, handleSubmit } = useForm<InstitutionFormValues>();

  const onSubmit = async (values: InstitutionFormValues) => {
    setError("");
    try {
      const data = await registerInst({
        nombre_institucion: values.nombreInstitucion,
        clavect: values.cct || undefined,
        telefono: values.telefono,
        email_institucion: values.emailInstitucion,
        direccion: values.calle || undefined,
        colonia: values.colonia || undefined,
        codigopostal: values.codigoPostal || undefined,
        municipio: values.municipio || undefined,
        estado: values.estado || undefined,
        nombre: values.adminNombre,
        email: values.adminEmail,
        password: values.adminPassword,
        apellidopaterno: values.adminApellidoPaterno,
        apellidomaterno: values.adminApellidoMaterno || undefined,
      });
      setCookie(ACCESS_TOKEN_COOKIE, data.access_token, { path: "/" });
      setCookie(REFRESH_TOKEN_COOKIE, data.refresh_token, { path: "/" });
      setCookie(USER_TYPE_COOKIE, data.tipousuario, { path: "/" });
      router.push(AUTH_REDIRECT[data.tipousuario] ?? "/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al registrar institución");
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
      {/* Información de la Institución */}
      <div className="divider">Información de la Institución</div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          id="nombreInstitucion"
          containerClassName="col-span-2"
          label="Nombre Institución"
          type="text"
          placeholder="Instituto Politécnico Nacional"
          leftIcon={<School2 className="size-4" />}
          required
          {...register("nombreInstitucion")}
        />
        <Input
          id="cct"
          label="Clave de Centro de Trabajo (CCT)"
          type="text"
          placeholder="09DPR0001X"
          leftIcon={<FileKey className="size-4" />}
          {...register("cct")}
        />
        <Input
          id="telefono"
          label="Teléfono"
          type="tel"
          placeholder="55 1234 5678"
          leftIcon={<Phone className="size-4" />}
          required
          {...register("telefono")}
        />
        <Input
          id="emailInstitucion"
          containerClassName="col-span-2"
          label="Correo Electrónico de la Institución"
          type="email"
          placeholder="contacto@institucion.edu.mx"
          leftIcon={<Mail className="size-4" />}
          required
          {...register("emailInstitucion")}
        />
      </div>

      {/* Dirección */}
      <div className="divider">Dirección</div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Input
          id="calle"
          label="Calle"
          type="text"
          placeholder="Av. Instituto Politécnico Nacional 1936"
          leftIcon={<MapPin className="size-4" />}
          containerClassName="col-span-3"
          {...register("calle")}
        />
        <Input
          id="colonia"
          label="Colonia"
          type="text"
          placeholder="Lindavista"
          leftIcon={<MapPin className="size-4" />}
          containerClassName="col-span-2"
          {...register("colonia")}
        />
        <Input
          id="codigoPostal"
          label="Código Postal"
          type="text"
          placeholder="07738"
          maxLength={5}
          leftIcon={<MapPin className="size-4" />}
          {...register("codigoPostal")}
        />
        <Input
          id="municipio"
          label="Municipio"
          type="text"
          placeholder="Gustavo A. Madero"
          leftIcon={<Building2 className="size-4" />}
          containerClassName="col-span-2"
          {...register("municipio")}
        />
        <Input
          id="estado"
          label="Estado"
          type="text"
          placeholder="Ciudad de México"
          leftIcon={<MapPin className="size-4" />}
          containerClassName="col-span-2"
          {...register("estado")}
        />
      </div>

      {/* Cuenta de Administrador */}
      <div className="divider">Cuenta de Administrador</div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          id="adminNombre"
          label="Nombre"
          type="text"
          placeholder="Juan"
          leftIcon={<User className="size-4" />}
          required
          {...register("adminNombre")}
        />
        <Input
          id="adminApellidoPaterno"
          label="Apellido Paterno"
          type="text"
          placeholder="Pérez"
          leftIcon={<User className="size-4" />}
          required
          {...register("adminApellidoPaterno")}
        />
        <Input
          id="adminApellidoMaterno"
          label="Apellido Materno"
          type="text"
          placeholder="López"
          leftIcon={<User className="size-4" />}
          required
          {...register("adminApellidoMaterno")}
        />
      </div>

      <Input
        id="adminEmail"
        label="Correo Electrónico"
        type="email"
        placeholder="admin@institucion.edu.mx"
        leftIcon={<Mail className="size-4" />}
        required
        {...register("adminEmail")}
      />

      <PasswordInput
        id="adminPassword"
        label="Contraseña"
        placeholder="••••••••"
        leftIcon={<Lock className="size-4" />}
        required
        {...register("adminPassword")}
      />

      {error ? <p className="text-sm text-error">{error}</p> : null}

      {/* Botones */}
      <div className="card-actions justify-end mt-8">
        <Button type="button" variant="ghost">
          Cancelar
        </Button>
        <Button type="submit" variant="primary" isLoading={isPending}>
          {isPending ? "Registrando..." : "Registrar Institución"}
        </Button>
      </div>
    </form>
  );
};

export default RegisterInstitutionForm;
