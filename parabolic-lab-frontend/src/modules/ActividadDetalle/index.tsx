import ActivityInfo from "./ActivityInfo";
import ScenariosList from "./ScenariosList";

interface ActividadDetalleProps {
  idactividad: string;
}

const ActividadDetalle = ({ idactividad }: ActividadDetalleProps) => (
  <div className="flex flex-col gap-4 p-4 md:p-8 md:gap-6">
    <ActivityInfo idactividad={idactividad} />
    <ScenariosList idactividad={idactividad} />
  </div>
);

export default ActividadDetalle;