"use client";

import clsx from "clsx";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface BackButtonProps {
  /** Destino explícito. Si se omite, vuelve a la página anterior del historial. */
  href?: string;
  /** Etiqueta accesible / tooltip. */
  label?: string;
  className?: string;
}

/**
 * Botón de regresar reutilizable. Unifica el patrón usado en docente/alumno
 * (btn btn-ghost btn-square btn-sm + ArrowLeft) para mantener una UX
 * consistente entre admin, docente y alumno.
 */
const BackButton = ({ href, label = "Regresar", className }: BackButtonProps) => {
  const router = useRouter();
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={() => (href ? router.push(href) : router.back())}
      className={clsx("btn btn-ghost btn-square btn-sm", className)}
    >
      <ArrowLeft size={20} />
    </button>
  );
};

export default BackButton;
