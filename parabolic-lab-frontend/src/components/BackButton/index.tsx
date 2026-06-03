"use client";

import { Button } from "amvasdev-ui";
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
    <Button
      type="button"
      variant="ghost"
      size="sm"
      aria-label={label}
      title={label}
      onClick={() => (href ? router.push(href) : router.back())}
      className={clsx("btn-square", className)}
    >
      <ArrowLeft size={20} />
    </Button>
  );
};

export default BackButton;
