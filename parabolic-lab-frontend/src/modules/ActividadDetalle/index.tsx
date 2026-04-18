import ActivityInfo from "./ActivityInfo";
import ScenariosList from "./ScenariosList";

const ActividadDetalle = () => (
  <div className="flex flex-col gap-4 p-4 md:p-8 md:gap-6">
    <ActivityInfo />
    <ScenariosList />
  </div>
);

export default ActividadDetalle;
