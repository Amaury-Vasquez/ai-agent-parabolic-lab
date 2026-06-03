import { Badge, Button, Modal } from "amvasdev-ui";
import { Link2, Trash2 } from "lucide-react";
import { useState } from "react";
import Card from "@/components/Card";
import { useDeleteSalon } from "@/mutations/useDeleteSalon";
import SeleccionarEscenarioModal from "./SeleccionarEscenarioModal";
import SalonConfigModal from "./SalonConfigModal";
import { useRouter } from "next/navigation";
import { Salon } from "@/types/salon";

interface SalonCardProps {
  salon: Salon;
}

const SalonCard = ({ salon }: SalonCardProps) => {
  const hasScenarios = salon.escenarios.length > 0;
  const hasMultipleScenarios = salon.escenarios.length > 1;
  const router = useRouter();
  const [isSeleccionarEscenarioModalOpen, setIsSeleccionarEscenarioModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const [enlaceCopiado, setEnlaceCopiado] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const { mutate: deleteSalon, isPending: isDeleting } = useDeleteSalon();

  const handleCopiar = async () => {
    await navigator.clipboard.writeText(salon.codigoacceso);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  // Enlace de invitación: lleva al registro de alumno con la institución en
  // la ruta y el código del salón prellenado vía query param.
  const handleCopiarEnlace = async () => {
    const enlace = `${window.location.origin}/registro/${salon.idinstitucion}/alumno?salon=${encodeURIComponent(salon.codigoacceso)}`;
    await navigator.clipboard.writeText(enlace);
    setEnlaceCopiado(true);
    setTimeout(() => setEnlaceCopiado(false), 2000);
  };

  if (deleted) return null;

  return (
    <Card contentClassName="justify-between">
      {/* Card Header with Settings */}
      <div className="flex justify-between items-start">
        <h2 className="card-title">{salon.nombresalon}</h2>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" className="btn-square" onClick={() => setIsConfigModalOpen(true)}>
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </Button>
          <Button variant="ghost" size="sm" className="btn-square text-error" onClick={() => setIsDeleteModalOpen(true)}>
            <Trash2 className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Access Code */}
      <div className="bg-base-200 p-4 rounded-lg mt-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-xs opacity-60 uppercase mb-1">
              Código de acceso:
            </p>
            <p className="font-mono font-bold text-lg">{salon.codigoacceso}</p>
          </div>
          <Button variant="ghost" size="sm" className="btn-square" onClick={handleCopiar}>
            {copiado ? (
              <span className="text-xs text-success">¡Copiado!</span>
            ) : (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            )}
          </Button>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full mt-2"
          onClick={handleCopiarEnlace}
        >
          <Link2 className="w-4 h-4" />
          {enlaceCopiado ? (
            <span className="text-success">¡Enlace copiado!</span>
          ) : (
            "Copiar enlace de invitación"
          )}
        </Button>
      </div>

      {/* Assigned Scenarios */}
      <div className="mt-4">
        {hasScenarios ? (
          <>
            <p className="text-xs text-base-content/70 uppercase mb-2 font-semibold">
              {hasMultipleScenarios
                ? "Escenarios Asignados"
                : "Escenario Asignado"}
            </p>
            <div className="flex items-center gap-2">
              <div className="flex flex-wrap gap-2 flex-1">
                <Badge variant="primary" size="md" soft>
                  {salon.escenarios[0].nombre}
                </Badge>
                {hasMultipleScenarios ? (
                  <Badge variant="primary" borderType="outline" size="md">
                    +{salon.escenarios.length - 1} escenario
                    {salon.escenarios.length > 2 ? "s" : ""}
                  </Badge>
                ) : null}
              </div>
            </div>
          </>
        ) : (
          <p className="text-sm opacity-50 italic">Sin escenario asignado</p>
        )}
      </div>

      {/* Students Count */}
      <div className="flex items-center gap-2 mt-3">
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
        <span className="text-sm">{salon.num_estudiantes} estudiantes</span>
      </div>

      {/* Action Buttons */}
      <div className="card-actions flex-col mt-6 w-full">
        <Button variant="primary" className="w-full" onClick={() => setIsSeleccionarEscenarioModalOpen(true)}>
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Asignar Escenario

        </Button>
        <Button
          outlined
          className="w-full"
          onClick={() => router.push(`/docente/salon/${salon.idsalon}`)}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          Ver Progreso
        </Button>
      </div>
      <SeleccionarEscenarioModal
        isOpen={isSeleccionarEscenarioModalOpen}
        onClose={() => setIsSeleccionarEscenarioModalOpen(false)}
        salon={salon}
      />
      <SalonConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        salon={salon}
      />
      {isDeleteModalOpen && (
        <Modal
          onClose={() => setIsDeleteModalOpen(false)}
          title="Eliminar salón"
          confirmButton={{
            children: isDeleting ? "Eliminando..." : "Sí, eliminar",
            variant: "error",
            disabled: isDeleting,
            onClick: () => deleteSalon(salon.idsalon, {
              onSuccess: () => {
                setDeleted(true);
                setIsDeleteModalOpen(false);
              }
            })
          }}
        >
          <p className="py-4">
            ¿Estás seguro de eliminar <strong>{salon.nombresalon}</strong>?
            Esta acción borrará el progreso de los estudiantes.
          </p>
        </Modal>
      )}
    </Card>
  );
};

export default SalonCard;
