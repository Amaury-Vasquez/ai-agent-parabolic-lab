"use client";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "amvasdev-ui";
import { useMemo } from "react";
import { useMySalones } from "@/queries/useMySalones";
import { useEscenariosBySalon } from "@/queries/useEscenario";
import { Scenario } from "@/models/scenario";
import ScenarioCard from "@/modules/ActividadDetalle/ScenarioCard";

interface SalonAlumnoProps {
  classroomId: string;
}

// Dedup defensivo: si un escenario y su copia (mismo origen raíz) conviven
// en el salón, mostrar solo el primero para que el alumno no lo vea doble.
const dedupPorOrigen = (escenarios: Scenario[]): Scenario[] => {
  const raicesVistas = new Set<string>();
  return escenarios.filter((e) => {
    const raiz = e.idescenario_origen ?? e.idescenario;
    if (raicesVistas.has(raiz)) return false;
    raicesVistas.add(raiz);
    return true;
  });
};

const SalonAlumno = ({ classroomId }: SalonAlumnoProps) => {
  const router = useRouter();
  const { data: salones, isLoading: loadingSalones } = useMySalones();
  const salon = salones?.find((s) => s.codigoacceso === classroomId);
  const { data: escenariosRaw, isLoading: loadingEscenarios } = useEscenariosBySalon(
    salon?.idsalon ?? ""
  );
  const escenarios = useMemo(
    () => (escenariosRaw ? dedupPorOrigen(escenariosRaw) : escenariosRaw),
    [escenariosRaw]
  );

  if (loadingSalones) {
    return (
      <div className="flex justify-center p-8">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  if (!salon) {
    return (
      <div className="p-8 text-center">
        <p className="opacity-70">Salón no encontrado.</p>
        <Button variant="ghost" onClick={() => router.push("/alumno")} className="mt-4">
          Volver a mis salones
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft size={16} />
        </Button>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">{salon.nombresalon}</h1>
          <p className="text-sm opacity-70">Código: {salon.codigoacceso}</p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">Escenarios disponibles</h2>
        {loadingEscenarios ? (
          <div className="flex justify-center p-4">
            <span className="loading loading-spinner loading-md" />
          </div>
        ) : escenarios && escenarios.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:gap-6">
            {escenarios.map((scenario) => (
              <ScenarioCard key={scenario.idescenario} scenario={scenario} salonId={classroomId} />
            ))}
          </div>
        ) : (
          <div className="bg-base-200 rounded-lg p-6 text-center">
            <p className="opacity-70">No hay escenarios disponibles en este salón.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalonAlumno;
