"use client";
import { Badge, Button } from "amvasdev-ui";
import { Users } from "lucide-react";
import Link from "next/link";
import Card from "@/components/Card";
import { Salon } from "@/types/salon";

interface ClassroomCardProps {
  salon: Salon;
}

const ClassroomCard = ({ salon }: ClassroomCardProps) => {
  const hasScenarios = salon.escenarios.length > 0;
  const hasMultipleScenarios = salon.escenarios.length > 1;

  return (
    <Card contentClassName="justify-between">
      {/* Card Header */}
      <div>
        <h2 className="card-title">{salon.nombresalon}</h2>
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
                  {salon.escenarios[0]}
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
        <Users className="w-4 h-4" />
        <span className="text-sm">{salon.num_estudiantes} estudiantes</span>
      </div>

      {/* Action Button */}
      <div className="card-actions flex-col mt-6 w-full">
        <Link href={`/alumno/salon/${salon.codigoacceso}`} className="w-full">
          <Button variant="primary" className="w-full">
            Ver Salón
          </Button>
        </Link>
      </div>
    </Card>
  );
};

export default ClassroomCard;
