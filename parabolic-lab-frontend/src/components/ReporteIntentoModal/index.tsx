"use client";
import { Button, Modal } from "amvasdev-ui";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import ReporteIntentoContent from "@/components/ReporteIntento";
import { useReporteIntento } from "@/queries/useReporteIntento";

interface ReporteIntentoModalProps {
  isOpen: boolean;
  onClose: () => void;
  idinteraccion: string | null;
}

const ReporteIntentoModal = ({
  isOpen,
  onClose,
  idinteraccion,
}: ReporteIntentoModalProps) => {
  const { data: reporte, isLoading, isError } = useReporteIntento(
    isOpen ? idinteraccion : null,
  );

  if (!isOpen || !idinteraccion) return null;

  return (
    <Modal
      onClose={onClose}
      title="Reporte del intento"
    >
      <div className="flex flex-col gap-4 py-2 max-h-[80vh] overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <span className="loading loading-spinner loading-lg" />
          </div>
        ) : isError ? (
          <div className="alert alert-error">
            <span>No se pudo cargar el reporte. Inténtalo más tarde.</span>
          </div>
        ) : reporte ? (
          <>
            <ReporteIntentoContent reporte={reporte} />
            <div className="divider my-0" />
            <div className="flex justify-end">
              <Link href={`/alumno/reporte/${idinteraccion}`} target="_blank">
                <Button variant="ghost" size="sm">
                  <ExternalLink className="w-4 h-4" />
                  Abrir en página completa
                </Button>
              </Link>
            </div>
          </>
        ) : null}
      </div>
    </Modal>
  );
};

export default ReporteIntentoModal;
