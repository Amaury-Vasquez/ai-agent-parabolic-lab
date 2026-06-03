import type { Scenario } from "@/models/scenario";
import type { Salon } from "@/types/salon";

export interface AsignacionEscenario {
  salon: Salon;
  // Id del escenario dentro de ese salón (la copia, o el propio original
  // si está asignado directamente); necesario para ver respuestas.
  idescenarioEnSalon: string;
}

// Salones donde el escenario está asignado: cada asignación crea una copia
// con idescenario_origen apuntando al original de la biblioteca (o el
// original mismo puede estar asignado directamente a un salón).
export const getAsignaciones = (
  escenario: Pick<Scenario, "idescenario">,
  salones: Salon[] | undefined,
): AsignacionEscenario[] =>
  (salones ?? []).flatMap((salon) => {
    const copia = salon.escenarios.find(
      (e) =>
        e.idescenario_origen === escenario.idescenario ||
        e.idescenario === escenario.idescenario,
    );
    return copia ? [{ salon, idescenarioEnSalon: copia.idescenario }] : [];
  });

export const isEscenarioAsignadoASalon = (
  escenario: Pick<Scenario, "idescenario">,
  salon: Salon,
): boolean =>
  salon.escenarios.some(
    (e) =>
      e.idescenario_origen === escenario.idescenario ||
      e.idescenario === escenario.idescenario,
  );
