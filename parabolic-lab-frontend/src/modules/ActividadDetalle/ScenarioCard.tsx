import { Badge, Button } from "amvasdev-ui";
import { Scenario } from "@/models/scenario";

interface ScenarioCardProps {
  scenario: Scenario;
}

const DIFFICULTY_VARIANT_MAP: Record<
  string,
  "success" | "warning" | "error" | "neutral"
> = {
  Basico: "success",
  Intermedio: "warning",
  Avanzado: "error",
};

const ScenarioCard = ({ scenario }: ScenarioCardProps) => (
  <div className="bg-base-200 rounded-lg p-4 flex flex-col gap-4 md:p-6 md:gap-6">
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1">
        <h3 className="text-lg md:text-xl font-semibold">{scenario.nombre}</h3>
        <div className="flex gap-2 mt-2">
          <Badge
            variant={
              DIFFICULTY_VARIANT_MAP[scenario.niveldificultad] || "neutral"
            }
          >
            {scenario.niveldificultad}
          </Badge>
          <Badge variant="neutral">{scenario.tipoescenario}</Badge>
        </div>
      </div>
      <Button variant="primary" className="hidden md:flex">
        Comenzar
      </Button>
    </div>

    {scenario.descripcion ? (
      <p className="text-sm">{scenario.descripcion}</p>
    ) : null}

    {scenario.objetivosaprendizaje ? (
      <div>
        <p className="text-sm font-semibold">Objetivos de aprendizaje:</p>
        <p className="text-sm opacity-80">{scenario.objetivosaprendizaje}</p>
      </div>
    ) : null}

    {scenario.instrucciones ? (
      <div>
        <p className="text-sm font-semibold">Instrucciones:</p>
        <p className="text-sm opacity-80">{scenario.instrucciones}</p>
      </div>
    ) : null}

    <div className="flex gap-4 text-sm opacity-70">
      {scenario.tiempolimite ? (
        <span>⏱️ {scenario.tiempolimite} min</span>
      ) : null}
      {scenario.intentospermitidos ? (
        <span>🔄 {scenario.intentospermitidos} intentos</span>
      ) : null}
    </div>
    <Button variant="primary" className="w-full md:hidden">
      Comenzar
    </Button>
  </div>
);

export default ScenarioCard;
