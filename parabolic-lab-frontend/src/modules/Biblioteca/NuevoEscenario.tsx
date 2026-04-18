"use client";

import ScenarioEditor from "@/modules/ScenarioEditor";
import { useMySalones } from "@/queries/useMySalones";

const NuevoEscenario = () => {
  const { data: salones } = useMySalones();
  
  // Usar el primer salón disponible como contexto para crear el escenario
  // Si no hay salones, el ID será undefined pero eso será manejado por ScenarioEditor
  const salonId = salones?.[0]?.idsalon;

  return <ScenarioEditor classroomId={salonId} />;
};

export default NuevoEscenario;
